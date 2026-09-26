import { Router } from 'express';
import { getMyNotifications, markNotificationAsRead } from '../controllers/notifications.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationAsRead);

export default router;
