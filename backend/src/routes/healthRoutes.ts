import { Router } from 'express';
import { healthController } from '../controllers/healthController';

const router = Router();

router.get('/health', (req, res) => healthController.checkHealth(req, res));

export default router;
