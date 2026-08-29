import { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database';
import { vectorStore } from '../vector/vectorStore';
import { env } from '../config/env';

export class HealthController {
  async checkHealth(_req: Request, res: Response): Promise<void> {
    const dbStatus = getDatabaseStatus();

    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      services: {
        database: dbStatus.isConnected ? 'connected' : 'in-memory-fallback',
        vectorStore: {
          provider: env.VECTOR_STORE_PROVIDER,
          indexedChunks: vectorStore.getStoreSize(),
        },
        llm: {
          provider: env.LLM_PROVIDER,
          model: env.LLM_MODEL,
          hasKey: Boolean(env.GEMINI_API_KEY || env.OPENAI_API_KEY || env.OPENROUTER_API_KEY),
        },
        embeddings: {
          provider: env.EMBEDDING_PROVIDER,
          model: env.EMBEDDING_MODEL,
        },
      },
    });
  }
}

export const healthController = new HealthController();
