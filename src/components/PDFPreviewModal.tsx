import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from '@phosphor-icons/react';
import html2pdf from 'html2pdf.js';

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
  isReceiver = false
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

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
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-inner border border-gray-200"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              minHeight: '600px'
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
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {isReceiver
                    ? `You just received money from ${transaction.countryName} ${transaction.countryFlag}`
                    : `You just sent money to ${transaction.countryName} ${transaction.countryFlag}`
                  }
                </h2>
                <p className="text-gray-600">
                  Exchange Rate: 1 {transaction.fromCurrency} = {transaction.exchangeRate.toFixed(4)} {transaction.toCurrency}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono font-semibold text-gray-800">{transaction.uniqueId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono text-sm text-gray-700">{transaction.formatId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-semibold text-gray-800">{transaction.clientName}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Sent:</span>
                    <span className="font-semibold text-gray-800">
                      ${transaction.amount.toFixed(2)} {transaction.fromCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span className="font-semibold text-gray-800">{transaction.exchangeRate.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-semibold text-gray-800">${transaction.fee.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Total Received */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total Received:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {transaction.toCurrency} {totalReceived.toFixed(2)}
                  </span>
                </div>
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