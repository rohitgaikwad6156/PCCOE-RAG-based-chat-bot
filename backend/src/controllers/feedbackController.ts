import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Feedback } from '../models/Feedback';

export class FeedbackController {
  async submitFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId, type, comment } = req.body;
      const userId = req.user!._id;

      if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
        res.status(400).json({ success: false, message: 'Valid message ID is required' });
        return;
      }

      const feedback = await Feedback.create({
        userId,
        messageId: new mongoose.Types.ObjectId(messageId),
        type,
        comment: comment?.trim(),
      });

      res.status(201).json({
        success: true,
        message: 'Feedback recorded. Thank you!',
        data: feedback,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const feedbackController = new FeedbackController();
