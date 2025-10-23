import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from '@phosphor-icons/react';
import html2pdf from 'html2pdf.js';
import { getCurrencySymbol } from '@/lib/utils';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    clientName: string;
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    fee: number;
    uniqueId: string;
    formatId: string;
    transactionType: 'send' | 'receive';
    countryName: string;
    countryFlag: string;
  };
  isReceiver?: boolean;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  transaction,
  isReceiver: _isReceiver = false
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Prevent crashes if the modal is open but the transaction data isn't ready.
  if (!transaction) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-center">
            Loading Transaction...
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Please wait while the details are being prepared.
          </p>
        </div>
      </div>
    );
  }
  const generatePDF = async () => {
    if (!pdfRef.current) return;

    setIsGenerating(true);
    try {
      const opt = {
        margin: 1,
        filename: `receipt-${transaction.uniqueId}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(pdfRef.current).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalReceived = transaction.amount * transaction.exchangeRate;
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString();
  const time = now.toTimeString().split(' ')[0];
  const feePercentage = ((transaction.fee / transaction.amount) * 100).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Receipt Preview</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div
            ref={pdfRef}
            className="p-8 rounded-2xl shadow-inner border border-gray-200"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              minHeight: '600px',
              backgroundImage: 'url(/assets/Background.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">✓</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">RJB TRANZ</h1>
                  <p className="text-sm text-gray-600">Professional Currency Exchange</p>
                </div>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
              {/* Greeting */}
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-gray-800">Hi, {transaction.clientName}</h1>
              </div>

              {/* Thank you message */}
              <div className="text-center mb-6">
                <p className="italic text-lg text-gray-700">
                  Thank you for trusting <span className="font-bold italic">RJB Tranz</span> for swift transactions and superior rate.
                </p>
              </div>

              {/* Amount sent */}
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold text-gray-800">Amount sent: {getCurrencySymbol(transaction.fromCurrency)}{transaction.amount.toFixed(2)} {transaction.fromCurrency}</h2>
                <p className="text-lg text-gray-600">Transaction Fee: {feePercentage}%</p>
              </div>

              {/* Exchange rate */}
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700">
                  Exchange Rate: 1 {transaction.fromCurrency} = {transaction.exchangeRate.toFixed(4)} {transaction.toCurrency}
                </p>
              </div>

              {/* Unique code */}
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700">Unique code: {transaction.uniqueId}</p>
              </div>

              {/* Destination */}
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700">
                  You just sent money to {transaction.countryName} {transaction.countryFlag}
                </p>
              </div>

              {/* Date and Time */}
              <div className="text-center">
                <p className="text-lg text-gray-700">
                  <strong>{day}</strong>, {fullDate}
                </p>
                <p className="text-lg text-gray-700">{time}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              <p>Thank you for choosing RJB TRANZ</p>
              <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;