import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../types';

interface LoginFormData {
  email: string;
  password: string;
  mfaToken?: string;
}

function Login() {
  const navigate = useNavigate();
  const { login, state } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      mfaToken: undefined,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Basic validation
      if (!data.email) {
        setError('email', { type: 'manual', message: 'Email is required' });
        return;
      }
      if (!data.password) {
        setError('password', { type: 'manual', message: 'Password is required' });
        return;
      }
      if (!/\S+@\S+\.\S+/.test(data.email)) {
        setError('email', { type: 'manual', message: 'Please enter a valid email address' });
        return;
      }

      const credentials: LoginRequest = {
        email: data.email,
        password: data.password,
        mfaToken: data.mfaToken,
      };

      await login(credentials);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'MFA_REQUIRED') {
        setRequiresMfa(true);
      } else if (error.code === 'INVALID_CREDENTIALS') {
        setError('root', {
          type: 'manual',
          message: 'Invalid email or password',
        });
      } else if (error.code === 'ACCOUNT_LOCKED') {
        setError('root', {
          type: 'manual',
          message: 'Account is locked due to too many failed login attempts',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'Login failed. Please try again.',
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
              }}
            >
              FinWise
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Secure Financial Management
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Error Alert */}
            {errors.root && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.root.message}
              </Alert>
            )}

            {/* MFA Notice */}
            {requiresMfa && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon fontSize="small" />
                  <Typography variant="body2">
                    Please enter your 6-digit MFA code from your authenticator app
                  </Typography>
                </Box>
              </Alert>
            )}

            {/* Email Field */}
            <TextField
              {...register('email')}
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus={!requiresMfa}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={state.isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              {...register('password')}
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={state.isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* MFA Token Field */}
            {requiresMfa && (
              <TextField
                {...register('mfaToken')}
                margin="normal"
                required
                fullWidth
                label="MFA Code"
                type="text"
                autoComplete="one-time-code"
                autoFocus
                placeholder="000000"
                error={!!errors.mfaToken}
                helperText={errors.mfaToken?.message || 'Enter the 6-digit code from your authenticator app'}
                disabled={state.isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SecurityIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Demo Credentials */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Demo Mode Available
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Test the application with these credentials:
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'grey.100', 
                  p: 1.5, 
                  borderRadius: 1, 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}>
                  <div><strong>Email:</strong> demo@finwise.com</div>
                  <div><strong>Password:</strong> password123</div>
                </Box>
              </Box>
            </Alert>

            {/* Security Notice */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Your financial data is protected with bank-level security
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  🔒 256-bit Encryption
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  🛡️ Multi-Factor Auth
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  📊 Audit Logging
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 FinWise. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
