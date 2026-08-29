import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ISourceRef {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  relevanceScore: number;
  relevanceLabel: 'High' | 'Medium' | 'Low';
  snippet: string;
}

export interface IMessage extends MongooseDocument {
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources: ISourceRef[];
  isGrounded: boolean;
  language?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [
      {
        documentId: { type: String, required: true },
        documentTitle: { type: String, required: true },
        pageNumber: { type: Number, default: 1 },
        relevanceScore: { type: Number, default: 0 },
        relevanceLabel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
        snippet: { type: String, default: '' },
      },
    ],
    isGrounded: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
