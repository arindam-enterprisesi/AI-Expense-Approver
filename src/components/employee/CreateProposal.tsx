import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, Send, ArrowLeft, Loader } from 'lucide-react';
import { Proposal, Receipt } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';
import { useOCR } from '@/hooks/image-processing';
import { TripInformationForm } from './TripInformationForm';
import { AddReceiptForm } from './AddReceiptForm';
import { ReceiptList } from './ReceiptList';
import { analyzeProposalWithAI } from '@/hooks/ai-workflow';

// Note: You'll need to update the Receipt type in @/pages/Index to include:
// ocrRawText?: string;
// ocrProcessed?: boolean;

interface CreateProposalProps {
  onSubmit: (proposal: Proposal) => void;
  initialProposal?: Proposal;
  isEditing?: boolean;
}

// Extended Receipt type to include OCR data
interface ExtendedReceipt extends Omit<Receipt, 'id' | 'aiStatus' | 'aiJustification'> {
  ocrRawText?: string;
  ocrProcessed?: boolean;
}

export function CreateProposal({ onSubmit, initialProposal, isEditing = false }: CreateProposalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillProposal = (location.state as { prefillProposal?: Proposal } | null)?.prefillProposal;
  const baseProposal = initialProposal ?? prefillProposal;

  // Initialize OCR hook
  const { extractedText, isLoading: isOCRLoading, error: ocrError, processImage, clearResults } = useOCR({
    language: 'eng',
    logger: true
  });

  // Show loading transition when await response from ai
  const [aiAnalysisLoading, setAIAnalysisLoading] = useState(false);

  const [formData, setFormData] = useState({
    tripPurpose: baseProposal?.tripPurpose || '',
    tripLocation: baseProposal?.tripLocation || '',
    startDate: baseProposal?.tripDates.start || '',
    endDate: baseProposal?.tripDates.end || '',
    department: baseProposal?.department || 'Sales',
    tripType: baseProposal?.tripType || 'single', // "single" or "multi"
    multiCityDetails: baseProposal?.multiCityDetails || '' // optional for multi-city
  });

  const [receipts, setReceipts] = useState<ExtendedReceipt[]>(
    baseProposal?.receipts.map(r => ({
      description: r.description,
      amount: r.amount,
      category: r.category,
      notes: r.notes,
      date: r.date,
      image: r.image || '/ReceiptPlaceholder.png',
      ocrRawText: r.ocrRawText,
      ocrProcessed: r.ocrProcessed,
      paymentMethod: r.paymentMethod || 'personal'
    })) || []
  );

  const [newReceipt, setNewReceipt] = useState<ExtendedReceipt>({
    description: '',
    amount: '',
    category: 'Meals',
    date: '',
    notes: '',
    image: '/ReceiptPlaceholder.png',
    ocrRawText: '',
    ocrProcessed: false,
    paymentMethod: 'personal'
  });

  const [showOCRText, setShowOCRText] = useState<{ [key: string]: boolean }>({});
  const [processingOCR, setProcessingOCR] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prefillQueue, setPrefillQueue] = useState<number[]>([]);
  const [activePrefillIndex, setActivePrefillIndex] = useState<number | null>(null);

  const categories = ['Meals', 'Transportation', 'Accommodation', 'Entertainment', 'Supplies', 'Other'];
  // const [notes, setNotes] = useState('')

  const handleAddReceipt = () => {
    if (!newReceipt.description || !newReceipt.amount || !newReceipt.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all receipt details.",
        variant: "destructive"
      });
      return;
    }

    const receipt: ExtendedReceipt = {
      ...newReceipt,
      amount: parseFloat(newReceipt.amount as string),
      // image: newReceipt.image || '/placeholder.svg'
      image: '/ReceiptPlaceholder.png'
    };

    setReceipts(prev => [...prev, receipt]);
    setNewReceipt({
      description: '',
      amount: '',
      category: 'Meals',
      date: '',
      image: '/ReceiptPlaceholder.png',
      ocrRawText: '',
      notes: '',
      ocrProcessed: false,
      paymentMethod: 'personal'
    });

    // Clear OCR results after adding receipt
    // clearResults();

    toast({
      title: "Receipt Added",
      description: "Receipt has been added to your proposal.",
    });
  };

  const handleRemoveReceipt = (index: number) => {
    setReceipts(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid image file.",
        variant: "destructive"
      });
      return;
    }

    // Set processing state
    setProcessingOCR(true);

    // Read file for preview
    const reader = new FileReader();
    reader.onload = () => {
      setNewReceipt(prev => ({
        ...prev,
        image: reader.result as string,
        ocrProcessed: false,
        ocrRawText: ''
      }));
    };
    reader.readAsDataURL(file);

    try {
      // Process image with OCR
      await processImage(file);
      // console.log('variable named extracted: ', extractedText)

      toast({
        title: "Receipt Processing Complete",
        description: "Receipt image has been processed and text extracted.",
      });
    } catch (error) {
      console.error('Receipt processing failed:', error);
      toast({
        title: "Receipt Processing Failed",
        description: "Failed to extract text from image. You can still proceed manually.",
        variant: "destructive"
      });
    } finally {
      setProcessingOCR(false);
    }
  };

  // Update newReceipt when OCR completes
  useEffect(() => {
    if (
      extractedText &&
      newReceipt.image &&
      newReceipt.image !== '/ReceiptPlaceholder.png' &&
      !newReceipt.ocrProcessed
    ) {
      setNewReceipt(prev => ({
        ...prev,
        ocrRawText: extractedText,
        ocrProcessed: true
      }));
    }
  }, [extractedText, newReceipt.image, newReceipt.ocrProcessed]);

  const parseAmountFromOcr = (text: string): number | null => {
    const amountMatches = text.match(/(?:total\s*(?:paid)?|amount\s*due|balance\s*due|total)\s*[:$]*\s*\$?([0-9]+(?:\.[0-9]{2})?)/gi);
    if (!amountMatches || amountMatches.length === 0) return null;

    const last = amountMatches[amountMatches.length - 1];
    const valueMatch = last.match(/\$?([0-9]+(?:\.[0-9]{2})?)/);
    return valueMatch ? parseFloat(valueMatch[1]) : null;
  };

  const normalizeDate = (text: string): string | null => {
    const numericMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (numericMatch) {
      const parts = numericMatch[1].split(/[\/\-]/).map(p => p.trim());
      if (parts.length === 3) {
        const [month, day, year] = parts;
        const normalizedYear = year.length === 2 ? `20${year}` : year;
        return `${normalizedYear.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    const textMatch = text.match(/([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})/);
    if (textMatch) {
      const monthName = textMatch[1].toLowerCase();
      const day = textMatch[2].padStart(2, '0');
      const year = textMatch[3];
      const monthMap: { [key: string]: string } = {
        jan: '01', january: '01',
        feb: '02', february: '02',
        mar: '03', march: '03',
        apr: '04', april: '04',
        may: '05',
        jun: '06', june: '06',
        jul: '07', july: '07',
        aug: '08', august: '08',
        sep: '09', sept: '09', september: '09',
        oct: '10', october: '10',
        nov: '11', november: '11',
        dec: '12', december: '12'
      };
      const month = monthMap[monthName];
      if (month) {
        return `${year}-${month}-${day}`;
      }
    }

    return null;
  };

  const inferCategoryFromOcr = (text: string): string | null => {
    const lowered = text.toLowerCase();
    if (/(hotel|lodging|inn|resort)/.test(lowered)) return 'Accommodation';
    if (/(flight|airline|boarding|gate|uber|lyft|taxi|ride|car|rental|parking|train|bus)/.test(lowered)) return 'Transportation';
    if (/(meal|restaurant|dining|cafe|food|beverage)/.test(lowered)) return 'Meals';
    return null;
  };

  const extractDescriptionFromOcr = (text: string): string | null => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    return lines.length ? lines[0] : null;
  };

  const extractLocationFromOcr = (text: string): string | null => {
    const lowered = text.toLowerCase();
    
    // Look for flight route patterns (e.g., "Route: MCO — EWR" or "MCO-EWR" or "MCO to EWR")
    const routeMatch = text.match(/(?:Route:\s*)?([A-Z]{3})\s*(?:—|–|-|to|>)\s*([A-Z]{3})/i);
    if (routeMatch) {
      return `${routeMatch[1].toUpperCase()} — ${routeMatch[2].toUpperCase()}`;
    }
    
    // Look for common location patterns
    const addressMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})/); // City, ST format
    if (addressMatch) {
      return `${addressMatch[1]}, ${addressMatch[2]}`;
    }
    
    // Look for city names (common patterns)
    const cityMatch = text.match(/(?:^|\n)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?:,|\s)([A-Z]{2}|[A-Z][a-z]+)(?:$|\n|\s)/m);
    if (cityMatch) {
      return `${cityMatch[1]}, ${cityMatch[2]}`;
    }
    
    // Check for specific location keywords in the text
    const locationKeywords = [
      { pattern: /(new york|nyc)/i, location: 'New York, NY' },
      { pattern: /(los angeles|la)/i, location: 'Los Angeles, CA' },
      { pattern: /(san francisco)/i, location: 'San Francisco, CA' },
      { pattern: /(chicago)/i, location: 'Chicago, IL' },
      { pattern: /(boston)/i, location: 'Boston, MA' },
      { pattern: /(seattle)/i, location: 'Seattle, WA' },
      { pattern: /(miami)/i, location: 'Miami, FL' },
      { pattern: /(atlanta)/i, location: 'Atlanta, GA' },
      { pattern: /(dallas)/i, location: 'Dallas, TX' },
      { pattern: /(houston)/i, location: 'Houston, TX' },
    ];
    
    for (const { pattern, location } of locationKeywords) {
      if (pattern.test(lowered)) {
        return location;
      }
    }
    
    return null;
  };

  const dataUrlToFile = (dataUrl: string, filename: string): File | null => {
    if (!dataUrl.startsWith('data:image/')) return null;
    const [header, base64Data] = dataUrl.split(',');
    if (!header || !base64Data) return null;
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], filename, { type: mimeType });
  };

  useEffect(() => {
    if (prefillQueue.length === 0) {
      const queue = receipts
        .map((receipt, index) => ({ receipt, index }))
        .filter(({ receipt }) =>
          receipt.image &&
          receipt.image.startsWith('data:image/') &&
          !receipt.ocrProcessed
        )
        .map(({ index }) => index);

      if (queue.length > 0) {
        setPrefillQueue(queue);
      }
    }
  }, [receipts, prefillQueue.length]);

  useEffect(() => {
    if (activePrefillIndex !== null || prefillQueue.length === 0 || isOCRLoading) {
      return;
    }

    const nextIndex = prefillQueue[0];
    const receipt = receipts[nextIndex];
    if (!receipt || !receipt.image) return;

    const file = dataUrlToFile(receipt.image, `gmail-receipt-${nextIndex}.png`);
    if (!file) return;

    setActivePrefillIndex(nextIndex);
    processImage(file).catch(() => {
      setActivePrefillIndex(null);
      setPrefillQueue(prev => prev.slice(1));
    });
  }, [activePrefillIndex, prefillQueue, receipts, isOCRLoading, processImage]);

  useEffect(() => {
    if (activePrefillIndex === null || !extractedText) return;

    const today = new Date().toISOString().split('T')[0];

    const parsedAmount = parseAmountFromOcr(extractedText);
    const parsedDate = normalizeDate(extractedText);
    const parsedCategory = inferCategoryFromOcr(extractedText);
    const parsedDescription = extractDescriptionFromOcr(extractedText);
    const parsedLocation = extractLocationFromOcr(extractedText);

    setReceipts(prev => {
      const updatedReceipts = prev.map((receipt, index) => {
        if (index !== activePrefillIndex) return receipt;

        const shouldReplaceDate = !receipt.date || receipt.date === today;
        const shouldReplaceAmount = !receipt.amount || receipt.amount === 0;
        const shouldReplaceCategory = !receipt.category || receipt.category === 'Other';
        const shouldReplaceDescription = !receipt.description || receipt.description === 'Gmail Auto-Captured Expenses';

        return {
          ...receipt,
          description: shouldReplaceDescription ? (parsedDescription || receipt.description) : receipt.description,
          amount: shouldReplaceAmount ? (parsedAmount ?? receipt.amount) : receipt.amount,
          category: shouldReplaceCategory ? (parsedCategory || receipt.category) : receipt.category,
          date: shouldReplaceDate ? (parsedDate || receipt.date) : receipt.date,
          ocrRawText: extractedText,
          ocrProcessed: true
        };
      });

      // Update trip dates if OCR extracted a valid date
      if (parsedDate) {
        const validDates = updatedReceipts
          .map(r => r.date)
          .filter(Boolean)
          .filter(d => d !== today) // Exclude today's date (weak default)
          .map(d => new Date(d))
          .filter(d => !isNaN(d.getTime()));

        if (validDates.length > 0) {
          const earliestDate = new Date(Math.min(...validDates.map(d => d.getTime())));
          const newStartDate = earliestDate.toISOString().split('T')[0];
          
          // Calculate end date as 2 days after the extracted start date
          const endDateObj = new Date(earliestDate);
          endDateObj.setDate(endDateObj.getDate() + 2);
          const newEndDate = endDateObj.toISOString().split('T')[0];
          
          // Always update both start and end dates together when we have a valid date
          setFormData(prevForm => ({
            ...prevForm,
            startDate: newStartDate,
            endDate: newEndDate,
            tripLocation: parsedLocation || prevForm.tripLocation,
          }));
        }
      } else if (parsedLocation) {
        // Update location even if no date was extracted
        setFormData(prevForm => ({
          ...prevForm,
          tripLocation: parsedLocation,
        }));
      }

      return updatedReceipts;
    });

    setPrefillQueue(prev => prev.slice(1));
    setActivePrefillIndex(null);
  }, [activePrefillIndex, extractedText]);

  const toggleOCRText = (receiptId: string) => {
    setShowOCRText(prev => ({
      ...prev,
      [receiptId]: !prev[receiptId]
    }));
  };


  const handleSubmit = (status: 'draft' | 'submitted') => {
    // Check if there's a pending receipt that needs to be added
    if (newReceipt.description && newReceipt.amount && newReceipt.date) {
      const receipt: ExtendedReceipt = {
        ...newReceipt,
        amount: parseFloat(newReceipt.amount as string),
        image: '/ReceiptPlaceholder.png'
      };
      setReceipts(prev => [...prev, receipt]);
      // Use the updated receipts array for submission
      handleSubmitWithReceipts(status, [...receipts, receipt]);
      return;
    }
    // console.log("receipts: ", receipts);

    handleSubmitWithReceipts(status, receipts);
  };

  const handleSubmitWithReceipts = (status: 'draft' | 'submitted', finalReceiptsList: ExtendedReceipt[]) => {
    if (!formData.tripPurpose || !formData.tripLocation || !formData.startDate || !formData.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (status === 'submitted' && finalReceiptsList.length === 0) {
      toast({
        title: "No Receipts",
        description: "Please add at least one receipt before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Convert ExtendedReceipt to Receipt format (remove OCR fields)
    // console.log("FRL: ", finalReceiptsList)
    const processedReceipts = finalReceiptsList.map((receipt, index) => ({
      id: isEditing && initialProposal?.receipts[index]?.id ? initialProposal.receipts[index].id : `r${Date.now()}_${index}`,
      description: receipt.description,
      amount: receipt.amount,
      category: receipt.category,
      date: receipt.date,
      image: receipt.image,
      notes: receipt.notes || '',
      ocrRawText: receipt.ocrRawText,
      ocrProcessed: receipt.ocrProcessed,
      aiStatus: 'pending' as const,
      aiJustification: ''
    }));

    // For both draft and submitted, pass plain receipts to proposal
    const finalReceipts = processedReceipts;

    const proposal: Proposal = {
      id: isEditing && initialProposal ? initialProposal.id : Date.now().toString(),
      employeeId: 'emp001',
      employeeName: 'John Doe',
      // employeeEmail: 'john.Doe@xyz.com',
      employeeEmail: 'expensemanager.ai@gmail.com',
      department: formData.department,
      tripPurpose: formData.tripPurpose,
      tripLocation: formData.tripLocation,
      tripDates: {
        start: formData.startDate,
        end: formData.endDate
      },
      tripType: formData.tripType,
      multiCityDetails: formData.multiCityDetails || '',
      receipts: finalReceipts,
      totalAmount: finalReceiptsList.reduce((sum, r) => sum + (typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount), 0),
      status: status === 'submitted' ? 'under_review' : 'draft',
      aiOverallStatus: status === 'submitted' ? 'pending' : 'pending',
      aiOverallJustification: status === 'submitted'
        ? 'AI analysis completed. Review individual receipt decisions.'
        : '',
      createdAt: initialProposal?.createdAt || new Date().toISOString(),
      submittedAt: status === 'submitted' ? new Date().toISOString() : initialProposal?.submittedAt
    };

    setAIAnalysisLoading(true)
    // Send proposal for AI analysis (capture result)
    analyzeProposalWithAI(proposal)
      .then(rawRes => {
        setAIAnalysisLoading(false)
        // console.log(rawRes)
        let resObj;
        if (typeof rawRes === "string") {
          // remove ```json and ```
          const cleaned = rawRes
            .replace(/```json/i, "")
            .replace(/```/g, "")
            .trim();

          resObj = JSON.parse(cleaned);
          // console.log("AI Analysis Response (string): ", resObj);
        } else {
          resObj = rawRes;
          // console.log("AI Analysis Response (object): ", resObj);
        }

        // console.log("AI Analysis Response (parsed):", resObj);

        const receiptsWithAI = proposal.receipts.map(r => {
          const receiptId = r.id || r.receipt_id;
          const ai = resObj.receipts_review?.find((ar: any) => ar.receipt_id === receiptId);

          return {
            ...r,
            aiStatus: ai?.status ?? '',
            aiJustification: ai?.justification ?? ''
          };
        });

        const updatedProposal = {
          ...proposal,
          receipts: receiptsWithAI,
          aiOverallStatus: resObj.overall_status,
          aiAnalysisTimestamp: resObj.timestamp,
          aiAnalysis: resObj,
          aiOverallJustification: resObj.overall_summary
        };

        // console.log("updated proposal:", updatedProposal);
        onSubmit(updatedProposal);
        toast({
          title: status === 'submitted' ? "Report Submitted" : isEditing ? "Report Updated" : "Draft Saved",
          description: status === 'submitted'
            ? "Your report has been submitted for AI review and admin approval."
            : isEditing
              ? "Your report has been updated successfully."
              : "Your report has been saved as a draft.",
        });
        navigate('/dashboard');
      })
      .catch(err => {
        toast({
          title: 'AI Analysis Failed',
          description: 'There was a problem analyzing your report with AI. Submission still completed.',
          variant: 'destructive'
        });
        console.error('AI Analysis Error:', err);
        onSubmit(proposal); // Fallback: save without AI field
        navigate('/dashboard');
      });

    // console.log('submitting proposal: ',proposal);
  };

  const totalAmount = receipts.reduce((sum, receipt) => sum + (typeof receipt.amount === 'string' ? parseFloat(receipt.amount) : receipt.amount), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {aiAnalysisLoading && (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-200/60 backdrop-blur-sm z-50">
              <div className="w-12 h-12 border-4 border-white border-t-[#5ABA47] rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-700 text-lg font-medium">
                Analyzing your data, please wait…
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Reimbursement Report' : 'Create Reimbursement Report'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update your business trip expenses' : 'Submit your business trip expenses for review'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => handleSubmit('draft')}
            variant="outline"
            className="border-[#5ABA47] text-[#5ABA47] hover:bg-[#5ABA47] hover:text-white"
            disabled={submitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {submitting ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={() => handleSubmit('submitted')}
            className="bg-[#5ABA47] hover:bg-[#4a9c3a] text-white"
            disabled={submitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? 'Submitting...' : (isEditing ? 'Update & Submit' : 'Submit for Review')}
          </Button>
          {submitting && (
            <span className="ml-3 text-[#5ABA47] flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#5ABA47" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="60, 180" />
              </svg>
              Processing with AI...
            </span>
          )}
        </div>
      </div>

      {/* Trip Information */}
      <TripInformationForm formData={formData} setFormData={setFormData} />

      {/* Add Receipt */}
      <AddReceiptForm
        newReceipt={newReceipt}
        setNewReceipt={setNewReceipt}
        handleImageUpload={handleImageUpload}
        handleAddReceipt={handleAddReceipt}
        processingOCR={processingOCR}
        isOCRLoading={isOCRLoading}
        ocrError={ocrError}
        showOCRText={showOCRText}
        toggleOCRText={toggleOCRText}
        categories={categories}
      />

      {/* Receipt List */}
      <ReceiptList
        receipts={receipts}
        handleRemoveReceipt={handleRemoveReceipt}
        showOCRText={showOCRText}
        toggleOCRText={toggleOCRText}
        totalAmount={totalAmount}
      />
    </div>
  );
}