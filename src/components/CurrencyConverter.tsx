import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowsClockwise, 
  Swap, 
  TrendUp, 
  TrendDown,
  CurrencyDollar,
  Calculator,
  Clock,
  Star,
  X
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ExchangeRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  region: 'africa' | 'asia' | 'europe' | 'north-america' | 'south-america' | 'oceania' | 'middle-east';
}

interface CurrencyConverterProps {
  exchangeRates: ExchangeRate[];
  onRefreshRates: () => Promise<void>;
  isRefreshing: boolean;
  favoriteRates: string[];
  onToggleFavorite: (pair: string) => void;
  onClose?: () => void;
}

interface ConversionResult {
  fromAmount: number;
  toAmount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  inverseRate: number;
  lastUpdated: string;
  change: number;
  changePercent: number;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  exchangeRates,
  onRefreshRates,
  isRefreshing,
  favoriteRates,
  onToggleFavorite,
  onClose
}) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('GHS');
  const [amount, setAmount] = useState('1000');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [recentConversions, setRecentConversions] = useState<ConversionResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Get available currencies from exchange rates
  const availableCurrencies = React.useMemo(() => {
    const currencies = new Set<string>();
    currencies.add('USD'); // Base currency
    
    exchangeRates.forEach(rate => {
      const [base, target] = rate.pair.split('/');
      currencies.add(base);
      currencies.add(target);
    });
    
    return Array.from(currencies).sort();
  }, [exchangeRates]);

  // Get country flag for currency
  const getCurrencyFlag = (currency: string) => {
    const flagMap: { [key: string]: string } = {
      'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
      'GHS': '🇬🇭', 'NGN': '🇳🇬', 'KES': '🇰🇪', 'ZAR': '🇿🇦',
      'INR': '🇮🇳', 'PHP': '🇵🇭', 'CNY': '🇨🇳', 'CAD': '🇨🇦',
      'AUD': '🇦🇺', 'CHF': '🇨🇭', 'BRL': '🇧🇷', 'MXN': '🇲🇽',
      'AED': '🇦🇪', 'SAR': '🇸🇦', 'EGP': '🇪🇬', 'MAD': '🇲🇦'
    };
    return flagMap[currency] || '🌍';
  };

  // Find exchange rate between two currencies
  const findExchangeRate = (from: string, to: string): ExchangeRate | null => {
    if (from === to) return null;

    // Direct pair
    let rate = exchangeRates.find(r => r.pair === `${from}/${to}`);
    if (rate) return rate;

    // Inverse pair
    rate = exchangeRates.find(r => r.pair === `${to}/${from}`);
    if (rate) {
      return {
        ...rate,
        pair: `${from}/${to}`,
        rate: 1 / rate.rate,
        change: -rate.change,
        changePercent: -rate.changePercent
      };
    }

    // Cross-currency calculation via USD
    if (from !== 'USD' && to !== 'USD') {
      const fromUsdRate = exchangeRates.find(r => r.pair === `USD/${from}` || r.pair === `${from}/USD`);
      const toUsdRate = exchangeRates.find(r => r.pair === `USD/${to}` || r.pair === `${to}/USD`);

      if (fromUsdRate && toUsdRate) {
        const fromRate = fromUsdRate.pair === `USD/${from}` ? fromUsdRate.rate : 1 / fromUsdRate.rate;
        const toRate = toUsdRate.pair === `USD/${to}` ? toUsdRate.rate : 1 / toUsdRate.rate;
        
        return {
          pair: `${from}/${to}`,
          rate: toRate / fromRate,
          change: 0, // Simplified for cross-currency
          changePercent: 0,
          lastUpdated: new Date().toISOString(),
          region: 'africa' // Default region
        };
      }
    }

    return null;
  };

  // Perform currency conversion
  const performConversion = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsCalculating(true);
    
    try {
      // Simulate API delay for live rates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const rate = findExchangeRate(fromCurrency, toCurrency);
      
      if (!rate) {
        toast.error(`Exchange rate not available for ${fromCurrency}/${toCurrency}`);
        return;
      }

      const fromAmount = parseFloat(amount);
      const toAmount = fromAmount * rate.rate;
      
      const conversionResult: ConversionResult = {
        fromAmount,
        toAmount,
        fromCurrency,
        toCurrency,
        rate: rate.rate,
        inverseRate: 1 / rate.rate,
        lastUpdated: rate.lastUpdated,
        change: rate.change,
        changePercent: rate.changePercent
      };
      
      setResult(conversionResult);
      
      // Add to recent conversions
      setRecentConversions(prev => {
        const updated = [conversionResult, ...prev.filter(r => 
          !(r.fromCurrency === fromCurrency && r.toCurrency === toCurrency)
        )];
        return updated.slice(0, 5); // Keep only last 5
      });
      
      toast.success('Conversion completed successfully');
    } catch (error) {
      toast.error('Conversion failed. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Swap currencies
  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    
    // Clear result to force recalculation
    setResult(null);
  };

  // Auto-convert when amount or currencies change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && fromCurrency && toCurrency) {
      const timer = setTimeout(() => {
        performConversion();
      }, 800); // Debounce conversion
      
      return () => clearTimeout(timer);
    }
  }, [fromCurrency, toCurrency, amount, exchangeRates]);

  // Quick amount buttons
  const quickAmounts = [100, 500, 1000, 5000, 10000];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-6 w-6 text-primary" weight="duotone" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Currency Converter</h2>
            <p className="text-muted-foreground">Live exchange rates & instant conversion</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshRates}
            disabled={isRefreshing}
            className={`transition-fast ${isRefreshing ? 'animate-pulse' : ''}`}
          >
            <ArrowsClockwise className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Rates
          </Button>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Converter */}
      <Card className="card-hover-glass overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <CurrencyDollar className="h-5 w-5 text-primary" weight="duotone" />
            Live Currency Conversion
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="text-xl font-semibold h-14"
              min="0"
              step="0.01"
            />
            
            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="text-xs"
                >
                  {quickAmount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            {/* From Currency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              <div className="relative">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg font-semibold bg-background appearance-none cursor-pointer hover:border-primary transition-fast"
                >
                  {availableCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {getCurrencyFlag(currency)} {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:justify-start mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={swapCurrencies}
                className="h-10 w-10 p-0 rounded-full hover:scale-110 transition-fast"
              >
                <Swap className="h-4 w-4" weight="bold" />
              </Button>
            </div>

            {/* To Currency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <div className="relative">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg font-semibold bg-background appearance-none cursor-pointer hover:border-primary transition-fast"
                >
                  {availableCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {getCurrencyFlag(currency)} {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Conversion Result */}
          {result && (
            <div className="space-y-4 p-6 bg-muted/20 rounded-lg border">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {getCurrencyFlag(result.toCurrency)} {result.toAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  })} {result.toCurrency}
                </div>
                <div className="text-muted-foreground">
                  {getCurrencyFlag(result.fromCurrency)} {result.fromAmount.toLocaleString()} {result.fromCurrency}
                </div>
              </div>

              <Separator />

              {/* Rate Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange Rate:</span>
                    <span className="font-semibold">
                      1 {result.fromCurrency} = {result.rate.toFixed(6)} {result.toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inverse Rate:</span>
                    <span className="font-semibold">
                      1 {result.toCurrency} = {result.inverseRate.toFixed(6)} {result.fromCurrency}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">24h Change:</span>
                    <div className={`flex items-center font-semibold ${
                      result.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.changePercent >= 0 ? (
                        <TrendUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendDown className="h-4 w-4 mr-1" />
                      )}
                      {result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <div className="flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(result.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Favorite Toggle */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(`${result.fromCurrency}/${result.toCurrency}`)}
                  className="gap-2"
                >
                  <Star 
                    className={`h-4 w-4 ${
                      favoriteRates.includes(`${result.fromCurrency}/${result.toCurrency}`)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground'
                    }`} 
                    weight={favoriteRates.includes(`${result.fromCurrency}/${result.toCurrency}`) ? "fill" : "regular"}
                  />
                  {favoriteRates.includes(`${result.fromCurrency}/${result.toCurrency}`) 
                    ? 'Remove from Favorites' 
                    : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <Button
            onClick={performConversion}
            disabled={isCalculating || !amount || parseFloat(amount) <= 0}
            className="w-full h-12 text-lg font-semibold"
          >
            {isCalculating ? (
              <>
                <ArrowsClockwise className="h-5 w-5 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5 mr-2" />
                Convert Currency
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Conversions */}
      {recentConversions.length > 0 && (
        <Card className="card-hover-enhanced">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentConversions.map((conversion, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-fast cursor-pointer"
                  onClick={() => {
                    setFromCurrency(conversion.fromCurrency);
                    setToCurrency(conversion.toCurrency);
                    setAmount(conversion.fromAmount.toString());
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      {getCurrencyFlag(conversion.fromCurrency)} {conversion.fromAmount.toLocaleString()} {conversion.fromCurrency}
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="text-sm font-semibold">
                      {getCurrencyFlag(conversion.toCurrency)} {conversion.toAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4
                      })} {conversion.toCurrency}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    Rate: {conversion.rate.toFixed(4)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CurrencyConverter;