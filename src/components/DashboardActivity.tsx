import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendUp
} from "@phosphor-icons/react";

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

interface PrinterStatus {
  connected: boolean;
  paperLevel: number;
  model: string;
  temperature: number;
  errors: string[];
}

interface DashboardActivityProps {
  transactions: Transaction[];
  printerStatus: PrinterStatus;
  onTransactionClick: (transaction: Transaction) => void;
}

const DashboardActivity: React.FC<DashboardActivityProps> = ({
  transactions,
  printerStatus,
  onTransactionClick
}) => {
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

  const pendingTransactions = (() => {
    try {
      return (transactions || []).filter(t => t?.status === 'pending').length;
    } catch (error) {
      console.error('Error calculating pendingTransactions:', error);
      return 0;
    }
  })();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="card-dark-shadow animate-card-entrance overflow-hidden relative" style={{ animationDelay: '1200ms' }}>
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
                  style={{ animationDelay: `${900 + index * 100}ms` }}
                  onClick={() => onTransactionClick(transaction)}
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
                  <Badge className={`flex-shrink-0`}>
                    {transaction.status || 'pending'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="card-dark-shadow animate-card-entrance overflow-hidden relative" style={{ animationDelay: '1300ms' }}>
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
  );
};

export default DashboardActivity;