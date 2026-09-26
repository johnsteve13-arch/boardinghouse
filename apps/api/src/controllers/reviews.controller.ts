import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';
import { Review } from '@seait-stay/types';

const reviewSchema = z.object({
  boardingHouseId: z.string(),
  overallRating: z.number().min(1).max(5),
  cleanlinessRating: z.number().min(1).max(5),
  locationRating: z.number().min(1).max(5),
  valueRating: z.number().min(1).max(5),
  safetyRating: z.number().min(1).max(5),
  ownerResponsivenessRating: z.number().min(1).max(5),
  comment: z.string().min(10)
});

const ownerReplySchema = z.object({
  reply: z.string().min(2)
});

export async function getReviewsForHouse(req: Request, res: Response, next: NextFunction) {
  try {
    const { boardingHouseId } = req.params;
    const reviews = store.getReviews(boardingHouseId);
    return res.json({
      success: true,
      meta: { total: reviews.length },
      data: reviews
    });
  } catch (err) {
    next(err);
  }
}

export async function submitReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only verified students can submit reviews' });
    }

    const data = reviewSchema.parse(req.body);
    const house = store.findBoardingHouseById(data.boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      boardingHouseId: house.id,
      studentId: req.user.id,
      studentName: req.user.fullName,
      studentAvatar: req.user.avatarUrl,
      studentDepartment: req.user.department,
      isStayVerified: true,
      overallRating: data.overallRating,
      cleanlinessRating: data.cleanlinessRating,
      locationRating: data.locationRating,
      valueRating: data.valueRating,
      safetyRating: data.safetyRating,
      ownerResponsivenessRating: data.ownerResponsivenessRating,
      comment: data.comment,
      createdAt: new Date().toISOString()
    };

    store.addReview(newReview);

    // Notify owner
    store.addNotification({
      id: `notif-${Date.now()}`,
      userId: house.ownerId,
      title: `New student review for ${house.name}`,
      message: `${req.user.fullName} gave a ${data.overallRating}★ review: "${data.comment.slice(0, 50)}..."`,
      type: 'review',
      linkUrl: `/boarding-houses/${house.slug}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: newReview
    });
  } catch (err) {
    next(err);
  }
}

export async function replyToReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { reviewId } = req.params;

    const { reply } = ownerReplySchema.parse(req.body);

    const review = store.getReviews().find((r) => r.id === reviewId);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

    const house = store.findBoardingHouseById(review.boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    if (house.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied to reply to this review' });
    }

    const updated = store.updateReview(reviewId, {
      ownerReply: reply,
      ownerRepliedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Reply posted',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}
