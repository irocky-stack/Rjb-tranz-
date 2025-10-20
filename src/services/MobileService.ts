let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

export const mobileService = {
  isInstallable: () => deferredPrompt !== null,
  promptInstall: () => {},
  isStandalone: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },
  isAppInstalled: function() {
    return this.isStandalone();
  },
  checkForUpdates: () => {},
  getInstallPrompt: () => deferredPrompt,
  showInstallPrompt: async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  },
  canAddToHomeScreen: () => {
    // Fallback for when install prompt isn't available
    return true; // Always show instructions if not installable
  },
  showAddToHomeScreenInstructions: () => {
    // This will be handled in the component
  },
  getDeviceInfo: () => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edg/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isMobile = /Mobi|Android/i.test(ua);
    return {
      isIOS,
      isAndroid,
      isChrome,
      isSafari,
      isMobile,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    };
  },
  getNetworkStatus: () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return {
      online: navigator.onLine,
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      } : null
    };
  }
};