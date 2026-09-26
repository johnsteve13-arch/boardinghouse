import { Router } from 'express';
import { getComparison } from '../controllers/comparison.controller';

const router = Router();

router.get('/', getComparison);

export default router;
