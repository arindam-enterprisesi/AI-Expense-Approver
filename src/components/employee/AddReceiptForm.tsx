import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Plus, Eye, EyeOff, CheckCircle } from 'lucide-react';

export interface AddReceiptFormProps {
  newReceipt: any;
  setNewReceipt: React.Dispatch<React.SetStateAction<any>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddReceipt: () => void;
  processingOCR: boolean;
  isOCRLoading: boolean;
  ocrError: string | null;
  showOCRText: { [key: string]: boolean };
  toggleOCRText: (id: string) => void;
  categories: string[];
  notes: string;
}

export const AddReceiptForm: React.FC<AddReceiptFormProps> = ({
  newReceipt,
  setNewReceipt,
  handleImageUpload,
  handleAddReceipt,
  processingOCR,
  isOCRLoading,
  ocrError,
  showOCRText,
  toggleOCRText,
  categories,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Plus className="h-5 w-5 mr-2 text-[#5ABA47]" />
        Add Receipt
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Description and Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={newReceipt.description}
            onChange={(e) =>
              setNewReceipt((prev: any) => ({ ...prev, description: e.target.value }))
            }
            placeholder="e.g., Flight from NYC to SFO"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={newReceipt.amount}
            onChange={(e) =>
              setNewReceipt((prev: any) => ({ ...prev, amount: e.target.value }))
            }
            placeholder="0.00"
            className="mt-1"
          />
        </div>
      </div>

      {/* Category and Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={newReceipt.category}
            onChange={(e) =>
              setNewReceipt((prev: any) => ({ ...prev, category: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#5ABA47] focus:outline-none focus:ring-1 focus:ring-[#5ABA47]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="receiptDate">Date</Label>
          <Input
            id="receiptDate"
            type="date"
            value={newReceipt.date}
            onChange={(e) =>
              setNewReceipt((prev: any) => ({ ...prev, date: e.target.value }))
            }
            className="mt-1"
          />
        </div>
      </div>

      {/* Receipt Image and Billable Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Receipt Upload Section */}
        <div>
          <Label htmlFor="receiptImage">
            Receipt Upload (Supported: Image, PDF, DOCX)
          </Label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              id="receiptImage"
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleImageUpload}
              className="hidden"
              disabled={processingOCR || isOCRLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('receiptImage')?.click()}
              className="border-[#5ABA47] text-[#5ABA47] hover:bg-[#5ABA47] hover:text-white"
              disabled={processingOCR || isOCRLoading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {processingOCR || isOCRLoading ? 'Processing...' : 'Upload File'}
            </Button>
            {newReceipt.image && (
              <span className="text-sm text-green-600">
                {newReceipt.ocrProcessed
                  ? 'File uploaded & processed'
                  : 'Upload File'}
              </span>
            )}
          </div>

          {ocrError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Error: {ocrError}
            </div>
          )}

          {newReceipt.ocrRawText && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Extracted Data:
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleOCRText('new')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showOCRText['new'] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {showOCRText['new'] && (
                <pre className="text-xs text-blue-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {newReceipt.ocrRawText}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Client Billable Section */}
        <div className="flex flex-col justify-center border border-gray-200 rounded-lg p-4 bg-gray-50">
          <Label className="text-gray-700 mb-2">Client Billable</Label>
          <button
            type="button"
            onClick={() =>
              setNewReceipt((prev: any) => ({
                ...prev,
                billable: !prev.billable,
              }))
            }
            className={`flex items-center justify-center px-4 py-2 rounded-md transition ${newReceipt.billable
                ? 'bg-[#5ABA47] text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
          >
            {newReceipt.billable && <CheckCircle className="h-4 w-4 mr-2" />}
            {newReceipt.billable ? 'Billable' : 'Non-Billable'}
          </button>
        </div>
        <div className="mt-4">
          <Label htmlFor="receiptNotes">Notes (Optional)</Label>
          <textarea
            id="receiptNotes"
            value={newReceipt.notes || ''}
            onChange={(e) =>
              setNewReceipt((prev: any) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add any notes or justification for this receipt..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#5ABA47] focus:outline-none focus:ring-1 focus:ring-[#5ABA47]"
            rows={3}
          />
        </div>
      </div>

      {/* Add Receipt Button */}
      <Button
        onClick={handleAddReceipt}
        className="w-full bg-[#5ABA47] hover:bg-[#4a9c3a] text-white"
        disabled={processingOCR || isOCRLoading}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Receipt
      </Button>
    </CardContent>
  </Card>
);
