import { Pinecone } from '@pinecone-database/pinecone';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { EmbeddingService } from '../embeddings/embeddingService';

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    documentId: string;
    documentTitle: string;
    department: string;
    collectionName: string;
    pageNumber: number;
    chunkIndex: number;
    text: string;
  };
}

export interface VectorQueryResult {
  id: string;
  score: number;
  metadata: VectorRecord['metadata'];
}

export interface VectorFilter {
  department?: string;
  collectionName?: string;
  documentId?: string;
}

const STOP_WORDS = new Set([
  'tell', 'me', 'the', 'what', 'which', 'when', 'where', 'how', 'why', 'who',
  'for', 'and', 'are', 'is', 'was', 'were', 'about', 'give', 'show', 'please',
  'with', 'from', 'have', 'has', 'had', 'does', 'can', 'could', 'would', 'will',
  'any', 'some', 'this', 'that', 'into', 'details', 'information', 'know',
]);

export class VectorStore {
  private inMemoryStore: Map<string, VectorRecord> = new Map();
  private pineconeClient: Pinecone | null = null;
  private pineconeIndexName: string;

  constructor() {
    this.pineconeIndexName = env.PINECONE_INDEX || 'pccoe-rag';
    this.initializePinecone();
  }

  private async initializePinecone(): Promise<void> {
    if (env.VECTOR_STORE_PROVIDER === 'pinecone' && env.PINECONE_API_KEY) {
      try {
        this.pineconeClient = new Pinecone({ apiKey: env.PINECONE_API_KEY });
        logger.info(`Pinecone vector database client initialized for index: ${this.pineconeIndexName}`);
      } catch (err: any) {
        logger.warn(`Pinecone initialization failed (${err.message}). Using local high-performance in-memory vector store.`);
      }
    }
  }

  private adaptVectorToDimension(vec: number[], targetDim = 1024): number[] {
    if (!vec || vec.length === 0) return new Array(targetDim).fill(0);
    if (vec.length === targetDim) return vec;
    if (vec.length > targetDim) return vec.slice(0, targetDim);
    const padded = new Array(targetDim).fill(0);
    for (let i = 0; i < vec.length; i++) {
      padded[i] = vec[i];
    }
    return padded;
  }

