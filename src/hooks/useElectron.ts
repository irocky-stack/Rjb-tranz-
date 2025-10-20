import { useEffect, useState } from 'react';

interface ElectronAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<{
    platform: string;
    arch: string;
    version: string;
  }>;
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  onMenuAction: (callback: (event: any, channel: string, data?: any) => void) => () => void;
  isElectron: boolean;
  platform: string;
  showNotification: (title: string, options?: NotificationOptions) => Notification;
  print: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [version, setVersion] = useState<string>('');
  const [platform, setPlatform] = useState<any>(null);

  useEffect(() => {
    const checkElectron = async () => {
      if (window.electronAPI) {
        setIsElectron(true);
        
        try {
          const appVersion = await window.electronAPI.getVersion();
          const platformInfo = await window.electronAPI.getPlatform();
          
          setVersion(appVersion);
          setPlatform(platformInfo);
        } catch (error) {
          console.error('Failed to get Electron info:', error);
        }
      }
    };

    checkElectron();
  }, []);

  const showSaveDialog = async (options: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => {
    if (!window.electronAPI) return null;
    return await window.electronAPI.showSaveDialog(options);
  };

  const showOpenDialog = async (options: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: string[];
  }) => {
    if (!window.electronAPI) return null;
    return await window.electronAPI.showOpenDialog(options);
  };

  const exportToFile = async (data: any, filename: string, type: 'csv' | 'json' = 'csv') => {
    if (!window.electronAPI) {
      // Fallback for web version
      const content = type === 'csv' 
        ? convertToCSV(data)
        : JSON.stringify(data, null, 2);
      
      const blob = new Blob([content], { 
        type: type === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    }

    try {
      const result = await showSaveDialog({
        title: 'Export Data',
        defaultPath: filename,
        filters: [
          type === 'csv' 
            ? { name: 'CSV Files', extensions: ['csv'] }
            : { name: 'JSON Files', extensions: ['json'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        const content = type === 'csv' 
          ? convertToCSV(data)
          : JSON.stringify(data, null, 2);
        
        // In a real implementation, you'd use Node.js fs module through IPC
        // For now, we'll use the web fallback
        const blob = new Blob([content], { 
          type: type === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filePath.split('/').pop() || filename;
        a.click();
        URL.revokeObjectURL(url);
        
        return { success: true, filePath: result.filePath };
      }
      
      return { success: false, canceled: true };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error };
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (window.electronAPI) {
      return window.electronAPI.showNotification(title, options);
    } else {
      // Fallback for web version
      if ('Notification' in window && Notification.permission === 'granted') {
        return new Notification(title, options);
      }
      return null;
    }
  };

  const print = () => {
    if (window.electronAPI) {
      window.electronAPI.print();
    } else {
      window.print();
    }
  };

  const registerMenuHandlers = (handlers: Record<string, (...args: any[]) => void>) => {
    // Stub for menu handlers
    return () => {};
  };

  const registerThemeHandler = (handler: (isDark: boolean) => void) => {
    // Stub for theme handler
    return () => {};
  };

  const readFile = async (filePath: string): Promise<string> => {
    // Stub for reading files
    return '';
  };

  const writeFile = async (filePath: string, content: string): Promise<void> => {
    // Stub for writing files
  };

  return {
    isElectron,
    appVersion: version || '1.0.0',
    version,
    platform,
    showSaveDialog,
    showOpenDialog,
    exportToFile,
    showNotification,
    print,
    registerMenuHandlers,
    registerThemeHandler,
    readFile,
    writeFile,
    electronAPI: window.electronAPI
  };
}

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = headers.join(',') + '\n' + 
    data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ).join('\n');
  
  return csvContent;
}