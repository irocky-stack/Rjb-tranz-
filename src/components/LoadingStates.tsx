 import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  Activity, 
  Banknote,
  Loader2,
  TrendingUp
} from "lucide-react";

// Professional loading skeleton for metric cards
export const MetricCardSkeleton: React.FC = () => (
  <Card className="animate-pulse-professional">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-4 w-4 bg-muted rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-32"></div>
        <div className="h-3 bg-muted rounded w-28"></div>
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton for transaction rows
export const TransactionRowSkeleton: React.FC = () => (
  <tr className="border-b animate-pulse">
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-20"></div>
    </td>
    <td className="p-4">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-32"></div>
        <div className="h-3 bg-muted rounded w-40"></div>
      </div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-24"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-20"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-16"></div>
    </td>
    <td className="p-4">
      <div className="h-6 bg-muted rounded w-20"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-20"></div>
    </td>
    <td className="p-4">
      <div className="flex space-x-2">
        <div className="h-8 w-8 bg-muted rounded"></div>
        <div className="h-8 w-8 bg-muted rounded"></div>
      </div>
    </td>
  </tr>
);

// Loading skeleton for client cards
export const ClientCardSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-10 w-10 bg-muted rounded-full"></div>
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-40"></div>
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Enhanced branded spinner with more options
export const BrandedSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse';
}> = ({ size = 'md', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (variant === 'dots') {
    return (
      <div className="flex items-center justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} bg-primary rounded-full animate-bounce`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex items-center justify-center">
        <div className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse-professional`} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-accent rounded-full animate-ping opacity-20`}></div>
      </div>
    </div>
  );
};

// Full-page loading screen with RJB TRANZ branding
export const FullPageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading RJB TRANZ CRM..." 
}) => {
  const [progress, setProgress] = React.useState(0);
  const [currentMessage, setCurrentMessage] = React.useState(message);

  React.useEffect(() => {
    const messages = [
      "Initializing RJB TRANZ CRM...",
      "Loading user data...",
      "Connecting to services...",
      "Preparing dashboard...",
      "Almost ready..."
    ];

    let messageIndex = 0;
    let progressValue = 0;

    const progressInterval = setInterval(() => {
      progressValue += Math.random() * 15 + 5;
      if (progressValue > 100) progressValue = 100;
      setProgress(progressValue);

      // Update message based on progress
      const newMessageIndex = Math.min(
        Math.floor((progressValue / 100) * messages.length),
        messages.length - 1
      );
      
      if (newMessageIndex !== messageIndex) {
        messageIndex = newMessageIndex;
        setCurrentMessage(messages[messageIndex]);
      }

      if (progressValue >= 100) {
        clearInterval(progressInterval);
      }
    }, 300);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 animate-loading-enter">
      <div className="text-center space-y-8 max-w-sm w-full">
        {/* Logo with enhanced loading animation */}
        <div className="relative flex justify-center">
          <div className="relative">
            <img 
              src="https://i.ibb.co/6LY7bxR/rjb-logo.jpg" 
              alt="RJB TRANZ Logo" 
              className="h-20 w-20 rounded-full mx-auto animate-pulse-professional shadow-lg"
              style={{ 
                filter: 'drop-shadow(0 0 20px rgba(var(--primary), 0.3))',
                animation: 'pulse-professional 2s ease-in-out infinite'
              }}
            />
            {/* Rotating border */}
            <div className="absolute inset-0 h-20 w-20 mx-auto border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            {/* Pulsing ring */}
            <div className="absolute inset-0 h-20 w-20 mx-auto border-2 border-accent rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        
        {/* Company name with fade-in animation */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground font-montserrat bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RJB TRANZ
          </h1>
          <p className="text-muted-foreground font-montserrat">Admin CRM System</p>
        </div>
        
        {/* Loading message with typing effect */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <BrandedSpinner size="md" />
          </div>
          <p className="text-sm text-muted-foreground font-montserrat min-h-[20px] transition-all duration-300">
            {currentMessage}
          </p>
        </div>
        
        {/* Enhanced loading progress bar */}
        <div className="w-full max-w-xs mx-auto space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ 
                width: `${progress}%`,
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 2s ease-in-out infinite'
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-montserrat">
            <span>Loading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-primary/15 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

// Data refresh indicator
export const RefreshIndicator: React.FC<{ isRefreshing: boolean }> = ({ isRefreshing }) => {
  if (!isRefreshing) return null;
  
  return (
    <div className="fixed top-20 right-6 z-50">
      <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-lg flex items-center space-x-2">
        <BrandedSpinner size="sm" />
        <span className="text-sm text-foreground">Refreshing data...</span>
      </div>
    </div>
  );
};

// Print job progress indicator
export const PrintProgress: React.FC<{ 
  isVisible: boolean; 
  progress: number; 
  message: string 
}> = ({ isVisible, progress, message }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-primary animate-spin" viewBox="0 0 24 24">
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none" 
                    strokeDasharray={`${progress * 0.628} ${62.8 - (progress * 0.628)}`}
                    strokeDashoffset="15.7"
                    transform="rotate(-90 12 12)"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Connection status indicator
export const ConnectionStatus: React.FC<{ 
  isOnline: boolean; 
  lastSync?: string 
}> = ({ isOnline, lastSync }) => (
  <div className="flex items-center space-x-2 text-sm">
    <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
    <span className="text-muted-foreground">
      {isOnline ? 'Online' : 'Offline'}
      {lastSync && ` • Last sync: ${lastSync}`}
    </span>
  </div>
);

// Chart loading placeholder
export const ChartSkeleton: React.FC = () => (
  <div className="h-64 w-full bg-gradient-to-b from-primary/5 to-accent/5 rounded-lg animate-pulse-professional flex items-end justify-center p-4">
    <div className="flex items-end space-x-2 h-full w-full max-w-sm">
      {[...Array(7)].map((_, i) => (
        <div 
          key={i}
          className="bg-muted rounded-t flex-1 animate-pulse"
          style={{ 
            height: `${30 + Math.random() * 70}%`,
            animationDelay: `${i * 0.1}s`
          }}
        ></div>
      ))}
    </div>
  </div>
);

// Startup splash screen for immediate app launch feedback
export const StartupSplash: React.FC = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center z-50">
    <div className="text-center">
      <div className="relative mb-6">
        <img 
          src="https://i.ibb.co/6LY7bxR/rjb-logo.jpg" 
          alt="RJB TRANZ Logo" 
          className="h-24 w-24 rounded-full mx-auto shadow-2xl animate-pulse-professional"
        />
        <div className="absolute inset-0 h-24 w-24 mx-auto border-4 border-white/20 rounded-full animate-spin"></div>
      </div>
      <h1 className="text-4xl font-bold text-white font-montserrat mb-2">RJB TRANZ</h1>
      <p className="text-white/80 font-montserrat">Loading...</p>
    </div>
  </div>
);

export default {
  MetricCardSkeleton,
  TransactionRowSkeleton,
  ClientCardSkeleton,
  BrandedSpinner,
  FullPageLoader,
  StartupSplash,
  RefreshIndicator,
  PrintProgress,
  ConnectionStatus,
  ChartSkeleton
};