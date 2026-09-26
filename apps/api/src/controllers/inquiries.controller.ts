import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';
import { Inquiry } from '@seait-stay/types';

const createInquirySchema = z.object({
  boardingHouseId: z.string(),
  roomInterest: z.string().optional(),
  targetMoveInDate: z.string().optional(),
  initialMessage: z.string().min(3)
});

const replyInquirySchema = z.object({
  message: z.string().min(1)
});

export async function createInquiry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const data = createInquirySchema.parse(req.body);
    const house = store.findBoardingHouseById(data.boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    const inquiryId = `inq-${Date.now()}`;
    const initialMessage = {
      id: `msg-${Date.now()}`,
      inquiryId,
      senderId: req.user.id,
      senderName: req.user.fullName,
      senderRole: req.user.role,
      message: data.initialMessage,
      createdAt: new Date().toISOString()
    };

    const newInquiry: Inquiry = {
      id: inquiryId,
      boardingHouseId: house.id,
      boardingHouseName: house.name,
      boardingHouseCover: house.coverImage,
      studentId: req.user.id,
      studentName: req.user.fullName,
      studentEmail: req.user.email,
      studentPhone: req.user.phone,
      ownerId: house.ownerId,
      roomInterest: data.roomInterest,
      targetMoveInDate: data.targetMoveInDate,
      lastMessage: data.initialMessage,
      lastMessageAt: initialMessage.createdAt,
      status: 'pending',
      messages: [initialMessage],
      createdAt: initialMessage.createdAt
    };

    store.addInquiry(newInquiry);

    // Notify the owner
    store.addNotification({
      id: `notif-${Date.now()}`,
      userId: house.ownerId,
      title: `New Inquiry for ${house.name}`,
      message: `${req.user.fullName} asked: "${data.initialMessage.slice(0, 60)}..."`,
      type: 'inquiry',
      linkUrl: `/inquiries`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry sent to owner successfully',
      data: newInquiry
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyInquiries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const inquiries = store.getInquiries(req.user.id, req.user.role);
    return res.json({
      success: true,
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
}

export async function getInquiryById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { id } = req.params;

    const inq = store.findInquiryById(id);
    if (!inq) return res.status(404).json({ success: false, error: 'Inquiry not found' });

    if (inq.studentId !== req.user.id && inq.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    return res.json({
      success: true,
      data: inq
    });
  } catch (err) {
    next(err);
  }
}

export async function sendInquiryMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { id } = req.params;

    const inq = store.findInquiryById(id);
    if (!inq) return res.status(404).json({ success: false, error: 'Inquiry not found' });

    if (inq.studentId !== req.user.id && inq.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { message } = replyInquirySchema.parse(req.body);

    const updated = store.addInquiryMessage(id, {
      senderId: req.user.id,
      senderName: req.user.fullName,
      senderRole: req.user.role,
      message
    });

    // Notify the other party
    const recipientId = req.user.id === inq.studentId ? inq.ownerId : inq.studentId;
    store.addNotification({
      id: `notif-${Date.now()}`,
      userId: recipientId,
      title: `New message regarding ${inq.boardingHouseName}`,
      message: `${req.user.fullName}: "${message.slice(0, 60)}..."`,
      type: 'inquiry',
      linkUrl: `/inquiries`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}
