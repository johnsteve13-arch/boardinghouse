import { Router } from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/reports.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.post('/', requireAuth, createReport);
router.get('/', requireAuth, requireRole('admin'), getReports);
router.patch('/:id/status', requireAuth, requireRole('admin'), updateReportStatus);

export default router;
