import { invoke } from '@tauri-apps/api/core';
import { useState, useEffect } from 'react';

export interface DatabaseConfig {
  secure_path: string;
  credentials_exist: boolean;
}

export interface AppInfo {
  name: string;
  version: string;
  data_dir: string;
}

// Custom hook for Tauri integration
export const useTauri = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig | null>(null);

  useEffect(() => {
    // Check if we're running in Tauri
    const checkTauri = async () => {
      try {
        await invoke('get_app_info');
        setIsDesktop(true);
      } catch (error) {
        setIsDesktop(false);
      }
    };

    checkTauri();
  }, []);

  const getAppInfo = async (): Promise<AppInfo> => {
    try {
      const info = await invoke<AppInfo>('get_app_info');
      setAppInfo(info);
      return info;
    } catch (error) {
      throw new Error(`Failed to get app info: ${error}`);
    }
  };

  const checkDatabaseCredentials = async (): Promise<DatabaseConfig> => {
    try {
      const config = await invoke<DatabaseConfig>('check_database_credentials');
      setDatabaseConfig(config);
      return config;
    } catch (error) {
      throw new Error(`Failed to check database credentials: ${error}`);
    }
  };

  const getSecureDataDir = async (): Promise<string> => {
    try {
      return await invoke<string>('get_finwise_data_dir');
    } catch (error) {
      throw new Error(`Failed to get data directory: ${error}`);
    }
  };

  const openDataDirectory = async (): Promise<void> => {
    try {
      await invoke('open_data_directory');
    } catch (error) {
      throw new Error(`Failed to open data directory: ${error}`);
    }
  };

  const showNotification = async (title: string, message: string): Promise<void> => {
    try {
      await invoke('show_notification', { title, message });
    } catch (error) {
      console.warn('Failed to show notification:', error);
    }
  };

  return {
    isDesktop,
    appInfo,
    databaseConfig,
    getAppInfo,
    checkDatabaseCredentials,
    getSecureDataDir,
    openDataDirectory,
    showNotification,
  };
};

// Helper function to check if we're running in desktop mode
export const isDesktopApp = (): boolean => {
  return (window as any).__TAURI__ !== undefined;
};

// Desktop-specific utilities
export const desktopUtils = {
  // Check if running in desktop mode
  isDesktop: isDesktopApp,
  
  // Show a native notification (desktop only)
  notify: async (title: string, message: string) => {
    if (isDesktopApp()) {
      try {
        await invoke('show_notification', { title, message });
      } catch (error) {
        console.warn('Desktop notification failed:', error);
      }
    }
  },

  // Open the secure data directory
  openDataDir: async () => {
    if (isDesktopApp()) {
      try {
        await invoke('open_data_directory');
      } catch (error) {
        console.error('Failed to open data directory:', error);
      }
    }
  },

  // Get app information
  getInfo: async (): Promise<AppInfo | null> => {
    if (isDesktopApp()) {
      try {
        return await invoke<AppInfo>('get_app_info');
      } catch (error) {
        console.error('Failed to get app info:', error);
        return null;
      }
    }
    return null;
  },
};
