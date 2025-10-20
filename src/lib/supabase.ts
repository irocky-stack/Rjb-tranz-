import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ucakztqgjaacjwejxcuz.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYWt6dHFnamFhY2p3ZWp4Y3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTMwNTIsImV4cCI6MjA3NjI4OTA1Mn0.Rcvs1SPKp6Qc4D78gZ0OhMDKRFo1NZMSzahiDgDy114';

// Only create client if we have valid-looking credentials
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Database schema interfaces
export interface Transaction {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  amount: number;
  from_currency: string;
  to_currency: string;
  exchange_rate: number;
  fee: number;
  total_fee: number;
  status: 'pending' | 'completed' | 'failed';
  receipt_printed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_transactions: number;
  total_volume: number;
  last_visit: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  pair: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  change: number;
  change_percent: number;
  last_updated: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  receiver_name: string;
  receiver_email: string;
  receiver_phone?: string;
  amount: number;
  description: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  updated_at: string;
}

// Utility functions for Supabase operations
export const supabaseOperations = {
  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase.from('transactions').select('count').limit(1);
      if (error) throw error;
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  },

  // Transactions
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Clients
  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Exchange Rates
  async getExchangeRates() {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('last_updated', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async upsertExchangeRate(rate: Omit<ExchangeRate, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('exchange_rates')
      .upsert([rate], {
        onConflict: 'from_currency,to_currency'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExchangeRates(rates: ExchangeRate[]) {
    const results: ExchangeRate[] = [];
    for (const rate of rates) {
      try {
        const result = await this.upsertExchangeRate({
          ...rate,
          id: undefined as any,
          created_at: undefined as any
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to update rate ${rate.pair}:`, error);
      }
    }
    return results;
  },

  async deleteTransaction(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSystemConfig() {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  async saveSystemConfig(config: any) {
    const { data, error } = await supabase
      .from('system_config')
      .upsert([config], { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Invoices
  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Sync local data to Supabase
  async syncData(localData: {
    transactions: Transaction[];
    clients: Client[];
    invoices: Invoice[];
    exchangeRates: ExchangeRate[];
  }) {
    try {
      const results = {
        transactions: 0,
        clients: 0,
        invoices: 0,
        exchangeRates: 0,
        errors: [] as string[]
      };

      // Sync transactions
      for (const transaction of localData.transactions) {
        try {
          await this.createTransaction({
            ...transaction,
            id: undefined as any, // Let Supabase generate ID
            created_at: undefined as any,
            updated_at: undefined as any
          });
          results.transactions++;
        } catch (error) {
          results.errors.push(`Transaction ${transaction.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Sync clients
      for (const client of localData.clients) {
        try {
          await this.createClient({
            ...client,
            id: undefined as any,
            created_at: undefined as any,
            updated_at: undefined as any
          });
          results.clients++;
        } catch (error) {
          results.errors.push(`Client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Sync invoices
      for (const invoice of localData.invoices) {
        try {
          await this.createInvoice({
            ...invoice,
            id: undefined as any,
            created_at: undefined as any,
            updated_at: undefined as any
          });
          results.invoices++;
        } catch (error) {
          results.errors.push(`Invoice ${invoice.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Sync exchange rates
      for (const rate of localData.exchangeRates) {
        try {
          await this.upsertExchangeRate({
            ...rate,
            id: undefined as any,
            created_at: undefined as any
          });
          results.exchangeRates++;
        } catch (error) {
          results.errors.push(`Exchange rate ${rate.pair}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};