import { Router } from 'express';
import {
  createInquiry,
  getMyInquiries,
  getInquiryById,
  sendInquiryMessage
} from '../controllers/inquiries.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', createInquiry);
router.get('/', getMyInquiries);
router.get('/:id', getInquiryById);
router.post('/:id/messages', sendInquiryMessage);

export default router;
