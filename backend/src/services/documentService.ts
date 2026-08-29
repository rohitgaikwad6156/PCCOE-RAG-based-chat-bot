import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Document, IDocument } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { extractTextFromFile } from '../document/textExtractor';
import { chunkDocumentPages } from '../document/chunker';
import { embeddingService } from '../embeddings/embeddingService';
import { vectorStore, VectorRecord } from '../vector/vectorStore';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';
import { logger } from '../utils/logger';

export class DocumentService {
  async processUploadedDocument(
    file: Express.Multer.File,
    title: string,
    department: string,
    collectionName: string,
    uploadedByUserId: string,
    version = 1
  ): Promise<any> {
    const docId = new mongoose.Types.ObjectId().toString();

    let doc: any;
    if (isDbConnected()) {
      doc = await Document.create({
        title: title || file.originalname,
        filename: file.filename,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype || 'application/octet-stream',
        fileSize: file.size,
        department: department || 'All Departments',
        collectionName: collectionName || 'Academics',
        version,
        status: 'processing',
        processingProgress: 10,
        processingStage: 'Extracting text',
        uploadedBy: new mongoose.Types.ObjectId(uploadedByUserId),
      });
    } else {
      doc = {
        _id: new mongoose.Types.ObjectId(docId),
        id: docId,
        title: title || file.originalname,
        filename: file.filename,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype || 'application/octet-stream',
        fileSize: file.size,
        department: department || 'All Departments',
        collectionName: collectionName || 'Academics',
        version,
        status: 'processing',
        processingProgress: 10,
        processingStage: 'Extracting text',
        chunkCount: 0,
        pageCount: 1,
        uploadedBy: { _id: uploadedByUserId, name: 'Admin', email: 'admin@college.edu' },
        createdAt: new Date(),
        updatedAt: new Date(),
        save: async () => {},
      };
      memoryDb.documents.set(docId, doc);
    }

    const targetId = doc._id ? doc._id.toString() : doc.id;
    this.runIngestionPipeline(targetId, file.path, doc.title, doc.department, doc.collectionName, doc.version).catch((err) => {
      logger.error(`Error in background ingestion pipeline for doc ${targetId}: ${err.message}`);
    });

    return doc;
  }

  async runIngestionPipeline(
    documentId: string,
    filePath: string,
    title: string,
    department: string,
    collectionName: string,
    version: number
  ): Promise<void> {
    let doc: any = isDbConnected() ? await Document.findById(documentId) : memoryDb.documents.get(documentId);
    if (!doc) return;

    try {
      doc.processingProgress = 25;
      doc.processingStage = 'Extracting text';
      if (isDbConnected()) await doc.save();

      const extraction = await extractTextFromFile(filePath, doc.fileType);
      if (!extraction.rawText || extraction.rawText.trim().length === 0) {
        throw new Error('No readable text found in document.');
      }

      doc.pageCount = extraction.totalPages;
      doc.processingProgress = 50;
      doc.processingStage = 'Creating text chunks';
      if (isDbConnected()) await doc.save();

      const chunks = chunkDocumentPages(extraction.pages, {
        documentId,
        documentTitle: title,
        department,
        collectionName,
        documentVersion: version,
      });

      if (chunks.length === 0) {
        throw new Error('Document produced 0 text chunks during chunking.');
      }

      doc.processingProgress = 75;
      doc.processingStage = 'Generating vector embeddings';
      if (isDbConnected()) await doc.save();

      const vectorRecords: VectorRecord[] = [];
      const dbChunkDocs = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const vectorValues = await embeddingService.generateEmbedding(chunk.text);

        vectorRecords.push({
          id: chunk.vectorId,
          values: vectorValues,
          metadata: {
            documentId,
            documentTitle: title,
            department,
            collectionName,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
          },
        });

        dbChunkDocs.push({
          documentId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          pageNumber: chunk.pageNumber,
          vectorId: chunk.vectorId,
          department,
          collectionName,
          documentVersion: version,
          metadata: chunk.metadata,
        });
      }

      doc.processingProgress = 90;
      doc.processingStage = 'Indexing in vector database';
      if (isDbConnected()) await doc.save();

      await vectorStore.upsertVectors(vectorRecords);

      if (isDbConnected()) {
        await DocumentChunk.deleteMany({ documentId });
        await DocumentChunk.insertMany(dbChunkDocs);
      } else {
        memoryDb.documentChunks.set(documentId, dbChunkDocs);
      }

      doc.status = 'processed';
      doc.processingProgress = 100;
      doc.processingStage = 'Ready';
      doc.chunkCount = chunks.length;
      doc.errorMessage = undefined;
      if (isDbConnected()) await doc.save();

      logger.info(`Successfully ingested document "${doc.title}" (${chunks.length} chunks, ${extraction.totalPages} pages)`);
    } catch (error: any) {
      logger.error(`Document processing failed for "${doc.title}": ${error.message}`);
      doc.status = 'failed';
      doc.processingStage = 'Failed';
      doc.errorMessage = error.message;
      if (isDbConnected()) await doc.save();
    }
  }

  async reprocessDocument(documentId: string): Promise<any> {
    const doc: any = isDbConnected() ? await Document.findById(documentId) : memoryDb.documents.get(documentId);
    if (!doc) return null;

    const fullPath = path.resolve(__dirname, '../../uploads', doc.filename);
    if (!fs.existsSync(fullPath)) {
      throw new Error('Original document file is no longer available on server.');
    }

    doc.status = 'processing';
    doc.processingProgress = 10;
    doc.processingStage = 'Reprocessing initiated';
    doc.errorMessage = undefined;
    if (isDbConnected()) await doc.save();

    await vectorStore.deleteDocumentVectors(documentId);

    this.runIngestionPipeline(documentId, fullPath, doc.title, doc.department, doc.collectionName, doc.version).catch((err) => {
      logger.error(`Reprocessing error for doc ${documentId}: ${err.message}`);
    });

    return doc;
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    if (isDbConnected()) {
      await DocumentChunk.deleteMany({ documentId });
      await Document.findByIdAndDelete(documentId);
    } else {
      memoryDb.documents.delete(documentId);
      memoryDb.documentChunks.delete(documentId);
    }

    await vectorStore.deleteDocumentVectors(documentId);
    logger.info(`Deleted document ${documentId} and all associated chunks and vectors.`);
    return true;
  }
}

export const documentService = new DocumentService();
