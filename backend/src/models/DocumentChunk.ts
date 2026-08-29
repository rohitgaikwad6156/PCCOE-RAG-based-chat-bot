import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentChunk extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  chunkIndex: number;
  text: string;
  pageNumber: number;
  vectorId: string;
  department: string;
  collectionName: string;
  documentVersion: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    vectorId: {
      type: String,
      required: true,
      index: true,
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
    documentVersion: {
      type: Number,
      default: 1,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

DocumentChunkSchema.index({ documentId: 1, chunkIndex: 1 });

export const DocumentChunk = mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
