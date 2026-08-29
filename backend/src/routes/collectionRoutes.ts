import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { collectionController } from '../controllers/collectionController';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.use(requireAuth);

router.get('/', (req: Request, res: Response, next: NextFunction) => collectionController.getCollections(req, res, next));

router.post(
  '/',
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Collection name is required'),
    body('description').optional().trim(),
    body('department').optional().trim(),
    validateRequest,
  ],
  (req: Request, res: Response, next: NextFunction) => collectionController.createCollection(req, res, next)
);

router.delete('/:id', requireAdmin, (req: Request, res: Response, next: NextFunction) => collectionController.deleteCollection(req, res, next));

export default router;
