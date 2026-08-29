import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { embeddingService } from '../embeddings/embeddingService';
import { vectorStore } from '../vector/vectorStore';
import { llmService } from '../llm/llmService';
import { constructRAGPrompt } from '../llm/prompts';
import { RAG_CONFIG } from '../config/constants';
import { isDbConnected } from '../config/database';
import { Document } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { memoryDb } from '../config/memoryDb';
import { logger } from '../utils/logger';

export class DiagnosticsController {
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vectorCount = vectorStore.getStoreSize();
      let documentCount = 0;
      let chunkCount = 0;

      if (isDbConnected()) {
        documentCount = await Document.countDocuments();
        chunkCount = await DocumentChunk.countDocuments();
      } else {
        documentCount = memoryDb.documents.size;
        for (const chunks of memoryDb.documentChunks.values()) {
          chunkCount += chunks.length;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          llm: {
            provider: env.LLM_PROVIDER,
            model: env.LLM_MODEL,
            hasOpenRouterKey: !!env.OPENROUTER_API_KEY,
            hasOpenAiKey: !!env.OPENAI_API_KEY,
            hasGeminiKey: !!env.GEMINI_API_KEY,
          },
          embedding: {
            provider: env.EMBEDDING_PROVIDER,
            model: env.EMBEDDING_MODEL,
            dimension: 128,
          },
          vectorStore: {
            provider: env.VECTOR_STORE_PROVIDER,
            totalVectors: vectorCount,
            indexName: env.PINECONE_INDEX || 'pccoe-rag',
            isReady: vectorCount > 0,
          },
          database: {
            isMongoConnected: isDbConnected(),
            documentsIndexed: documentCount,
            chunksStored: chunkCount,
          },
          ragConfig: {
            topK: RAG_CONFIG.TOP_K,
            relevanceThreshold: RAG_CONFIG.RELEVANCE_THRESHOLD,
          },
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async runRAGTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ success: false, message: 'Query string is required for testing' });
        return;
      }

      const trimmedQuery = query.trim();
      logger.info(`[RAG DIAGNOSTIC] Running trace for query: "${trimmedQuery}"`);

      // 1. Generate query embedding
      const queryEmbedding = await embeddingService.generateEmbedding(trimmedQuery);

      // 2. Vector search
      const matches = await vectorStore.querySimilarity(
        queryEmbedding,
        RAG_CONFIG.TOP_K,
        undefined,
        trimmedQuery
      );

      // 3. Filter by relevance threshold
      const validMatches = matches.filter((m) => m.score >= RAG_CONFIG.RELEVANCE_THRESHOLD);

      // 4. Construct context
      let contextBuffer = '';
      validMatches.forEach((m, idx) => {
        const title = m.metadata.documentTitle || 'PCCOE Document';
        const page = m.metadata.pageNumber || 1;
        contextBuffer += `[Source ${idx + 1}: ${title} (Page ${page})]\n${m.metadata.text}\n\n---\n\n`;
      });

      // 5. Build prompt
      const prompt = constructRAGPrompt(trimmedQuery, contextBuffer, []);

      // 6. Call LLM
      const llmAnswer = await llmService.generateText(prompt);

      res.status(200).json({
        success: true,
        data: {
          query: trimmedQuery,
          queryEmbeddingDimensions: queryEmbedding.length,
          totalVectorMatchesFound: matches.length,
          allMatches: matches.map((m) => ({
            id: m.id,
            score: m.score,
            documentTitle: m.metadata.documentTitle,
            pageNumber: m.metadata.pageNumber,
            isAccepted: m.score >= RAG_CONFIG.RELEVANCE_THRESHOLD,
            snippet: m.metadata.text ? m.metadata.text.slice(0, 180) + '...' : '',
          })),
          acceptedChunksCount: validMatches.length,
          contextLengthChars: contextBuffer.length,
          llmAnswer,
          sources: validMatches.map((m) => ({
            documentTitle: m.metadata.documentTitle,
            pageNumber: m.metadata.pageNumber,
            relevanceScore: Math.round(m.score * 100),
          })),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const diagnosticsController = new DiagnosticsController();
