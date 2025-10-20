import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SupabaseContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'error' | 'disconnected';
  testConnection: () => Promise<boolean>;
  lastConnectionTest: Date | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function useSupabaseConnection() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseConnection must be used within a SupabaseProvider');
  }
  return context;
}

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [lastConnectionTest, setLastConnectionTest] = useState<Date | null>(null);

  const testConnection = async (): Promise<boolean> => {
    try {
      setConnectionStatus('connecting');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('countries')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      setIsConnected(true);
      setConnectionStatus('connected');
      setLastConnectionTest(new Date());
      
      return true;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      setLastConnectionTest(new Date());
      
      // Show user-friendly error message
      toast.error('Database connection failed', {
        description: 'Please check your internet connection or try again later.',
        duration: 5000
      });
      
      return false;
    }
  };

  // Test connection on mount and periodically
  useEffect(() => {
    testConnection();

    // Test connection every 5 minutes
    const interval = setInterval(testConnection, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      testConnection();
    };

    const handleOffline = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value: SupabaseContextType = {
    isConnected,
    connectionStatus,
    testConnection,
    lastConnectionTest
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Connection Status Indicator Component
export function ConnectionStatusIndicator() {
  const { connectionStatus, isConnected, testConnection } = useSupabaseConnection();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'error':
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Database Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {connectionStatus === 'error' && (
        <button
          onClick={testConnection}
          className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}