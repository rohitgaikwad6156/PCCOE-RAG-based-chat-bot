import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { adminService } from '../services/adminService';
import { User } from '../models/User';

export class AdminController {
  async getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardMetrics();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getAnalytics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await adminService.getAnalyticsData();
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, role, page = '1', limit = '20' } = req.query;
      const query: Record<string, any> = {};

      if (search && typeof search === 'string') {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }
      if (role && role !== 'all') {
        query.role = role;
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        User.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
