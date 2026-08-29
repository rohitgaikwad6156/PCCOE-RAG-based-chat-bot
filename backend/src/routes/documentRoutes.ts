import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { documentController } from '../controllers/documentController';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  requireAdmin,
  uploadMiddleware.single('file'),
  (req: AuthRequest, res: Response, next: NextFunction) => documentController.uploadDocument(req, res, next)
);

router.get('/', (req: AuthRequest, res: Response, next: NextFunction) => documentController.getDocuments(req, res, next));
router.get('/:id', (req: AuthRequest, res: Response, next: NextFunction) => documentController.getDocumentById(req, res, next));

router.put(
  '/:id',
  requireAdmin,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('department').optional().trim(),
    body('collectionName').optional().trim(),
    body('status').optional().isIn(['uploaded', 'processing', 'processed', 'failed', 'archived']),
    validateRequest,
  ],
  (req: AuthRequest, res: Response, next: NextFunction) => documentController.updateDocument(req, res, next)
);

router.delete('/:id', requireAdmin, (req: AuthRequest, res: Response, next: NextFunction) => documentController.deleteDocument(req, res, next));
router.post('/:id/reprocess', requireAdmin, (req: AuthRequest, res: Response, next: NextFunction) => documentController.reprocessDocument(req, res, next));
router.get('/:id/summary', (req: AuthRequest, res: Response, next: NextFunction) => documentController.getSummary(req, res, next));
router.get('/:id/faqs', (req: AuthRequest, res: Response, next: NextFunction) => documentController.getFAQs(req, res, next));

export default router;
