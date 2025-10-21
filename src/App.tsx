 import React, { useState, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { useNotifications } from "@/hooks/useNotifications";
import { useCapacitor } from "@/hooks/useCapacitor";
import { useElectron } from "@/hooks/useElectron";
import { useFontScale } from "@/hooks/useFontScale";
import { pwaManager } from "@/utils/pwa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingStates from "@/components/LoadingStates";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AnalyticsModal from "@/components/AnalyticsModal";
import InAppNotifications from "@/components/InAppNotifications";
import AuthPage from "@/components/AuthPage";
import PushNotificationService from "@/components/PushNotificationService";
import SystemSettings from "@/components/SystemSettings";
import CountryModal from "@/components/CountryModal";
import PWAInstall from "@/components/PWAInstall";
import SleepMode from "@/components/SleepMode";
import FinancialCarousel from "@/components/FinancialCarousel";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import ProfileSettings from "@/components/ProfileSettings";
import FileUploadDemo from "@/components/FileUploadDemo";
import TransactionPreviewModal from "@/components/TransactionPreviewModal";

// Removed MobileIntegration - Pure PWA App
import CurrencyConverter from "@/components/CurrencyConverter";
import AutoConversionWidget from "@/components/AutoConversionWidget";
import ExchangeRateService from "@/components/ExchangeRateService";
import RateAlerts from "@/components/RateAlerts";
import { 
  CurrencyDollar, 
  Users, 
  User, 
  TrendUp, 
  TrendDown, 
  CalendarBlank,
  MagnifyingGlass,
  Funnel,
  DotsThreeVertical,
  Plus,
  FileText,
  Pulse,
  ArrowsClockwise,
  Lightning,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Money,
  Buildings,
  WifiHigh,
  WifiSlash,
  DownloadSimple,
  UploadSimple,
  Warning,
  SignOut,
  Gear,
  UserCheck,
  Printer,
  Globe,
  ChartBar,
  Receipt,
  CaretLeft,
  CaretRight,
  Moon,
  Sun,
  Star,
  SortAscending,
  SortDescending,
  CaretDown,
  Swap,
  Calculator,
  Camera,
  X
} from "@phosphor-icons/react";
import { toast } from "sonner";

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

interface Transaction {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  receiptPrinted: boolean;
  phoneNumber: string;
  transactionType: 'send' | 'receive';
  uniqueId: string;
  formatId: string;
  uniqueCode: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalTransactions: number;
  totalVolume: number;
  lastVisit: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  registrationDate: string;
}

interface ExchangeRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  region: 'africa' | 'asia' | 'europe' | 'north-america' | 'south-america' | 'oceania' | 'middle-east';
}

interface PrinterStatus {
  connected: boolean;
  paperLevel: number;
  model: string;
  temperature: number;
  errors: string[];
}

interface InvoiceData {
  id: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
}

