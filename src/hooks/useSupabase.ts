import { useState, useEffect, useCallback } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

export interface UseSupabaseOptions {
  autoLoad?: boolean;
  enableRealtime?: boolean;
}

export const useSupabase = (options: UseSupabaseOptions = {}) => {
  const { autoLoad = false, enableRealtime = false } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test database connection
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await SupabaseService.testConnection();
      setIsConnected(connected);
      return connected;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [transactions, clients, invoices, exchangeRates] = await Promise.all([
        SupabaseService.getTransactions(),
        SupabaseService.getClients(),
        SupabaseService.getInvoices(),
        SupabaseService.getExchangeRates()
      ]);

      return {
        transactions,
        clients,
        invoices,
        exchangeRates
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync local data to Supabase
  const syncData = useCallback(async (localData: {
    transactions?: any[];
    clients?: any[];
    invoices?: any[];
    exchangeRates?: any[];
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await SupabaseService.syncLocalDataToSupabase(localData);
      
      if (!result.success) {
        throw new Error('Sync operation failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, synced: 0, total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Individual CRUD operations
  const transactions = {
    create: async (transaction: any) => {
      setIsLoading(true);
      try {
        return await SupabaseService.createTransaction(transaction);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create transaction');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    update: async (id: string, updates: any) => {
      setIsLoading(true);
      try {
        return await SupabaseService.updateTransaction(id, updates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update transaction');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    delete: async (id: string) => {
      setIsLoading(true);
      try {
        return await SupabaseService.deleteTransaction(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete transaction');
        return false;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clients = {
    create: async (client: any) => {
      setIsLoading(true);
      try {
        return await SupabaseService.createClient(client);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create client');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    update: async (id: string, updates: any) => {
      setIsLoading(true);
      try {
        return await SupabaseService.updateClient(id, updates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update client');
        return null;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const invoices = {
    create: async (invoice: any) => {
      setIsLoading(true);
      try {
        return await SupabaseService.createInvoice(invoice);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create invoice');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    update: async (id: string, updates: any) => {
      setIsLoading(true);
      try {
        return await SupabaseService.updateInvoice(id, updates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update invoice');
        return null;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const exchangeRates = {
    update: async (rates: any[]) => {
      setIsLoading(true);
      try {
        return await SupabaseService.updateExchangeRates(rates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update exchange rates');
        return false;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const systemConfig = {
    get: async () => {
      setIsLoading(true);
      try {
        return await SupabaseService.getSystemConfig();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get system config');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    save: async (config: any) => {
      setIsLoading(true);
      try {
        return await SupabaseService.saveSystemConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save system config');
        return null;
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Auto-test connection on mount if requested
  useEffect(() => {
    if (autoLoad) {
      testConnection();
    }
  }, [autoLoad, testConnection]);

  return {
    // State
    isLoading,
    isConnected,
    error,
    
    // Core operations
    testConnection,
    loadData,
    syncData,
    
    // CRUD operations
    transactions,
    clients,
    invoices,
    exchangeRates,
    systemConfig,
    
    // Utilities
    clearError: () => setError(null)
  };
};