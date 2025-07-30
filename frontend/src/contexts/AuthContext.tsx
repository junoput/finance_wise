import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, LoginResponse } from '../types';
import apiService from '../services/api';

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Auth Context
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const user = await apiService.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: user });
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('auth_token');
          dispatch({ type: 'LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // Demo mode - check for demo credentials
      if (credentials.email === 'demo@finwise.com' && credentials.password === 'password123') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockResponse: LoginResponse = {
          user: {
            id: 1,
            email: 'demo@finwise.com',
            firstName: 'Demo',
            lastName: 'User',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: new Date().toISOString(),
            mfaEnabled: false,
            lastLogin: new Date().toISOString(),
          },
          token: 'demo-jwt-token-12345',
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          requiresMfa: false,
        };
        
        // Store token
        localStorage.setItem('authToken', mockResponse.token);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: mockResponse.user,
            token: mockResponse.token,
          },
        });
        return;
      }
      
      // Try actual API call for non-demo credentials
      const response: LoginResponse = await apiService.login(credentials);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
    } catch (error: any) {
      // If API fails, provide helpful error message for demo mode
      const errorMessage = credentials.email === 'demo@finwise.com' ? 
        'Demo login failed. Please use: demo@finwise.com / password123' :
        'Backend server is not running. Try demo credentials: demo@finwise.com / password123';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshUser = async () => {
    if (state.isAuthenticated) {
      try {
        const user = await apiService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        // If refresh fails, logout user
        dispatch({ type: 'LOGOUT' });
      }
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Auth Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return fallback ? <>{fallback}</> : <div>Please log in to access this page.</div>;
  }

  return <>{children}</>;
}

export default AuthContext;
