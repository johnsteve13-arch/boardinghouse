import { Router } from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favorites.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getFavorites);
router.post('/:boardingHouseId/toggle', toggleFavorite);

export default router;
