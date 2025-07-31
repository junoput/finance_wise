import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Computer as DesktopIcon,
  Folder as FolderIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  CloudOff as OfflineIcon,
} from '@mui/icons-material';
import { useTauri, desktopUtils } from '../hooks/useTauri';

const DesktopSettings: React.FC = () => {
  const { 
    isDesktop, 
    appInfo, 
    databaseConfig, 
    getAppInfo, 
    checkDatabaseCredentials,
    openDataDirectory,
    showNotification 
  } = useTauri();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDesktop) {
      loadDesktopInfo();
    }
  }, [isDesktop]);

  const loadDesktopInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        getAppInfo(),
        checkDatabaseCredentials()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load desktop information');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDataDirectory = async () => {
    try {
      await openDataDirectory();
      await showNotification('Directory Opened', 'FinWise data directory opened in file manager');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open data directory');
    }
  };

  const handleTestNotification = async () => {
    try {
      await showNotification('Test Notification', 'FinWise desktop notifications are working!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to show notification');
    }
  };

  if (!isDesktop) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfflineIcon />
          <Typography variant="body2">
            You are using the web version of FinWise. 
            <strong> Desktop-specific features are not available.</strong>
          </Typography>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <DesktopIcon color="primary" />
        <Typography variant="h5" component="h2">
          Desktop Application Settings
        </Typography>
        <Chip 
          label="Desktop Mode" 
          color="success" 
          size="small"
          icon={<DesktopIcon />}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Desktop Features */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Desktop Features</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1">Native File Access</Typography>
                <Typography variant="body2" color="text.secondary">
                  Direct access to your secure data directory
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                onClick={handleOpenDataDirectory}
                disabled={loading}
                startIcon={<FolderIcon />}
              >
                Open Data Folder
              </Button>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1">Desktop Notifications</Typography>
                <Typography variant="body2" color="text.secondary">
                  Native system notifications for important events
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                onClick={handleTestNotification}
                disabled={loading}
              >
                Test Notification
              </Button>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1">Offline Operation</Typography>
                <Typography variant="body2" color="text.secondary">
                  Full functionality without internet connection
                </Typography>
              </Box>
              <Chip label="Always Available" color="success" />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={loadDesktopInfo}
            disabled={loading}
          >
            Refresh Information
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleTestNotification}
            disabled={loading}
          >
            Test Notification
          </Button>
        </Box>
      </Paper>

      {/* Desktop Advantages */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Desktop Advantages</Typography>
        <Alert severity="success" sx={{ mb: 1 }}>
          <Typography variant="body2">
            <strong>Enhanced Security:</strong> Your financial data is stored locally in your secure home directory 
            with no cloud dependencies.
          </Typography>
        </Alert>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Better Performance:</strong> Native desktop performance with direct database access.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default DesktopSettings;
