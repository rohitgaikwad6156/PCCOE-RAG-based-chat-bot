import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Collection } from '../models/Collection';
import { Document } from '../models/Document';
import { DEFAULT_DEPARTMENTS, DEFAULT_COLLECTIONS } from '../config/constants';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';

export class CollectionController {
  async getCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (isDbConnected()) {
        let collections = await Collection.find().sort({ name: 1 }).lean();

        if (collections.length === 0) {
          const defaultDocs = DEFAULT_COLLECTIONS.map((name) => ({
            name,
            description: `${name} official documents`,
            department: 'All Departments',
            documentCount: 0,
          }));
          await Collection.insertMany(defaultDocs).catch(() => {});
          collections = await Collection.find().sort({ name: 1 }).lean();
        }

        // Dynamically compute live document counts by collectionName from Document collection
        const docCounts = await Document.aggregate([
          { $match: { status: { $ne: 'archived' } } },
          { $group: { _id: '$collectionName', count: { $sum: 1 } } },
        ]);
        const countMap = new Map<string, number>();
        docCounts.forEach((item: any) => {
          if (item._id) countMap.set(item._id, item.count);
        });

        const collectionsWithCounts = collections.map((col: any) => ({
          ...col,
          documentCount: countMap.get(col.name) || 0,
        }));

        res.status(200).json({
          success: true,
          data: {
            collections: collectionsWithCounts,
            departments: DEFAULT_DEPARTMENTS,
          },
        });
        return;
      }

      // Memory DB fallback
      let collections = Array.from(memoryDb.collections.values());
      if (collections.length === 0) {
        collections = DEFAULT_COLLECTIONS.map((name, i) => ({
          _id: `col-${i + 1}`,
          name,
          description: `${name} official documents`,
          department: 'All Departments',
          documentCount: 0,
          createdAt: new Date(),
        }));
        collections.forEach((c) => memoryDb.collections.set(c._id, c));
      }

      // Compute document counts in memoryDb
      const memDocs = Array.from(memoryDb.documents.values()).filter((d: any) => d.status !== 'archived');
      const memCountMap = new Map<string, number>();
      memDocs.forEach((d: any) => {
        if (d.collectionName) {
          memCountMap.set(d.collectionName, (memCountMap.get(d.collectionName) || 0) + 1);
        }
      });

      const collectionsWithCounts = collections.map((col: any) => ({
        ...col,
        documentCount: memCountMap.get(col.name) || 0,
      }));

      res.status(200).json({
        success: true,
        data: {
          collections: collectionsWithCounts,
          departments: DEFAULT_DEPARTMENTS,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, department } = req.body;

      if (isDbConnected()) {
        const existing = await Collection.findOne({ name: name.trim() });
        if (existing) {
          res.status(400).json({ success: false, message: 'Collection with this name already exists' });
          return;
        }

        const col = await Collection.create({
          name: name.trim(),
          description: description ? description.trim() : '',
          department: department || 'All Departments',
        });

        res.status(201).json({
          success: true,
          message: 'Collection created successfully',
          data: col,
        });
        return;
      }

      const id = new mongoose.Types.ObjectId().toString();
      const newCol = {
        _id: id,
        name: name.trim(),
        description: description ? description.trim() : '',
        department: department || 'All Departments',
        documentCount: 0,
        createdAt: new Date(),
      };
      memoryDb.collections.set(id, newCol);

      res.status(201).json({
        success: true,
        message: 'Collection created successfully',
        data: newCol,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (isDbConnected()) {
        await Collection.findByIdAndDelete(id);
      } else {
        memoryDb.collections.delete(id);
      }

      res.status(200).json({
        success: true,
        message: 'Collection deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const collectionController = new CollectionController();
