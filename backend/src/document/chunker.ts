import { RAG_CONFIG } from '../config/constants';
import { cleanExtractedText } from './textCleaner';
import { ExtractedPage } from './textExtractor';

export interface ChunkItem {
  chunkIndex: number;
  text: string;
  pageNumber: number;
  vectorId: string;
  charCount: number;
  metadata: {
    documentId: string;
    documentTitle: string;
    department: string;
    collectionName: string;
    documentVersion: number;
    pageNumber: number;
    chunkIndex: number;
  };
}

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  documentId: string;
  documentTitle: string;
  department: string;
  collectionName: string;
  documentVersion: number;
}

export function chunkDocumentPages(
  pages: ExtractedPage[],
  options: ChunkOptions
): ChunkItem[] {
  const chunkSize = options.chunkSize || RAG_CONFIG.CHUNK_SIZE_CHAR;
  const chunks: ChunkItem[] = [];

  let globalChunkIndex = 0;

  for (const page of pages) {
    const cleanedText = cleanExtractedText(page.text);
    if (!cleanedText || cleanedText.length === 0) continue;

    // Split page text by logical paragraphs / bullet blocks
    const paragraphs = cleanedText.split(/\n\n+/).filter((p) => p.trim().length > 0);
    let currentChunkText = '';

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();

      if ((currentChunkText + '\n\n' + para).length > chunkSize && currentChunkText.length > 0) {
        chunks.push({
          chunkIndex: globalChunkIndex,
          text: currentChunkText.trim(),
          pageNumber: page.pageNumber,
          vectorId: `${options.documentId}-chunk-${globalChunkIndex}`,
          charCount: currentChunkText.trim().length,
          metadata: {
            documentId: options.documentId,
            documentTitle: options.documentTitle,
            department: options.department,
            collectionName: options.collectionName,
            documentVersion: options.documentVersion,
            pageNumber: page.pageNumber,
            chunkIndex: globalChunkIndex,
          },
        });
        globalChunkIndex++;
        currentChunkText = para;
      } else {
        currentChunkText = currentChunkText ? currentChunkText + '\n\n' + para : para;
      }
    }

    if (currentChunkText.trim().length > 0) {
      chunks.push({
        chunkIndex: globalChunkIndex,
        text: currentChunkText.trim(),
        pageNumber: page.pageNumber,
        vectorId: `${options.documentId}-chunk-${globalChunkIndex}`,
        charCount: currentChunkText.trim().length,
        metadata: {
          documentId: options.documentId,
          documentTitle: options.documentTitle,
          department: options.department,
          collectionName: options.collectionName,
          documentVersion: options.documentVersion,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex,
        },
      });
      globalChunkIndex++;
    }
  }

  return chunks;
}
