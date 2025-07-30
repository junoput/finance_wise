import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="60vh"
      textAlign="center"
    >
      <Typography variant="h1" component="h1" fontWeight={700} color="primary.main" mb={2}>
        404
      </Typography>
      <Typography variant="h4" component="h2" fontWeight={600} mb={2}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/dashboard')}
        size="large"
      >
        Go to Dashboard
      </Button>
    </Box>
  );
}

export default NotFound;
