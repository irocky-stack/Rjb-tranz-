 import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  DollarSign, 
  Phone, 
  MapPin,
  Calculator,
  Printer,
  CheckCircle,
  AlertCircle,
  Globe,
  CreditCard,
  Smartphone,
  Wifi,
  WifiOff,
  Send,
  Banknote,
  Building,
  Zap,
  PiggyBank,
  Circle,
  CheckCircle2,
  Edit3,
  Save,
  Dot
} from 'lucide-react';
import { toast } from 'sonner';

// Payment methods
const PAYMENT_METHODS = [
  { id: 'zelle', name: 'Zelle', icon: Zap, color: 'bg-purple-100 text-purple-600', description: 'US Bank Transfer' },
  { id: 'mtn_momo', name: 'MTN MoMo', icon: Smartphone, color: 'bg-yellow-100 text-yellow-600', description: 'Mobile Money' },
  { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-100 text-green-600', description: 'Cash Payment' },
  { id: 'interbank', name: 'Interbank', icon: Building, color: 'bg-blue-100 text-blue-600', description: 'Bank Transfer' },
];

// Countries data with phone codes
const COUNTRIES = [
  { code: 'GH', name: 'Ghana', currency: 'GHS', phoneCode: '+233', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', phoneCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', currency: 'KES', phoneCode: '+254', flag: '🇰🇪' },
  { code: 'PH', name: 'Philippines', currency: 'PHP', phoneCode: '+63', flag: '🇵🇭' },
  { code: 'IN', name: 'India', currency: 'INR', phoneCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', currency: 'USD', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', currency: 'CAD', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', currency: 'AUD', phoneCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', currency: 'EUR', phoneCode: '+49', flag: '🇩🇪' },
];

// Exchange rates (in real app, this would come from API)
const EXCHANGE_RATES = {
  'USD-GHS': 12.45,
  'USD-NGN': 795.50,
  'USD-KES': 129.75,
  'USD-PHP': 56.75,
  'USD-INR': 83.25,
  'GBP-USD': 1.27,
  'EUR-USD': 1.09,
  'CAD-USD': 0.74,
  'AUD-USD': 0.67,
};

interface InvoiceData {
  // Sender Info
  senderName: string;
  senderEmail: string;
  senderAmount: string;
  senderCurrency: string;
  senderCountry: string;
  senderPhone: string;
  senderPaymentMethod: string;
  
  // Receiver Info
  receiverName: string;
  receiverEmail: string;
  receiverAmount: string;
  receiverCurrency: string;
  receiverCountry: string;
  receiverPhone: string;
  receiverPaymentMethod: string;
  
  // Fee Settings
  feeAmount: number;
  feeRate: number; // 5% default
  feeCurrency: string;
  feeOnSender: boolean;
  exchangeRate: number;
  totalFee: number;
  isRateEditable: boolean;
}

interface CreateInvoiceProps {
  onBack: () => void;
  onComplete: (data: InvoiceData) => void;
  selectedCountry?: {
    flag: string;
    name: string;
    currency: string;
    pair: string;
    rate: any;
  } | null;
}

export default function CreateInvoice({ onBack, onComplete, selectedCountry }: CreateInvoiceProps) {
  const { showTransactionNotification } = useNotifications();
  const [currentPage, setCurrentPage] = useState(1);
  const [printerConnected, setPrinterConnected] = useState(false);
  const [printerStatus, setPrinterStatus] = useState('Disconnected');
  const [isProcessing, setIsProcessing] = useState(false);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    senderName: '',
    senderEmail: '',
    senderAmount: '',
    senderCurrency: 'USD',
    senderCountry: 'US',
    senderPhone: '',
    senderPaymentMethod: 'zelle',
    receiverName: '',
    receiverEmail: '',
    receiverAmount: '',
    receiverCurrency: selectedCountry?.currency || 'GHS',
    receiverCountry: selectedCountry ? COUNTRIES.find(c => c.currency === selectedCountry.currency)?.code || 'GH' : 'GH',
    receiverPhone: '',
    receiverPaymentMethod: 'mtn_momo',
    feeAmount: 0,
    feeRate: 5.0, // 5% default
    feeCurrency: 'USD',
    feeOnSender: true,
    exchangeRate: selectedCountry?.rate?.rate || 12.45,
    totalFee: 0,
    isRateEditable: false,
  });

  // Check printer connection status
  useEffect(() => {
    const checkPrinter = () => {
      const connected = Math.random() > 0.3; // 70% chance connected
      setPrinterConnected(connected);
      setPrinterStatus(connected ? 'Connected via USB' : 'Disconnected');
    };
    
    checkPrinter();
    const interval = setInterval(checkPrinter, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate exchange rate and amounts with 5% fee auto-deduction
  useEffect(() => {
    const fromCurrency = invoiceData.senderCurrency;
    const toCurrency = invoiceData.receiverCurrency;
    const rateKey = `${fromCurrency}-${toCurrency}`;
    const reverseRateKey = `${toCurrency}-${fromCurrency}`;
    
    let rate = EXCHANGE_RATES[rateKey] || (1 / (EXCHANGE_RATES[reverseRateKey] || 1));
    
    // Apply 5% fee to the exchange rate (auto-deduct)
    const adjustedRate = rate * (1 - invoiceData.feeRate / 100);
    
    // Calculate receiver amount and fee based on sender amount
    if (invoiceData.senderAmount) {
      const senderAmt = parseFloat(invoiceData.senderAmount);
      const receiverAmt = senderAmt * adjustedRate;
      const feeAmt = senderAmt * (invoiceData.feeRate / 100);
      
      setInvoiceData(prev => ({
        ...prev,
        exchangeRate: adjustedRate,
        receiverAmount: receiverAmt.toFixed(2),
        feeAmount: feeAmt,
        totalFee: feeAmt
      }));
    }
  }, [invoiceData.senderAmount, invoiceData.senderCurrency, invoiceData.receiverCurrency, invoiceData.feeRate]);

  const updateField = (field: keyof InvoiceData, value: string | number | boolean) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const getCountryByCode = (code: string) => {
    return COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
  };

  const validatePage = (page: number): boolean => {
    switch (page) {
      case 1:
        return !!(invoiceData.senderName && invoiceData.senderAmount && invoiceData.senderPhone);
      case 2:
        return !!(invoiceData.receiverName && invoiceData.receiverPhone);
      case 3:
        return true; // Fee page is always valid
      case 4:
        return true; // Printer page
      default:
        return false;
    }
  };

  const nextPage = () => {
    if (validatePage(currentPage)) {
      setCurrentPage(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handlePrint = async () => {
    if (!printerConnected) {
      toast.error('Printer not connected');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate printing process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show transaction notification
      showTransactionNotification('completed', {
        id: `TXN-${Date.now()}`,
        clientName: invoiceData.receiverName,
        amount: parseFloat(invoiceData.senderAmount),
        currency: invoiceData.senderCurrency
      });
      
      toast.success('Invoice printed successfully!');
      onComplete(invoiceData);
    } catch (error) {
      toast.error('Printing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    // Show transaction notification
    showTransactionNotification('created', {
      id: `INV-${Date.now()}`,
      clientName: invoiceData.receiverName,
      amount: parseFloat(invoiceData.senderAmount),
      currency: invoiceData.senderCurrency
    });
    
    onComplete(invoiceData);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onBack()}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Card className="card-hover-glass border-0 shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-xl font-bold font-montserrat">Create Invoice</h2>
                  <p className="text-blue-100 text-sm">
                    Page {currentPage} of 4 - {
                      currentPage === 1 ? "Sender Information" :
                      currentPage === 2 ? "Receiver Information" :
                      currentPage === 3 ? "Fee & Rate Calculation" :
                      "Print & Complete"
                    }
                  </p>
                  {/* Selected Country Display */}
                  {selectedCountry && (
                    <div className="flex items-center gap-2 mt-1 text-blue-100 text-xs">
                      <span>Selected Country:</span>
                      <span className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                        {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.currency})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.round((currentPage / 4) * 100)}%</div>
                <div className="text-xs text-blue-100">Complete</div>
              </div>
            </div>
            <Progress value={(currentPage / 4) * 100} className="bg-blue-800" />
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Page 1: Sender Information */}
          {currentPage === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat">Sender Information</h3>
                <p className="text-gray-600">Who is sending the money?</p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter sender's full name"
                      value={invoiceData.senderName}
                      onChange={(e) => updateField('senderName', e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="sender@example.com"
                      value={invoiceData.senderEmail}
                      onChange={(e) => updateField('senderEmail', e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={invoiceData.senderAmount}
                        onChange={(e) => updateField('senderAmount', e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency *
                    </label>
                    <select
                      value={invoiceData.senderCurrency}
                      onChange={(e) => updateField('senderCurrency', e.target.value)}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md bg-white"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country.currency} value={country.currency}>
                          {country.flag} {country.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      value={invoiceData.senderCountry}
                      onChange={(e) => updateField('senderCountry', e.target.value)}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md bg-white"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {getCountryByCode(invoiceData.senderCountry).phoneCode}
                      </div>
                      <Input
                        type="tel"
                        placeholder="123456789"
                        value={invoiceData.senderPhone}
                        onChange={(e) => updateField('senderPhone', e.target.value)}
                        className="pl-16 h-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection with Dot Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method *
                  </label>
                  <div className="space-y-3">
                    {/* Dot Toggle Selector */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {PAYMENT_METHODS.map((method, index) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => updateField('senderPaymentMethod', method.id)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            invoiceData.senderPaymentMethod === method.id
                              ? 'bg-primary scale-125 shadow-lg' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          title={method.name}
                        />
                      ))}
                    </div>
                    
                    {/* Selected Payment Method Card */}
                    {(() => {
                      const selectedMethod = PAYMENT_METHODS.find(m => m.id === invoiceData.senderPaymentMethod);
                      const IconComponent = selectedMethod?.icon;
                      
                      return selectedMethod && IconComponent ? (
                        <div className="payment-method-card selected border-2 border-primary bg-primary/5 rounded-lg p-4 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-lg ${selectedMethod.color}`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{selectedMethod.name}</h3>
                              <p className="text-sm text-gray-600">{selectedMethod.description}</p>
                            </div>
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page 2: Receiver Information */}
          {currentPage === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat">Receiver Information</h3>
                <p className="text-gray-600">Who will receive the money?</p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter receiver's full name"
                      value={invoiceData.receiverName}
                      onChange={(e) => updateField('receiverName', e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="receiver@example.com"
                      value={invoiceData.receiverEmail}
                      onChange={(e) => updateField('receiverEmail', e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Auto-calculated"
                        value={invoiceData.receiverAmount}
                        onChange={(e) => updateField('receiverAmount', e.target.value)}
                        className="pl-10 h-12 bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency *
                    </label>
                    <select
                      value={invoiceData.receiverCurrency}
                      onChange={(e) => updateField('receiverCurrency', e.target.value)}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md bg-white"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country.currency} value={country.currency}>
                          {country.flag} {country.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      value={invoiceData.receiverCountry}
                      onChange={(e) => updateField('receiverCountry', e.target.value)}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md bg-white"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {getCountryByCode(invoiceData.receiverCountry).phoneCode}
                      </div>
                      <Input
                        type="tel"
                        placeholder="123456789"
                        value={invoiceData.receiverPhone}
                        onChange={(e) => updateField('receiverPhone', e.target.value)}
                        className="pl-16 h-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection with Dot Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method *
                  </label>
                  <div className="space-y-3">
                    {/* Dot Toggle Selector */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {PAYMENT_METHODS.map((method, index) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => updateField('receiverPaymentMethod', method.id)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            invoiceData.receiverPaymentMethod === method.id
                              ? 'bg-primary scale-125 shadow-lg' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          title={method.name}
                        />
                      ))}
                    </div>
                    
                    {/* Selected Payment Method Card */}
                    {(() => {
                      const selectedMethod = PAYMENT_METHODS.find(m => m.id === invoiceData.receiverPaymentMethod);
                      const IconComponent = selectedMethod?.icon;
                      
                      return selectedMethod && IconComponent ? (
                        <div className="payment-method-card selected border-2 border-primary bg-primary/5 rounded-lg p-4 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-lg ${selectedMethod.color}`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{selectedMethod.name}</h3>
                              <p className="text-sm text-gray-600">{selectedMethod.description}</p>
                            </div>
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page 3: Fee & Rate Calculation */}
          {currentPage === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calculator className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat">Fee & Rate Calculation</h3>
                <p className="text-gray-600">Configure transaction fees and exchange rates</p>
              </div>

              {/* Exchange Rate Display - Editable */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Exchange Rate
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateField('isRateEditable', !invoiceData.isRateEditable)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {invoiceData.isRateEditable ? (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-blue-600 font-mono">
                      1 {invoiceData.senderCurrency} = 
                      {invoiceData.isRateEditable ? (
                        <Input
                          type="number"
                          step="0.0001"
                          value={invoiceData.exchangeRate}
                          onChange={(e) => updateField('exchangeRate', parseFloat(e.target.value) || 0)}
                          className="inline-block w-32 mx-2 text-center font-mono text-3xl font-bold border-blue-300"
                        />
                      ) : (
                        ` ${invoiceData.exchangeRate.toFixed(4)} `
                      )}
                      {invoiceData.receiverCurrency}
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      Rate includes 5% fee deduction
                    </div>
                    <div className="text-sm text-gray-600">
                      Updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Configuration - Enhanced */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Transaction Fee (Auto-deducted at 5%)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fee Rate (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={invoiceData.feeRate}
                        onChange={(e) => updateField('feeRate', parseFloat(e.target.value) || 5.0)}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fee Amount
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={invoiceData.feeAmount.toFixed(2)}
                        className="h-12 bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fee Currency
                      </label>
                      <select
                        value={invoiceData.feeCurrency}
                        onChange={(e) => updateField('feeCurrency', e.target.value)}
                        className="w-full h-12 px-3 border border-gray-300 rounded-md bg-white"
                      >
                        <option value={invoiceData.senderCurrency}>
                          {invoiceData.senderCurrency} (Sender)
                        </option>
                        <option value={invoiceData.receiverCurrency}>
                          {invoiceData.receiverCurrency} (Receiver)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Who pays the fee?</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={invoiceData.feeOnSender ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateField('feeOnSender', true)}
                      >
                        Sender
                      </Button>
                      <Button
                        variant={!invoiceData.feeOnSender ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateField('feeOnSender', false)}
                      >
                        Receiver
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Auto-deduction:</strong> The {invoiceData.feeRate}% fee is automatically deducted from the exchange rate. 
                      The receiver gets the amount after fee deduction.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-lg font-semibold text-green-800">
                      Total Fee: {invoiceData.feeAmount.toFixed(2)} {invoiceData.feeCurrency}
                    </div>
                    <div className="text-sm text-green-600">
                      {invoiceData.feeRate}% of {invoiceData.senderAmount} {invoiceData.senderCurrency} • Paid by: {invoiceData.feeOnSender ? 'Sender' : 'Receiver'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Sender Amount:</span>
                      <span className="font-semibold">{invoiceData.senderAmount} {invoiceData.senderCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exchange Rate (with fee):</span>
                      <span className="font-mono text-sm">{invoiceData.exchangeRate.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Receiver Amount:</span>
                      <span className="font-semibold">{invoiceData.receiverAmount} {invoiceData.receiverCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee Rate:</span>
                      <span className="font-semibold">{invoiceData.feeRate}%</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Transaction Fee:</span>
                      <span className="font-semibold">{invoiceData.feeAmount.toFixed(2)} {invoiceData.feeCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Methods:</span>
                      <span className="text-sm">
                        {PAYMENT_METHODS.find(m => m.id === invoiceData.senderPaymentMethod)?.name} → {PAYMENT_METHODS.find(m => m.id === invoiceData.receiverPaymentMethod)?.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Page 4: Print & Complete */}
          {currentPage === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Printer className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-montserrat">Print & Complete</h3>
                <p className="text-gray-600">Send to printer and finalize transaction</p>
              </div>

              {/* Printer Status */}
              <Card className={`border-2 ${printerConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {printerConnected ? (
                        <Wifi className="h-5 w-5 text-green-600" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-red-600" />
                      )}
                      Printer Status
                    </div>
                    <Badge variant={printerConnected ? "secondary" : "destructive"}>
                      {printerStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">USB Connection</span>
                      <Badge variant={printerConnected ? "secondary" : "outline"}>
                        {printerConnected ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Bluetooth</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                  
                  {!printerConnected && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Printer not connected. Please check USB cable or Bluetooth connection.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Invoice Preview */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://i.ibb.co/6LY7bxR/rjb-logo.jpg" 
                        alt="RJB TRANZ Logo" 
                        className="h-8 w-8 rounded-full"
                      />
                      RJB TRANZ - Money Transfer Invoice Preview
                    </div>
                    <Badge className="bg-white text-blue-700">
                      #{new Date().getTime().toString().slice(-6)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Transaction Summary Header */}
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                      <h3 className="text-3xl font-bold text-blue-800 mb-3 font-montserrat">
                        Invoice Preview
                      </h3>
                      <div className="text-2xl font-bold text-blue-700 mb-2">
                        {invoiceData.senderAmount} {invoiceData.senderCurrency} → {invoiceData.receiverAmount} {invoiceData.receiverCurrency}
                      </div>
                      <p className="text-blue-600 font-mono">
                        Exchange Rate: 1 {invoiceData.senderCurrency} = {invoiceData.exchangeRate.toFixed(4)} {invoiceData.receiverCurrency}
                      </p>
                      <p className="text-sm text-blue-500 mt-2">
                        Rate includes {invoiceData.feeRate}% fee deduction
                      </p>
                    </div>

                    {/* Sender & Receiver Info Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                          <Send className="h-5 w-5 text-blue-600" />
                          Sender Details
                        </h4>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg text-sm space-y-2 border border-blue-200">
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Name:</strong> 
                            <span className="text-gray-900">{invoiceData.senderName}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Email:</strong> 
                            <span className="text-gray-900">{invoiceData.senderEmail || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Phone:</strong> 
                            <span className="text-gray-900">{getCountryByCode(invoiceData.senderCountry).phoneCode} {invoiceData.senderPhone}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Country:</strong> 
                            <span className="text-gray-900">{getCountryByCode(invoiceData.senderCountry).flag} {getCountryByCode(invoiceData.senderCountry).name}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Payment Method:</strong> 
                            <span className="text-gray-900">{PAYMENT_METHODS.find(m => m.id === invoiceData.senderPaymentMethod)?.name}</span>
                          </div>
                          <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                            <strong className="text-blue-700">Sending Amount:</strong> 
                            <span className="font-bold text-blue-800">{invoiceData.senderAmount} {invoiceData.senderCurrency}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                          <User className="h-5 w-5 text-green-600" />
                          Receiver Details
                        </h4>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg text-sm space-y-2 border border-green-200">
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Name:</strong> 
                            <span className="text-gray-900">{invoiceData.receiverName}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Email:</strong> 
                            <span className="text-gray-900">{invoiceData.receiverEmail || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Phone:</strong> 
                            <span className="text-gray-900">{getCountryByCode(invoiceData.receiverCountry).phoneCode} {invoiceData.receiverPhone}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Country:</strong> 
                            <span className="text-gray-900">{getCountryByCode(invoiceData.receiverCountry).flag} {getCountryByCode(invoiceData.receiverCountry).name}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Payment Method:</strong> 
                            <span className="text-gray-900">{PAYMENT_METHODS.find(m => m.id === invoiceData.receiverPaymentMethod)?.name}</span>
                          </div>
                          <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                            <strong className="text-green-700">Receiving Amount:</strong> 
                            <span className="font-bold text-green-800">{invoiceData.receiverAmount} {invoiceData.receiverCurrency}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Breakdown */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">Transaction Breakdown</h4>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Original Rate:</span>
                            <span className="font-mono">{(invoiceData.exchangeRate / (1 - invoiceData.feeRate / 100)).toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fee Rate:</span>
                            <span className="font-semibold text-red-600">{invoiceData.feeRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Adjusted Rate:</span>
                            <span className="font-mono">{invoiceData.exchangeRate.toFixed(4)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fee Amount:</span>
                            <span className="font-semibold">{invoiceData.feeAmount.toFixed(2)} {invoiceData.feeCurrency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fee Paid By:</span>
                            <span className="font-semibold">{invoiceData.feeOnSender ? 'Sender' : 'Receiver'}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-300 pt-2">
                            <span className="font-semibold text-gray-800">Net Conversion:</span>
                            <span className="font-bold">{invoiceData.receiverAmount} {invoiceData.receiverCurrency}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Important Notes
                      </h4>
                      <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                        <li>The {invoiceData.feeRate}% fee is automatically deducted from the exchange rate</li>
                        <li>The receiver will get exactly {invoiceData.receiverAmount} {invoiceData.receiverCurrency}</li>
                        <li>Exchange rates are subject to market fluctuations</li>
                        <li>Transaction will be processed once payment is confirmed</li>
                      </ul>
                    </div>

                    {/* Timestamp */}
                    <div className="text-center text-xs text-gray-500 border-t pt-4">
                      <div className="font-semibold">Generated on {new Date().toLocaleString()}</div>
                      <div className="mt-1">RJB TRANZ Professional Money Transfer Services</div>
                      <div className="mt-1">This is a preview. Final receipt will be generated after payment confirmation.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handlePrint}
                  disabled={!printerConnected || isProcessing}
                  className="h-14 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Printing...
                    </>
                  ) : (
                    <>
                      <Printer className="h-5 w-5 mr-2" />
                      Print Receipt
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleComplete}
                  variant="outline"
                  className="h-14 text-lg"
                  size="lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Complete Without Print
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {currentPage < 4 ? (
              <Button
                onClick={nextPage}
                disabled={!validatePage(currentPage)}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="text-sm text-gray-500">
                Complete the transaction above
              </div>
            )}
          </div>
        </div>
        </Card>
      </div>
    </div>
  );
}