function App() {
  console.log('🚀 App component: Starting initialization...');
  
  const { showTransactionNotification } = useNotifications();
  console.log('✅ App: useNotifications initialized');
  
  const capacitor = useCapacitor();
  console.log('✅ App: useCapacitor initialized', capacitor);
  
  const { isNative, platform: capacitorPlatform, isOnline, hapticFeedback } = capacitor;
  const electron = useElectron();
  console.log('✅ App: useElectron initialized', { isElectron: electron.isElectron });
  
  const { isElectron, platform: electronPlatform, registerMenuHandlers, registerThemeHandler, showSaveDialog, showOpenDialog, readFile, writeFile } = electron;
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCountrySelection, setShowCountrySelection] = useState(false);
  
  console.log('✅ App: State initialized');

  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [showRateAlerts, setShowRateAlerts] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{
    flag: string;
    name: string;
    currency: string;
    pair: string;
    rate: ExchangeRate;
    region: string;
  } | null>(null);
  const [selectedInvoiceCountry, setSelectedInvoiceCountry] = useState<{
    flag: string;
    name: string;
    currency: string;
    pair: string;
    rate: ExchangeRate;
  } | null>(null);
  const [transactions, setTransactions] = useKV<Transaction[]>("transactions", []);
  const [clients, setClients] = useKV<Client[]>("clients", []);
  const [invoices, setInvoices] = useKV<InvoiceData[]>("invoices", []);
  const [exchangeRates, setExchangeRates] = useKV<ExchangeRate[]>("exchangeRates", []);
  const [printerStatus, setPrinterStatus] = useKV<PrinterStatus>("printerStatus", {
    connected: false,
    paperLevel: 0,
    model: "ESC/POS Thermal Printer",
    temperature: 0,
    errors: []
  });
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useKV<boolean>("isAuthenticated", false);
  const [currentUser, setCurrentUser] = useKV<string>("currentUser", "");
  
  // Theme state - Integrated with system settings
  const [systemConfig, setSystemConfig] = useKV<SystemConfig>("systemConfig", {
    companyName: "RJB TRANZ",
    companyEmail: "admin@rjbtranz.com",
    companyPhone: "+233-123-456-789",
    companyAddress: "Accra, Ghana",
    businessLicense: "BL-2024-001",
    taxId: "TIN-123456789",
    baseCurrency: "USD",
    defaultFeeRate: 2.5,
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
    sleepModeDelay: 10, // Default 10 minutes
    fontScale: 1.0 // Default font scale
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Use font scale hook
  const { fontScale, getFontSize, getScaleClass } = useFontScale(systemConfig?.fontScale || 1.0);
  
  // Pagination state for invoices
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const invoicesPerPage = 5;
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Transaction filtering state
  const [amountFilter, setAmountFilter] = useState({
    min: "",
    max: ""
  });
  const [dateFilter, setDateFilter] = useState({
    start: "",
    end: ""
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Transaction sorting state
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showPWAInstall, setShowPWAInstall] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sleep mode state
  const [showSleepMode, setShowSleepMode] = useState(false);
  const [sleepModeTimeout, setSleepModeTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Enhanced filtering state
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [rateSortOrder, setRateSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favoriteRates, setFavoriteRates] = useKV<string[]>("favoriteRates", []);
  const [autoRefreshRates, setAutoRefreshRates] = useState(true);
  
  // Analytics modal state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsType, setAnalyticsType] = useState<'revenue' | 'volume' | 'growth' | 'average' | 'clients' | 'conversion'>('revenue');
  const [analyticsTitle, setAnalyticsTitle] = useState('');

  // Transaction preview modal state
  const [showTransactionPreview, setShowTransactionPreview] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Enhanced country selection state for invoice creation
  const [invoiceCountrySearch, setInvoiceCountrySearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');

  // Mobile tab navigation
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const tabs = ['dashboard', 'transactions', 'invoices', 'countries', 'converter', 'profile-demo'];

  const handleAnalyticsClick = (type: 'revenue' | 'volume' | 'growth' | 'average' | 'clients' | 'conversion', title: string) => {
    setAnalyticsType(type);
    setAnalyticsTitle(title);
    setShowAnalyticsModal(true);
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser("");
    setIsAuthenticated(false);
    setActiveTab("dashboard");
    setShowSystemSettings(false);
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setSystemConfig((prev) => {
      const current = prev || {
        companyName: "RJB TRANZ",
        companyEmail: "admin@rjbtranz.com", 
        companyPhone: "+233-123-456-789",
        companyAddress: "Accra, Ghana",
        businessLicense: "BL-2024-001",
        taxId: "TIN-123456789",
        baseCurrency: "USD",
        defaultFeeRate: 2.5,
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
        theme: "light" as const,
        sleepModeDelay: 10,
        fontScale: 1.0
      };
      return { ...current, theme: newTheme };
    });
    setIsDarkMode(!isDarkMode);
  };

  // Apply theme to document based on system config
  useEffect(() => {
    const config = systemConfig;
    let shouldBeDark = false;

    if (config?.theme === 'dark') {
      shouldBeDark = true;
    } else if (config?.theme === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDarkMode(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply font scale
    if (config?.fontScale) {
      document.documentElement.style.setProperty('--font-scale', config.fontScale.toString());
      // Also apply mobile font scale class
      if (config.fontScale !== 1.0) {
        document.documentElement.classList.add('mobile-font-scale');
      } else {
        document.documentElement.classList.remove('mobile-font-scale');
      }
    }
  }, [systemConfig]);

  // Sleep mode functionality - Initialize sleep timer and add activity listeners
  useEffect(() => {
    if (!isAuthenticated || !systemConfig?.sleepModeDelay || systemConfig.sleepModeDelay === 0) {
      // Clear any existing timer if sleep mode is disabled
      if (sleepModeTimeout) {
        clearTimeout(sleepModeTimeout);
        setSleepModeTimeout(null);
      }
      return;
    }

    const resetSleepTimer = () => {
      if (sleepModeTimeout) {
        clearTimeout(sleepModeTimeout);
      }
      const delay = systemConfig.sleepModeDelay * 60 * 1000; // Convert minutes to milliseconds
      const timeout = setTimeout(() => {
        setShowSleepMode(true);
      }, delay);
      setSleepModeTimeout(timeout);
    };

    resetSleepTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!showSleepMode) {
        resetSleepTimer();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      if (sleepModeTimeout) {
        clearTimeout(sleepModeTimeout);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, systemConfig?.sleepModeDelay, showSleepMode, sleepModeTimeout]);

  // Keyboard shortcut to exit sleep mode
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showSleepMode) {
        setShowSleepMode(false);
        // Reset sleep timer after waking up only if sleep mode is enabled
        if (systemConfig?.sleepModeDelay && systemConfig.sleepModeDelay > 0) {
          if (sleepModeTimeout) {
            clearTimeout(sleepModeTimeout);
          }
          const delay = systemConfig.sleepModeDelay * 60 * 1000;
          const timeout = setTimeout(() => {
            setShowSleepMode(true);
          }, delay);
          setSleepModeTimeout(timeout);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showSleepMode, sleepModeTimeout, systemConfig?.sleepModeDelay]);

  // Professional loading component
  const LoadingCard = ({ children }: { children: React.ReactNode }) => (
    <Card className="animate-pulse-professional">
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );

  useEffect(() => {
  

  // Listen for custom navigation events from notifications
    const handleSwitchToTransactions = (event: CustomEvent) => {
      setActiveTab('transactions');
      const { transactionId } = event.detail;
      if (transactionId) {
        // You could scroll to specific transaction here
        console.log('Navigating to transaction:', transactionId);
      }
    };

    // PWA event listeners
    const handlePWAUpdate = (event: CustomEvent) => {
      console.log('PWA update available');
      // You could show a toast or modal here
    };

    const handleAppFocus = () => {
      console.log('App focused');
      // Refresh data when app comes into focus
      if (exchangeRates && exchangeRates.length > 0) {
        refreshData();
      }
    };

    const handleAppOnline = () => {
      console.log('App online');
      // Trigger data sync when back online
      refreshData();
    };

    const handleAppOffline = () => {
      console.log('App offline');
      // You could show offline indicator
    };

    window.addEventListener('switchToTransactions', handleSwitchToTransactions as EventListener);
    window.addEventListener('pwa-update-available', handlePWAUpdate as EventListener);
    window.addEventListener('app-focus', handleAppFocus);
    window.addEventListener('app-online', handleAppOnline);
    window.addEventListener('app-offline', handleAppOffline);
    
    return () => {
      window.removeEventListener('switchToTransactions', handleSwitchToTransactions as EventListener);
      window.removeEventListener('pwa-update-available', handlePWAUpdate as EventListener);
      window.removeEventListener('app-focus', handleAppFocus);
      window.removeEventListener('app-online', handleAppOnline);
      window.removeEventListener('app-offline', handleAppOffline);
    };
  }, [exchangeRates]);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionPreview(true);
    // Prevent body scroll when modal opens
    document.body.classList.add('modal-open');
  };

  const handleCloseTransactionPreview = () => {
    setShowTransactionPreview(false);
    setSelectedTransaction(null);
    // Re-enable body scroll when modal closes
    document.body.classList.remove('modal-open');
  };

  const handleTransactionComplete = (transactionId: string) => {
    updateTransactionStatus(transactionId, 'completed');
    
    // Show completion animation with enhanced feedback
    toast.success("🎉 Transaction Completed Successfully!", {
      description: "The recipient can now collect the funds. Receipt is ready for download.",
      duration: 5000,
    });
  };

  const handleTransactionContinue = (transactionData: any) => {
    // Update transaction with receiver information
    setTransactions(prev => prev?.map(t => 
      t.id === transactionData.id 
        ? {
            ...t,
            receiverName: transactionData.receiverData.name,
            receiverEmail: transactionData.receiverData.email,
            receiverPhone: transactionData.receiverData.phone,
            receiverAmount: transactionData.receiverData.amount,
            exchangeRate: transactionData.editedRate
          }
        : t
    ) || []);
    
    toast.success("Transaction information updated successfully");
  };

  // Enhanced data initialization with safety checks
  const [dataInitialized, setDataInitialized] = useState(false);

  useEffect(() => {
    console.log('🔄 App: Data initialization useEffect triggered');
    console.log('Current data state:', {
      transactionsLength: transactions?.length,
      clientsLength: clients?.length,
      exchangeRatesLength: exchangeRates?.length,
      invoicesLength: invoices?.length
    });
    
    const initializeData = async () => {
      try {
        console.log('📊 Initializing data...');
        
        // Initialize transactions with better error handling
        if (!transactions || transactions.length === 0) {
          console.log('Setting sample transactions');
          const sampleTransactions: Transaction[] = [
            {
              id: "TXN-001",
              clientName: "John Smith",
              clientEmail: "john.smith@email.com",
              amount: 1000,
              fromCurrency: "USD",
              toCurrency: "GHS",
              exchangeRate: 12.45,
              fee: 25,
              status: "completed",
              createdAt: new Date().toISOString(),
              receiptPrinted: true,
              phoneNumber: "+1-555-0123",
              transactionType: "send" as const,
              uniqueId: "A1B2C3D",
              formatId: "USD-123-2406132158-00001",
              uniqueCode: "RJB3er43wd5"
            },
            {
              id: "TXN-002",
              clientName: "Mary Johnson",
              clientEmail: "mary.j@email.com",
              amount: 500,
              fromCurrency: "USD",
              toCurrency: "NGN",
              exchangeRate: 795.50,
              fee: 15,
              status: "pending",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              receiptPrinted: false,
              phoneNumber: "+1-555-0124",
              transactionType: "send" as const,
              uniqueId: "B2C3D4E",
              formatId: "USD-124-2406132157-00002",
              uniqueCode: "RJB4rf56tg7"
            },
            {
              id: "TXN-003",
              clientName: "David Brown",
              clientEmail: "david.brown@email.com",
              amount: 750,
              fromCurrency: "USD",
              toCurrency: "PHP",
              exchangeRate: 56.75,
              fee: 20,
              status: "completed",
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              receiptPrinted: true,
              phoneNumber: "+1-555-0125",
              transactionType: "receive" as const,
              uniqueId: "C3D4E5F",
              formatId: "PHP-125-2406132156-00003",
              uniqueCode: "RJB5tg67yh8"
            },
            // Add more pending transactions for testing receive functionality
            {
              id: "TXN-004",
              clientName: "Sarah Wilson",
              clientEmail: "sarah.wilson@email.com",
              amount: 800,
              fromCurrency: "USD",
              toCurrency: "GHS",
              exchangeRate: 12.45,
              fee: 20,
              status: "pending",
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              receiptPrinted: false,
              phoneNumber: "+1-555-0126",
              transactionType: "send" as const,
              uniqueId: "D4E5F6G",
              formatId: "USD-126-2406132155-00004",
              uniqueCode: "RJB6yh78uj9"
            },
            {
              id: "TXN-005",
              clientName: "Michael Chen",
              clientEmail: "m.chen@email.com",
              amount: 1200,
              fromCurrency: "USD",
              toCurrency: "PHP",
              exchangeRate: 56.75,
              fee: 30,
              status: "pending",
              createdAt: new Date(Date.now() - 900000).toISOString(),
              receiptPrinted: false,
              phoneNumber: "+1-555-0127",
              transactionType: "send" as const,
              uniqueId: "E5F6G7H",
              formatId: "USD-127-2406132154-00005",
              uniqueCode: "RJB7uj90ik0"
            },
            {
              id: "TXN-006",
              clientName: "Lisa Rodriguez",
              clientEmail: "lisa.r@email.com",
              amount: 650,
              fromCurrency: "USD",
              toCurrency: "NGN",
              exchangeRate: 795.50,
              fee: 18,
              status: "pending",
              createdAt: new Date(Date.now() - 2700000).toISOString(),
              receiptPrinted: false,
              phoneNumber: "+1-555-0128",
              transactionType: "send" as const,
              uniqueId: "F6G7H8I",
              formatId: "USD-128-2406132153-00006",
              uniqueCode: "RJB8ik01ol2"
            }
          ];
          setTransactions(sampleTransactions);
        }

        // Initialize clients with better error handling
        if (!clients || clients.length === 0) {
          console.log('Setting sample clients');
          const sampleClients: Client[] = [
            {
              id: "CL-001",
              name: "John Smith",
              email: "john.smith@email.com",
              phone: "+1-555-0123",
              totalTransactions: 15,
              totalVolume: 12500,
              lastVisit: new Date().toISOString(),
              verificationStatus: "verified",
              registrationDate: new Date(Date.now() - 30 * 24 * 3600000).toISOString()
            },
            {
              id: "CL-002",
              name: "Mary Johnson",
              email: "mary.j@email.com",
              phone: "+1-555-0124",
              totalTransactions: 8,
              totalVolume: 6200,
              lastVisit: new Date(Date.now() - 3600000).toISOString(),
              verificationStatus: "verified",
              registrationDate: new Date(Date.now() - 45 * 24 * 3600000).toISOString()
            },
            {
              id: "CL-003",
              name: "David Brown",
              email: "david.brown@email.com",
              phone: "+1-555-0125",
              totalTransactions: 3,
              totalVolume: 2100,
              lastVisit: new Date(Date.now() - 7200000).toISOString(),
              verificationStatus: "pending",
              registrationDate: new Date(Date.now() - 7 * 24 * 3600000).toISOString()
            }
          ];
          setClients(sampleClients);
        }

        if (!exchangeRates || exchangeRates.length === 0) {
        const sampleRates: ExchangeRate[] = [
          // Africa
          { pair: "USD/GHS", rate: 12.45, change: 0.15, changePercent: 1.22, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/NGN", rate: 795.50, change: -5.25, changePercent: -0.66, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/KES", rate: 129.75, change: 2.10, changePercent: 1.64, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/ZAR", rate: 18.75, change: -0.12, changePercent: -0.64, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/EGP", rate: 30.85, change: 0.25, changePercent: 0.82, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/MAD", rate: 10.15, change: 0.08, changePercent: 0.79, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/TND", rate: 3.12, change: -0.02, changePercent: -0.64, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/ETB", rate: 55.20, change: 1.15, changePercent: 2.13, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/UGX", rate: 3750.00, change: 25.50, changePercent: 0.68, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/TZS", rate: 2510.00, change: -15.75, changePercent: -0.62, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/RWF", rate: 1285.50, change: 8.25, changePercent: 0.65, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/XOF", rate: 615.25, change: 3.75, changePercent: 0.61, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/BWP", rate: 13.65, change: -0.08, changePercent: -0.58, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/NAD", rate: 18.75, change: -0.12, changePercent: -0.64, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/ZMW", rate: 26.50, change: 0.35, changePercent: 1.34, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/AOA", rate: 835.50, change: 5.75, changePercent: 0.69, lastUpdated: new Date().toISOString(), region: 'africa' },

          // Asia
          { pair: "USD/INR", rate: 83.25, change: 0.45, changePercent: 0.54, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/PHP", rate: 56.75, change: -0.85, changePercent: -1.48, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/JPY", rate: 149.85, change: 1.25, changePercent: 0.84, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/CNY", rate: 7.28, change: -0.02, changePercent: -0.27, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/KRW", rate: 1335.50, change: 8.75, changePercent: 0.66, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/SGD", rate: 1.35, change: -0.01, changePercent: -0.74, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/MYR", rate: 4.68, change: 0.03, changePercent: 0.65, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/THB", rate: 36.45, change: -0.25, changePercent: -0.68, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/VND", rate: 24350.00, change: 125.00, changePercent: 0.52, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/IDR", rate: 15750.00, change: -85.50, changePercent: -0.54, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/PKR", rate: 285.75, change: 2.15, changePercent: 0.76, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/LKR", rate: 325.50, change: -1.85, changePercent: -0.56, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/BDT", rate: 109.85, change: 0.65, changePercent: 0.60, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/NPR", rate: 133.20, change: 0.85, changePercent: 0.64, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/MMK", rate: 2095.00, change: 15.75, changePercent: 0.76, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/KHR", rate: 4125.00, change: 25.50, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/LAK", rate: 20850.00, change: 125.00, changePercent: 0.60, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/MNT", rate: 3450.00, change: 18.75, changePercent: 0.55, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/AFN", rate: 72.50, change: 0.45, changePercent: 0.63, lastUpdated: new Date().toISOString(), region: 'asia' },

          // Europe
          { pair: "USD/EUR", rate: 0.92, change: -0.005, changePercent: -0.54, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/GBP", rate: 0.79, change: -0.003, changePercent: -0.38, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/CHF", rate: 0.88, change: 0.002, changePercent: 0.23, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/SEK", rate: 10.85, change: 0.08, changePercent: 0.74, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/NOK", rate: 10.65, change: 0.12, changePercent: 1.14, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/DKK", rate: 6.85, change: -0.04, changePercent: -0.58, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/PLN", rate: 4.28, change: 0.03, changePercent: 0.71, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/CZK", rate: 22.75, change: 0.15, changePercent: 0.66, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/HUF", rate: 365.50, change: 2.25, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/RON", rate: 4.68, change: 0.02, changePercent: 0.43, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/BGN", rate: 1.80, change: -0.01, changePercent: -0.56, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/HRK", rate: 6.95, change: -0.04, changePercent: -0.57, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/RSD", rate: 108.50, change: 0.75, changePercent: 0.70, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/RUB", rate: 95.25, change: 1.85, changePercent: 1.98, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/UAH", rate: 36.85, change: 0.25, changePercent: 0.68, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/TRY", rate: 28.75, change: 0.45, changePercent: 1.59, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/ALL", rate: 95.25, change: 0.65, changePercent: 0.69, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/AMD", rate: 395.50, change: 2.25, changePercent: 0.57, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/AZN", rate: 1.70, change: 0.01, changePercent: 0.59, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/BAM", rate: 1.80, change: -0.01, changePercent: -0.56, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/BYN", rate: 3.25, change: 0.02, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'europe' },

          // North America (USA pinned to top)
          { pair: "USD/USD", rate: 1.00, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/CAD", rate: 1.36, change: 0.008, changePercent: 0.59, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/MXN", rate: 17.85, change: -0.12, changePercent: -0.67, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/GTQ", rate: 7.85, change: -0.03, changePercent: -0.38, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/HNL", rate: 24.65, change: 0.08, changePercent: 0.33, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/NIO", rate: 36.75, change: 0.15, changePercent: 0.41, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/CRC", rate: 535.50, change: 2.25, changePercent: 0.42, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/PAB", rate: 1.00, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/DOP", rate: 56.85, change: 0.35, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/JMD", rate: 155.25, change: 0.85, changePercent: 0.55, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/BBD", rate: 2.00, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/BZD", rate: 2.02, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/BMD", rate: 1.00, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/KYD", rate: 0.83, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/AWG", rate: 1.79, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },

          // South America
          { pair: "USD/BRL", rate: 4.95, change: 0.08, changePercent: 1.64, lastUpdated: new Date().toISOString(), region: 'south-america' },
          { pair: "USD/ARS", rate: 365.50, change: 8.75, changePercent: 2.45, lastUpdated: new Date().toISOString(), region: 'south-america' },
          { pair: "USD/CLP", rate: 885.50, change: -5.25, changePercent: -0.59, lastUpdated: new Date().toISOString(), region: 'south-america' },
          { pair: "USD/COP", rate: 4125.00, change: 25.50, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'south-america' },
          { pair: "USD/PEN", rate: 3.75, change: 0.02, changePercent: 0.54, lastUpdated: new Date().toISOString(), region: 'south-america' },
          { pair: "USD/UYU", rate: 39.25, change: -0.15, changePercent: -0.38, lastUpdated: new Date().toISOString(), region: 'south-america' },
          { pair: "USD/VES", rate: 36.15, change: 0.85, changePercent: 2.41, lastUpdated: new Date().toISOString(), region: 'south-america' },
          { pair: "USD/BOB", rate: 6.92, change: 0.01, changePercent: 0.14, lastUpdated: new Date().toISOString(), region: 'south-america' },
          { pair: "USD/PYG", rate: 7350.00, change: 45.50, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'south-america' },

          // Oceania
          { pair: "USD/AUD", rate: 1.52, change: 0.01, changePercent: 0.66, lastUpdated: new Date().toISOString(), region: 'oceania' },
          { pair: "USD/NZD", rate: 1.65, change: 0.008, changePercent: 0.49, lastUpdated: new Date().toISOString(), region: 'oceania' },
          { pair: "USD/FJD", rate: 2.25, change: 0.01, changePercent: 0.45, lastUpdated: new Date().toISOString(), region: 'oceania' },

          // Middle East
          { pair: "USD/AED", rate: 3.67, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/SAR", rate: 3.75, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/QAR", rate: 3.64, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/KWD", rate: 0.31, change: -0.001, changePercent: -0.32, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/BHD", rate: 0.38, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/OMR", rate: 0.39, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/JOD", rate: 0.71, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/LBP", rate: 15050.00, change: 50.00, changePercent: 0.33, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/ILS", rate: 3.85, change: 0.02, changePercent: 0.52, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/IRR", rate: 42150.00, change: 250.00, changePercent: 0.60, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/IQD", rate: 1310.00, change: 8.50, changePercent: 0.65, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/SYP", rate: 2512.50, change: 15.75, changePercent: 0.63, lastUpdated: new Date().toISOString(), region: 'middle-east' },
          { pair: "USD/YER", rate: 250.75, change: 1.25, changePercent: 0.50, lastUpdated: new Date().toISOString(), region: 'middle-east' },

          // Additional Africa
          { pair: "USD/DZD", rate: 134.50, change: 0.85, changePercent: 0.63, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/LYD", rate: 4.85, change: 0.03, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/SDG", rate: 602.50, change: 3.75, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/SOS", rate: 571.25, change: 2.85, changePercent: 0.50, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/DJF", rate: 177.85, change: 0.95, changePercent: 0.54, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/ERN", rate: 15.00, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/MZN", rate: 63.75, change: 0.45, changePercent: 0.71, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/MWK", rate: 1735.00, change: 12.50, changePercent: 0.72, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/SZL", rate: 18.75, change: -0.12, changePercent: -0.64, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/LSL", rate: 18.75, change: -0.12, changePercent: -0.64, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/MGA", rate: 4650.00, change: 28.50, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/MUR", rate: 46.25, change: 0.32, changePercent: 0.70, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/SCR", rate: 13.45, change: 0.08, changePercent: 0.60, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/GMD", rate: 71.50, change: 0.45, changePercent: 0.63, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/GNF", rate: 8625.00, change: 52.50, changePercent: 0.61, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/SLE", rate: 22.75, change: 0.15, changePercent: 0.66, lastUpdated: new Date().toISOString(), region: 'africa' },
          { pair: "USD/LRD", rate: 195.50, change: 1.25, changePercent: 0.64, lastUpdated: new Date().toISOString(), region: 'africa' },

          // Additional Asia
          { pair: "USD/UZS", rate: 12450.00, change: 75.50, changePercent: 0.61, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/KZT", rate: 485.75, change: 3.25, changePercent: 0.67, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/KGS", rate: 86.50, change: 0.55, changePercent: 0.64, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/TJS", rate: 10.95, change: 0.07, changePercent: 0.64, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/TMT", rate: 3.50, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/BND", rate: 1.35, change: -0.01, changePercent: -0.74, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/MVR", rate: 15.42, change: 0.01, changePercent: 0.06, lastUpdated: new Date().toISOString(), region: 'asia' },
          { pair: "USD/BTN", rate: 84.25, change: 0.50, changePercent: 0.60, lastUpdated: new Date().toISOString(), region: 'asia' },

          // Additional Europe  
          { pair: "USD/ISK", rate: 138.50, change: 0.85, changePercent: 0.62, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/MDL", rate: 18.25, change: 0.12, changePercent: 0.66, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/MKD", rate: 56.75, change: 0.38, changePercent: 0.67, lastUpdated: new Date().toISOString(), region: 'europe' },
          { pair: "USD/GEL", rate: 2.75, change: 0.02, changePercent: 0.73, lastUpdated: new Date().toISOString(), region: 'europe' },

          // Additional Caribbean & Islands
          { pair: "USD/BMD", rate: 1.00, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/KYD", rate: 0.83, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' },
          { pair: "USD/AWG", rate: 1.79, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'north-america' }
        ];
        setExchangeRates(sampleRates);
      }

      if (!invoices || invoices.length === 0) {
        const sampleInvoices: InvoiceData[] = [
          {
            id: "INV-001",
            receiverName: "Sarah Wilson",
            receiverEmail: "sarah.wilson@email.com",
            receiverPhone: "+1-555-0199",
            amount: 2500,
            description: "Consulting services for Q4 2024",
            dueDate: new Date(Date.now() + 14 * 24 * 3600000).toISOString().split('T')[0],
            status: "sent",
            createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
          },
          {
            id: "INV-002",
            receiverName: "Michael Chen",
            receiverEmail: "m.chen@techcorp.com",
            receiverPhone: "+1-555-0200",
            amount: 1800,
            description: "Web development project - Phase 1",
            dueDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split('T')[0],
            status: "draft",
            createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString()
          }
        ];
        setInvoices(sampleInvoices);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      // Set empty arrays as fallback
      if (!transactions) setTransactions([]);
      if (!clients) setClients([]);
      if (!exchangeRates) setExchangeRates([]);
      if (!invoices) setInvoices([]);
    }
    
    setDataInitialized(true);
    console.log('✅ Data initialization complete');
  };

    initializeData();
    return () => {
      console.log('🔄 Data initialization useEffect cleanup');
    };
  }, []); // Remove circular dependencies - only initialize once on mount

  useEffect(() => {
  
    // Enhanced startup sequence with faster loading
    const initializeApp = async () => {
      try {
        // Show splash screen briefly
        await new Promise(resolve => setTimeout(resolve, 600));
        setShowSplash(false);
        
        // Then show detailed loading screen
        await new Promise(resolve => setTimeout(resolve, 400)); // Auth check
        await new Promise(resolve => setTimeout(resolve, 300)); // Data loading  
        await new Promise(resolve => setTimeout(resolve, 200)); // UI preparation
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setIsInitialLoad(false);
        setShowSplash(false);
      }
    };

    // Initialize mobile service
    const initializeMobile = async () => {
      try {
        // PWA lifecycle monitoring only
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            console.log('📱 App became active - refreshing data');
            refreshData();
          }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      } catch (error) {
        console.error('Error initializing PWA service:', error);
      }
    };

    initializeApp();
    // Initialize PWA service
    const initializePWA = async () => {
      try {
        // Setup PWA event listeners
        const handlePhotoCapture = (event: any) => {
          console.log('📸 Photo captured:', event.detail);
          // You could save the photo or add it to transactions
        };

        const handleFileShared = (event: any) => {
          console.log('📄 File shared:', event.detail);
          // Handle shared CSV/JSON files
          if (event.detail.type === 'text/csv') {
            // Process CSV transaction data
            setActiveTab('transactions');
          }
        };

        const handleAppShortcut = (event: any) => {
          console.log('🔗 App shortcut used:', event.detail);
          if (event.detail.tab) {
            setActiveTab(event.detail.tab);
          }
        };

        // Setup PWA event listeners
        window.addEventListener('photo-captured', handlePhotoCapture);
        window.addEventListener('file-shared', handleFileShared);
        window.addEventListener('app-shortcut', handleAppShortcut);

        // PWA lifecycle monitoring
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            console.log('📱 App became active - refreshing data');
            refreshData();
          }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          window.removeEventListener('photo-captured', handlePhotoCapture);
          window.removeEventListener('file-shared', handleFileShared);
          window.removeEventListener('app-shortcut', handleAppShortcut);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      } catch (error) {
        console.error('Error initializing PWA service:', error);
      }
    };
  }, []); // Remove dataInitialized dependency to prevent re-runs

  // Simulated printer connection check
  useEffect(() => {
    const checkPrinterStatus = () => {
      const isConnected = Math.random() > 0.1; // 90% chance connected
      setPrinterStatus((prev) => ({
        connected: isConnected,
        paperLevel: Math.floor(Math.random() * 100),
        model: prev?.model || "ESC/POS Thermal Printer",
        temperature: 35 + Math.floor(Math.random() * 20),
        errors: isConnected ? [] : ["Connection timeout", "Check USB cable"]
      }));
    };

    checkPrinterStatus();
    const interval = setInterval(checkPrinterStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePrintReceipt = async (transactionId: string) => {
    setIsLoading(true);
    
    try {
      // Simulate print job - Faster
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (printerStatus?.connected) {
        setTransactions((prev) => prev?.map(t => 
          t.id === transactionId ? { ...t, receiptPrinted: true } : t
        ) || []);
        toast.success("Receipt printed successfully");
      } else {
        toast.error("Printer not connected");
      }
    } catch (error) {
      toast.error("Print failed");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);

    try {
      // Fetch real-time exchange rates from API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();

      if (data && data.rates) {
        // Convert API response to our ExchangeRate format
        const updatedRates: ExchangeRate[] = Object.entries(data.rates).map(([currency, rateValue]) => {
          // Map currencies to regions for better organization
          const regionMap: { [key: string]: ExchangeRate['region'] } = {
            // North America
            'USD': 'north-america', 'CAD': 'north-america', 'MXN': 'north-america',
            'GTQ': 'north-america', 'HNL': 'north-america', 'NIO': 'north-america',
            'CRC': 'north-america', 'PAB': 'north-america', 'DOP': 'north-america',
            'JMD': 'north-america', 'BBD': 'north-america', 'BZD': 'north-america',
            'BMD': 'north-america', 'KYD': 'north-america', 'AWG': 'north-america',

            // Europe
            'EUR': 'europe', 'GBP': 'europe', 'CHF': 'europe', 'SEK': 'europe',
            'NOK': 'europe', 'DKK': 'europe', 'PLN': 'europe', 'CZK': 'europe',
            'HUF': 'europe', 'RON': 'europe', 'BGN': 'europe', 'HRK': 'europe',
            'RSD': 'europe', 'RUB': 'europe', 'UAH': 'europe', 'TRY': 'europe',
            'ALL': 'europe', 'AMD': 'europe', 'AZN': 'europe', 'BAM': 'europe',
            'BYN': 'europe', 'ISK': 'europe', 'MDL': 'europe', 'MKD': 'europe',
            'GEL': 'europe',

            // Asia
            'JPY': 'asia', 'CNY': 'asia', 'KRW': 'asia', 'SGD': 'asia',
            'MYR': 'asia', 'THB': 'asia', 'VND': 'asia', 'IDR': 'asia',
            'PKR': 'asia', 'LKR': 'asia', 'BDT': 'asia', 'NPR': 'asia',
            'MMK': 'asia', 'KHR': 'asia', 'LAK': 'asia', 'MNT': 'asia',
            'AFN': 'asia', 'UZS': 'asia', 'KZT': 'asia', 'KGS': 'asia',
            'TJS': 'asia', 'TMT': 'asia', 'BND': 'asia', 'MVR': 'asia',
            'BTN': 'asia', 'INR': 'asia', 'PHP': 'asia',

            // Africa
            'GHS': 'africa', 'NGN': 'africa', 'KES': 'africa', 'ZAR': 'africa',
            'EGP': 'africa', 'MAD': 'africa', 'TND': 'africa', 'ETB': 'africa',
            'UGX': 'africa', 'TZS': 'africa', 'RWF': 'africa', 'XOF': 'africa',
            'BWP': 'africa', 'NAD': 'africa', 'ZMW': 'africa', 'AOA': 'africa',
            'DZD': 'africa', 'LYD': 'africa', 'SDG': 'africa', 'SOS': 'africa',
            'DJF': 'africa', 'ERN': 'africa', 'MZN': 'africa', 'MWK': 'africa',
            'SZL': 'africa', 'LSL': 'africa', 'MGA': 'africa', 'MUR': 'africa',
            'SCR': 'africa', 'GMD': 'africa', 'GNF': 'africa', 'SLE': 'africa',
            'LRD': 'africa',

            // South America
            'BRL': 'south-america', 'ARS': 'south-america', 'CLP': 'south-america',
            'COP': 'south-america', 'PEN': 'south-america', 'UYU': 'south-america',
            'VES': 'south-america', 'BOB': 'south-america', 'PYG': 'south-america',

            // Oceania
            'AUD': 'oceania', 'NZD': 'oceania', 'FJD': 'oceania',

            // Middle East
            'AED': 'middle-east', 'SAR': 'middle-east', 'QAR': 'middle-east',
            'KWD': 'middle-east', 'BHD': 'middle-east', 'OMR': 'middle-east',
            'JOD': 'middle-east', 'LBP': 'middle-east', 'ILS': 'middle-east',
            'IRR': 'middle-east', 'IQD': 'middle-east', 'SYP': 'middle-east',
            'YER': 'middle-east'
          };

          const region = regionMap[currency] || 'other';

          // Calculate change and changePercent (using previous rate if available)
          const previousRate = (exchangeRates || []).find(r => r.pair === `USD/${currency}`)?.rate || (rateValue as number);
          const change = (rateValue as number) - previousRate;
          const changePercent = previousRate !== 0 ? (change / previousRate) * 100 : 0;

          return {
            pair: `USD/${currency}`,
            rate: rateValue as number,
            change,
            changePercent,
            lastUpdated: new Date().toISOString(),
            region: region as ExchangeRate['region']
          };
        });

        // Sort to put North America first, then other regions
        updatedRates.sort((a, b) => {
          if (a.region === 'north-america' && b.region !== 'north-america') return -1;
          if (a.region !== 'north-america' && b.region === 'north-america') return 1;
          return a.pair.localeCompare(b.pair);
        });

        setExchangeRates(updatedRates);
        toast.success("Exchange rates updated with live data");
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);

      // Fallback to simulated refresh if API fails
      setExchangeRates((prev) => (prev || []).map(rate => {
        if (!rate) return rate;
        return {
          ...rate,
          rate: (rate.rate || 1) + (Math.random() - 0.5) * 0.1,
          change: (Math.random() - 0.5) * 2,
          changePercent: (Math.random() - 0.5) * 3,
          lastUpdated: new Date().toISOString()
        };
      }));

      toast.error("Using cached rates - API unavailable");
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportData = async (type: 'transactions' | 'clients' | 'invoices' | 'countries') => {
    let data;
    let filename;
    
    switch (type) {
      case 'transactions':
        data = transactions;
        filename = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'clients':
        data = clients;
        filename = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'invoices':
        data = invoices;
        filename = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'countries':
        data = exchangeRates;
        filename = `exchange_rates_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        data = [];
        filename = `export_${new Date().toISOString().split('T')[0]}.csv`;
    }
    
    // Generate CSV content
    const csvContent = (data && data.length > 0 && data[0] ? Object.keys(data[0]).join(",") + "\n" + 
     data.filter(row => row).map(row => Object.values(row).join(",")).join("\n") : "");
    
    if (isElectron) {
      // Desktop: Use native file dialog
      const result = await showSaveDialog({
        title: `Export ${type}`,
        defaultPath: filename,
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (!result.canceled && result.filePath) {
        try {
          await writeFile(result.filePath, csvContent);
          toast.success(`${type} data exported successfully`);
        } catch (error) {
          toast.error(`Failed to export ${type} data`);
        }
      }
    } else {
      // Web: Use browser download
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${type} data exported successfully`);
    }
  };

  // Remove Electron menu listeners - Web app doesn't need this
  useEffect(() => {
    if (isElectron) {
      // Desktop: Register menu handlers
      const cleanup = registerMenuHandlers({
        'new-transaction': () => {
          toast.success('Creating new transaction...');
          // You could open a transaction modal here
        },
        'export-data': () => {
          exportData('transactions');
        },
        'print-receipt': () => {
          // Print most recent transaction
          const recentTransaction = transactions?.[0];
          if (recentTransaction) {
            handlePrintReceipt(recentTransaction.id || '');
          } else {
            toast.error('No transactions to print');
          }
        },
        'switch-tab': (tab: string) => {
          setActiveTab(tab);
        },
        'refresh-data': () => {
          refreshData();
        },
        'toggle-theme': () => {
          toggleTheme();
        },
        'open-settings': () => {
          setShowSystemSettings(true);
        },
        'open-rate-alerts': () => {
          setShowRateAlerts(true);
        },
        'backup-data': async (filePath: string) => {
          try {
            const backupData = {
              transactions,
              clients,
              invoices,
              exchangeRates,
              systemConfig,
              exportDate: new Date().toISOString()
            };
            await writeFile(filePath, JSON.stringify(backupData, null, 2));
            toast.success('Data backed up successfully');
          } catch (error) {
            toast.error('Failed to backup data');
          }
        },
        'restore-data': async (filePath: string) => {
          try {
            const data = await readFile(filePath);
            const backupData = JSON.parse(data);
            
            if (backupData.transactions) setTransactions(backupData.transactions);
            if (backupData.clients) setClients(backupData.clients);
            if (backupData.invoices) setInvoices(backupData.invoices);
            if (backupData.exchangeRates) setExchangeRates(backupData.exchangeRates);
            if (backupData.systemConfig) setSystemConfig(backupData.systemConfig);
            
            toast.success('Data restored successfully');
          } catch (error) {
            toast.error('Failed to restore data');
          }
        }
      });

      // Register theme change handler
      const themeCleanup = registerThemeHandler((isDark: boolean) => {
        setIsDarkMode(isDark);
        setSystemConfig(prev => {
          const current = prev || {
            companyName: "RJB TRANZ",
            companyEmail: "admin@rjbtranz.com", 
            companyPhone: "+233-123-456-789",
            companyAddress: "Accra, Ghana",
            businessLicense: "BL-2024-001",
            taxId: "TIN-123456789",
            baseCurrency: "USD",
            defaultFeeRate: 2.5,
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
            theme: "light" as const,
            sleepModeDelay: 10,
            fontScale: 1.0
          };
          return { ...current, theme: isDark ? 'dark' : 'light' };
        });
      });

      return () => {
        cleanup?.();
        themeCleanup?.();
      };
    }
  }, [isElectron, transactions, clients, invoices, exchangeRates, systemConfig]);

  const handleCreateInvoice = (data: any) => {
    const newInvoice: InvoiceData = {
      id: `INV-${Date.now()}`,
      receiverName: data.receiverName,
      receiverEmail: data.receiverEmail,
      receiverPhone: data.receiverPhone,
      amount: parseFloat(data.amount),
      description: data.description,
      dueDate: data.dueDate,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    setInvoices(prev => [...(prev || []), newInvoice]);
    setSelectedInvoiceCountry(null);
    setActiveTab('invoices');
    toast.success("Invoice created successfully");
  };

  const handleCountrySelectionForInvoice = (currencyPair: string) => {
    const currency = currencyPair.includes('/') ? currencyPair.split('/')[1] : currencyPair;
    const rate = exchangeRates?.find(r => r.pair === currencyPair);
    
    if (rate) {
      setSelectedInvoiceCountry({
        flag: getCountryFlag(currencyPair),
        name: getCountryName(currencyPair),
        currency: currency,
        pair: currencyPair,
        rate: rate
      });
    }
  };

  const handleCountrySelectionContinue = () => {
    setShowCountrySelection(false);
    if (selectedInvoiceCountry) {
      // Show the same modal that appears when a country is selected
      setSelectedCountry({
        flag: selectedInvoiceCountry.flag,
        name: selectedInvoiceCountry.name,
        currency: selectedInvoiceCountry.currency,
        pair: selectedInvoiceCountry.pair,
        rate: selectedInvoiceCountry.rate,
        region: selectedInvoiceCountry.rate.region
      });
      // Prevent body scroll when modal opens
      document.body.classList.add('modal-open');
    }
    // Reset search and filter state
    setInvoiceCountrySearch('');
    setSelectedContinent('all');
  };

  const handleCountrySelectionCancel = () => {
    setShowCountrySelection(false);
    setSelectedInvoiceCountry(null);
    setInvoiceCountrySearch('');
    setSelectedContinent('all');
  };

  const updateTransactionStatus = (transactionId: string, newStatus: 'pending' | 'completed' | 'failed' | 'cancelled') => {
    setTransactions((prev) => prev?.map(t => 
      t.id === transactionId ? { ...t, status: newStatus } : t
    ) || []);
    
    // Find the transaction to get details for notification
    const transaction = transactions?.find(t => t.id === transactionId);
    if (transaction) {
      showTransactionNotification('updated', {
        id: transaction.id,
        clientName: transaction.clientName,
        amount: transaction.amount,
        currency: transaction.fromCurrency
      });
    }
    
    // Show appropriate toast message based on status
    if (newStatus === 'completed') {
      toast.success(`Transaction completed successfully! 🎉`);
    } else if (newStatus === 'pending') {
      toast.info(`Transaction is now pending processing`);
    } else if (newStatus === 'failed') {
      toast.error(`Transaction failed - please review and retry`);
    } else if (newStatus === 'cancelled') {
      toast.warning(`Transaction cancelled`);
    } else {
      toast.success(`Transaction status updated to ${newStatus}`);
    }
  };

  // Function to complete pending transactions automatically (can be triggered by external events)
  const completePendingTransaction = (transactionId: string) => {
    const transaction = transactions?.find(t => t.id === transactionId);
    if (transaction && transaction.status === 'pending') {
      updateTransactionStatus(transactionId, 'completed');
      
      // Additional actions when transaction is completed
      if (systemConfig?.printReceipts && !transaction.receiptPrinted) {
        setTimeout(() => {
          handlePrintReceipt(transactionId);
        }, 1000); // Auto-print receipt after 1 second
      }
    }
  };

  // Batch complete multiple pending transactions
  const completeAllPendingTransactions = () => {
    const pendingTransactions = transactions?.filter(t => t.status === 'pending') || [];
    
    if (pendingTransactions.length === 0) {
      toast.info('No pending transactions to complete');
      return;
    }

    pendingTransactions.forEach((transaction, index) => {
      setTimeout(() => {
        updateTransactionStatus(transaction.id, 'completed');
      }, index * 200); // Stagger the completions
    });

    toast.success(`Completing ${pendingTransactions.length} pending transactions...`);
  };

  // Country flag mapping function
  const getCountryFlag = (currencyPair: string) => {
    const currency = currencyPair.includes('/') ? currencyPair.split('/')[1] : currencyPair;
    const flagMap: { [key: string]: string } = {
      // Africa
      'GHS': '🇬🇭', // Ghana
      'NGN': '🇳🇬', // Nigeria
      'KES': '🇰🇪', // Kenya
      'ZAR': '🇿🇦', // South Africa
      'EGP': '🇪🇬', // Egypt
      'MAD': '🇲🇦', // Morocco
      'TND': '🇹🇳', // Tunisia
      'ETB': '🇪🇹', // Ethiopia
      'UGX': '🇺🇬', // Uganda
      'TZS': '🇹🇿', // Tanzania
      'RWF': '🇷🇼', // Rwanda
      'XOF': '🇸🇳', // West African CFA (Senegal representative)
      'BWP': '🇧🇼', // Botswana
      'NAD': '🇳🇦', // Namibia
      'ZMW': '🇿🇲', // Zambia
      'AOA': '🇦🇴', // Angola

      // Asia
      'INR': '🇮🇳', // India
      'PHP': '🇵🇭', // Philippines
      'JPY': '🇯🇵', // Japan
      'CNY': '🇨🇳', // China
      'KRW': '🇰🇷', // South Korea
      'SGD': '🇸🇬', // Singapore
      'MYR': '🇲🇾', // Malaysia
      'THB': '🇹🇭', // Thailand
      'VND': '🇻🇳', // Vietnam
      'IDR': '🇮🇩', // Indonesia
      'PKR': '🇵🇰', // Pakistan
      'LKR': '🇱🇰', // Sri Lanka
      'BDT': '🇧🇩', // Bangladesh
      'NPR': '🇳🇵', // Nepal
      'MMK': '🇲🇲', // Myanmar
      'KHR': '🇰🇭', // Cambodia
      'LAK': '🇱🇦', // Laos
      'MNT': '🇲🇳', // Mongolia
      'AFN': '🇦🇫', // Afghanistan

      // Europe
      'EUR': '🇪🇺', // European Union
      'GBP': '🇬🇧', // United Kingdom
      'CHF': '🇨🇭', // Switzerland
      'SEK': '🇸🇪', // Sweden
      'NOK': '🇳🇴', // Norway
      'DKK': '🇩🇰', // Denmark
      'PLN': '🇵🇱', // Poland
      'CZK': '🇨🇿', // Czech Republic
      'HUF': '🇭🇺', // Hungary
      'RON': '🇷🇴', // Romania
      'BGN': '🇧🇬', // Bulgaria
      'HRK': '🇭🇷', // Croatia
      'RSD': '🇷🇸', // Serbia
      'RUB': '🇷🇺', // Russia
      'UAH': '🇺🇦', // Ukraine
      'TRY': '🇹🇷', // Turkey
      'ALL': '🇦🇱', // Albania
      'AMD': '🇦🇲', // Armenia
      'AZN': '🇦🇿', // Azerbaijan
      'BAM': '🇧🇦', // Bosnia and Herzegovina
      'BYN': '🇧🇾', // Belarus

      // Americas
      'CAD': '🇨🇦', // Canada
      'MXN': '🇲🇽', // Mexico
      'BRL': '🇧🇷', // Brazil
      'ARS': '🇦🇷', // Argentina
      'CLP': '🇨🇱', // Chile
      'COP': '🇨🇴', // Colombia
      'PEN': '🇵🇪', // Peru
      'UYU': '🇺🇾', // Uruguay
      'VES': '🇻🇪', // Venezuela
      'BOB': '🇧🇴', // Bolivia
      'PYG': '🇵🇾', // Paraguay
      'GTQ': '🇬🇹', // Guatemala
      'HNL': '🇭🇳', // Honduras
      'NIO': '🇳🇮', // Nicaragua
      'CRC': '🇨🇷', // Costa Rica
      'PAB': '🇵🇦', // Panama
      'DOP': '🇩🇴', // Dominican Republic
      'JMD': '🇯🇲', // Jamaica
      'BBD': '🇧🇧', // Barbados
      'BZD': '🇧🇿', // Belize

      // Oceania
      'AUD': '🇦🇺', // Australia
      'NZD': '🇳🇿', // New Zealand
      'FJD': '🇫🇯', // Fiji

      // Middle East
      'AED': '🇦🇪', // UAE
      'SAR': '🇸🇦', // Saudi Arabia
      'QAR': '🇶🇦', // Qatar
      'KWD': '🇰🇼', // Kuwait
      'BHD': '🇧🇭', // Bahrain
      'OMR': '🇴🇲', // Oman
      'JOD': '🇯🇴', // Jordan
      'LBP': '🇱🇧', // Lebanon
      'ILS': '🇮🇱', // Israel
      'IRR': '🇮🇷', // Iran
      'IQD': '🇮🇶', // Iraq
      'SYP': '🇸🇾', // Syria
      'YER': '🇾🇪', // Yemen

      // Additional Africa
      'DZD': '🇩🇿', // Algeria
      'LYD': '🇱🇾', // Libya
      'SDG': '🇸🇩', // Sudan
      'SOS': '🇸🇴', // Somalia
      'DJF': '🇩🇯', // Djibouti
      'ERN': '🇪🇷', // Eritrea
      'MZN': '🇲🇿', // Mozambique
      'MWK': '🇲🇼', // Malawi
      'SZL': '🇸🇿', // Eswatini
      'LSL': '🇱🇸', // Lesotho
      'MGA': '🇲🇬', // Madagascar
      'MUR': '🇲🇺', // Mauritius
      'SCR': '🇸🇨', // Seychelles
      'GMD': '🇬🇲', // Gambia
      'GNF': '🇬🇳', // Guinea
      'SLE': '🇸🇱', // Sierra Leone
      'LRD': '🇱🇷', // Liberia

      // Additional Asia
      'UZS': '🇺🇿', // Uzbekistan
      'KZT': '🇰🇿', // Kazakhstan
      'KGS': '🇰🇬', // Kyrgyzstan
      'TJS': '🇹🇯', // Tajikistan
      'TMT': '🇹🇲', // Turkmenistan
      'BND': '🇧🇳', // Brunei
      'MVR': '🇲🇻', // Maldives
      'BTN': '🇧🇹', // Bhutan

      // Additional Europe
      'ISK': '🇮🇸', // Iceland
      'MDL': '🇲🇩', // Moldova
      'MKD': '🇲🇰', // North Macedonia
      'GEL': '🇬🇪', // Georgia

      // Other
      'BMD': '🇧🇲', // Bermuda
      'KYD': '🇰🇾', // Cayman Islands
      'AWG': '🇦🇼', // Aruba
      'USD': '🇺🇸', // United States
    };
    
    return flagMap[currency] || '🌍';
  };

  // Country name mapping function
  const getCountryName = (currencyPair: string) => {
    const currency = currencyPair.includes('/') ? currencyPair.split('/')[1] : currencyPair;
    const countryMap: { [key: string]: string } = {
      // Africa
      'GHS': 'Ghana', 'NGN': 'Nigeria', 'KES': 'Kenya', 'ZAR': 'South Africa',
      'EGP': 'Egypt', 'MAD': 'Morocco', 'TND': 'Tunisia', 'ETB': 'Ethiopia',
      'UGX': 'Uganda', 'TZS': 'Tanzania', 'RWF': 'Rwanda', 'XOF': 'West Africa',
      'BWP': 'Botswana', 'NAD': 'Namibia', 'ZMW': 'Zambia', 'AOA': 'Angola',

      // Asia
      'INR': 'India', 'PHP': 'Philippines', 'JPY': 'Japan', 'CNY': 'China',
      'KRW': 'South Korea', 'SGD': 'Singapore', 'MYR': 'Malaysia', 'THB': 'Thailand',
      'VND': 'Vietnam', 'IDR': 'Indonesia', 'PKR': 'Pakistan', 'LKR': 'Sri Lanka',
      'BDT': 'Bangladesh', 'NPR': 'Nepal', 'MMK': 'Myanmar', 'KHR': 'Cambodia',
      'LAK': 'Laos', 'MNT': 'Mongolia', 'AFN': 'Afghanistan',

      // Europe
      'EUR': 'European Union', 'GBP': 'United Kingdom', 'CHF': 'Switzerland',
      'SEK': 'Sweden', 'NOK': 'Norway', 'DKK': 'Denmark', 'PLN': 'Poland',
      'CZK': 'Czech Republic', 'HUF': 'Hungary', 'RON': 'Romania', 'BGN': 'Bulgaria',
      'HRK': 'Croatia', 'RSD': 'Serbia', 'RUB': 'Russia', 'UAH': 'Ukraine',
      'TRY': 'Turkey', 'ALL': 'Albania', 'AMD': 'Armenia', 'AZN': 'Azerbaijan',
      'BAM': 'Bosnia Herzegovina', 'BYN': 'Belarus',

      // Americas
      'CAD': 'Canada', 'MXN': 'Mexico', 'BRL': 'Brazil', 'ARS': 'Argentina',
      'CLP': 'Chile', 'COP': 'Colombia', 'PEN': 'Peru', 'UYU': 'Uruguay',
      'VES': 'Venezuela', 'BOB': 'Bolivia', 'PYG': 'Paraguay', 'GTQ': 'Guatemala',
      'HNL': 'Honduras', 'NIO': 'Nicaragua', 'CRC': 'Costa Rica', 'PAB': 'Panama',
      'DOP': 'Dominican Republic', 'JMD': 'Jamaica', 'BBD': 'Barbados', 'BZD': 'Belize',

      // Oceania
      'AUD': 'Australia', 'NZD': 'New Zealand', 'FJD': 'Fiji',

      // Middle East
      'AED': 'United Arab Emirates', 'SAR': 'Saudi Arabia', 'QAR': 'Qatar',
      'KWD': 'Kuwait', 'BHD': 'Bahrain', 'OMR': 'Oman', 'JOD': 'Jordan',
      'LBP': 'Lebanon', 'ILS': 'Israel', 'IRR': 'Iran', 'IQD': 'Iraq',
      'SYP': 'Syria', 'YER': 'Yemen',

      // Additional Africa
      'DZD': 'Algeria', 'LYD': 'Libya', 'SDG': 'Sudan', 'SOS': 'Somalia',
      'DJF': 'Djibouti', 'ERN': 'Eritrea', 'MZN': 'Mozambique', 'MWK': 'Malawi',
      'SZL': 'Eswatini', 'LSL': 'Lesotho', 'MGA': 'Madagascar', 'MUR': 'Mauritius',
      'SCR': 'Seychelles', 'GMD': 'Gambia', 'GNF': 'Guinea', 'SLE': 'Sierra Leone',
      'LRD': 'Liberia',

      // Additional Asia
      'UZS': 'Uzbekistan', 'KZT': 'Kazakhstan', 'KGS': 'Kyrgyzstan', 'TJS': 'Tajikistan',
      'TMT': 'Turkmenistan', 'BND': 'Brunei', 'MVR': 'Maldives', 'BTN': 'Bhutan',

      // Additional Europe
      'ISK': 'Iceland', 'MDL': 'Moldova', 'MKD': 'North Macedonia', 'GEL': 'Georgia',

      // Other
      'BMD': 'Bermuda', 'KYD': 'Cayman Islands', 'AWG': 'Aruba',
      'USD': 'United States',
    };
    
    return countryMap[currency] || 'International';
  };

  const handleCountryClick = (currencyPair: string) => {
    const currency = currencyPair.includes('/') ? currencyPair.split('/')[1] : currencyPair;
    const rate = exchangeRates?.find(r => r.pair === currencyPair);
    
    if (rate) {
      // Prevent body scroll when modal opens
      document.body.classList.add('modal-open');
      
      setSelectedCountry({
        flag: getCountryFlag(currencyPair),
        name: getCountryName(currencyPair),
        currency: currency,
        pair: currencyPair,
        rate: rate,
        region: rate.region
      });
    }
  };

  const handleCloseCountryModal = () => {
    // Re-enable body scroll when modal closes
    document.body.classList.remove('modal-open');
    setSelectedCountry(null);
  };

  const handleSendMoney = (currency: string) => {
    console.log(`Initiating send transaction for ${currency}`);
    // The modal will handle the transaction creation flow
    // No need to close modal or show toast here - handled in the modal
  };

  const handleReceiveMoney = (currency: string) => {
    console.log(`Initiating receive transaction for ${currency}`);
    // The modal will handle the transaction creation flow
    // No need to close modal or show toast here - handled in the modal
  };

  // Mobile tab navigation handlers with touch support
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleMobileTabChange = (direction: 'left' | 'right') => {
    const newIndex = direction === 'right'
      ? (currentTabIndex + 1) % tabs.length  // Loop to first tab when reaching the end
      : (currentTabIndex - 1 + tabs.length) % tabs.length; // Loop to last tab when reaching the beginning

    setCurrentTabIndex(newIndex);
    setActiveTab(tabs[newIndex]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swiped left - go to next tab
      handleMobileTabChange('right');
    } else {
      // Swiped right - go to previous tab
      handleMobileTabChange('left');
    }
  };

  // Favorites management
  const toggleFavoriteRate = (pair: string) => {
    setFavoriteRates((prev) => {
      const current = prev || [];
      if (current.includes(pair)) {
        return current.filter(p => p !== pair);
      } else {
        return [...current, pair];
      }
    });
  };

  // Enhanced filtering functions
  const getFilteredRates = () => {
    let filtered = exchangeRates || [];

    // Apply region filter
    if (regionFilter !== 'all' && regionFilter !== 'favorites') {
      filtered = filtered.filter(rate => rate && rate.region === regionFilter);
    }

    // Apply favorites filter
    if (regionFilter === 'favorites') {
      filtered = filtered.filter(rate => rate && (favoriteRates || []).includes(rate.pair));
    }

    // Apply search term (using debounced version for real-time filtering)
    if (debouncedSearchTerm) {
      filtered = filtered.filter(rate =>
        rate && (
          rate.pair.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          getCountryName(rate.pair).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting - put North America first, then sort alphabetically
    filtered.sort((a, b) => {
      if (!a || !b) return 0;

      // Always put North America first
      if (a.region === 'north-america' && b.region !== 'north-america') return -1;
      if (a.region !== 'north-america' && b.region === 'north-america') return 1;

      // Within the same region, sort alphabetically
      if (rateSortOrder === 'asc') {
        return a.pair.localeCompare(b.pair);
      } else {
        return b.pair.localeCompare(a.pair);
      }
    });

    return filtered.filter(rate => rate != null);
  };

  // Enhanced filtering for invoice country selection
  const getFilteredRatesForInvoice = () => {
    let filtered = exchangeRates || [];
    
    // Apply continent filter
    if (selectedContinent !== 'all') {
      const continentRegionMap: { [key: string]: string[] } = {
        'africa': ['africa'],
        'asia': ['asia'],
        'europe': ['europe'],
        'north-america': ['north-america'],
        'south-america': ['south-america'],
        'oceania': ['oceania'],
        'middle-east': ['middle-east']
      };
      
      const regions = continentRegionMap[selectedContinent] || [];
      filtered = filtered.filter(rate => rate && regions.includes(rate.region));
    }
    
    // Apply search term for invoice selection
    if (invoiceCountrySearch) {
      filtered = filtered.filter(rate => 
        rate && (
          rate.pair.toLowerCase().includes(invoiceCountrySearch.toLowerCase()) ||
          getCountryName(rate.pair).toLowerCase().includes(invoiceCountrySearch.toLowerCase())
        )
      );
    }
    
    // Sort alphabetically by country name
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      return getCountryName(a.pair).localeCompare(getCountryName(b.pair));
    });
    
    return filtered.filter(rate => rate != null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': 
      case 'sent': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': 
      case 'overdue': 
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'draft': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <Pulse className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': 
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'failed': 
      case 'overdue': 
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = (transactions || []).filter(t => {
    if (!t) return false;
    
    // Text search
    const matchesSearch = (t.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.clientEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    // Amount range filter
    const amount = t.amount || 0;
    const minAmount = amountFilter.min ? parseFloat(amountFilter.min) : 0;
    const maxAmount = amountFilter.max ? parseFloat(amountFilter.max) : Infinity;
    const matchesAmount = (!amountFilter.min || amount >= minAmount) && 
                         (!amountFilter.max || amount <= maxAmount);
    
    // Date range filter
    let matchesDate = true;
    if (dateFilter.start || dateFilter.end) {
      const transactionDate = new Date(t.createdAt || '');
      if (dateFilter.start) {
        const startDate = new Date(dateFilter.start);
        matchesDate = matchesDate && transactionDate >= startDate;
      }
      if (dateFilter.end) {
        const endDate = new Date(dateFilter.end);
        endDate.setHours(23, 59, 59, 999); // Include full end day
        matchesDate = matchesDate && transactionDate <= endDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesAmount && matchesDate;
  }).sort((a, b) => {
    if (!a || !b) return 0;
    
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        comparison = dateA - dateB;
        break;
        
      case 'amount':
        const amountA = a.amount || 0;
        const amountB = b.amount || 0;
        comparison = amountA - amountB;
        break;
        
      case 'name':
        const nameA = (a.clientName || '').toLowerCase();
        const nameB = (b.clientName || '').toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
        
      case 'status':
        const statusA = a.status || '';
        const statusB = b.status || '';
        comparison = statusA.localeCompare(statusB);
        break;
        
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculate metrics - with enhanced null safety
  const safeToLocaleString = (value: number | null | undefined): string => {
    try {
      if (value === null || value === undefined || isNaN(value)) return '0';
      return value.toLocaleString();
    } catch (error) {
      console.error('Error in safeToLocaleString:', error, value);
      return '0';
    }
  };

  const safeToLocaleDateString = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error in safeToLocaleDateString:', error, dateString);
      return 'Invalid date';
    }
  };

  const safeToLocaleTimeString = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return date.toLocaleTimeString();
    } catch (error) {
      console.error('Error in safeToLocaleTimeString:', error, dateString);
      return 'Invalid time';
    }
  };

  const totalRevenue = (() => {
    try {
      return (transactions || []).reduce((sum, t) => {
        const fee = t?.fee;
        return sum + (typeof fee === 'number' && !isNaN(fee) ? fee : 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating totalRevenue:', error);
      return 0;
    }
  })();

  const totalVolume = (() => {
    try {
      return (transactions || []).reduce((sum, t) => {
        const amount = t?.amount;
        return sum + (typeof amount === 'number' && !isNaN(amount) ? amount : 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating totalVolume:', error);
      return 0;
    }
  })();

  const completedTransactions = (() => {
    try {
      return (transactions || []).filter(t => t?.status === 'completed').length;
    } catch (error) {
      console.error('Error calculating completedTransactions:', error);
      return 0;
    }
  })();

  const pendingTransactions = (() => {
    try {
      return (transactions || []).filter(t => t?.status === 'pending').length;
    } catch (error) {
      console.error('Error calculating pendingTransactions:', error);
      return 0;
    }
  })();

  // Invoice pagination logic with null safety
  const filteredInvoices = (invoices || []).filter(invoice => {
    if (!invoice) return false;
    const matchesSearch = (invoice.receiverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.receiverEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoicePages = Math.ceil(filteredInvoices.length / invoicesPerPage);
  const startIndex = (currentInvoicePage - 1) * invoicesPerPage;
  const endIndex = startIndex + invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const goToNextInvoicePage = () => {
    if (currentInvoicePage < totalInvoicePages) {
      setCurrentInvoicePage(prev => prev + 1);
    }
  };

  const goToPrevInvoicePage = () => {
    if (currentInvoicePage > 1) {
      setCurrentInvoicePage(prev => prev - 1);
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAmountFilter({ min: "", max: "" });
    setDateFilter({ start: "", end: "" });
    setSortBy("date");
    setSortOrder("desc");
    setShowAdvancedFilters(false);
  };

  // Check if any filters or sorting are active
  const hasActiveFilters = searchTerm !== "" || 
                          statusFilter !== "all" || 
                          amountFilter.min !== "" || 
                          amountFilter.max !== "" ||
                          dateFilter.start !== "" || 
                          dateFilter.end !== "" ||
                          sortBy !== "date" ||
                          sortOrder !== "desc";

  // Keyboard shortcuts for sorting
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Alt + D for date sort
      if (event.altKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setSortBy('date');
      }
      // Alt + A for amount sort
      else if (event.altKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setSortBy('amount');
      }
      // Alt + N for name sort
      else if (event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        setSortBy('name');
      }
      // Alt + S for status sort
      else if (event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setSortBy('status');
      }
      // Alt + R to reverse sort order
      else if (event.altKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      }
    };

    // Only add listeners when on transactions tab
    if (activeTab === 'transactions') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [activeTab, setSortBy, setSortOrder]);

  // Sync activeTab with mobile tab index
  useEffect(() => {
    const tabIndex = tabs.indexOf(activeTab);
    if (tabIndex !== -1) {
      setCurrentTabIndex(tabIndex);
    }
  }, [activeTab]);

  // Auto-refresh exchange rates every 60 seconds
  useEffect(() => {
    if (!autoRefreshRates) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing exchange rates...');
      refreshData();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [autoRefreshRates]);

  // Debounce search term for real-time filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when search/filter changes
  useEffect(() => {
    setCurrentInvoicePage(1);
  }, [debouncedSearchTerm, statusFilter]);

  // Show startup splash screen with enhanced loading
  if (showSplash) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-app-startup">
        <div className="text-center space-y-6 animate-float">
          <div className="animate-logo-bounce">
            <img 
              src="https://i.ibb.co/6LY7bxR/rjb-logo.jpg" 
              alt="RJB TRANZ Logo" 
              className="h-20 w-20 rounded-full mx-auto shadow-2xl"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground font-montserrat">RJB TRANZ</h1>
            <p className="text-muted-foreground font-montserrat">Admin CRM System</p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication page if not logged in
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const handleConfigUpdate = (config: SystemConfig) => {
    setSystemConfig(config);
  };

  const handleWakeUp = () => {
    setShowSleepMode(false);
  };

  // Show enhanced carousel as standby/sleep mode if enabled
  if (showSleepMode) {
    return (
      <FinancialCarousel 
        isStandbyMode={true}
        onWakeUp={handleWakeUp}
        autoSlideDelay={6000} // Slightly slower for standby mode
      />
    );
  }

  // Show system settings page
  if (showSystemSettings) {
    return (
      <SystemSettings 
        onBack={() => setShowSystemSettings(false)}
        systemConfig={systemConfig}
        onConfigUpdate={handleConfigUpdate}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        localData={{
          transactions,
          clients,
          invoices,
          exchangeRates
        }}
        onDataSynced={() => {
          // Optionally refresh data after sync
          console.log('Data synced successfully');
        }}
      />
    );
  }

  // Show profile settings page
  if (showProfileSettings) {
    return (
      <ProfileSettings 
        onBack={() => setShowProfileSettings(false)}
        currentUser={currentUser || 'Admin'}
        onUserUpdate={(userData) => {
          console.log('User profile updated:', userData);
          // Update current user name if changed
          if (userData.displayName !== currentUser) {
            setCurrentUser(userData.displayName);
          }
        }}
      />
    );
  }

  // Show full page loader during initial load
  if (isInitialLoad) {
    return <LoadingStates.FullPageLoader message="Initializing RJB TRANZ CRM..." />;
  }

  return (
    <div className="min-h-screen bg-background animate-app-startup">
      {/* Exchange Rate Service */}
      <ExchangeRateService
        onRatesUpdate={setExchangeRates}
        isAutoRefresh={autoRefreshRates}
        refreshInterval={30000}
      />
      
      {/* Push Notification Service */}
      <PushNotificationService transactions={transactions || []} />
      
      {/* Refresh Indicator */}
      <LoadingStates.RefreshIndicator isRefreshing={isRefreshing} />
      
      {/* Enhanced Header with Sticky Status Bar */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 animate-card-entrance">
        {/* Status Bar */}
        <div className="h-8 bg-primary/10 border-b border-primary/20 flex items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-3">
            {/* Network Connection Status */}
            <div className="flex items-center gap-1">
              <WifiHigh className="h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">Network Connected</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time */}
            <span className="text-muted-foreground font-dynamic-xs">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {/* Font Scale Indicator */}
            {systemConfig?.fontScale && systemConfig.fontScale !== 1.0 && (
              <span className="text-xs text-primary font-dynamic-xs">
                Font: {Math.round(systemConfig.fontScale * 100)}%
              </span>
            )}
            
            {/* In-App Notifications */}
            <InAppNotifications 
              transactions={transactions || []}
              currentUser={currentUser || 'Admin'}
            />
          </div>
        </div>

        {/* Main Header */}
        <div className="flex h-16 items-center px-4 gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="h-8 w-8 rounded-full flex-shrink-0"
            >
              <img
                src="https://i.ibb.co/6LY7bxR/rjb-logo.jpg"
                alt="RJB TRANZ Logo"
                className="h-8 w-8 rounded-full"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground font-montserrat truncate font-dynamic-lg">RJB TRANZ</h1>
              <p className="text-xs text-muted-foreground font-montserrat truncate sm:hidden font-dynamic-xs">
                {currentUser || 'Admin'}
              </p>
              <p className="text-sm text-muted-foreground hidden sm:block font-montserrat font-dynamic-sm">
                Welcome back, {currentUser || 'Admin'}! 👋
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile Network Status Indicator */}
            <div className="sm:hidden">
              <WifiHigh className="h-5 w-5 text-green-600" />
            </div>
            

            {/* Desktop Version Indicator */}
            {isElectron && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-md">
                <span className="text-xs text-accent-foreground font-medium">
                  Desktop v{electron.appVersion}
                </span>
              </div>
            )}
            
            {/* PWA Status Indicator */}
            {!isElectron && pwaManager.isStandalone() && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-md">
                <span className="text-xs text-accent-foreground font-medium">
                  PWA v1.0.0
                </span>
              </div>
            )}
            
            {/* Desktop Network Status */}
            <div className="hidden sm:flex items-center gap-2">
              <WifiHigh className="h-4 w-4 text-green-600" />
              <span className="text-sm whitespace-nowrap">
                Network Connected
              </span>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  hapticFeedback();
                  toggleTheme();
                }}
                className="text-muted-foreground hover:text-foreground h-8 w-8 px-0"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" weight="duotone" />
                ) : (
                  <Moon className="h-4 w-4" weight="duotone" />
                )}
              </Button>

              <ProfilePictureUpload
                currentUser={currentUser || 'Admin'}
                size="sm"
                showControls={false}
                className="flex-shrink-0"
                onImageChange={(imageUrl) => {
                  hapticFeedback();
                  if (imageUrl) {
                    // Force re-render by updating all avatar images
                    const avatarImages = document.querySelectorAll('.user-avatar');
                    avatarImages.forEach((img) => {
                      if (img instanceof HTMLImageElement) {
                        img.src = imageUrl;
                      }
                    });
                  }
                }}
              />
              
              {/* Profile Settings Quick Access */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  hapticFeedback();
                  setShowSleepMode(true);
                }}
                className="text-muted-foreground hover:text-foreground h-8 w-8 px-0 hidden sm:flex"
                title="Show Carousel"
              >
                <User className="h-4 w-4" weight="duotone" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  hapticFeedback();
                  handleLogout();
                }}
                className="text-muted-foreground hover:text-foreground h-8 px-2 sm:px-3"
              >
                <SignOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-6 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile Tab Navigation with Icons Below Labels */}
          <div className="block sm:hidden mb-6">
            <div className="grid grid-cols-3 gap-2 px-4">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: ChartBar },
                { key: 'transactions', label: 'Transactions', icon: CreditCard },
                { key: 'invoices', label: 'Invoices', icon: Receipt },
                { key: 'countries', label: 'Countries', icon: Globe },
                { key: 'converter', label: 'Converter', icon: Calculator },
                { key: 'profile-demo', label: 'Upload', icon: Camera }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-300 ${
                    activeTab === key
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-102'
                  }`}
                >
                  <Icon className="h-6 w-6" weight="duotone" />
                  <span className="text-xs font-medium font-montserrat">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden sm:block w-full overflow-x-auto scrollbar-none mb-6">
            <TabsList className="grid w-max min-w-full grid-cols-5 gap-1 sm:w-full sm:min-w-0 h-14">
              <TabsTrigger value="dashboard" className="px-4 py-3 whitespace-nowrap transition-fast text-base font-medium">
                <ChartBar className="h-5 w-5 mr-3" weight="duotone" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'}} />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="transactions" className="px-4 py-3 whitespace-nowrap transition-fast text-base font-medium">
                <CreditCard className="h-5 w-5 mr-3" weight="duotone" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'}} />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="invoices" className="px-4 py-3 whitespace-nowrap transition-fast text-base font-medium">
                <Receipt className="h-5 w-5 mr-3" weight="duotone" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'}} />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="countries" className="px-4 py-3 whitespace-nowrap transition-fast text-base font-medium">
                <Globe className="h-5 w-5 mr-3" weight="duotone" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'}} />
                Countries
              </TabsTrigger>
              <TabsTrigger value="converter" className="px-4 py-3 whitespace-nowrap transition-fast text-base font-medium">
                <Calculator className="h-5 w-5 mr-3" weight="duotone" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'}} />
                Converter
              </TabsTrigger>
              <TabsTrigger value="profile-demo" className="px-4 py-3 whitespace-nowrap transition-fast text-base font-medium">
                <Camera className="h-5 w-5 mr-3" weight="duotone" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'}} />
                Upload Demo
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Enhanced Dashboard Tab with Analytics */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* PWA Install Banner - Show for installable PWA */}
            {showPWAInstall && !pwaManager.isStandalone() && (
              <div className="animate-card-entrance">
                <PWAInstall onClose={() => setShowPWAInstall(false)} />
              </div>
            )}

            {/* Financial Services Carousel */}
            <div className="animate-card-entrance" style={{animationDelay: '100ms'}}>
              <FinancialCarousel className="mb-6 carousel-card-enhanced dashboard-card-glow" />
            </div>

            {/* Metrics Cards with Enhanced Glow Effects */}
            <div className="grid gap-4 grid-cols-2 mb-6">
              {isRefreshing || !dataInitialized ? (
                <>
                  <LoadingStates.MetricCardSkeleton />
                  <LoadingStates.MetricCardSkeleton />
                  <LoadingStates.MetricCardSkeleton />
                  <LoadingStates.MetricCardSkeleton />
                </>
              ) : (
                <>
                  <Card 
                    className="p-4 sm:p-6 gradient-card-1 system-management-card dashboard-card-glow animate-card-entrance overflow-hidden relative cursor-pointer card-hover-glass"
                    onClick={() => handleAnalyticsClick('revenue', 'Total Revenue')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#182B3A] to-[#20A4F3] opacity-30 rounded-lg"></div>
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-3 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground font-dynamic-sm">Total Revenue</CardTitle>
                      <CurrencyDollar className="h-4 w-4 text-[#20A4F3]" weight="duotone" />
                    </CardHeader>
                    <CardContent className="p-0 relative z-10">
                      <div className="text-2xl font-bold font-dynamic-2xl">${safeToLocaleString(totalRevenue)}</div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1 font-dynamic-xs">
                        <TrendUp className="h-3 w-3 mr-1 text-green-600" weight="bold" />
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="p-4 sm:p-6 gradient-card-7 system-management-card dashboard-card-glow animate-card-entrance overflow-hidden relative cursor-pointer card-hover-glass" 
                    style={{animationDelay: '100ms'}}
                    onClick={() => handleAnalyticsClick('volume', 'Transaction Volume')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#43e97b] to-[#38f9d7] opacity-30 rounded-lg"></div>
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-3 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Daily Transaction Volume</CardTitle>
                      <Money className="h-4 w-4 text-[#43e97b]" weight="duotone" />
                    </CardHeader>
                    <CardContent className="p-0 relative z-10">
                      <div className="text-2xl font-bold mb-2">
                        ${safeToLocaleString(totalVolume)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Total volume</span>
                        <span>{(transactions || []).length} transactions</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Average per transaction: ${safeToLocaleString(
                          (transactions || []).length > 0
                            ? Math.round(totalVolume / (transactions || []).length)
                            : 0
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="p-4 sm:p-6 gradient-card-5 system-management-card dashboard-card-glow animate-card-entrance overflow-hidden relative cursor-pointer card-hover-glass" 
                    style={{animationDelay: '200ms'}}
                    onClick={() => handleAnalyticsClick('growth', 'Revenue Growth')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f093fb] to-[#f5576c] opacity-30 rounded-lg"></div>
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-3 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Growth</CardTitle>
                      <TrendUp className="h-4 w-4 text-[#f5576c]" weight="duotone" />
                    </CardHeader>
                    <CardContent className="p-0 relative z-10">
                      <div className="text-2xl font-bold">+15.7%</div>
                      <p className="text-xs text-muted-foreground">vs previous period</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="p-4 sm:p-6 gradient-card-6 system-management-card dashboard-card-glow animate-card-entrance overflow-hidden relative cursor-pointer card-hover-glass" 
                    style={{animationDelay: '300ms'}}
                    onClick={() => handleAnalyticsClick('average', 'Average Transaction')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4facfe] to-[#00f2fe] opacity-30 rounded-lg"></div>
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-3 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Avg Transaction</CardTitle>
                      <CurrencyDollar className="h-4 w-4 text-[#00f2fe]" weight="duotone" />
                    </CardHeader>
                    <CardContent className="p-0 relative z-10">
                      <div className="text-2xl font-bold">
                        ${safeToLocaleString(transactions && transactions.length > 0 ? Math.round(totalVolume / transactions.length) : 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">per transaction</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Recent Activity & Analytics */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="card-dark-shadow animate-card-entrance overflow-hidden relative" style={{animationDelay: '1200ms'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-xl">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    {(transactions || []).slice(0, 5).map((transaction, index) => {
                      if (!transaction) return null;
                      return (
                        <div 
                          key={transaction.id || `transaction-${index}`} 
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 card-hover-minimal animate-card-entrance cursor-pointer transition-fast hover:bg-muted/40" 
                          style={{animationDelay: `${900 + index * 100}ms`}}
                          onClick={() => handleTransactionClick(transaction)}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="text-sm font-medium">
                              {(transaction.clientName || 'Unknown').split(' ').map(n => n[0] || '').join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{transaction.clientName || 'Unknown Client'}</p>
                            <p className="text-sm text-muted-foreground">
                              ${safeToLocaleString(transaction.amount || 0)} {transaction.fromCurrency || 'USD'} → {transaction.toCurrency || 'USD'}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(transaction.status || 'pending')} flex-shrink-0`}>
                            {transaction.status || 'pending'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-dark-shadow animate-card-entrance overflow-hidden relative" style={{animationDelay: '1300ms'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#f093fb]/5 to-[#f5576c]/5 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-xl">System Status & Analytics</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 card-hover-minimal">
                      <span className="font-medium">Printer Status</span>
                      <Badge variant={printerStatus?.connected ? "secondary" : "destructive"}>
                        {printerStatus?.connected ? "Connected" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 card-hover-minimal">
                      <span className="font-medium">Paper Level</span>
                      <div className="flex items-center gap-3">
                        <Progress value={printerStatus?.paperLevel || 0} className="w-20" />
                        <span className="text-sm font-mono">{printerStatus?.paperLevel || 0}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 card-hover-minimal">
                      <span className="font-medium">Exchange Rates</span>
                      <Badge variant="secondary">Live</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 card-hover-minimal">
                      <span className="font-medium">Pending Transactions</span>
                      <Badge variant="outline">{pendingTransactions}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 card-hover-minimal">
                      <span className="font-medium">Client Growth</span>
                      <div className="flex items-center space-x-2">
                        <TrendUp className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600 text-sm">+8.5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integrated Analytics Dashboard */}
            <AnalyticsDashboard 
              transactions={transactions || []} 
              clients={clients || []} 
            />
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6 relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold font-dynamic-2xl">Transaction Management</h2>
            </div>

            {/* Floating Action Buttons */}
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search transactions"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.focus();
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }} 
                className="flex-1 sm:flex-none"
              >
                <MagnifyingGlass className="h-4 w-4 mr-2" weight="bold" />
                Search
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportData('transactions')} 
                className="flex-1 sm:flex-none"
              >
                <DownloadSimple className="h-4 w-4 mr-2" weight="bold" />
                Export
              </Button>
              {pendingTransactions > 0 && (
                <Button 
                  variant="secondary"
                  size="sm" 
                  onClick={completeAllPendingTransactions}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" weight="bold" />
                  Complete All ({pendingTransactions})
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={() => {
                  toast.success('Transaction creation feature coming soon!');
                }}
                className="flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4 mr-2" weight="bold" />
                New
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4">
              {/* Primary Search and Status Filter Row */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="bold" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border rounded-md text-sm bg-background min-w-[140px] h-12"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort Controls Row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'date', label: 'Date', icon: CalendarBlank, shortcut: 'Alt+D' },
                      { key: 'amount', label: 'Amount', icon: CurrencyDollar, shortcut: 'Alt+A' },
                      { key: 'name', label: 'Name', icon: Users, shortcut: 'Alt+N' },
                      { key: 'status', label: 'Status', icon: CheckCircle, shortcut: 'Alt+S' }
                    ].map((sort) => {
                      const IconComponent = sort.icon;
                      return (
                        <Button
                          key={sort.key}
                          variant={sortBy === sort.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortBy(sort.key as 'date' | 'amount' | 'name' | 'status')}
                          className={`sort-button h-9 px-3 transition-fast ${
                            sortBy === sort.key ? 'active' : ''
                          }`}
                          title={`Sort by ${sort.label} (${sort.shortcut})`}
                        >
                          <IconComponent className="h-4 w-4 mr-1" weight="duotone" />
                          <span className="text-xs sm:text-sm">{sort.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="sort-direction h-9 px-3 transition-fast"
                    title={`Currently sorting ${sortOrder === 'asc' ? 'ascending' : 'descending'}. Click to reverse (Alt+R)`}
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <SortAscending className="h-4 w-4 mr-1" />
                        <span className="text-xs sm:text-sm">Ascending</span>
                      </>
                    ) : (
                      <>
                        <SortDescending className="h-4 w-4 mr-1" />
                        <span className="text-xs sm:text-sm">Descending</span>
                      </>
                    )}
                  </Button>
                  
                  {/* Keyboard shortcuts hint */}
                  <div className="hidden lg:block text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                    Alt+D/A/N/S to sort • Alt+R to reverse
                  </div>
                </div>
              </div>

              {/* Advanced Filters Toggle and Quick Sort Presets */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2"
                  >
                    <Funnel className="h-4 w-4" />
                    Advanced Filters
                    <CaretDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-muted-foreground hover:text-foreground"
                      title="Reset all filters and sorting"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                {/* Quick Sort Presets */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Quick:</span>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSortBy('date');
                        setSortOrder('desc');
                      }}
                      className="text-xs h-7 px-2 hover:bg-primary/10"
                      title="Most recent transactions first"
                    >
                      Latest
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSortBy('amount');
                        setSortOrder('desc');
                      }}
                      className="text-xs h-7 px-2 hover:bg-primary/10"
                      title="Highest amounts first"
                    >
                      High $
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSortBy('status');
                        setSortOrder('asc');
                      }}
                      className="text-xs h-7 px-2 hover:bg-primary/10"
                      title="Group by status"
                    >
                      Status
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder('asc');
                      }}
                      className="text-xs h-7 px-2 hover:bg-primary/10"
                      title="Alphabetical by client name"
                    >
                      A-Z
                    </Button>
                  </div>
                </div>
              </div>

              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <Card className="p-4 bg-muted/20 animate-fade-in">
                  <div className="space-y-4">
                    {/* Amount Range Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Amount Range (USD)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Input
                            type="number"
                            placeholder="Min amount"
                            value={amountFilter.min}
                            onChange={(e) => setAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                            className="h-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder="Max amount"
                            value={amountFilter.max}
                            onChange={(e) => setAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                            className="h-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Input
                            type="date"
                            value={dateFilter.start}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Input
                            type="date"
                            value={dateFilter.end}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Date Presets */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Quick Presets</label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            setDateFilter({
                              start: today.toISOString().split('T')[0],
                              end: today.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs"
                        >
                          Today
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);
                            setDateFilter({
                              start: yesterday.toISOString().split('T')[0],
                              end: yesterday.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs"
                        >
                          Yesterday
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date(today);
                            lastWeek.setDate(lastWeek.getDate() - 7);
                            setDateFilter({
                              start: lastWeek.toISOString().split('T')[0],
                              end: today.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs"
                        >
                          Last 7 Days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date(today);
                            lastMonth.setDate(lastMonth.getDate() - 30);
                            setDateFilter({
                              start: lastMonth.toISOString().split('T')[0],
                              end: today.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs"
                        >
                          Last 30 Days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                            setDateFilter({
                              start: startOfMonth.toISOString().split('T')[0],
                              end: today.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs"
                        >
                          This Month
                        </Button>
                      </div>
                    </div>

                    {/* Quick Amount Presets */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Amount Presets</label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAmountFilter({ min: "0", max: "100" })}
                          className="text-xs"
                        >
                          $0 - $100
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAmountFilter({ min: "100", max: "500" })}
                          className="text-xs"
                        >
                          $100 - $500
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAmountFilter({ min: "500", max: "1000" })}
                          className="text-xs"
                        >
                          $500 - $1,000
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAmountFilter({ min: "1000", max: "" })}
                          className="text-xs"
                        >
                          $1,000+
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Filter and Sort Summary */}
              {(hasActiveFilters || sortBy !== 'date' || sortOrder !== 'desc') && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <span className="text-sm font-medium text-primary">Active:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {(amountFilter.min || amountFilter.max) && (
                    <Badge variant="secondary" className="text-xs">
                      Amount: ${amountFilter.min || "0"} - ${amountFilter.max || "∞"}
                    </Badge>
                  )}
                  {(dateFilter.start || dateFilter.end) && (
                    <Badge variant="secondary" className="text-xs">
                      Date: {dateFilter.start || "∞"} to {dateFilter.end || "∞"}
                    </Badge>
                  )}
                  {(sortBy !== 'date' || sortOrder !== 'desc') && (
                    <Badge variant="outline" className="text-xs border-primary/30">
                      Sort: {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({filteredTransactions.length} results)
                  </span>
                </div>
              )}
            </div>

            {/* Transaction Cards - Mobile Optimized */}
            <div className="space-y-4">
              {/* Results header with sort info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {filteredTransactions.length} transactions
                  {sortBy !== 'date' || sortOrder !== 'desc' ? (
                    <span className="ml-2">
                      • Sorted by {sortBy} ({sortOrder === 'asc' ? '↑' : '↓'})
                    </span>
                  ) : (
                    <span className="ml-2">• Latest first</span>
                  )}
                </span>
                {filteredTransactions.length > 0 && (
                  <div className="text-xs bg-muted/20 px-2 py-1 rounded-md">
                    {sortBy === 'date' && 'Most recent first'}
                    {sortBy === 'amount' && (sortOrder === 'desc' ? 'Highest amount first' : 'Lowest amount first')}
                    {sortBy === 'name' && (sortOrder === 'asc' ? 'A-Z' : 'Z-A')}
                    {sortBy === 'status' && 'Grouped by status'}
                  </div>
                )}
              </div>
              
              {filteredTransactions.map((transaction, index) => {
                if (!transaction) return null;
                return (
                  <Card 
                    key={transaction.id || `tx-${index}`} 
                    className="overflow-hidden card-hover-glass card-ripple animate-card-entrance transition-fast hover:shadow-2xl active:shadow-3xl cursor-pointer" 
                    style={{animationDelay: `${index * 100}ms`}}
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Transaction Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarFallback className="text-sm font-medium">
                              {(transaction.clientName || 'Unknown').split(' ').map(n => n[0] || '').join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                              <h3 className="font-semibold truncate">{transaction.clientName || 'Unknown Client'}</h3>
                              <Badge className={`${getStatusColor(transaction.status || 'pending')} w-fit`}>
                                {getStatusIcon(transaction.status || 'pending')}
                                <span className="ml-1">{transaction.status || 'pending'}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 truncate">{transaction.clientEmail || 'No email'}</p>
                            {transaction.phoneNumber && (
                              <p className="text-xs text-muted-foreground mb-2">📱 {transaction.phoneNumber}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Amount:</span>
                                <div className="font-semibold">${safeToLocaleString(transaction.amount || 0)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fee:</span>
                                <div className="font-semibold">${transaction.fee || 0}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Pair:</span>
                                <div>{transaction.fromCurrency || 'USD'} → {transaction.toCurrency || 'USD'}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <div className="capitalize">
                                  {transaction.transactionType === 'send' ? '📤 Send' : '📥 Receive'}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <div>{safeToLocaleDateString(transaction.createdAt)}</div>
                              </div>
                              {transaction.uniqueId && (
                                <div>
                                  <span className="text-muted-foreground">Code:</span>
                                  <div className="font-mono text-xs">{transaction.uniqueId}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t sm:pt-0 sm:border-t-0 sm:flex-col sm:border-l sm:pl-4">
                          {/* Quick Complete Button for Pending Transactions */}
                          {transaction.status === 'pending' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => completePendingTransaction(transaction.id || '')}
                              className="flex-1 sm:flex-none h-10 min-w-[110px] bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-fast"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" weight="bold" />
                              Complete
                            </Button>
                          )}
                          
                          {/* Status Change Dropdown */}
                          <div className="relative flex-1 sm:flex-none">
                            <select
                              value={transaction.status || 'pending'}
                              onChange={(e) => updateTransactionStatus(transaction.id || '', e.target.value as Transaction['status'])}
                              className="w-full h-10 px-3 text-sm border rounded-md bg-background hover:scale-105 transition-fast appearance-none cursor-pointer min-w-[120px]"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1rem'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {transaction.status === 'completed' && (
                              <CheckCircle className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600 pointer-events-none" weight="fill" />
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintReceipt(transaction.id || '')}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none h-10 min-w-[100px] hover:scale-105 transition-fast card-hover-glass"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold font-dynamic-2xl">Invoice Management</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => exportData('invoices')} className="flex-1 sm:flex-none">
                  <DownloadSimple className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={() => setShowCountrySelection(true)} className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="bold" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border rounded-md text-sm bg-background min-w-[140px] h-12"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Invoice Cards Container with Separated Pagination */}
            {currentInvoices.length > 0 ? (
              <div className="space-y-4">
                {/* Scrollable Invoice Cards Area */}
                <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar pr-2">
                  {currentInvoices.map((invoice, index) => {
                    if (!invoice) return null;
                    return (
                      <Card key={invoice.id || `invoice-${index}`} className="overflow-hidden card-hover-glass card-ripple animate-card-entrance transition-fast hover:shadow-2xl active:shadow-3xl" style={{animationDelay: `${index * 100}ms`}}>
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <Avatar className="h-12 w-12 flex-shrink-0">
                                <AvatarFallback className="text-sm font-medium">
                                  {(invoice.receiverName || 'Unknown').split(' ').map(n => n[0] || '').join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                                  <h3 className="font-semibold truncate">{invoice.receiverName || 'Unknown Receiver'}</h3>
                                  <Badge className={`${getStatusColor(invoice.status || 'draft')} w-fit`}>
                                    {getStatusIcon(invoice.status || 'draft')}
                                    <span className="ml-1">{invoice.status || 'draft'}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 truncate">{invoice.receiverEmail || 'No email'}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Amount:</span>
                                    <div className="font-semibold">${safeToLocaleString(invoice.amount || 0)}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Due Date:</span>
                                    <div>{safeToLocaleDateString(invoice.dueDate)}</div>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Description:</span>
                                    <div className="truncate">{invoice.description || 'No description'}</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t sm:pt-0 sm:border-t-0 sm:flex-col sm:border-l sm:pl-4">
                              <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 min-w-[100px] hover:scale-105 transition-fast">
                                <FileText className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="h-10 px-3 hover:scale-105 transition-fast">
                                <DotsThreeVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Fixed Pagination Controls */}
                {totalInvoicePages > 1 && (
                  <Card className="bg-muted/20 border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPrevInvoicePage}
                            disabled={currentInvoicePage === 1}
                            className="flex items-center gap-2 h-10 min-w-[100px]"
                          >
                            <CaretLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextInvoicePage}
                            disabled={currentInvoicePage === totalInvoicePages}
                            className="flex items-center gap-2 h-10 min-w-[100px]"
                          >
                            Next
                            <CaretRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            Page {currentInvoicePage} of {totalInvoicePages}
                          </span>
                          <span>•</span>
                          <span>
                            {filteredInvoices.length} total invoices
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {filteredInvoices.length === 0 && (invoices?.length || 0) > 0 
                        ? "No invoices match your search" 
                        : "No invoices yet"}
                    </h3>
                    <p className="text-muted-foreground">
                      {filteredInvoices.length === 0 && (invoices?.length || 0) > 0
                        ? "Try adjusting your search or filter criteria"
                        : "Create your first invoice to get started"}
                    </p>
                  </div>
                  {filteredInvoices.length === 0 && (invoices?.length || 0) === 0 && (
                    <Button onClick={() => setShowCountrySelection(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Countries Tab */}
          <TabsContent value="countries" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold font-dynamic-2xl">Countries & Exchange Rates</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => exportData('countries')} className="flex-1 sm:flex-none transition-fast">
                  <DownloadSimple className="h-4 w-4 mr-2" />
                  Export Rates
                </Button>
                <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing} className={`refresh-button flex-1 sm:flex-none transition-fast ${isRefreshing ? 'refreshing' : ''}`}>
                  <ArrowsClockwise className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search countries or currencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 transition-fast"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* Regional Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Regions', icon: Globe },
                  { key: 'favorites', label: 'Favorites', icon: Star },
                  { key: 'africa', label: 'Africa', icon: null },
                  { key: 'asia', label: 'Asia', icon: null },
                  { key: 'europe', label: 'Europe', icon: null },
                  { key: 'north-america', label: 'North America', icon: null },
                  { key: 'south-america', label: 'South America', icon: null },
                  { key: 'oceania', label: 'Oceania', icon: null },
                  { key: 'middle-east', label: 'Middle East', icon: null }
                ].map((filter) => {
                  const IconComponent = filter.icon;
                  return (
                    <Button
                      key={filter.key}
                      variant={regionFilter === filter.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRegionFilter(filter.key)}
                      className={`filter-button region-pill h-10 px-4 transition-fast ${
                        regionFilter === filter.key ? 'active' : ''
                      }`}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4 mr-2" weight="duotone" />}
                      <span className="text-xs sm:text-sm relative z-10">{filter.label}</span>
                    </Button>
                  );
                })}
              </div>
              
              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">Sort:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRateSortOrder(rateSortOrder === 'asc' ? 'desc' : 'asc')}
                  className="sort-toggle h-10 px-4 transition-fast"
                >
                  {rateSortOrder === 'asc' ? (
                    <>
                      <SortAscending className="h-4 w-4 mr-2" />
                      A-Z
                    </>
                  ) : (
                    <>
                      <SortDescending className="h-4 w-4 mr-2" />
                      Z-A
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Countries Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {getFilteredRates().map((rate, index) => {
                if (!rate) return null;
                // Filter transactions for this country to show count
                const currency = rate.pair.includes('/') ? rate.pair.split('/')[1] : rate.pair;
                const countryTransactions = (transactions || []).filter(t => 
                  t && (t.fromCurrency === currency || t.toCurrency === currency)
                );
                
                const isFavorite = (favoriteRates || []).includes(rate.pair);
                
                return (
                    <Card
                      key={rate.pair} // Stable key by category/pair to prevent reshuffling across refreshes
                      className="currency-pair group overflow-hidden card-hover-glass card-ripple animate-card-entrance cursor-pointer transition-fast hover:shadow-xl hover:scale-[1.02] hover:border-primary/30 bg-gradient-to-br from-card via-card to-muted/20 gpu-accelerated active:shadow-2xl lg:p-3 lg:text-sm"
                      style={{animationDelay: `${index * 20}ms`}}
                      onClick={() => handleCountryClick(rate.pair)}
                    >
                    <CardHeader className="pb-4 lg:pb-2 relative">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl lg:text-2xl transition-fast group-hover:scale-105 group-hover:rotate-6">
                          {getCountryFlag(rate.pair)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg lg:text-base truncate font-mono group-hover:text-primary transition-fast">
                            {rate.pair.includes('/') ? rate.pair.split('/')[1] : rate.pair}
                          </CardTitle>
                          <CardDescription className="truncate font-montserrat lg:text-sm">
                            {getCountryName(rate.pair)}
                          </CardDescription>
                          {countryTransactions.length > 0 && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {countryTransactions.length} transactions
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Favorite Star & Click indicator */}
                      <div className="absolute top-1 right-1 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteRate(rate.pair);
                          }}
                          className="h-8 w-8 lg:h-6 lg:w-6 p-0 opacity-0 group-hover:opacity-100 transition-fast"
                        >
                          <Star
                            className={`favorite-star h-4 w-4 lg:h-3 lg:w-3 transition-fast ${
                              isFavorite
                                ? 'text-yellow-500 fill-yellow-500 active'
                                : 'text-muted-foreground hover:text-yellow-500'
                            }`}
                            weight={isFavorite ? "fill" : "regular"}
                          />
                        </Button>
                        <div className="opacity-0 group-hover:opacity-100 transition-fast">
                          <div className="w-2 h-2 lg:w-1.5 lg:h-1.5 bg-primary rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg group-hover:bg-primary/10 transition-fast">
                          <span className="text-sm lg:text-xs font-medium font-montserrat">Exchange Rate</span>
                          <span className="font-bold text-xl lg:text-lg font-mono group-hover:text-primary transition-fast">
                            {(rate.rate || 0).toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg group-hover:bg-accent/10 transition-fast">
                          <span className="text-sm lg:text-xs font-medium font-montserrat">24h Change</span>
                          <div className={`flex items-center font-semibold transition-fast text-sm ${(rate.changePercent || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(rate.changePercent || 0) > 0 ? (
                              <TrendUp className="h-4 w-4 lg:h-3 lg:w-3 mr-1 group-hover:animate-bounce" />
                            ) : (
                              <TrendDown className="h-4 w-4 lg:h-3 lg:w-3 mr-1 group-hover:animate-bounce" />
                            )}
                            <span>
                              {(rate.changePercent || 0) > 0 ? '+' : ''}{(rate.changePercent || 0).toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        {/* Last Updated - Only visible on hover */}
                        <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="text-sm lg:text-xs font-medium font-montserrat">Last Updated</span>
                          <span className="text-sm lg:text-xs font-mono">{safeToLocaleTimeString(rate.lastUpdated)}</span>
                        </div>
                      </div>

                      {/* Hover hint */}
                      <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-fast">
                        <p className="text-xs text-primary font-medium font-montserrat">
                          Click to view transaction history & details
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Currency Converter Tab */}
          <TabsContent value="converter" className="space-y-6">
            <CurrencyConverter
              exchangeRates={exchangeRates || []}
              onRefreshRates={refreshData}
              isRefreshing={isRefreshing}
              favoriteRates={favoriteRates || []}
              onToggleFavorite={toggleFavoriteRate}
            />
          </TabsContent>

          {/* Profile Picture Upload Demo Tab */}
          <TabsContent value="profile-demo" className="space-y-6">
            <FileUploadDemo />
          </TabsContent>

          {/* Rate Alerts Tab - Hidden but accessible via floating button */}
          {showRateAlerts && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
              <RateAlerts
                exchangeRates={exchangeRates || []}
                onClose={() => setShowRateAlerts(false)}
              />
            </div>
          )}


        </Tabs>
      </main>

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <AnalyticsModal
          type={analyticsType}
          title={analyticsTitle}
          onClose={() => setShowAnalyticsModal(false)}
          transactions={transactions || []}
          clients={clients || []}
        />
      )}

      {/* Country Modal */}
      {selectedCountry && (
        <CountryModal
          country={selectedCountry}
          transactions={transactions || []}
          exchangeRates={exchangeRates || []}
          countries={exchangeRates?.map(rate => ({
            flag: getCountryFlag(rate.pair),
            name: getCountryName(rate.pair),
            currency: rate.pair.split('/')[1],
            pair: rate.pair,
            rate: rate,
            region: rate.region
          })) || []}
          onClose={handleCloseCountryModal}
          onSendMoney={handleSendMoney}
          onReceiveMoney={handleReceiveMoney}
          onTransactionCreated={(newTransaction) => {
            setTransactions((prev) => [...(prev || []), newTransaction]);
          }}
        />
      )}

      {/* Country Selection Modal for Invoice Creation */}
      {showCountrySelection && (
        <div className="modal-backdrop" onClick={handleCountrySelectionCancel}>
          <div className="modal-content max-w-3xl lg:max-w-2xl mobile-modal" onClick={(e) => e.stopPropagation()}>
            <Card className="bg-card border-0 shadow-2xl mobile-card">
              <CardHeader className="pb-4 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2 mobile-header">
                    <Globe className="h-5 w-5 text-primary" weight="duotone" />
                    <span className="truncate">Select Preferred Country</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCountrySelectionCancel}
                    className="h-10 w-10 p-0 mobile-button flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base mobile-text">
                  Choose the country for your invoice currency and regional settings
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search countries or currencies..."
                    value={invoiceCountrySearch}
                    onChange={(e) => setInvoiceCountrySearch(e.target.value)}
                    className="pl-10 h-12 transition-fast mobile-input text-base"
                  />
                </div>

                {/* Continent Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Filter by Continent</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', label: 'All Continents', icon: Globe },
                      { key: 'africa', label: 'Africa', icon: null },
                      { key: 'asia', label: 'Asia', icon: null },
                      { key: 'europe', label: 'Europe', icon: null },
                      { key: 'north-america', label: 'North America', icon: null },
                      { key: 'south-america', label: 'South America', icon: null },
                      { key: 'oceania', label: 'Oceania', icon: null },
                      { key: 'middle-east', label: 'Middle East', icon: null }
                    ].map((continent) => {
                      const IconComponent = continent.icon;
                      return (
                        <Button
                          key={continent.key}
                          variant={selectedContinent === continent.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedContinent(continent.key)}
                          className={`filter-button region-pill h-9 px-3 transition-fast text-xs ${
                            selectedContinent === continent.key ? 'active' : ''
                          }`}
                        >
                          {IconComponent && <IconComponent className="h-3 w-3 mr-1" weight="duotone" />}
                          <span className="relative z-10">{continent.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Results Summary */}
                <div className="text-sm text-muted-foreground">
                  {getFilteredRatesForInvoice().length} countries available
                  {selectedContinent !== 'all' && ` in ${selectedContinent.replace('-', ' ')}`}
                  {invoiceCountrySearch && ` matching "${invoiceCountrySearch}"`}
                </div>

                {/* Selected Country Display */}
                {selectedInvoiceCountry && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">{selectedInvoiceCountry.flag}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg mobile-header truncate">{selectedInvoiceCountry.name}</h3>
                        <p className="text-muted-foreground text-sm mobile-text">Currency: {selectedInvoiceCountry.currency}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mobile-text">
                          Exchange Rate: {selectedInvoiceCountry.rate.rate.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Countries Grid */}
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-visible">
                  {getFilteredRatesForInvoice().map((rate, index) => {
                    if (!rate) return null;
                    const isSelected = selectedInvoiceCountry?.pair === rate.pair;
                    
                    return (
                      <Card 
                        key={rate.pair || `rate-${index}`} 
                        className={`currency-pair group overflow-hidden card-hover-glass card-ripple cursor-pointer transition-fast hover:shadow-lg hover:scale-[1.02] hover:border-primary/40 bg-gradient-to-br from-card via-card to-muted/20 gpu-accelerated mobile-card ${
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleCountrySelectionForInvoice(rate.pair)}
                      >
                        <CardContent className="p-3 lg:p-2 sm:p-3">
                          <div className="flex items-center gap-3 lg:gap-2">
                            <div className="text-2xl lg:text-xl transition-fast group-hover:scale-105 flex-shrink-0">
                              {getCountryFlag(rate.pair)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold truncate font-mono group-hover:text-primary transition-fast text-sm lg:text-xs">
                                {rate.pair.includes('/') ? rate.pair.split('/')[1] : rate.pair}
                              </h4>
                              <p className="text-xs lg:text-[10px] text-muted-foreground truncate font-montserrat mobile-text">
                                {getCountryName(rate.pair)}
                              </p>
                              <p className="text-xs lg:text-[10px] text-muted-foreground mobile-text">
                                Rate: {rate.rate.toFixed(4)}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 lg:h-4 lg:w-4 text-primary flex-shrink-0" weight="fill" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* No Results Message */}
                  {getFilteredRatesForInvoice().length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No countries found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or continent filter
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInvoiceCountrySearch('');
                          setSelectedContinent('all');
                        }}
                        className="mt-3"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCountrySelectionCancel}
                    className="mobile-button flex-1 sm:flex-none h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCountrySelectionContinue}
                    disabled={!selectedInvoiceCountry}
                    className="min-w-[120px] mobile-button flex-1 sm:flex-none h-12"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Transaction Preview Modal */}
      {showTransactionPreview && selectedTransaction && (
        <TransactionPreviewModal
          transaction={selectedTransaction}
          onClose={handleCloseTransactionPreview}
          onComplete={handleTransactionComplete}
          onContinue={handleTransactionContinue}
          onStatusUpdate={updateTransactionStatus}
        />
      )}

    </div>
  );
}

export default App;