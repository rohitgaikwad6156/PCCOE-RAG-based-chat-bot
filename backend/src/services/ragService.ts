import mongoose from 'mongoose';
import { RAG_CONFIG } from '../config/constants';
import { embeddingService } from '../embeddings/embeddingService';
import { vectorStore, VectorQueryResult } from '../vector/vectorStore';
import { structuredKnowledgeService } from './structuredKnowledgeService';
import { llmService } from '../llm/llmService';
import { constructRAGPrompt } from '../llm/prompts';
import { Conversation } from '../models/Conversation';
import { Message, ISourceRef } from '../models/Message';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';
import { logger } from '../utils/logger';

export interface RAGAnswerResult {
  messageId: string;
  conversationId: string;
  answer: string;
  sources: ISourceRef[];
  isGrounded: boolean;
  confidenceScore: number;
  confidenceLabel: 'High' | 'Medium' | 'Low';
}

const GREETINGS = [
  'hi',
  'hello',
  'hey',
  'namaste',
  'good morning',
  'good afternoon',
  'good evening',
  'who are you',
  'what can you do',
  'help',
  'hii',
  'helo',
];

export class RAGService {
  async answerQuestion(
    question: string,
    userId: string,
    conversationId?: string,
    departmentFilter?: string,
    collectionFilter?: string
  ): Promise<RAGAnswerResult> {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      throw new Error('Question cannot be empty');
    }

    console.log('\n======================================================');
    console.log(`🔍 [RAG PIPELINE START] Question: "${trimmedQuestion}"`);
    console.log('======================================================');

    let conv: any = null;
    let historyForPrompt: Array<{ role: string; content: string }> = [];

    // 1. Get or create conversation session
    if (isDbConnected()) {
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        conv = await Conversation.findById(conversationId);
      }
      if (!conv) {
        conv = await Conversation.create({
          userId: new mongoose.Types.ObjectId(userId),
          title: trimmedQuestion.slice(0, 40) + (trimmedQuestion.length > 40 ? '...' : ''),
          departmentFilter: departmentFilter || 'All Departments',
          collectionFilter: collectionFilter || 'All Collections',
        });
      }

      const previousMessages = await Message.find({ conversationId: conv._id })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

