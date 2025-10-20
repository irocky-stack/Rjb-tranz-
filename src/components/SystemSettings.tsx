import React, { useState, useRef } from "react";
import { useKV } from "@github/spark/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DataMigration from "@/components/DataMigration";
import SupabaseTest from "@/components/SupabaseTest";
import PrinterManager from "@/components/PrinterManager";
import NotificationTester from "@/components/NotificationTester";
import { SupabaseService } from "@/services/supabaseService";
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Envelope,
  Phone,
  Key,
  CheckCircle,
  Warning,
  Moon,
  Sun,
  Monitor,
  Trash,
  Archive,
  CloudArrowDown,
  HardDrives,
  Printer,
  Clock,
  Upload,
  CircleNotch,
  X
} from "@phosphor-icons/react";
import { toast } from "sonner";

// Declare global spark interface
declare global {
  interface Window {
    spark: {
      kv: {
        keys: () => Promise<string[]>;
        get: <T>(key: string) => Promise<T | undefined>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
    };
  }
}

const spark = window.spark;

interface SystemSettingsProps {
  onBack: () => void;
  systemConfig?: SystemConfig;
  onConfigUpdate?: (config: SystemConfig) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  localData?: {
    transactions?: any[];
    clients?: any[];
    invoices?: any[];
    exchangeRates?: any[];
  };
  onDataSynced?: () => void;
}

interface SystemConfig {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  businessLicense: string;
  taxId: string;
  baseCurrency: string;
  defaultFeeRate: number;
  autoBackup: boolean;
  notificationSound: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  transactionUpdates: boolean;
  requireClientVerification: boolean;
  sessionTimeout: number;
  printReceipts: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
  sleepModeDelay: number;
  fontScale: number;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ 
  onBack, 
  systemConfig: propSystemConfig,
  onConfigUpdate: propOnConfigUpdate,
  isDarkMode = false,
  onToggleTheme,
  localData = {},
  onDataSynced
}) => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isResettingData, setIsResettingData] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Profile picture state
  const [profilePicture, setProfilePicture] = useKV<string>("userProfilePicture", "");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [systemStatus, setSystemStatus] = useState({
    database: "online",
    storage: "healthy", 
    notifications: "active",
    security: "secure"
  });
  
  const [localSystemConfig, setLocalSystemConfig] = useKV<SystemConfig>("systemConfig", {
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    businessLicense: "",
    taxId: "",
    baseCurrency: "USD",
    defaultFeeRate: 0,
    autoBackup: true,
    notificationSound: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    transactionUpdates: true,
    requireClientVerification: true,
    sessionTimeout: 30,
    printReceipts: true,
    language: "en",
    theme: "light",
    sleepModeDelay: 10,
    fontScale: 1.0
  });

  // Use prop config if provided, otherwise use local config
  const effectiveConfig = (propSystemConfig ?? localSystemConfig) as SystemConfig;

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const updateConfig = (newConfig: SystemConfig) => {
    if (propOnConfigUpdate) {
      propOnConfigUpdate(newConfig);
    } else {
      setLocalSystemConfig(newConfig);
    }
  };

  const handleConfigUpdate = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    if (key === 'theme' && onToggleTheme && value !== effectiveConfig.theme) {
      onToggleTheme();
    }
    const newConfig: SystemConfig = { ...effectiveConfig, [key]: value };
    updateConfig(newConfig);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  // Profile picture upload handler
  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingProfile(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfilePicture(result);
      toast.success('Profile picture updated successfully');
      setIsUploadingProfile(false);
    };

    reader.onerror = () => {
      toast.error('Failed to read image file');
      setIsUploadingProfile(false);
    };

    reader.readAsDataURL(file);
  };

  const triggerProfileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeProfilePicture = () => {
    setProfilePicture("");
    toast.success('Profile picture removed');
  };

  const saveSettings = () => {
    if (showPasswordFields) {
      if (!passwords.currentPassword || !passwords.newPassword) {
        toast.error("Please fill in all password fields");
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error("New passwords don't match");
        return;
      }
      if (passwords.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }

    toast.success("Settings saved successfully");
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswordFields(false);
  };

  const testSupabaseConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      const isConnected = await SupabaseService.testConnection();
      setConnectionStatus(isConnected ? 'success' : 'error');
      
      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        database: isConnected ? "online" : "offline"
      }));
    } catch (error) {
      setConnectionStatus('error');
      setSystemStatus(prev => ({
        ...prev,
        database: "offline"
      }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const resetToDefaults = async () => {
    setIsResettingData(true);
    
    try {
      // Clear all stored data
      await clearAppCache();
      
      const defaultConfig: SystemConfig = {
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        companyAddress: "",
        businessLicense: "",
        taxId: "",
        baseCurrency: "USD",
        defaultFeeRate: 0,
        autoBackup: true,
        notificationSound: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        transactionUpdates: true,
        requireClientVerification: true,
        sessionTimeout: 30,
        printReceipts: true,
        language: "en",
        theme: "light",
        sleepModeDelay: 10,
        fontScale: 1.0
      };

      updateConfig(defaultConfig);
      
      toast.success("Settings reset to defaults. App will restart.");
      
      // Simulate app restart after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      toast.error("Failed to reset settings");
    } finally {
      setIsResettingData(false);
    }
  };

  const clearAppCache = async () => {
    setIsClearingCache(true);
    
    try {
      // Get all stored keys and clear them
      const allKeys = await spark.kv.keys();
      
      // Keep essential keys but clear data caches
      const keysToKeep = ["systemConfig", "isAuthenticated", "currentUser"];
      const keysToClear = allKeys.filter(key => !keysToKeep.includes(key));
      
      // Clear specific data keys
      for (const key of keysToClear) {
        await spark.kv.delete(key);
      }
      
      // Clear browser caches if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      toast.success("Cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cache");
    } finally {
      setIsClearingCache(false);
    }
  };

  const exportSystemData = async () => {
    try {
      const allKeys = await spark.kv.keys();
      const systemData: any = {};
      
      for (const key of allKeys) {
        systemData[key] = await spark.kv.get(key);
      }
      
      const dataStr = JSON.stringify(systemData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("System data exported successfully");
    } catch (error) {
      toast.error("Failed to export system data");
    }
  };

  return (
    <div className="min-h-screen bg-background system-settings-mobile">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground mobile-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="mobile-text">Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground mobile-header">System Management</h1>
            <p className="text-sm text-muted-foreground mobile-text">Configure your business settings and preferences</p>
          </div>
          <Button
            onClick={saveSettings}
            className="bg-green-600 hover:bg-green-700 text-white mobile-button"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="mobile-text">Save All</span>
          </Button>
        </div>
      </header>

      {/* Main Content - Grid Layout */}
      <main className="p-4 pb-6 sm:p-6 max-w-7xl mx-auto system-settings-content">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Company Information Card */}
          <Card className="md:col-span-2 lg:col-span-1 card-hover-glass mobile-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg mobile-header">Company Details</CardTitle>
                  <CardDescription className="mobile-text">Business information and contact details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block mobile-text">Company Name</label>
                <Input
                  placeholder="Enter company name"
                  value={effectiveConfig.companyName}
                  onChange={(e) => handleConfigUpdate("companyName", e.target.value)}
                  className="h-10 mobile-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block mobile-text">Email</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={effectiveConfig.companyEmail}
                  onChange={(e) => handleConfigUpdate("companyEmail", e.target.value)}
                  className="h-10 mobile-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block mobile-text">Phone</label>
                <Input
                  placeholder="Enter phone number"
                  value={effectiveConfig.companyPhone}
                  onChange={(e) => handleConfigUpdate("companyPhone", e.target.value)}
                  className="h-10 mobile-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block mobile-text">Address</label>
                <Input
                  placeholder="Enter business address"
                  value={effectiveConfig.companyAddress}
                  onChange={(e) => handleConfigUpdate("companyAddress", e.target.value)}
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Settings Card */}
          <Card className="card-hover-glass">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Business Settings</CardTitle>
                  <CardDescription>Core business configuration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Base Currency</label>
                <Select 
                  value={effectiveConfig.baseCurrency} 
                  onValueChange={(value) => handleConfigUpdate("baseCurrency", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="GHS">GHS - Ghana Cedi</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Default Fee Rate (%)</label>
                <Input
                  type="number"
                  placeholder="Enter fee rate"
                  value={effectiveConfig.defaultFeeRate}
                  onChange={(e) => handleConfigUpdate("defaultFeeRate", parseFloat(e.target.value) || 0)}
                  className="h-10"
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  placeholder="Enter timeout in minutes"
                  value={effectiveConfig.sessionTimeout}
                  onChange={(e) => handleConfigUpdate("sessionTimeout", parseInt(e.target.value) || 30)}
                  className="h-10"
                  min="5"
                  max="120"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select 
                  value={effectiveConfig.language} 
                  onValueChange={(value) => handleConfigUpdate("language", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="card-hover-glass">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Palette className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Preferences</CardTitle>
                  <CardDescription>Application preferences and theme</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light' as const, icon: Sun, label: 'Light' },
                    { value: 'dark' as const, icon: Moon, label: 'Dark' },
                    { value: 'system' as const, icon: Monitor, label: 'System' }
                  ].map((theme) => {
                    const IconComponent = theme.icon;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => handleConfigUpdate("theme", theme.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                          effectiveConfig.theme === theme.value
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="text-xs font-medium">{theme.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Print Receipts</span>
                  <Switch
                    checked={effectiveConfig.printReceipts}
                    onCheckedChange={(checked) => handleConfigUpdate("printReceipts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto Backup</span>
                  <Switch
                    checked={effectiveConfig.autoBackup}
                    onCheckedChange={(checked) => handleConfigUpdate("autoBackup", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Client Verification</span>
                  <Switch
                    checked={effectiveConfig.requireClientVerification}
                    onCheckedChange={(checked) => handleConfigUpdate("requireClientVerification", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="card-hover-glass">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Manage notification settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sound Notifications</span>
                <Switch
                  checked={effectiveConfig.notificationSound}
                  onCheckedChange={(checked) => handleConfigUpdate("notificationSound", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Notifications</span>
                <Switch
                  checked={effectiveConfig.emailNotifications}
                  onCheckedChange={(checked) => handleConfigUpdate("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Push Notifications</span>
                <Switch
                  checked={effectiveConfig.pushNotifications}
                  onCheckedChange={(checked) => handleConfigUpdate("pushNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transaction Updates</span>
                <Switch
                  checked={effectiveConfig.transactionUpdates}
                  onCheckedChange={(checked) => handleConfigUpdate("transactionUpdates", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="card-hover-glass">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">System Status</CardTitle>
                  <CardDescription>Current system health</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Database</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {systemStatus.database}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Storage</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {systemStatus.storage}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Notifications</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {systemStatus.notifications}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Security</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {systemStatus.security}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* System Actions Card */}
          <Card className="card-hover-glass">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Warning className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">System Actions</CardTitle>
                  <CardDescription>Maintenance and data management</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportSystemData}
                className="w-full justify-start"
              >
                <CloudArrowDown className="h-4 w-4 mr-2" />
                Export Backup
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAppCache}
                disabled={isClearingCache}
                className="w-full justify-start"
              >
                {isClearingCache ? (
                  <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4 mr-2" />
                )}
                Clear Cache
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="w-full justify-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Restart App
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={resetToDefaults}
                disabled={isResettingData}
                className="w-full justify-start"
              >
                {isResettingData ? (
                  <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Reset All Settings
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Additional Components */}
        <div className="mt-8 space-y-6">
          {/* Printer Management */}
          <Card className="card-hover-glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Printer className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Printer Management</CardTitle>
                  <CardDescription>Configure receipt printing and device settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <PrinterManager />
                <NotificationTester 
                  onTestNotification={async (title, body, type, transaction) => {
                    if (transaction) {
                      toast.success(`${title}: ${body}`);
                    } else {
                      const toastMessage = `${title}: ${body}`;
                      switch (type) {
                        case 'completed':
                          toast.success(toastMessage);
                          break;
                        case 'failed':
                          toast.error(toastMessage);
                          break;
                        case 'pending':
                          toast.info?.(toastMessage) || toast.success(toastMessage);
                          break;
                        default:
                          toast.success(toastMessage);
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Database Management */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-hover-glass">
              <CardHeader>
                <CardTitle className="text-lg">Database Integration</CardTitle>
                <CardDescription>Supabase connection and data management</CardDescription>
              </CardHeader>
              <CardContent>
                <SupabaseTest />
              </CardContent>
            </Card>

            <Card className="card-hover-glass">
              <CardHeader>
                <CardTitle className="text-lg">Data Migration</CardTitle>
                <CardDescription>Sync local data with cloud storage</CardDescription>
              </CardHeader>
              <CardContent>
                <DataMigration 
                  localData={localData}
                  onDataSynced={onDataSynced}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemSettings;
