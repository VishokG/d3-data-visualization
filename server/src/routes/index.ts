import { Router } from 'express';
import salesRoutes from './salesRoutes';

const router = Router();

router.use('/sales', salesRoutes);

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

export default router;
