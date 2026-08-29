import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../utils/logger';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  pages: ExtractedPage[];
  totalPages: number;
  totalCharacters: number;
  rawText: string;
  isLowDensity: boolean;
}

export async function extractTextFromFile(filePath: string, fileType: string): Promise<ExtractionResult> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();

  if (fileType === 'application/pdf' || ext === '.pdf') {
    return extractPdf(filePath);
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword' ||
    ext === '.docx' ||
    ext === '.doc'
  ) {
    return extractDocx(filePath);
  }

  if (fileType === 'text/plain' || ext === '.txt' || ext === '.md') {
    return extractPlainText(filePath);
  }

  throw new Error(`Unsupported file type: ${fileType || ext}`);
}

async function extractPdf(filePath: string): Promise<ExtractionResult> {
  const dataBuffer = fs.readFileSync(filePath);
  
  const pages: ExtractedPage[] = [];
  let pageCounter = 1;

  // Custom pager function for pdf-parse to preserve page numbers
  const options = {
    pagerender: (pageData: any) => {
      return pageData.getTextContent().then((textContent: any) => {
        let lastY, text = '';
        for (const item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        pages.push({
          pageNumber: pageCounter++,
          text: text.trim(),
        });
        return text;
      });
    },
  };

  const parsed = await pdfParse(dataBuffer, options);
  const rawText = parsed.text || '';
  const totalCharacters = rawText.length;
  const isLowDensity = totalCharacters < 50 && parsed.numpages > 0;

  // If pagerender didn't populate properly, fallback to splitting raw text by form feed
  if (pages.length === 0) {
    const rawPages = rawText.split(/\f/);
    rawPages.forEach((pgText, idx) => {
      if (pgText.trim().length > 0) {
        pages.push({ pageNumber: idx + 1, text: pgText.trim() });
      }
    });
  }

  if (pages.length === 0 && rawText.trim().length > 0) {
    pages.push({ pageNumber: 1, text: rawText.trim() });
  }

  return {
    pages,
    totalPages: parsed.numpages || pages.length || 1,
    totalCharacters,
    rawText,
    isLowDensity,
  };
}

async function extractDocx(filePath: string): Promise<ExtractionResult> {
  const result = await mammoth.extractRawText({ path: filePath });
  const rawText = result.value || '';
  
  // Approximate pages by paragraphs/sections (approx 500 words per page)
  const paragraphs = rawText.split(/\n{2,}/);
  const pages: ExtractedPage[] = [];
  let currentPageText = '';
  let currentPageNum = 1;

  for (const para of paragraphs) {
    if ((currentPageText + para).length > 2500 && currentPageText.length > 0) {
      pages.push({ pageNumber: currentPageNum++, text: currentPageText.trim() });
      currentPageText = para + '\n\n';
    } else {
      currentPageText += para + '\n\n';
    }
  }

  if (currentPageText.trim().length > 0) {
    pages.push({ pageNumber: currentPageNum, text: currentPageText.trim() });
  }

  if (pages.length === 0 && rawText.trim().length > 0) {
    pages.push({ pageNumber: 1, text: rawText.trim() });
  }

  return {
    pages,
    totalPages: pages.length || 1,
    totalCharacters: rawText.length,
    rawText,
    isLowDensity: rawText.length < 30,
  };
}

async function extractPlainText(filePath: string): Promise<ExtractionResult> {
  const rawText = fs.readFileSync(filePath, 'utf-8');
  const pages: ExtractedPage[] = [];

  // Split by markdown headers or large sections
  const sections = rawText.split(/(?=\n##?\s+)/);
  sections.forEach((sec, idx) => {
    if (sec.trim().length > 0) {
      pages.push({ pageNumber: idx + 1, text: sec.trim() });
    }
  });

  if (pages.length === 0) {
    pages.push({ pageNumber: 1, text: rawText.trim() });
  }

  return {
    pages,
    totalPages: pages.length,
    totalCharacters: rawText.length,
    rawText,
    isLowDensity: rawText.length < 10,
  };
}
