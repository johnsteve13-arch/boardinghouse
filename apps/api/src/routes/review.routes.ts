import { Router } from 'express';
import { getReviewsForHouse, getOwnerReviews, submitReview, replyToReview } from '../controllers/reviews.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/owner/all', requireAuth, getOwnerReviews);
router.get('/house/:boardingHouseId', getReviewsForHouse);
// Allow tenants to directly submit reviews without registering
router.post('/', submitReview);
router.post('/:reviewId/reply', requireAuth, replyToReview);

export default router;
