import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Container,
  Paper
} from '@mui/material';
import { 
  Computer as DesktopIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon 
} from '@mui/icons-material';
import DesktopSettings from '../components/DesktopSettings';
import { desktopUtils } from '../hooks/useTauri';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

function Settings() {
  const [tabValue, setTabValue] = useState(desktopUtils.isDesktop() ? 0 : 1);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" fontWeight={700} mb={3}>
        Settings
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {desktopUtils.isDesktop() && (
              <Tab 
                icon={<DesktopIcon />} 
                label="Desktop" 
                {...a11yProps(0)} 
              />
            )}
            <Tab 
              icon={<ProfileIcon />} 
              label="Profile" 
              {...a11yProps(desktopUtils.isDesktop() ? 1 : 0)} 
            />
            <Tab 
              icon={<NotificationsIcon />} 
              label="Notifications" 
              {...a11yProps(desktopUtils.isDesktop() ? 2 : 1)} 
            />
          </Tabs>
        </Box>

        {desktopUtils.isDesktop() && (
          <TabPanel value={tabValue} index={0}>
            <DesktopSettings />
          </TabPanel>
        )}

        <TabPanel value={tabValue} index={desktopUtils.isDesktop() ? 1 : 0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Profile Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              Profile management features coming soon...
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={desktopUtils.isDesktop() ? 2 : 1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
            <Typography variant="body2" color="text.secondary">
              Notification settings coming soon...
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default Settings;
