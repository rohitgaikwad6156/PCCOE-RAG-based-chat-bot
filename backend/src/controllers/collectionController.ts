import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Collection } from '../models/Collection';
import { DEFAULT_DEPARTMENTS, DEFAULT_COLLECTIONS } from '../config/constants';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';

export class CollectionController {
  async getCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (isDbConnected()) {
        const collections = await Collection.find().sort({ name: 1 }).lean();
        res.status(200).json({
          success: true,
          data: {
            collections: collections.length > 0
              ? collections
              : DEFAULT_COLLECTIONS.map((name, i) => ({
                  _id: new mongoose.Types.ObjectId().toString(),
                  name,
                  description: `${name} official documents`,
                  department: 'All Departments',
                  documentCount: 0,
                })),
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
        }));
      }

      res.status(200).json({
        success: true,
        data: {
          collections,
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
