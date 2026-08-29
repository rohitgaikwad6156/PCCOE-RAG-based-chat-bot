import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';

export interface AuthRequest extends Request {
  user?: IUser | any;
}

interface JwtPayload {
  userId: string;
  role: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    let user;
    if (isDbConnected()) {
      user = await User.findById(decoded.userId);
    } else {
      user = memoryDb.users.get(decoded.userId);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User associated with token no longer exists.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required for this operation.',
    });
    return;
  }
  next();
}