  async upsertVectors(vectors: VectorRecord[]): Promise<void> {
    // Always store in memory for fast fallback
    for (const vec of vectors) {
      this.inMemoryStore.set(vec.id, vec);
    }

    if (this.pineconeClient && env.PINECONE_API_KEY) {
      try {
        const index = this.pineconeClient.index(this.pineconeIndexName);
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
          const batch = vectors.slice(i, i + batchSize).map((v) => ({
            id: v.id,
            values: this.adaptVectorToDimension(v.values, 1024),
            metadata: v.metadata,
          }));
          await index.upsert(batch);
        }
        logger.info(`Upserted ${vectors.length} vectors to Pinecone index (${this.pineconeIndexName}).`);
      } catch (err: any) {
        logger.warn(`Pinecone upsert notice (${err.message}). Cached in-memory vector store active.`);
      }
    }
  }

  async querySimilarity(
    queryVector: number[],
    topK = 5,
    filter?: VectorFilter,
    queryKeywords?: string
  ): Promise<VectorQueryResult[]> {
    if (this.pineconeClient && env.PINECONE_API_KEY) {
      try {
        const index = this.pineconeClient.index(this.pineconeIndexName);
        const pineconeFilter: Record<string, any> = {};
        if (filter?.department && filter.department !== 'All Departments') {
          pineconeFilter.department = filter.department;
        }
        if (filter?.collectionName && filter.collectionName !== 'All Collections') {
          pineconeFilter.collectionName = filter.collectionName;
        }
        if (filter?.documentId) {
          pineconeFilter.documentId = filter.documentId;
        }

        const adaptedQueryVector = this.adaptVectorToDimension(queryVector, 1024);

        const response = await index.query({
          vector: adaptedQueryVector,
          topK,
          includeMetadata: true,
          filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined,
        });

        if (response.matches && response.matches.length > 0) {
          return response.matches.map((m) => ({
            id: m.id,
            score: m.score || 0,
            metadata: m.metadata as VectorRecord['metadata'],
          }));
        }
      } catch (err: any) {
        logger.warn(`Pinecone query failed (${err.message}). Falling back to in-memory vector store.`);
      }
    }

    // In-memory Vector Search with Cosine Similarity + Keyword Salience Re-ranking
    return this.queryInMemory(queryVector, topK, filter, queryKeywords);
  }

  private extractSignificantTokens(query: string): string[] {
    if (!query) return [];
    const clean = query.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
    const rawTokens = clean.split(/\s+/).filter(Boolean);

    const tokens: Set<string> = new Set();
    for (const t of rawTokens) {
      if (t.includes('-')) {
        // e.g. "mht-cet" -> add "mht", "cet", "mhtcet"
        const parts = t.split('-');
        parts.forEach((p) => { if (!STOP_WORDS.has(p) && p.length > 1) tokens.add(p); });
        tokens.add(t.replace(/-/g, ''));
      } else {
        if (!STOP_WORDS.has(t) && t.length > 1) {
          tokens.add(t);
        }
      }
    }
    return Array.from(tokens);
  }

  private queryInMemory(
    queryVector: number[],
    topK = 5,
    filter?: VectorFilter,
    queryKeywords?: string
  ): VectorQueryResult[] {
    const results: VectorQueryResult[] = [];
    const significantTokens = queryKeywords ? this.extractSignificantTokens(queryKeywords) : [];

    for (const [id, record] of this.inMemoryStore.entries()) {
      // 1. Apply Metadata Filters
      if (filter?.department && filter.department !== 'All Departments' && record.metadata.department !== filter.department) {
        continue;
      }
      if (filter?.collectionName && filter.collectionName !== 'All Collections' && record.metadata.collectionName !== filter.collectionName) {
        continue;
      }
      if (filter?.documentId && record.metadata.documentId !== filter.documentId) {
        continue;
      }

      // 2. Cosine Vector Similarity
      const cosineSim = EmbeddingService.calculateCosineSimilarity(queryVector, record.values);

      // 3. Keyword / Salience Match
      let keywordScore = 0;
      if (significantTokens.length > 0 && record.metadata.text) {
        const textLower = record.metadata.text.toLowerCase();
        const textTokens = new Set(
          textLower.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean)
        );
        // Also add non-hyphenated forms
        for (const tt of Array.from(textTokens)) {
          if (tt.includes('-')) textTokens.add(tt.replace(/-/g, ''));
        }

        let matchCount = 0;
        for (const token of significantTokens) {
          if (textTokens.has(token) || textLower.includes(token)) {
            matchCount++;
          }
        }
        keywordScore = matchCount / significantTokens.length;
      }

      // Final hybrid score (Weighted combination: 60% semantic cosine + 40% keyword salience)
      const finalScore = significantTokens.length > 0
        ? cosineSim * 0.5 + keywordScore * 0.5
        : cosineSim;

      results.push({
        id,
        score: parseFloat(finalScore.toFixed(4)),
        metadata: record.metadata,
      });
    }

    // Sort descending by relevance score
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  async deleteDocumentVectors(documentId: string): Promise<void> {
    for (const [id, record] of this.inMemoryStore.entries()) {
      if (record.metadata.documentId === documentId) {
        this.inMemoryStore.delete(id);
      }
    }

    if (this.pineconeClient && env.PINECONE_API_KEY) {
      try {
        const index = this.pineconeClient.index(this.pineconeIndexName);
        await index.deleteMany({ filter: { documentId } });
      } catch (err: any) {
        logger.warn(`Pinecone delete failed: ${err.message}`);
      }
    }
  }

  getStoreSize(): number {
    return this.inMemoryStore.size;
  }
}

export const vectorStore = new VectorStore();
