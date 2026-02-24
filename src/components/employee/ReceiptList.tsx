import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, X, Eye, EyeOff } from 'lucide-react';

interface ReceiptListProps {
  receipts: any[];
  handleRemoveReceipt: (idx: number) => void;
  showOCRText: { [key: string]: boolean };
  toggleOCRText: (id: string) => void;
  totalAmount: number;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, handleRemoveReceipt, showOCRText, toggleOCRText, totalAmount }) => {
  if (!receipts.length) return null;
  // console.log("Receipts:", receipts);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#5ABA47]" />
            Receipts ({receipts.length})
          </span>
          <Badge className="bg-[#5ABA47] text-white">
            Total: ${totalAmount.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {receipts.map((receipt, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{receipt.description}</h4>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-gray-100 text-gray-800">{receipt.category}</Badge>
                  {receipt.ocrProcessed && (
                    <Badge className="bg-blue-100 text-blue-800">Vision</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReceipt(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                <span>Amount: ${typeof receipt.amount === 'string' ? parseFloat(receipt.amount).toLocaleString() : receipt.amount.toLocaleString()}</span>
                <span>Date: {new Date(receipt.date).toLocaleDateString()}</span>
              </div>
              {receipt.image && receipt.image !== '/ReceiptPlaceholder.png' && (
                <div className="mt-2">
                  {receipt.image.startsWith('data:image/') || receipt.image.startsWith('blob:') ? (
                    <img
                      src={receipt.image}
                      alt="Receipt attachment"
                      className="h-40 w-full max-w-md rounded-md border border-gray-200 object-contain bg-white"
                    />
                  ) : (
                    <div className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      Attachment added
                    </div>
                  )}
                </div>
              )}
              {receipt.ocrRawText && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Data:</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOCRText(`receipt-${index}`)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showOCRText[`receipt-${index}`] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  {showOCRText[`receipt-${index}`] && (
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {receipt.ocrRawText}
                    </pre>
                  )}
                </div>
              )}
              {receipt?.notes && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-start mb-2">
                    <span className="text-xs font-medium text-gray-600 mr-5">Notes:</span>
                    {receipt?.notes}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
