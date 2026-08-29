import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { feedbackController } from '../controllers/feedbackController';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  [
    body('messageId').isMongoId().withMessage('Valid messageId required'),
    body('type').isIn(['positive', 'negative']).withMessage('Feedback type must be positive or negative'),
    body('comment').optional().trim(),
    validateRequest,
  ],
  (req: AuthRequest, res: Response, next: NextFunction) => feedbackController.submitFeedback(req, res, next)
);

export default router;
