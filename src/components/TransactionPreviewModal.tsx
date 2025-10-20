import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Status = 'pending' | 'completed' | 'failed' | 'cancelled';

interface Transaction {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  fee: number;
  status: Status;
  createdAt: string;
  receiptPrinted: boolean;
  phoneNumber: string;
  transactionType: 'send' | 'receive';
  uniqueId: string;
  formatId: string;
}

interface TransactionPreviewModalProps {
  transaction: Transaction;
  onClose: () => void;
  onComplete: (transactionId: string) => void;
  onContinue: (transactionData: any) => void;
  onStatusUpdate: (transactionId: string, newStatus: Status) => void;
}

const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
  transaction,
  onClose,
  onComplete,
  onContinue,
  onStatusUpdate,
}) => {
  const {
    id,
    clientName,
    clientEmail,
    amount,
    fromCurrency,
    toCurrency,
    fee,
    status,
    createdAt,
    transactionType,
    uniqueId,
    formatId,
  } = transaction;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <Card className="modal-content bg-card border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transaction Preview</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{clientName}</div>
              <div className="text-sm text-muted-foreground">{clientEmail || 'No email'}</div>
            </div>
            <Badge variant="secondary" className="capitalize">
              {status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Amount</div>
              <div className="font-semibold">
                ${amount.toLocaleString()} {fromCurrency} → {toCurrency}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Fee</div>
              <div className="font-semibold">${fee.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Type</div>
              <div className="capitalize">{transactionType}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Created</div>
              <div>{new Date(createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Code</div>
              <div className="font-mono text-xs">{uniqueId}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Format ID</div>
              <div className="font-mono text-xs">{formatId}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button onClick={() => onComplete(id)} className="bg-green-600 hover:bg-green-700 text-white">
              Complete
            </Button>
            <Button variant="outline" onClick={() => onStatusUpdate(id, 'pending')}>
              Mark Pending
            </Button>
            <Button variant="outline" onClick={() => onStatusUpdate(id, 'cancelled')}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => onContinue({ id })}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionPreviewModal;
