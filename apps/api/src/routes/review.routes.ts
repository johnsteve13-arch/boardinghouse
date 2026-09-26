import { Router } from 'express';
import { getReviewsForHouse, submitReview, replyToReview } from '../controllers/reviews.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/house/:boardingHouseId', getReviewsForHouse);
router.post('/', requireAuth, submitReview);
router.post('/:reviewId/reply', requireAuth, replyToReview);

export default router;
