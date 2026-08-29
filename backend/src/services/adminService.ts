import { Document } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { User } from '../models/User';
import { Message } from '../models/Message';
import { Feedback } from '../models/Feedback';
import { vectorStore } from '../vector/vectorStore';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';

export class AdminService {
  async getDashboardMetrics() {
    if (isDbConnected()) {
      const [
        totalDocuments,
        processedDocuments,
        processingDocuments,
        failedDocuments,
        totalUsers,
        totalQuestions,
        positiveFeedback,
        negativeFeedback,
        recentUploads,
      ] = await Promise.all([
        Document.countDocuments({ status: { $ne: 'archived' } }),
        Document.countDocuments({ status: 'processed' }),
        Document.countDocuments({ status: 'processing' }),
        Document.countDocuments({ status: 'failed' }),
        User.countDocuments(),
        Message.countDocuments({ role: 'user' }),
        Feedback.countDocuments({ type: 'positive' }),
        Feedback.countDocuments({ type: 'negative' }),
        Document.find().sort({ createdAt: -1 }).limit(5).populate('uploadedBy', 'name email').lean(),
      ]);

      const totalChunks = await DocumentChunk.countDocuments();
      const vectorCount = vectorStore.getStoreSize() || totalChunks;

      const satisfactionRate =
        positiveFeedback + negativeFeedback > 0
          ? Math.round((positiveFeedback / (positiveFeedback + negativeFeedback)) * 100)
          : 100;

      return {
        totalDocuments,
        processedDocuments,
        processingDocuments,
        failedDocuments,
        totalChunks,
        vectorCount,
        totalUsers,
        totalQuestions,
        positiveFeedback,
        negativeFeedback,
        satisfactionRate,
        recentUploads,
      };
    }

    // Memory DB fallback
    const allDocs = Array.from(memoryDb.documents.values());
    const totalDocuments = allDocs.length;
    const processedDocuments = allDocs.filter((d: any) => d.status === 'processed').length;
    const processingDocuments = allDocs.filter((d: any) => d.status === 'processing').length;
    const failedDocuments = allDocs.filter((d: any) => d.status === 'failed').length;

    let totalChunks = 0;
    for (const chunks of memoryDb.documentChunks.values()) {
      totalChunks += chunks.length;
    }
    const vectorCount = vectorStore.getStoreSize() || totalChunks;

    const totalUsers = memoryDb.users.size;
    const allMessages = Array.from(memoryDb.messages.values());
    const totalQuestions = allMessages.filter((m: any) => m.role === 'user').length;

    const allFeedback = Array.from(memoryDb.feedbacks.values());
    const positiveFeedback = allFeedback.filter((f: any) => f.type === 'positive').length;
    const negativeFeedback = allFeedback.filter((f: any) => f.type === 'negative').length;

    const satisfactionRate =
      positiveFeedback + negativeFeedback > 0
        ? Math.round((positiveFeedback / (positiveFeedback + negativeFeedback)) * 100)
        : 100;

    const recentUploads = allDocs.slice(-5).reverse();

    return {
      totalDocuments,
      processedDocuments,
      processingDocuments,
      failedDocuments,
      totalChunks,
      vectorCount,
      totalUsers,
      totalQuestions,
      positiveFeedback,
      negativeFeedback,
      satisfactionRate,
      recentUploads,
    };
  }

  async getAnalyticsData() {
    let recentMessages: any[] = [];

    if (isDbConnected()) {
      recentMessages = await Message.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    } else {
      recentMessages = Array.from(memoryDb.messages.values())
        .filter((m: any) => m.role === 'user')
        .slice(-50)
        .reverse();
    }

    const topicMap: Record<string, number> = {
      'Exams & Schedules': 0,
      'Admissions & Eligibility': 0,
      'Hostel & Accommodation': 0,
      'Scholarships & Fees': 0,
      'Placements & Careers': 0,
      'Library & Timings': 0,
      'Other Queries': 0,
    };

    for (const msg of recentMessages) {
      const text = (msg.content || '').toLowerCase();
      if (text.includes('exam') || text.includes('schedule') || text.includes('calendar') || text.includes('ese') || text.includes('ise')) {
        topicMap['Exams & Schedules']++;
      } else if (text.includes('admiss') || text.includes('eligib') || text.includes('apply') || text.includes('cutoff') || text.includes('6175')) {
        topicMap['Admissions & Eligibility']++;
      } else if (text.includes('hostel') || text.includes('room') || text.includes('mess') || text.includes('nigdi')) {
        topicMap['Hostel & Accommodation']++;
      } else if (text.includes('scholarship') || text.includes('fee') || text.includes('waiver') || text.includes('mahadbt') || text.includes('ebc')) {
        topicMap['Scholarships & Fees']++;
      } else if (text.includes('placement') || text.includes('package') || text.includes('recruit') || text.includes('t&p')) {
        topicMap['Placements & Careers']++;
      } else if (text.includes('library') || text.includes('book') || text.includes('timing')) {
        topicMap['Library & Timings']++;
      } else {
        topicMap['Other Queries']++;
      }
    }

    const topics = Object.entries(topicMap).map(([topic, count]) => ({ topic, count }));

    return {
      topics,
      totalAnalyzed: recentMessages.length,
    };
  }
}

export const adminService = new AdminService();
