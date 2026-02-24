import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

interface UseOCRResult {
  extractedText: string;
  isLoading: boolean;
  error: string | null;
  processImage: (imageFile: File) => Promise<void>;
  clearResults: () => void;
}

interface UseOCROptions {
  language?: string;
  logger?: boolean;
  onProgress?: (progress: any) => void;
}

export const useOCR = (options: UseOCROptions = {}): UseOCRResult => {
  const { 
    language = 'eng', 
    logger = false, 
    onProgress 
  } = options;

  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageFile: File): Promise<void> => {
    if (!imageFile) {
      setError('No image file provided');
      return;
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      setError('Please provide a valid image file');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedText('');

    try {
      // Create worker with specified language
      const worker = await createWorker(language, 1, {
        logger: logger ? (m: any) => {
          // console.log(m);
          onProgress?.(m);
        } : undefined
      });

      // Process the image
      const { data: { text } } = await worker.recognize(imageFile);
      // console.log("Extracted: ", text.length,": ",text)
      setExtractedText(text.trim());

      // Clean up worker
      await worker.terminate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OCR processing failed';
      setError(errorMessage);
      // console.error('OCR Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language, logger, onProgress]);

  const clearResults = useCallback(() => {
    setExtractedText('');
    setError(null);
  }, []);

  return {
    extractedText,
    isLoading,
    error,
    processImage,
    clearResults
  };
};