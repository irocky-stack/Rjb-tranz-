 import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SupabaseService } from '@/services/supabaseService';
import { 
  Database, 
  CloudArrowUp, 
  CloudArrowDown, 
  CheckCircle, 
  Warning, 
  ArrowsClockwise,
  Lightning
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface DataMigrationProps {
  localData: {
    transactions?: any[];
    clients?: any[];
    invoices?: any[];
    exchangeRates?: any[];
    systemConfig?: any;
  };
  onDataSynced?: () => void;
}

const DataMigration: React.FC<DataMigrationProps> = ({ localData, onDataSynced }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStats, setSyncStats] = useState<{
    transactions: number;
    clients: number;
    invoices: number;
    exchangeRates: number;
  }>({
    transactions: 0,
    clients: 0,
    invoices: 0,
    exchangeRates: 0
  });

  const testConnection = async () => {
    setIsConnecting(true);
    try {
      const isConnected = await SupabaseService.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
    } catch (error) {
      setConnectionStatus('failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const syncDataToSupabase = async () => {
    if (connectionStatus !== 'connected') {
      toast.error('Please test connection first');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Simulate progress steps
      const steps = [
        { name: 'Preparing data...', progress: 10 },
        { name: 'Syncing transactions...', progress: 30 },
        { name: 'Syncing clients...', progress: 50 },
        { name: 'Syncing invoices...', progress: 70 },
        { name: 'Syncing exchange rates...', progress: 90 },
        { name: 'Finalizing...', progress: 100 }
      ];

      for (const step of steps) {
        toast.info(step.name);
        setSyncProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const result = await SupabaseService.syncLocalDataToSupabase(localData);
      
      if (result.success) {
        setSyncStats({
          transactions: localData.transactions?.length || 0,
          clients: localData.clients?.length || 0,
          invoices: localData.invoices?.length || 0,
          exchangeRates: localData.exchangeRates?.length || 0
        });
        
        toast.success(`Successfully synced ${result.synced} records!`);
        onDataSynced?.();
      } else {
        toast.error('Sync completed with errors');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const loadDataFromSupabase = async () => {
    setIsLoading(true);
    try {
      const transactions = await SupabaseService.getTransactions();
      const clients = await SupabaseService.getClients();
      const invoices = await SupabaseService.getInvoices();
      const exchangeRates = await SupabaseService.getExchangeRates();

      toast.success(`Loaded ${transactions.length + clients.length + invoices.length + exchangeRates.length} records from database`);
      onDataSynced?.();
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load data from database');
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'failed':
        return <Badge variant="destructive"><Warning className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTotalRecords = () => {
    return (localData.transactions?.length || 0) +
           (localData.clients?.length || 0) +
           (localData.invoices?.length || 0) +
           (localData.exchangeRates?.length || 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Supabase Integration
          </CardTitle>
          <CardDescription>
            Manage your data synchronization with Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <h3 className="font-medium">Database Connection</h3>
              <p className="text-sm text-muted-foreground">
                Status: {getConnectionStatusBadge()}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={isConnecting}
            >
              <ArrowsClockwise className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </div>

          {/* Data Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{localData.transactions?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{localData.clients?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Clients</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{localData.invoices?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Invoices</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{localData.exchangeRates?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Exchange Rates</div>
            </div>
          </div>

          {/* Sync Progress */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing data...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={syncDataToSupabase}
              disabled={connectionStatus !== 'connected' || isSyncing || getTotalRecords() === 0}
              className="flex-1"
            >
              <CloudArrowUp className="h-4 w-4 mr-2" />
              {isSyncing ? 'Syncing...' : 'Sync to Database'}
            </Button>
            
            <Button
              variant="outline"
              onClick={loadDataFromSupabase}
              disabled={connectionStatus !== 'connected' || isLoading}
              className="flex-1"
            >
              <CloudArrowDown className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Load from Database'}
            </Button>
          </div>

          {/* Sync Statistics */}
          {(syncStats.transactions > 0 || syncStats.clients > 0 || syncStats.invoices > 0 || syncStats.exchangeRates > 0) && (
            <Alert>
              <Lightning className="h-4 w-4" />
              <AlertDescription>
                Last sync: {syncStats.transactions} transactions, {syncStats.clients} clients, 
                {syncStats.invoices} invoices, {syncStats.exchangeRates} exchange rates
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          {connectionStatus === 'unknown' && (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Click "Test Connection" to verify your Supabase database connection before syncing data.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'failed' && (
            <Alert>
              <Warning className="h-4 w-4" />
              <AlertDescription>
                Database connection failed. Please check your Supabase configuration and ensure the database schema is set up correctly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMigration;