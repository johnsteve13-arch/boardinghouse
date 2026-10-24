import { Router } from 'express';
import {
  createInquiry,
  getMyInquiries,
  getInquiryById,
  sendInquiryMessage
} from '../controllers/inquiries.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Allow tenants to directly submit inquiries without registering
router.post('/', createInquiry);

router.use(requireAuth);

router.get('/', getMyInquiries);
router.get('/:id', getInquiryById);
router.post('/:id/messages', sendInquiryMessage);

export default router;
