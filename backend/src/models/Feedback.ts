import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IFeedback extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  type: 'positive' | 'negative';
  comment?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['positive', 'negative'],
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
