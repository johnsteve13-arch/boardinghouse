import { Response, NextFunction } from 'express';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';

export async function getMyNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const notifications = store.getNotifications(req.user.id);
    return res.json({
      success: true,
      meta: {
        total: notifications.length,
        unreadCount: notifications.filter((n) => !n.isRead).length
      },
      data: notifications
    });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { id } = req.params;

    const ok = store.markNotificationRead(id);
    return res.json({
      success: true,
      data: { marked: ok }
    });
  } catch (err) {
    next(err);
  }
}
