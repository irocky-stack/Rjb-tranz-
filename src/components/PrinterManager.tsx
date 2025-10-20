import React, { useState, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Printer, 
  Wifi, 
  WifiOff, 
  Zap, 
  AlertCircle, 
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface PrintJob {
  id: string;
  transactionId: string;
  clientName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: string;
}

interface PrinterStatus {
  connected: boolean;
  paperLevel: number;
  model: string;
  temperature: number;
  errors: string[];
}

const PrinterManager: React.FC = () => {
  const [printerStatus, setPrinterStatus] = useKV<PrinterStatus>("printerStatus", {
    connected: false,
    paperLevel: 0,
    model: "ESC/POS Thermal Printer",
    temperature: 0,
    errors: []
  });
  
  const [printQueue, setPrintQueue] = useKV<PrintJob[]>("printQueue", []);
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Simulate printer connection check
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      
      // Simulate connection check delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 90% chance of being connected
      const isConnected = Math.random() > 0.1;
      
      setPrinterStatus((prev) => ({
        connected: isConnected,
        paperLevel: 75 + Math.floor(Math.random() * 25), // 75-100%
        model: prev?.model || "EPSON TM-T20III ESC/POS Thermal Printer",
        temperature: 38 + Math.floor(Math.random() * 12), // 38-50°C
        errors: isConnected ? [] : ["USB connection timeout", "Check cable connection"]
      }));
      
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const generateESCPOSCommands = (transaction: any) => {
    // ESC/POS command structure for thermal printer
    const ESC = '\x1B';
    const GS = '\x1D';
    
    const commands = [
      // Initialize printer
      ESC + '@',
      
      // Set alignment to center
      ESC + 'a' + '1',
      
      // Print logo/header (would normally be a bitmap)
      '====== RJB TRANZ ======\n',
      'REMITTANCE RECEIPT\n',
      '========================\n\n',
      
      // Set alignment to left
      ESC + 'a' + '0',
      
      // Transaction details
      `Transaction ID: ${transaction.id}\n`,
      `Date: ${new Date(transaction.createdAt).toLocaleDateString()}\n`,
      `Time: ${new Date(transaction.createdAt).toLocaleTimeString()}\n\n`,
      
      // Client information
      `Client: ${transaction.clientName}\n`,
      `Email: ${transaction.clientEmail}\n\n`,
      
      // Transaction details
      `Amount: $${transaction.amount.toLocaleString()}\n`,
      `From: ${transaction.fromCurrency}\n`,
      `To: ${transaction.toCurrency}\n`,
      `Rate: ${transaction.exchangeRate.toFixed(4)}\n`,
      `Fee: $${transaction.fee}\n`,
      `Status: ${transaction.status.toUpperCase()}\n\n`,
      
      // Barcode (Code128)
      GS + 'k' + '\x49' + String.fromCharCode(transaction.id.length) + transaction.id,
      '\n\n',
      
      // Footer
      ESC + 'a' + '1', // Center align
      'Thank you for choosing\n',
      'RJB TRANZ\n',
      '========================\n',
      
      // Cut paper
      GS + 'V' + '\x42' + '\x00',
      
      // Cash drawer (if connected)
      ESC + 'p' + '\x00' + '\x32' + '\x96'
    ];
    
    return commands.join('');
  };

  const handleTestPrint = async () => {
    if (!printerStatus?.connected) {
      toast.error("Printer not connected");
      return;
    }

    setIsTestPrinting(true);
    
    try {
      // Simulate test print with ESC/POS commands
      const testTransaction = {
        id: "TEST-" + Date.now(),
        clientName: "Test Customer",
        clientEmail: "test@example.com",
        amount: 100,
        fromCurrency: "USD",
        toCurrency: "GHS",
        exchangeRate: 12.45,
        fee: 5,
        status: "completed",
        createdAt: new Date().toISOString()
      };

      const escposCommands = generateESCPOSCommands(testTransaction);
      
      // In a real implementation, this would send to the printer
      console.log("ESC/POS Commands:", escposCommands);
      
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update paper level
      setPrinterStatus((prev) => ({
        ...prev!,
        paperLevel: Math.max(0, (prev?.paperLevel || 0) - 2)
      }));
      
      toast.success("Test receipt printed successfully");
      
    } catch (error) {
      toast.error("Test print failed");
      console.error("Print error:", error);
    } finally {
      setIsTestPrinting(false);
    }
  };

  const processQueuedJobs = async () => {
    const pendingJobs = printQueue?.filter(job => job.status === 'pending') || [];
    
    for (const job of pendingJobs) {
      try {
        // Update job status to printing
        setPrintQueue((prev) => prev?.map(j => 
          j.id === job.id ? { ...j, status: 'printing' } : j
        ) || []);
        
        // Simulate printing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mark as completed
        setPrintQueue((prev) => prev?.map(j => 
          j.id === job.id ? { ...j, status: 'completed' } : j
        ) || []);
        
        toast.success(`Receipt printed for ${job.clientName}`);
        
      } catch (error) {
        // Mark as failed
        setPrintQueue((prev) => prev?.map(j => 
          j.id === job.id ? { ...j, status: 'failed' } : j
        ) || []);
        
        toast.error(`Print failed for ${job.clientName}`);
      }
    }
  };

  const addToQueue = (transaction: any) => {
    const printJob: PrintJob = {
      id: `PRINT-${Date.now()}`,
      transactionId: transaction.id,
      clientName: transaction.clientName,
      amount: transaction.amount,
      currency: transaction.fromCurrency,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setPrintQueue((prev) => [...(prev || []), printJob]);
    toast.success("Added to print queue");
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'printing': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Alert */}
      {connectionStatus === 'checking' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Checking printer connection...
          </AlertDescription>
        </Alert>
      )}
      
      {!printerStatus?.connected && connectionStatus === 'disconnected' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Printer disconnected. Check USB connection and power.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Printer Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              {printerStatus?.connected ? (
                <Wifi className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              )}
              <span>Printer Status</span>
            </CardTitle>
            <CardDescription className="text-sm">ESC/POS Thermal Printer Management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection</span>
              <Badge variant={printerStatus?.connected ? "secondary" : "destructive"} className="text-xs">
                {connectionStatus === 'checking' ? 'Checking...' : 
                 printerStatus?.connected ? 'Connected' : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Model</span>
              <span className="text-sm text-muted-foreground text-right max-w-[60%] truncate">
                {printerStatus?.model || "Unknown"}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Paper Level</span>
                <span className="text-sm">{printerStatus?.paperLevel || 0}%</span>
              </div>
              <Progress 
                value={printerStatus?.paperLevel || 0} 
                className={`w-full ${(printerStatus?.paperLevel || 0) < 20 ? 'bg-red-100' : ''}`}
              />
              {(printerStatus?.paperLevel || 0) < 20 && (
                <p className="text-xs text-red-600">Low paper - replace soon</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Temperature</span>
              <span className="text-sm">{printerStatus?.temperature || 0}°C</span>
            </div>
            
            {printerStatus?.errors && printerStatus.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {printerStatus.errors.join(", ")}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col md:flex-row gap-2">
              <Button 
                onClick={handleTestPrint}
                disabled={!printerStatus?.connected || isTestPrinting}
                className="flex-1 text-sm"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isTestPrinting ? 'Printing...' : 'Test Print'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={processQueuedJobs}
                disabled={!printerStatus?.connected}
                className="flex-1 text-sm"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Process
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Print Queue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Print Queue</CardTitle>
            <CardDescription className="text-sm">
              {printQueue?.length || 0} jobs - {printQueue?.filter(j => j.status === 'pending').length || 0} pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            {printQueue && printQueue.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {printQueue.slice(0, 10).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {getJobStatusIcon(job.status)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{job.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          ${job.amount.toLocaleString()} {job.currency}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(job.status)} text-xs flex-shrink-0 ml-2`}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Printer className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No print jobs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Printer Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Settings className="h-4 w-4 md:h-5 md:w-5" />
            <span>Printer Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paper Size</label>
              <select className="w-full px-3 py-2 border rounded-md text-sm">
                <option value="58mm">58mm (2.28")</option>
                <option value="80mm" selected>80mm (3.15")</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Print Density</label>
              <select className="w-full px-3 py-2 border rounded-md text-sm">
                <option value="light">Light</option>
                <option value="normal" selected>Normal</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto Cut</label>
              <select className="w-full px-3 py-2 border rounded-md text-sm">
                <option value="enabled" selected>Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">ESC/POS Support</h4>
            <p className="text-xs text-muted-foreground">
              Compatible with ESC/POS thermal printers including EPSON TM series, 
              Star TSP series, and most USB/Bluetooth thermal receipt printers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrinterManager;