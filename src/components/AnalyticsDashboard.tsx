import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  Download
} from "lucide-react";

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
}

interface Client {
  id: string;
  name: string;
  totalTransactions: number;
  totalVolume: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

interface AnalyticsDashboardProps {
  transactions: Transaction[];
  clients: Client[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  transactions = [], 
  clients = [] 
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.fee, 0);
    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgTransactionSize = transactions.length > 0 ? totalVolume / transactions.length : 0;
    
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const completionRate = transactions.length > 0 ? (completedTransactions.length / transactions.length) * 100 : 0;
    
    const activeClients = clients.filter(c => c.verificationStatus === 'verified').length;
    const avgRevenuePerClient = activeClients > 0 ? totalRevenue / activeClients : 0;
    
    // Currency breakdown
    const currencyStats = transactions.reduce((acc, t) => {
      const key = `${t.fromCurrency}-${t.toCurrency}`;
      if (!acc[key]) {
        acc[key] = { count: 0, volume: 0, revenue: 0 };
      }
      acc[key].count++;
      acc[key].volume += t.amount;
      acc[key].revenue += t.fee;
      return acc;
    }, {} as Record<string, { count: number; volume: number; revenue: number }>);
    
    const topCurrencyPairs = Object.entries(currencyStats)
      .sort(([,a], [,b]) => b.volume - a.volume)
      .slice(0, 5);
    
    // Client tier analysis
    const clientTiers = clients.reduce((acc, client) => {
      if (client.totalVolume >= 10000) acc.premium++;
      else if (client.totalVolume >= 5000) acc.gold++;
      else if (client.totalVolume >= 1000) acc.silver++;
      else acc.basic++;
      return acc;
    }, { premium: 0, gold: 0, silver: 0, basic: 0 });
    
    // Growth calculations (simulated)
    const revenueGrowth = 15.7; // Mock data
    const volumeGrowth = 12.3;
    const clientGrowth = 8.5;
    
    return {
      totalRevenue,
      totalVolume,
      avgTransactionSize,
      completionRate,
      activeClients,
      avgRevenuePerClient,
      topCurrencyPairs,
      clientTiers,
      revenueGrowth,
      volumeGrowth,
      clientGrowth
    };
  }, [transactions, clients]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Business Analytics</h3>
        <div className="flex flex-wrap items-center gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range as any)}
              className="text-xs"
            >
              {range}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Revenue Growth</CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{formatPercent(analytics.revenueGrowth)}</div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Avg Transaction</CardTitle>
            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{formatCurrency(analytics.avgTransactionSize)}</div>
            <p className="text-xs text-muted-foreground">per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Revenue per Client</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{formatCurrency(analytics.avgRevenuePerClient)}</div>
            <p className="text-xs text-muted-foreground">average lifetime value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="currencies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="currencies" className="text-xs md:text-sm">Currency Pairs</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs md:text-sm">Client Tiers</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs md:text-sm">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="currencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Currency Pairs</CardTitle>
              <CardDescription className="text-sm">Most active remittance corridors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCurrencyPairs.map(([pair, stats], index) => (
                  <div key={pair} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex-shrink-0">
                        <span className="text-xs md:text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{pair.replace('-', ' → ')}</p>
                        <p className="text-xs text-muted-foreground">{stats.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm md:text-base">{formatCurrency(stats.volume)}</p>
                      <p className="text-xs text-muted-foreground">Revenue: {formatCurrency(stats.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Distribution</CardTitle>
                <CardDescription className="text-sm">By transaction volume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm">Premium ($10K+)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{analytics.clientTiers.premium}</span>
                    <Badge variant="secondary" className="text-xs">
                      {((analytics.clientTiers.premium / clients.length) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm">Gold ($5K-$10K)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{analytics.clientTiers.gold}</span>
                    <Badge variant="secondary" className="text-xs">
                      {((analytics.clientTiers.gold / clients.length) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm">Silver ($1K-$5K)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{analytics.clientTiers.silver}</span>
                    <Badge variant="secondary" className="text-xs">
                      {((analytics.clientTiers.silver / clients.length) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm">Basic (Under $1K)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{analytics.clientTiers.basic}</span>
                    <Badge variant="secondary" className="text-xs">
                      {((analytics.clientTiers.basic / clients.length) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Metrics</CardTitle>
                <CardDescription className="text-sm">Month-over-month changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue</span>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600 text-sm">{formatPercent(analytics.revenueGrowth)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Volume</span>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600 text-sm">{formatPercent(analytics.volumeGrowth)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Client Base</span>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600 text-sm">{formatPercent(analytics.clientGrowth)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    All metrics showing positive growth trend
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Trends</CardTitle>
              <CardDescription className="text-sm">Historical performance visualization would go here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 md:h-64 w-full bg-gradient-to-b from-primary/5 to-accent/5 rounded-lg flex items-end justify-center p-4">
                <div className="flex items-end space-x-1 md:space-x-2 h-full w-full max-w-md">
                  {[65, 45, 78, 52, 84, 69, 91, 73, 88, 95, 82, 97].map((height, i) => (
                    <div 
                      key={i}
                      className="bg-primary/20 rounded-t flex-1 hover:bg-primary/40 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`Week ${i + 1}: ${height}% performance`}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs md:text-sm text-muted-foreground">
                  12-week performance trend • Average: 75.8% • Peak: 97%
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;