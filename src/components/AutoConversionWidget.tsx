 import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowsClockwise, 
  TrendUp, 
  TrendDown,
  Calculator,
  Eye,
  EyeSlash,
  X
} from '@phosphor-icons/react';

interface ExchangeRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  region: 'africa' | 'asia' | 'europe' | 'north-america' | 'south-america' | 'oceania' | 'middle-east';
}

interface AutoConversionWidgetProps {
  exchangeRates: ExchangeRate[];
  onRefreshRates: () => Promise<void>;
  isRefreshing: boolean;
  className?: string;
}

interface ConversionPair {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  isVisible: boolean;
}

const AutoConversionWidget: React.FC<AutoConversionWidgetProps> = ({
  exchangeRates,
  onRefreshRates,
  isRefreshing,
  className = ''
}) => {
  const [conversionPairs, setConversionPairs] = useState<ConversionPair[]>([
    { id: '1', fromCurrency: 'USD', toCurrency: 'GHS', amount: 1000, isVisible: true },
    { id: '2', fromCurrency: 'USD', toCurrency: 'NGN', amount: 500, isVisible: true },
    { id: '3', fromCurrency: 'USD', toCurrency: 'KES', amount: 1000, isVisible: true }
  ]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Get currency flag
  const getCurrencyFlag = (currency: string) => {
    const flagMap: { [key: string]: string } = {
      'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
      'GHS': '🇬🇭', 'NGN': '🇳🇬', 'KES': '🇰🇪', 'ZAR': '🇿🇦',
      'INR': '🇮🇳', 'PHP': '🇵🇭', 'CNY': '🇨🇳', 'CAD': '🇨🇦',
      'AUD': '🇦🇺', 'CHF': '🇨🇭', 'BRL': '🇧🇷', 'MXN': '🇲🇽'
    };
    return flagMap[currency] || '🌍';
  };

  // Find exchange rate
  const findExchangeRate = (from: string, to: string): number | null => {
    if (from === to) return 1;

    // Direct pair
    let rate = exchangeRates.find(r => r.pair === `${from}/${to}`);
    if (rate) return rate.rate;

    // Inverse pair
    rate = exchangeRates.find(r => r.pair === `${to}/${from}`);
    if (rate) return 1 / rate.rate;

    // Cross-currency via USD
    if (from !== 'USD' && to !== 'USD') {
      const fromUsdRate = exchangeRates.find(r => r.pair === `USD/${from}` || r.pair === `${from}/USD`);
      const toUsdRate = exchangeRates.find(r => r.pair === `USD/${to}` || r.pair === `${to}/USD`);

      if (fromUsdRate && toUsdRate) {
        const fromRate = fromUsdRate.pair === `USD/${from}` ? fromUsdRate.rate : 1 / fromUsdRate.rate;
        const toRate = toUsdRate.pair === `USD/${to}` ? toUsdRate.rate : 1 / toUsdRate.rate;
        return toRate / fromRate;
      }
    }

    return null;
  };

  // Get rate change info
  const getRateChangeInfo = (from: string, to: string) => {
    const pair = exchangeRates.find(r => 
      r.pair === `${from}/${to}` || r.pair === `${to}/${from}`
    );
    
    if (pair) {
      const isInverse = pair.pair === `${to}/${from}`;
      return {
        change: isInverse ? -pair.change : pair.change,
        changePercent: isInverse ? -pair.changePercent : pair.changePercent,
        lastUpdated: pair.lastUpdated
      };
    }
    
    return { change: 0, changePercent: 0, lastUpdated: new Date().toISOString() };
  };

  // Auto refresh rates
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      onRefreshRates();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAutoRefresh, onRefreshRates]);

  // Update conversion pair amount
  const updatePairAmount = (id: string, amount: number) => {
    setConversionPairs(prev => 
      prev.map(pair => 
        pair.id === id ? { ...pair, amount } : pair
      )
    );
  };

  // Toggle pair visibility
  const togglePairVisibility = (id: string) => {
    setConversionPairs(prev => 
      prev.map(pair => 
        pair.id === id ? { ...pair, isVisible: !pair.isVisible } : pair
      )
    );
  };

  // Remove conversion pair with X button
  const removePair = (id: string) => {
    setConversionPairs(prev => prev.filter(pair => pair.id !== id));
  };

  return (
    <Card className={`auto-conversion-widget card-dark-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-primary" weight="duotone" />
            Auto Conversions
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isAutoRefresh ? "default" : "outline"} 
              className="text-xs cursor-pointer"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            >
              {isAutoRefresh ? 'Auto' : 'Manual'}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshRates}
              disabled={isRefreshing}
              className="h-7 w-7 p-0"
            >
              <ArrowsClockwise 
                className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} 
                weight="bold" 
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {conversionPairs.map((pair) => {
          const rate = findExchangeRate(pair.fromCurrency, pair.toCurrency);
          const convertedAmount = rate ? pair.amount * rate : 0;
          const rateInfo = getRateChangeInfo(pair.fromCurrency, pair.toCurrency);
          
          return (
            <div
              key={pair.id}
              className={`conversion-pair p-4 rounded-lg border transition-all duration-300 ${
                pair.isVisible 
                  ? 'bg-muted/20 border-border' 
                  : 'bg-muted/5 border-muted opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCurrencyFlag(pair.fromCurrency)}</span>
                    <span className="font-mono text-sm font-semibold">
                      {pair.fromCurrency}
                    </span>
                  </div>
                  
                  <div className="text-muted-foreground">→</div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCurrencyFlag(pair.toCurrency)}</span>
                    <span className="font-mono text-sm font-semibold">
                      {pair.toCurrency}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePairVisibility(pair.id)}
                    className="h-6 w-6 p-0"
                  >
                    {pair.isVisible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeSlash className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePair(pair.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                    title="Remove pair"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {pair.isVisible && (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <Input
                      type="number"
                      value={pair.amount}
                      onChange={(e) => updatePairAmount(pair.id, parseFloat(e.target.value) || 0)}
                      className="flex-1 h-8 text-sm font-mono"
                      min="0"
                    />
                    
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono">
                        {convertedAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pair.toCurrency}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-mono font-semibold">
                        {rate?.toFixed(6) || 'N/A'}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${
                      rateInfo.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {rateInfo.changePercent >= 0 ? (
                        <TrendUp className="h-3 w-3" />
                      ) : (
                        <TrendDown className="h-3 w-3" />
                      )}
                      <span className="font-semibold">
                        {rateInfo.changePercent >= 0 ? '+' : ''}{rateInfo.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
        
        {/* Add new pair button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => {
            const newPair: ConversionPair = {
              id: Date.now().toString(),
              fromCurrency: 'USD',
              toCurrency: 'EUR',
              amount: 1000,
              isVisible: true
            };
            setConversionPairs(prev => [...prev, newPair]);
          }}
        >
          <Calculator className="h-3 w-3 mr-2" />
          Add Conversion Pair
        </Button>
        
        <div className="text-center text-xs text-muted-foreground pt-2 border-t">
          {isAutoRefresh ? 'Auto-refreshing every 30s' : 'Manual refresh mode'}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoConversionWidget;