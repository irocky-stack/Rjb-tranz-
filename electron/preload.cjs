const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // File system operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // Menu event listeners
  onMenuAction: (callback) => {
    const menuChannels = [
      'menu-new-transaction',
      'menu-export-data', 
      'menu-settings',
      'menu-navigate',
      'menu-refresh'
    ];
    
    menuChannels.forEach(channel => {
      ipcRenderer.on(channel, callback);
    });
    
    // Return cleanup function
    return () => {
      menuChannels.forEach(channel => {
        ipcRenderer.removeAllListeners(channel);
      });
    };
  },

  // System operations
  isElectron: true,
  platform: process.platform,

  // Notification support
  showNotification: (title, options) => {
    return new Notification(title, options);
  },

  // Print support
  print: () => {
    window.print();
  }
});

// Security: Remove Node.js APIs from global scope
delete window.require;
delete window.exports;
delete window.module;