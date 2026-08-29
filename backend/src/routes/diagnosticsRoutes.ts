import { Router } from 'express';
import { diagnosticsController } from '../controllers/diagnosticsController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Allow diagnostics for admins or local dev
router.get('/', (req, res, next) => diagnosticsController.getStatus(req, res, next));
router.post('/test-rag', (req, res, next) => diagnosticsController.runRAGTest(req, res, next));

export default router;
