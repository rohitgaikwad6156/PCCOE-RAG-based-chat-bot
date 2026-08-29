import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class LLMService {
  async generateText(prompt: string, maxTokens = 1200): Promise<string> {
    // 1. Live OpenRouter API (Access to Gemini 2.0, Claude 3.5, LLaMA 3.3, GPT-4o)
    if (env.OPENROUTER_API_KEY) {
      try {
        const text = await this.callOpenRouter(prompt, maxTokens);
        if (text) return text;
      } catch (err: any) {
        logger.warn(`OpenRouter notice: ${err.response?.data?.error?.message || err.message}. Trying backup providers...`);
      }
    }

    // 2. Live Google Gemini API (if valid Google AI Studio key provided)
    if (env.GEMINI_API_KEY && !env.GEMINI_API_KEY.startsWith('AQ.')) {
      try {
        const text = await this.callGemini(prompt, maxTokens);
        if (text) return text;
      } catch (err: any) {
        logger.warn(`Gemini notice: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    // 3. Live OpenAI API (if credits active)
    if (env.OPENAI_API_KEY) {
      try {
        const text = await this.callOpenAI(prompt, maxTokens);
        if (text) return text;
      } catch (err: any) {
        logger.warn(`OpenAI notice: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    // 4. Grounded Extractor Fallback
    return this.generateDeterministicGroundedResponse(prompt);
  }

  private async callOpenRouter(prompt: string, maxTokens: number): Promise<string> {
    const modelsToTry = [
      'openrouter/auto',
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-chat',
      'google/gemini-2.0-flash-001',
    ];

    for (const model of modelsToTry) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: 0.2,
          },
          {
            headers: {
              Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5173',
              'X-Title': 'PCCOE RAG Assistant',
            },
            timeout: 15000,
          }
        );

        const text = response.data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (e) {
        // try next candidate model
      }
    }

    throw new Error('OpenRouter models could not generate response');
  }

  private async callGemini(prompt: string, maxTokens: number): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.2,
        },
      },
      { timeout: 12000 }
    );

    const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) {
      return candidate.trim();
    }
    throw new Error('Invalid response received from Gemini API');
  }

  private async callOpenAI(prompt: string, maxTokens: number): Promise<string> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 12000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (text) {
      return text.trim();
    }
    throw new Error('Invalid response received from OpenAI API');
  }

  private generateDeterministicGroundedResponse(prompt: string): string {
    const contextMatch = prompt.match(/### RETRIEVED (?:PCCOE )?COLLEGE CONTEXT:\n([\s\S]*?)\n### CURRENT STUDENT QUESTION:/i);
    const questionMatch = prompt.match(/### CURRENT STUDENT QUESTION:\n"([^"]+)"/);

    const context = contextMatch ? contextMatch[1].trim() : '';
    const question = questionMatch ? questionMatch[1].trim() : '';

    if (!context || context.includes('[NO PCCOE COLLEGE DOCUMENTS MATCHED THIS QUERY]')) {
      return `I couldn't find reliable information about this in the available PCCOE Pune knowledge base. Please contact the PCCOE Academic Section (Sector 26, Pradhikaran, Nigdi, Pune) or refer to the official college circulars at www.pccoepune.com.`;
    }

    const lines = context.split('\n').filter((l) => l.trim().length > 0);
    const relevantLines: string[] = [];

    const queryTerms = question.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    for (const line of lines) {
      if (line.startsWith('[Source') || line.startsWith('---') || line.startsWith('##')) continue;
      const lineLower = line.toLowerCase();
      if (queryTerms.some((term) => lineLower.includes(term))) {
        relevantLines.push(line.replace(/^[#-*\s]+/, '').trim());
      }
    }

    if (relevantLines.length > 0) {
      return `Based on official PCCOE documentation:\n\n` +
        relevantLines.slice(0, 10).map((l) => `• ${l}`).join('\n') +
        `\n\n*Refer to the attached source references below for full official details.*`;
    }

    const cleanContext = context.replace(/\[Source[^\]]*\]/g, '').replace(/---/g, '').trim();
    const firstParagraph = cleanContext.split('\n\n')[0] || cleanContext;
    return `Based on official PCCOE documentation:\n\n${firstParagraph.slice(0, 500)}...\n\n*Refer to the attached source references below for full details.*`;
  }
}

export const llmService = new LLMService();
