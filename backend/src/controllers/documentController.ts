import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { documentService } from '../services/documentService';
import { summarizationService } from '../services/summarizationService';
import { faqService } from '../services/faqService';
import { Document } from '../models/Document';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';

export class DocumentController {
  async uploadDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Please attach a document file to upload.' });
        return;
      }

      const { title, department, collectionName, version } = req.body;
      const uploadedBy = req.user!._id ? req.user!._id.toString() : req.user!.id;

      const doc = await documentService.processUploadedDocument(
        req.file,
        title,
        department,
        collectionName,
        uploadedBy,
        version ? parseInt(version, 10) : 1
      );

      res.status(201).json({
        success: true,
        message: 'Document uploaded and queued for text extraction and vector indexing.',
        data: doc,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getDocuments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, department, collectionName, status, page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isDbConnected()) {
        const query: Record<string, any> = {};

        if (search && typeof search === 'string') {
          query.title = { $regex: search, $options: 'i' };
        }
        if (department && department !== 'All Departments') {
          query.department = department;
        }
        if (collectionName && collectionName !== 'All Collections') {
          query.collectionName = collectionName;
        }
        if (status && status !== 'all') {
          query.status = status;
        }

        const skip = (pageNum - 1) * limitNum;

        const [documents, total] = await Promise.all([
          Document.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('uploadedBy', 'name email')
            .lean(),
          Document.countDocuments(query),
        ]);

        res.status(200).json({
          success: true,
          data: {
            documents,
            pagination: {
              total,
              page: pageNum,
              pages: Math.ceil(total / limitNum),
            },
          },
        });
        return;
      }

      // Memory DB fallback
      let allDocs = Array.from(memoryDb.documents.values());
      if (search && typeof search === 'string') {
        const s = (search as string).toLowerCase();
        allDocs = allDocs.filter((d: any) => d.title.toLowerCase().includes(s));
      }
      if (department && department !== 'All Departments') {
        allDocs = allDocs.filter((d: any) => d.department === department);
      }
      if (collectionName && collectionName !== 'All Collections') {
        allDocs = allDocs.filter((d: any) => d.collectionName === collectionName);
      }
      if (status && status !== 'all') {
        allDocs = allDocs.filter((d: any) => d.status === status);
      }

      const total = allDocs.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = allDocs.slice(startIndex, startIndex + limitNum);

      res.status(200).json({
        success: true,
        data: {
          documents: paginated,
          pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum) || 1,
          },
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getDocumentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (isDbConnected()) {
        const doc = await Document.findById(id).populate('uploadedBy', 'name email');
        if (!doc) {
          res.status(404).json({ success: false, message: 'Document not found' });
          return;
        }

        res.status(200).json({
          success: true,
          data: doc,
        });
        return;
      }

      const doc = memoryDb.documents.get(id);
      if (!doc) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, department, collectionName, status, version } = req.body;

      if (isDbConnected()) {
        const doc = await Document.findById(id);
        if (!doc) {
          res.status(404).json({ success: false, message: 'Document not found' });
          return;
        }

        if (title) doc.title = title.trim();
        if (department) doc.department = department;
        if (collectionName) doc.collectionName = collectionName;
        if (status) doc.status = status;
        if (version) doc.version = version;

        await doc.save();

        res.status(200).json({
          success: true,
          message: 'Document metadata updated successfully.',
          data: doc,
        });
        return;
      }

      const doc = memoryDb.documents.get(id);
      if (!doc) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }

      if (title) doc.title = title.trim();
      if (department) doc.department = department;
      if (collectionName) doc.collectionName = collectionName;
      if (status) doc.status = status;
      if (version) doc.version = version;

      res.status(200).json({
        success: true,
        message: 'Document metadata updated successfully.',
        data: doc,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const success = await documentService.deleteDocument(id);

      if (!success) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Document and all vector embeddings deleted successfully.',
      });
    } catch (error: any) {
      next(error);
    }
  }

  async reprocessDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const doc = await documentService.reprocessDocument(id);

      if (!doc) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Document reprocessing initiated.',
        data: doc,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const summary = await summarizationService.summarizeDocument(id);

      res.status(200).json({
        success: true,
        data: { summary },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getFAQs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const faqs = await faqService.generateFAQs(id);

      res.status(200).json({
        success: true,
        data: { faqs },
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
