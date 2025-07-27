import { useState } from 'react';
import { createWorker } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
}

export const useClientOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processImage = async (imageFile: File): Promise<OCRResult> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text, confidence } } = await worker.recognize(imageFile);
      await worker.terminate();

      return {
        text,
        confidence: confidence / 100 // Convert to 0-1 scale
      };
    } catch (error) {
      console.error('Client-side OCR failed:', error);
      throw new Error('Failed to process image with OCR');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    processImage,
    isProcessing,
    progress
  };
};
