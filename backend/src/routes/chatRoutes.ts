import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { chatController } from '../controllers/chatController';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  [
    body('question').trim().notEmpty().withMessage('Question text is required'),
    body('conversationId').optional().isString(),
    body('departmentFilter').optional().isString(),
    body('collectionFilter').optional().isString(),
    validateRequest,
  ],
  (req: AuthRequest, res: Response, next: NextFunction) => chatController.askQuestion(req, res, next)
);

router.get('/conversations', (req: AuthRequest, res: Response, next: NextFunction) => chatController.getConversations(req, res, next));
router.get('/conversations/:id', (req: AuthRequest, res: Response, next: NextFunction) => chatController.getConversationMessages(req, res, next));
router.delete('/conversations/:id', (req: AuthRequest, res: Response, next: NextFunction) => chatController.deleteConversation(req, res, next));
router.get('/conversations/:id/export', (req: AuthRequest, res: Response, next: NextFunction) => chatController.exportConversation(req, res, next));

export default router;
