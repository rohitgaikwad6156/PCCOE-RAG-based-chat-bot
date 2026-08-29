import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type DocumentStatus = 'uploaded' | 'processing' | 'processed' | 'failed' | 'archived';

export interface IDocument extends MongooseDocument {
  title: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  department: string;
  collectionName: string;
  version: number;
  status: DocumentStatus;
  processingProgress: number; // 0 to 100
  processingStage?: string;
  errorMessage?: string;
  chunkCount: number;
  pageCount: number;
  uploadedBy: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      default: 'All Departments',
      index: true,
    },
    collectionName: {
      type: String,
      default: 'Academics',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed', 'archived'],
      default: 'uploaded',
      index: true,
    },
    processingProgress: {
      type: Number,
      default: 0,
    },
    processingStage: {
      type: String,
      default: 'Queued',
    },
    errorMessage: {
      type: String,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const Document = mongoose.model<IDocument>('Document', DocumentSchema);
