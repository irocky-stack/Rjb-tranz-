import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mobileService } from '@/services/MobileService';
import { 
  DownloadSimple, 
  DeviceMobile, 
  Desktop, 
  X, 
  CheckCircle,
  Lightning,
  WifiSlash,
  ShareNetwork,
  Info,
  PlusSquare
} from '@phosphor-icons/react';

interface PWAInstallProps {
  onClose?: () => void;
}

const PWAInstall: React.FC<PWAInstallProps> = ({ onClose }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  useEffect(() => {
    // Get device and network info
    setDeviceInfo(mobileService.getDeviceInfo());
    setNetworkStatus(mobileService.getNetworkStatus());

    // Check PWA status
    const checkPWAStatus = () => {
      setIsInstallable(mobileService.isInstallable());
      setIsStandalone(mobileService.isAppInstalled());
    };

    // Initial check
    checkPWAStatus();

    // Listen for PWA events
    const handlePWAInstall = (event: any) => {
      if (event.detail.type === 'available') {
        setIsInstallable(true);
      } else if (event.detail.type === 'installed') {
        setIsStandalone(true);
        setIsInstallable(false);
      }
    };

    const handleInstallInstructions = (event: any) => {
      setShowInstructions(true);
    };

    const handleNetworkChange = () => {
      setNetworkStatus(mobileService.getNetworkStatus());
    };

    // Add event listeners
    window.addEventListener('pwa-install', handlePWAInstall);
    window.addEventListener('show-install-instructions', handleInstallInstructions);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Check periodically in case the state changes
    const interval = setInterval(checkPWAStatus, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pwa-install', handlePWAInstall);
      window.removeEventListener('show-install-instructions', handleInstallInstructions);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await mobileService.showInstallPrompt();
      if (success) {
        console.log('📱 App installation initiated');
      } else if (mobileService.canAddToHomeScreen()) {
        mobileService.showAddToHomeScreenInstructions();
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('📱 Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const getInstallInstructions = () => {
    if (!deviceInfo) return '';
    
    if (deviceInfo.isIOS && deviceInfo.isSafari) {
      return 'Tap the Share button (⎎) at the bottom, then select "Add to Home Screen"';
    } else if (deviceInfo.isAndroid && deviceInfo.isChrome) {
      return 'Tap the menu (⋮) and select "Add to Home screen" or "Install app"';
    } else if (deviceInfo.isChrome) {
      return 'Click the install icon in the address bar or use the browser menu';
    } else {
      return 'Use your browser\'s menu to add this app to your home screen';
    }
  };

  // If app is already installed
  if (isStandalone) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" weight="fill" />
              <div>
                <CardTitle className="text-lg text-green-800 dark:text-green-200">
                  App Installed Successfully! 🎉
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-400">
                  RJB TRANZ is now running as a native app with full offline capabilities
                </CardDescription>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Lightning className="h-4 w-4" />
              <span>Faster loading, offline access, and native notifications enabled</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-green-600">
                <WifiSlash className="h-3 w-3" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Push notifications</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If install instructions should be shown
  if (showInstructions) {
    return (
      <Alert className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <Info className="h-4 w-4" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h4 className="font-semibold">Add RJB TRANZ to Home Screen</h4>
            <AlertDescription className="text-sm">
              {getInstallInstructions()}
            </AlertDescription>
            {deviceInfo?.isIOS && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <ShareNetwork className="h-3 w-3" />
                <span>Look for the share icon in Safari</span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)} className="h-8 w-8 p-0 ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    );
  }

  // If not installable, don't show anything
  if (!isInstallable && !mobileService.canAddToHomeScreen()) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {deviceInfo?.isMobile ? (
              <DeviceMobile className="h-6 w-6 text-primary" weight="duotone" />
            ) : (
              <Desktop className="h-6 w-6 text-primary" weight="duotone" />
            )}
            <div>
              <CardTitle className="text-lg">Install RJB TRANZ App</CardTitle>
              <CardDescription>
                Get the full app experience with enhanced performance
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Features Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Lightning className="h-4 w-4 text-primary" weight="duotone" />
            <span>Lightning fast loading</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <WifiSlash className="h-4 w-4 text-primary" weight="duotone" />
            <span>Full offline access</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-primary" weight="duotone" />
            <span>Native notifications</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PlusSquare className="h-4 w-4 text-primary" weight="duotone" />
            <span>Home screen access</span>
          </div>
        </div>

        {/* Enhanced Status indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {deviceInfo?.isIOS ? 'iOS' : deviceInfo?.isAndroid ? 'Android' : 'Desktop'}
          </Badge>
          <Badge variant={networkStatus?.online ? "default" : "destructive"} className="text-xs">
            {networkStatus?.online ? "Online" : "Offline"}
          </Badge>
          {deviceInfo?.isStandalone && (
            <Badge variant="outline" className="text-xs text-green-600">
              PWA Ready
            </Badge>
          )}
          {networkStatus?.connection?.effectiveType && (
            <Badge variant="outline" className="text-xs">
              {networkStatus.connection.effectiveType.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Installation instructions */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {deviceInfo?.isMobile ? (
              <>
                <p className="font-medium mb-1">Benefits for mobile:</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Works like a native app</li>
                  <li>• No app store required</li>
                  <li>• Always up-to-date</li>
                  <li>• Access from home screen</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-medium mb-1">Benefits for desktop:</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Dedicated app window</li>
                  <li>• System notifications</li>
                  <li>• Faster performance</li>
                  <li>• Works offline</li>
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Install button */}
        <div className="space-y-2">
          {isInstallable ? (
            <Button 
              onClick={handleInstall} 
              disabled={isInstalling}
              className="w-full"
              size="lg"
            >
              <DownloadSimple className="h-4 w-4 mr-2" weight="bold" />
              {isInstalling ? 'Installing...' : 'Install App Now'}
            </Button>
          ) : (
            <Button 
              onClick={() => setShowInstructions(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <PlusSquare className="h-4 w-4 mr-2" weight="bold" />
              Show Installation Instructions
            </Button>
          )}
          
          <p className="text-xs text-center text-muted-foreground">
            Free • No registration required • Instant setup
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstall;