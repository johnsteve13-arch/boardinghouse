import { Router } from 'express';
import {
  getAdminStats,
  getVerifications,
  reviewVerification,
  submitVerification,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getUsersList
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

// Owner can submit verification
router.post('/verifications/submit', requireAuth, requireRole('owner'), submitVerification);

// Admin-only endpoints
router.get('/stats', requireAuth, requireRole('admin'), getAdminStats);
router.get('/users', requireAuth, requireRole('admin'), getUsersList);
router.get('/verifications', requireAuth, requireRole('admin'), getVerifications);
router.patch('/verifications/:id/review', requireAuth, requireRole('admin'), reviewVerification);
router.get('/settings', requireAuth, requireRole('admin'), getSystemSettings);
router.patch('/settings', requireAuth, requireRole('admin'), updateSystemSettings);
router.get('/audit-logs', requireAuth, requireRole('admin'), getAuditLogs);

export default router;
