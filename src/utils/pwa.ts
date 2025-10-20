export const pwaManager = {
  install: () => {},
  checkForUpdates: () => {},
  isInstalled: () => false,
  isStandalone: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
};