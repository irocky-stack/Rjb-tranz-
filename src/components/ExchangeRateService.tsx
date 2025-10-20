 import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ExchangeRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  region: 'africa' | 'asia' | 'europe' | 'north-america' | 'south-america' | 'oceania' | 'middle-east';
}

interface ExchangeRateServiceProps {
  onRatesUpdate: (rates: ExchangeRate[]) => void;
  isAutoRefresh: boolean;
  refreshInterval?: number; // in milliseconds
}

// Mock API service for demonstration - in real app, replace with actual API calls
class MockExchangeRateAPI {
  private static baseRates: ExchangeRate[] = [
    // Africa
    { pair: "USD/GHS", rate: 12.45, change: 0.15, changePercent: 1.22, lastUpdated: new Date().toISOString(), region: 'africa' },
    { pair: "USD/NGN", rate: 795.50, change: -5.25, changePercent: -0.66, lastUpdated: new Date().toISOString(), region: 'africa' },
    { pair: "USD/KES", rate: 129.75, change: 2.10, changePercent: 1.64, lastUpdated: new Date().toISOString(), region: 'africa' },
    { pair: "USD/ZAR", rate: 18.75, change: -0.12, changePercent: -0.64, lastUpdated: new Date().toISOString(), region: 'africa' },
    { pair: "USD/EGP", rate: 30.85, change: 0.25, changePercent: 0.82, lastUpdated: new Date().toISOString(), region: 'africa' },

    // Asia
    { pair: "USD/INR", rate: 83.25, change: 0.45, changePercent: 0.54, lastUpdated: new Date().toISOString(), region: 'asia' },
    { pair: "USD/PHP", rate: 56.75, change: -0.85, changePercent: -1.48, lastUpdated: new Date().toISOString(), region: 'asia' },
    { pair: "USD/JPY", rate: 149.85, change: 1.25, changePercent: 0.84, lastUpdated: new Date().toISOString(), region: 'asia' },
    { pair: "USD/CNY", rate: 7.28, change: -0.02, changePercent: -0.27, lastUpdated: new Date().toISOString(), region: 'asia' },
    { pair: "USD/KRW", rate: 1335.50, change: 8.75, changePercent: 0.66, lastUpdated: new Date().toISOString(), region: 'asia' },

    // Europe
    { pair: "USD/EUR", rate: 0.92, change: -0.005, changePercent: -0.54, lastUpdated: new Date().toISOString(), region: 'europe' },
    { pair: "USD/GBP", rate: 0.79, change: -0.003, changePercent: -0.38, lastUpdated: new Date().toISOString(), region: 'europe' },
    { pair: "USD/CHF", rate: 0.88, change: 0.002, changePercent: 0.23, lastUpdated: new Date().toISOString(), region: 'europe' },

    // Americas
    { pair: "USD/CAD", rate: 1.36, change: 0.008, changePercent: 0.59, lastUpdated: new Date().toISOString(), region: 'north-america' },
    { pair: "USD/MXN", rate: 17.85, change: -0.12, changePercent: -0.67, lastUpdated: new Date().toISOString(), region: 'north-america' },
    { pair: "USD/BRL", rate: 4.95, change: 0.08, changePercent: 1.64, lastUpdated: new Date().toISOString(), region: 'south-america' },

    // Oceania
    { pair: "USD/AUD", rate: 1.52, change: 0.01, changePercent: 0.66, lastUpdated: new Date().toISOString(), region: 'oceania' },

    // Middle East
    { pair: "USD/AED", rate: 3.67, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'middle-east' },
    { pair: "USD/SAR", rate: 3.75, change: 0.00, changePercent: 0.00, lastUpdated: new Date().toISOString(), region: 'middle-east' },
  ];

  static async fetchLiveRates(): Promise<ExchangeRate[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate live rate changes with realistic fluctuations
    return this.baseRates.map(rate => {
      const volatility = this.getVolatilityForPair(rate.pair);
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const newRate = rate.rate * (1 + randomChange / 100);
      const change = newRate - rate.rate;
      const changePercent = (change / rate.rate) * 100;

      return {
        ...rate,
        rate: newRate,
        change: change,
        changePercent: changePercent,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  private static getVolatilityForPair(pair: string): number {
    // Different currency pairs have different volatilities
    const volatilityMap: { [key: string]: number } = {
      'USD/EUR': 0.5,
      'USD/GBP': 0.6,
      'USD/JPY': 0.4,
      'USD/CHF': 0.4,
      'USD/CAD': 0.3,
      'USD/AUD': 0.7,
      'USD/GHS': 1.2,
      'USD/NGN': 2.0,
      'USD/KES': 1.5,
      'USD/ZAR': 1.8,
      'USD/INR': 0.8,
      'USD/PHP': 1.0,
      'USD/CNY': 0.3,
      'USD/BRL': 1.5,
      'USD/MXN': 1.2
    };
    
    return volatilityMap[pair] || 1.0;
  }

  static async fetchHistoricalRates(pair: string, days: number = 7): Promise<{date: string, rate: number}[]> {
    // Simulate historical data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const data: {date: string, rate: number}[] = [];
    const baseRate = this.baseRates.find(r => r.pair === pair)?.rate || 1;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const volatility = this.getVolatilityForPair(pair);
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const rate = baseRate * (1 + randomChange / 100);
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate: rate
      });
    }
    
    return data;
  }
}

const ExchangeRateService: React.FC<ExchangeRateServiceProps> = ({
  onRatesUpdate,
  isAutoRefresh,
  refreshInterval = 30000 // 30 seconds default
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  // Manual refresh function
  const refreshRates = async () => {
    try {
      setIsConnected(true);
      const rates = await MockExchangeRateAPI.fetchLiveRates();
      onRatesUpdate(rates);
      setLastUpdate(new Date());
      setErrorCount(0);
      
      // Show success toast only if there were previous errors
      if (errorCount > 0) {
        toast.success('Exchange rates updated successfully');
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      setErrorCount(prev => prev + 1);
      
      if (errorCount < 3) {
        toast.error('Failed to update exchange rates. Retrying...');
      } else {
        toast.error('Exchange rate service temporarily unavailable');
      }
    } finally {
      setIsConnected(false);
    }
  };

  // Auto refresh effect
  useEffect(() => {
    if (!isAutoRefresh) return;

    // Initial fetch
    refreshRates();

    // Set up interval
    const interval = setInterval(refreshRates, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, onRatesUpdate]);

  // Expose refresh function globally for manual calls
  useEffect(() => {
    // Make refresh function available globally
    (window as any).refreshExchangeRates = refreshRates;
    
    return () => {
      delete (window as any).refreshExchangeRates;
    };
  }, []);

  // Connection status effect
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      toast.success('Connection restored. Updating rates...');
      refreshRates();
    };

    const handleOffline = () => {
      setIsConnected(false);
      toast.warning('Connection lost. Rates may be outdated.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // This component doesn't render anything, it's a service component
  return null;
};

export default ExchangeRateService;
export { MockExchangeRateAPI };