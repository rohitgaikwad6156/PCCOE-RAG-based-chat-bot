import { Document } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { llmService } from '../llm/llmService';
import { constructFAQPrompt } from '../llm/prompts';
import { logger } from '../utils/logger';

export interface GeneratedFAQ {
  question: string;
  answer: string;
  category: string;
}

export class FAQService {
  async generateFAQs(documentId: string): Promise<GeneratedFAQ[]> {
    const doc = await Document.findById(documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    const chunks = await DocumentChunk.find({ documentId: doc._id })
      .sort({ chunkIndex: 1 })
      .limit(10)
      .lean();

    if (chunks.length === 0) {
      throw new Error('Document has no processed text chunks.');
    }

    const combinedText = chunks.map((c) => c.text).join('\n\n');
    const prompt = constructFAQPrompt(doc.title, combinedText);

    const responseText = await llmService.generateText(prompt, 1500);

    try {
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err: any) {
      logger.warn(`Failed to parse FAQ JSON from LLM: ${err.message}`);
    }

    // Fallback structured FAQs
    return [
      {
        question: `What is covered under the ${doc.title}?`,
        answer: `This document outlines official regulations, procedures, and timelines regarding ${doc.collectionName}.`,
        category: doc.collectionName,
      },
      {
        question: `Who is eligible or affected by ${doc.title}?`,
        answer: `Applies to students enrolled in ${doc.department} and affiliated college academic programs.`,
        category: doc.department,
      },
      {
        question: `Where can students get more information on ${doc.title}?`,
        answer: `Students should contact the respective department office or refer to official notifications.`,
        category: 'Support',
      },
    ];
  }
}

export const faqService = new FAQService();
