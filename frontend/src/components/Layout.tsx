import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountIcon,
  Receipt as TransactionIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    text: 'Accounts',
    icon: <AccountIcon />,
    path: '/accounts',
  },
  {
    text: 'Transactions',
    icon: <TransactionIcon />,
    path: '/transactions',
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const drawer = (
    <div>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          FinWise
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Financial Management
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              backgroundColor: location.pathname === item.path ? 'primary.50' : 'transparent',
              borderRight: location.pathname === item.path ? 3 : 0,
              borderRightColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.50',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                '& .MuiListItemText-primary': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'FinWise'}
          </Typography>

          {/* User Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {state.user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderRightColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for fixed app bar */}
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
