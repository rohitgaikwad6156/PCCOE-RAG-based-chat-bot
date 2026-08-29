import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats', (req, res, next) => adminController.getDashboardStats(req, res, next));
router.get('/analytics', (req, res, next) => adminController.getAnalytics(req, res, next));
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));

export default router;
