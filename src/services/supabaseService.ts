import { supabase, supabaseOperations } from '@/lib/supabase'
import { toast } from 'sonner'

export class SupabaseService {
  // Test connection
  static async testConnection() {
    try {
      const result = await supabaseOperations.testConnection();
      if (result.success) {
        toast.success('Database connection successful!');
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
      return result.success;
    } catch (error) {
      console.error('Database connection failed:', error);
      toast.error('Database connection failed');
      return false;
    }
  }

  // Sync local data to Supabase
  static async syncLocalData(localData: {
    transactions?: any[]
    clients?: any[]
    invoices?: any[]
    exchangeRates?: any[]
  }) {
    try {
      const result = await supabaseOperations.syncData({
        transactions: localData.transactions || [],
        clients: localData.clients || [],
        invoices: localData.invoices || [],
        exchangeRates: localData.exchangeRates || []
      });

      const totalSynced = result.transactions + result.clients + result.invoices + result.exchangeRates;
      
      if (result.errors.length > 0) {
        toast.error(`Partially synced: ${totalSynced} records. ${result.errors.length} errors occurred.`);
        console.warn('Sync errors:', result.errors);
      } else {
        toast.success(`Successfully synced ${totalSynced} records to database`);
      }

      return { 
        success: result.errors.length === 0, 
        synced: totalSynced, 
        errors: result.errors 
      };
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync data to database');
      return { success: false, synced: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  // Sync local data to Supabase (alias for syncLocalData)
  static async syncLocalDataToSupabase(localData: {
    transactions?: any[]
    clients?: any[]
    invoices?: any[]
    exchangeRates?: any[]
  }) {
    return await this.syncLocalData(localData);
  }

  // Get data from Supabase
  static async getTransactions() {
    try {
      return await supabaseOperations.getTransactions();
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions from database')
      return []
    }
  }

  static async getClients() {
    try {
      return await supabaseOperations.getClients();
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to load clients from database')
      return []
    }
  }

  static async getInvoices() {
    try {
      return await supabaseOperations.getInvoices();
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Failed to load invoices from database')
      return []
    }
  }

  static async getExchangeRates() {
    try {
      return await supabaseOperations.getExchangeRates();
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      toast.error('Failed to load exchange rates from database')
      return []
    }
  }

  // CRUD operations for transactions
  static async createTransaction(transaction: any) {
    try {
      return await supabaseOperations.createTransaction(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Failed to create transaction')
      throw error
    }
  }

  static async updateTransaction(id: string, updates: any) {
    try {
      return await supabaseOperations.updateTransaction(id, updates);
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error('Failed to update transaction')
      throw error
    }
  }

  static async deleteTransaction(id: string) {
    try {
      return await supabaseOperations.deleteTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Failed to delete transaction')
      throw error
    }
  }

  // CRUD operations for clients
  static async createClient(client: any) {
    try {
      return await supabaseOperations.createClient(client);
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Failed to create client')
      throw error
    }
  }

  static async updateClient(id: string, updates: any) {
    try {
      return await supabaseOperations.updateClient(id, updates);
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error('Failed to update client')
      throw error
    }
  }

  // CRUD operations for invoices
  static async createInvoice(invoice: any) {
    try {
      return await supabaseOperations.createInvoice(invoice);
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice')
      throw error
    }
  }

  static async updateInvoice(id: string, updates: any) {
    try {
      return await supabaseOperations.updateInvoice(id, updates);
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast.error('Failed to update invoice')
      throw error
    }
  }

  // Exchange rates management
  static async updateExchangeRates(rates: any[]) {
    try {
      return await supabaseOperations.updateExchangeRates(rates);
    } catch (error) {
      console.error('Error updating exchange rates:', error)
      toast.error('Failed to update exchange rates')
      throw error
    }
  }

  // System configuration
  static async getSystemConfig() {
    try {
      return await supabaseOperations.getSystemConfig();
    } catch (error) {
      console.error('Error fetching system config:', error)
      toast.error('Failed to load system configuration')
      return null
    }
  }

  static async saveSystemConfig(config: any) {
    try {
      return await supabaseOperations.saveSystemConfig(config);
    } catch (error) {
      console.error('Error saving system config:', error)
      toast.error('Failed to save system configuration')
      throw error
    }
  }
}