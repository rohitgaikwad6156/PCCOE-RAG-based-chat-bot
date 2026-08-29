import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.post(
  '/signup',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['student', 'admin']).withMessage('Role must be student or admin'),
    body('department').optional().trim(),
    validateRequest,
  ],
  (req: Request, res: Response, next: NextFunction) => authController.signup(req, res, next)
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next)
);

router.get('/me', requireAuth, (req: AuthRequest, res: Response, next: NextFunction) => authController.getMe(req, res, next));
router.post('/logout', (req: Request, res: Response) => authController.logout(req, res));

export default router;
