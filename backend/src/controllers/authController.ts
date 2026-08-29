import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, department } = req.body;
      // Note: role is intentionally NOT accepted from req.body — assigned server-side
      const result = await authService.signup(name, email, password, department);
      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: authService.formatUser(req.user),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Google OAuth endpoint.
   * Only the `credential` field (Google ID token) is accepted.
   * Email, name, googleId sent directly from frontend are ignored — identity comes from verified token only.
   */
  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { credential } = req.body;
      const result = await authService.googleAuth({ credential });
      res.status(200).json({
        success: true,
        message: 'Signed in with Google successfully.',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }
}

export const authController = new AuthController();
