import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingStates from "@/components/LoadingStates";
import {
  CurrencyDollar,
  Money,
  TrendUp,
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

interface PrinterStatus {
  connected: boolean;
  paperLevel: number;
  model: string;
  temperature: number;
  errors: string[];
}

interface DashboardMetricsProps {
  transactions: Transaction[];
  clients: Client[];
  printerStatus: PrinterStatus;
  isRefreshing: boolean;
  dataInitialized: boolean;
  onAnalyticsClick: (type: 'revenue' | 'volume' | 'growth' | 'average' | 'clients' | 'conversion', title: string) => void;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  transactions,
  // clients, // Marked as unused, can be removed if not needed for future metrics
  // printerStatus, // Marked as unused, can be removed if not needed for future metrics
  isRefreshing,
  dataInitialized,
  onAnalyticsClick
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

  return (
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
            onClick={() => onAnalyticsClick('revenue', 'Total Revenue')}
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
            style={{ animationDelay: '100ms' }}
            onClick={() => onAnalyticsClick('volume', 'Transaction Volume')}
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
            style={{ animationDelay: '200ms' }}
            onClick={() => onAnalyticsClick('growth', 'Revenue Growth')}
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
            style={{ animationDelay: '300ms' }}
            onClick={() => onAnalyticsClick('average', 'Average Transaction')}
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
  );
};

export default DashboardMetrics;