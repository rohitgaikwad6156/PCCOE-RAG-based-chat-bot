import { Document } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { llmService } from '../llm/llmService';
import { constructSummaryPrompt } from '../llm/prompts';

export class SummarizationService {
  async summarizeDocument(documentId: string): Promise<string> {
    const doc = await Document.findById(documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    const chunks = await DocumentChunk.find({ documentId: doc._id })
      .sort({ chunkIndex: 1 })
      .limit(10)
      .lean();

    if (chunks.length === 0) {
      throw new Error('Document has no processed text chunks to summarize.');
    }

    const combinedText = chunks.map((c) => c.text).join('\n\n');
    const prompt = constructSummaryPrompt(doc.title, combinedText);

    return await llmService.generateText(prompt, 1200);
  }
}

export const summarizationService = new SummarizationService();
