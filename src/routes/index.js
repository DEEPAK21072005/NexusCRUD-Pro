import { Router } from 'express';
import itemRoutes from './itemRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/items', itemRoutes);

export default router;
