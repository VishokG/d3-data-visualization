import { Router } from 'express';
import * as salesController from '../controllers/salesController';
import { validateGroup } from '../middleware/validation/sales';

const router = Router();

router.get('/', validateGroup, salesController.getSales);

export default router;
