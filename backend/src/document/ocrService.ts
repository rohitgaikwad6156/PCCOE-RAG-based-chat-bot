import { logger } from '../utils/logger';

export interface OcrResult {
  hasOcrProcessed: boolean;
  extractedText: string;
  warning?: string;
}

export async function processOcrIfScanned(
  filePath: string,
  isLowDensity: boolean
): Promise<OcrResult> {
  if (!isLowDensity) {
    return { hasOcrProcessed: false, extractedText: '' };
  }

  logger.warn(`Document at ${filePath} has low text density. Scanned document detected.`);
  
  // OCR graceful handler
  return {
    hasOcrProcessed: false,
    extractedText: '',
    warning: 'The document appears to be a scanned image with low machine-readable text.',
  };
}
