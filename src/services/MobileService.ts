interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
});

export const mobileService = {
  isInstallable: () => deferredPrompt !== null,
  promptInstall: () => { },
  isStandalone: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
  },
  isAppInstalled: function () {
    return this.isStandalone();
  },
  checkForUpdates: () => { },
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
      isStandalone: window.matchMedia('(display-mode: standalone)').matches || (window.navigator as { standalone?: boolean }).standalone === true
    };
  },
  getNetworkStatus: () => {
    const connection = (navigator as { connection?: { effectiveType: string; downlink: number; rtt: number } }).connection ||
      (navigator as { mozConnection?: { effectiveType: string; downlink: number; rtt: number } }).mozConnection ||
      (navigator as { webkitConnection?: { effectiveType: string; downlink: number; rtt: number } }).webkitConnection;
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