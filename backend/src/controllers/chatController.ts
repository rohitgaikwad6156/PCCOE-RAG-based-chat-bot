import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { ragService } from '../services/ragService';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';

export class ChatController {
  async askQuestion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, conversationId, departmentFilter, collectionFilter } = req.body;
      const userId = req.user!._id ? req.user!._id.toString() : req.user!.id;

      const result = await ragService.answerQuestion(
        question,
        userId,
        conversationId,
        departmentFilter,
        collectionFilter
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id ? req.user!._id.toString() : req.user!.id;

      if (isDbConnected()) {
        const conversations = await Conversation.find({ userId })
          .sort({ updatedAt: -1 })
          .limit(30)
          .lean();

        res.status(200).json({
          success: true,
          data: conversations,
        });
        return;
      }

      // Memory DB fallback
      const list = Array.from(memoryDb.conversations.values())
        .filter((c: any) => c.userId === userId || c.userId === req.user!._id?.toString())
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getConversationMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!._id ? req.user!._id.toString() : req.user!.id;

      if (isDbConnected()) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          res.status(400).json({ success: false, message: 'Invalid conversation ID format' });
          return;
        }

        const conversation = await Conversation.findOne({ _id: id, userId });
        if (!conversation) {
          res.status(404).json({ success: false, message: 'Conversation not found' });
          return;
        }

        const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).lean();

        res.status(200).json({
          success: true,
          data: {
            conversation,
            messages,
          },
        });
        return;
      }

      // Memory DB fallback
      const conversation = memoryDb.conversations.get(id);
      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }

      const messages = Array.from(memoryDb.messages.values())
        .filter((m: any) => m.conversationId === id)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      res.status(200).json({
        success: true,
        data: {
          conversation,
          messages,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!._id ? req.user!._id.toString() : req.user!.id;

      if (isDbConnected()) {
        const conversation = await Conversation.findOneAndDelete({ _id: id, userId });
        if (!conversation) {
          res.status(404).json({ success: false, message: 'Conversation not found' });
          return;
        }

        await Message.deleteMany({ conversationId: id });
        res.status(200).json({
          success: true,
          message: 'Conversation deleted successfully.',
        });
        return;
      }

      // Memory DB fallback
      memoryDb.conversations.delete(id);
      for (const [msgId, msg] of memoryDb.messages.entries()) {
        if (msg.conversationId === id) {
          memoryDb.messages.delete(msgId);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully.',
      });
    } catch (error: any) {
      next(error);
    }
  }

  async exportConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { format } = req.query;
      const userId = req.user!._id ? req.user!._id.toString() : req.user!.id;

      let conversation: any = null;
      let messages: any[] = [];

      if (isDbConnected()) {
        conversation = await Conversation.findOne({ _id: id, userId });
        if (!conversation) {
          res.status(404).json({ success: false, message: 'Conversation not found' });
          return;
        }
        messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).lean();
      } else {
        conversation = memoryDb.conversations.get(id);
        if (!conversation) {
          res.status(404).json({ success: false, message: 'Conversation not found' });
          return;
        }
        messages = Array.from(memoryDb.messages.values())
          .filter((m: any) => m.conversationId === id)
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      if (format === 'txt') {
        let txt = `====================================================\n`;
        txt += `PCCOE Pune Information Assistant — Chat Transcript\n`;
        txt += `Title: ${conversation.title}\n`;
        txt += `Date: ${new Date(conversation.createdAt).toLocaleString()}\n`;
        txt += `====================================================\n\n`;

        messages.forEach((m: any) => {
          txt += `[${new Date(m.createdAt).toLocaleTimeString()}] ${m.role === 'user' ? 'Student' : 'PCCOE Assistant'}:\n${m.content}\n\n`;
          if (m.sources && m.sources.length > 0) {
            txt += `Sources Cited:\n`;
            m.sources.forEach((s: any) => {
              txt += `- ${s.documentTitle} (Page ${s.pageNumber}) [Relevance: ${s.relevanceScore}%]\n`;
            });
            txt += `\n`;
          }
          txt += `----------------------------------------------------\n\n`;
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="pccoe-chat-${id}.txt"`);
        res.send(txt);
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          conversation,
          messages,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