      historyForPrompt = previousMessages.reverse().map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await Message.create({
        conversationId: conv._id,
        role: 'user',
        content: trimmedQuestion,
        sources: [],
        isGrounded: false,
      });
    } else {
      // Memory DB fallback
      const activeId = (conversationId && memoryDb.conversations.has(conversationId))
        ? conversationId
        : new mongoose.Types.ObjectId().toString();

      conv = memoryDb.conversations.get(activeId);
      if (!conv) {
        conv = {
          _id: new mongoose.Types.ObjectId(activeId),
          id: activeId,
          userId,
          title: trimmedQuestion.slice(0, 40) + (trimmedQuestion.length > 40 ? '...' : ''),
          departmentFilter: departmentFilter || 'All Departments',
          collectionFilter: collectionFilter || 'All Collections',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryDb.conversations.set(activeId, conv);
      }

      const msgs = Array.from(memoryDb.messages.values()).filter(
        (m: any) => m.conversationId === activeId
      );
      historyForPrompt = msgs.slice(-6).map((m: any) => ({ role: m.role, content: m.content }));

      const userMsgId = new mongoose.Types.ObjectId().toString();
      memoryDb.messages.set(userMsgId, {
        _id: new mongoose.Types.ObjectId(userMsgId),
        id: userMsgId,
        conversationId: activeId,
        role: 'user',
        content: trimmedQuestion,
        sources: [],
        isGrounded: false,
        createdAt: new Date(),
      });
    }

    const cleanLower = trimmedQuestion.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const isGreeting = GREETINGS.includes(cleanLower);

    let answerText = '';
    let sources: ISourceRef[] = [];
    let isGrounded = false;
    let confidenceScore = 0;
    let confidenceLabel: 'High' | 'Medium' | 'Low' = 'Low';

    if (isGreeting) {
      console.log('💬 Query recognized as greeting. Returning PCCOE greeting overview.');
      answerText = `Hello! I am the official Digital Information Assistant for **Pimpri Chinchwad College of Engineering (PCCOE), Pune** (Autonomous, NAAC 'A' Grade, DTE Code: 6175).\n\nI can assist you with verified information on:\n• **Autonomous Examinations**: In-Sem (ISE/CIE) & End-Sem (ESE) schedules, 75% attendance rules, and exam regulations\n• **CAP Admissions 2026-27**: DTE Code 6175, MHT-CET & JEE Main cutoffs for all branches, documents required\n• **Departments & Programs**: B.Tech (Computer, IT, ENTC, Mechanical, Civil, AI-ML), M.Tech, MCA, Ph.D.\n• **Collegiate Clubs**: ITSA (IT Dept), Team Red Baron (SAE Baja), Team Kratos Racing Electric (Formula Student), Coding Club, Team Automatons, Team Maverick India\n• **Training & Placement**: Highest: Rs. 61 LPA | Average: Rs. 8.4 LPA | 650+ companies visiting annually\n• **Scholarships**: EBC (50% waiver), TFWS (100%), SC/ST (100%), OBC freeship via MahaDBT\n• **Campus Facilities**: Hostel (Boys & Girls), Dr. APJ Abdul Kalam Central Library, Sports, NSS, Art Circle\n• **Rankings 2026**: Times 12th (Top 175 India), Week 8th (Maharashtra Private), India Today 59th (Private India)\n\nHow can I assist you today?`;
      isGrounded = true;
      confidenceScore = 0.95;
      confidenceLabel = 'High';
      sources = [];
    } else {
      // 2. Query Structured Knowledge from MongoDB
      console.log('🏛️ Querying Structured Knowledge Base in MongoDB...');
      const structuredData = await structuredKnowledgeService.queryStructuredKnowledge(trimmedQuestion);
      const hasStructuredData = structuredData.length > 0;
      if (hasStructuredData) {
        console.log(`✅ Retrieved structured data (${structuredData.length} chars) from MongoDB.`);
      }

      // 3. Generate Query Embedding
      console.log('⚡ Generating question embedding...');
      const queryEmbedding = await embeddingService.generateEmbedding(trimmedQuestion);
      console.log(`✅ Question embedding generated (Dimension: ${queryEmbedding.length})`);

      // 4. Vector Similarity Search
      const filter = {
        department: departmentFilter || conv.departmentFilter,
        collectionName: collectionFilter || conv.collectionFilter,
      };

      console.log('🔎 Executing Vector Similarity Search in Vector Store...');
      const retrievedMatches = await vectorStore.querySimilarity(
        queryEmbedding,
        RAG_CONFIG.TOP_K,
        filter,
        trimmedQuestion
      );

      console.log(`📊 Vector Search Returned ${retrievedMatches.length} candidate chunk(s):`);
      retrievedMatches.forEach((m, idx) => {
        const isAccepted = m.score >= RAG_CONFIG.RELEVANCE_THRESHOLD;
        console.log(`  ${idx + 1}. [${isAccepted ? 'ACCEPTED' : 'REJECTED'}] Score: ${m.score} | Doc: "${m.metadata.documentTitle}" (Page ${m.metadata.pageNumber}) | Chunk: ${m.id}`);
      });

      // 5. Evaluate Relevance Threshold
      const validMatches = retrievedMatches.filter(
        (m) => m.score >= RAG_CONFIG.RELEVANCE_THRESHOLD
      );

      if (validMatches.length > 0 || hasStructuredData) {
        let contextBuffer = '';
        const sourceMap = new Map<string, ISourceRef>();

        if (hasStructuredData) {
          contextBuffer += `[PCCOE Official Structured Database Records]\n${structuredData}\n\n---\n\n`;
          sourceMap.set('structured-db', {
            documentId: 'pccoe-structured-database',
            documentTitle: 'PCCOE Official Institutional Database',
            pageNumber: 1,
            relevanceScore: 95,
            relevanceLabel: 'High',
            snippet: structuredData.slice(0, 200),
          });
        }

        validMatches.forEach((match, idx) => {
          const docTitle = match.metadata.documentTitle || 'PCCOE Document';
          const pageNum = match.metadata.pageNumber || 1;
          const snippet = match.metadata.text ? match.metadata.text.slice(0, 250) : '';

          contextBuffer += `[Document Source ${idx + 1}: ${docTitle} (Page ${pageNum})]\n${match.metadata.text}\n\n---\n\n`;

          const sourceKey = `${match.metadata.documentId}-p${pageNum}`;
          if (!sourceMap.has(sourceKey)) {
            sourceMap.set(sourceKey, {
              documentId: match.metadata.documentId,
              documentTitle: docTitle,
              pageNumber: pageNum,
              relevanceScore: Math.round(match.score * 100),
              relevanceLabel: match.score >= 0.70 ? 'High' : 'Medium',
              snippet,
            });
          }
        });

        console.log(`\n📦 Constructed Context Length: ${contextBuffer.length} characters.`);
        console.log('🤖 Sending Question + Context to LLM...');

        // 6. Generate LLM Answer
        const prompt = constructRAGPrompt(trimmedQuestion, contextBuffer, historyForPrompt);
        answerText = await llmService.generateText(prompt);

        console.log(`✅ LLM Generated Answer (${answerText.length} chars).`);

        // Check if LLM determined the knowledge was absent
        const ansLower = answerText.toLowerCase();
        const isRefusal =
          ansLower.includes("couldn't find reliable information") ||
          ansLower.includes("could not find reliable information") ||
          ansLower.includes("not mentioned in the provided") ||
          ansLower.includes("not available in the provided") ||
          ansLower.includes("not found in the available pccoe");

        if (isRefusal) {
          isGrounded = false;
          confidenceScore = 0;
          confidenceLabel = 'Low';
          sources = [];
          console.log('ℹ️ LLM determined query is out-of-scope of provided context. Cleared sources.');
        } else {
          isGrounded = true;
          const topScore = validMatches.length > 0 ? validMatches[0].score : 0.95;
          confidenceScore = topScore;
          confidenceLabel = topScore >= 0.70 ? 'High' : topScore >= 0.45 ? 'Medium' : 'Low';
          sources = Array.from(sourceMap.values());
        }
      } else {
        console.log(`⚠️ No chunks met relevance threshold (${RAG_CONFIG.RELEVANCE_THRESHOLD}) and no structured records matched. Returning ungrounded notice.`);
        answerText = `I couldn't find reliable information about this in the available PCCOE Pune knowledge base. Please contact the PCCOE Academic Section (Sector 26, Pradhikaran, Nigdi, Pune) or refer to the official college circulars at www.pccoepune.com.`;
        isGrounded = false;
        confidenceScore = 0;
        confidenceLabel = 'Low';
        sources = [];
      }
    }

    console.log(`📚 Sources Attached: ${sources.length}`);
    console.log('======================================================\n');

    let assistantMsgId = '';
    const convIdStr = conv._id ? conv._id.toString() : conv.id;

    if (isDbConnected()) {
      const assistantMessage = await Message.create({
        conversationId: conv._id,
        role: 'assistant',
        content: answerText,
        sources,
        isGrounded,
        confidenceScore,
        confidenceLabel,
      });
      assistantMsgId = assistantMessage._id.toString();

      conv.updatedAt = new Date();
      await conv.save();
    } else {
      assistantMsgId = new mongoose.Types.ObjectId().toString();
      memoryDb.messages.set(assistantMsgId, {
        _id: new mongoose.Types.ObjectId(assistantMsgId),
        id: assistantMsgId,
        conversationId: convIdStr,
        role: 'assistant',
        content: answerText,
        sources,
        isGrounded,
        confidenceScore,
        confidenceLabel,
        createdAt: new Date(),
      });
      conv.updatedAt = new Date();
    }

    return {
      messageId: assistantMsgId,
      conversationId: convIdStr,
      answer: answerText,
      sources,
      isGrounded,
      confidenceScore,
      confidenceLabel,
    };
  }
}

export const ragService = new RAGService();
