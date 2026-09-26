import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';
import { OwnerVerification } from '@seait-stay/types';

export async function getAdminStats(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = store.getUsers();
    const houses = store.getBoardingHouses();
    const verifications = store.getOwnerVerifications();
    const reports = store.getPropertyReports();
    const reviews = store.getReviews();

    const totalRooms = houses.reduce((sum, h) => sum + h.totalRooms, 0);
    const availableRooms = houses.reduce((sum, h) => sum + h.availableRooms, 0);

    const stats = {
      totalUsers: users.length,
      totalStudents: users.filter((u) => u.role === 'student').length,
      totalOwners: users.filter((u) => u.role === 'owner').length,
      totalBoardingHouses: houses.length,
      verifiedBoardingHouses: houses.filter((h) => h.verificationStatus === 'verified').length,
      pendingVerifications: verifications.filter((v) => v.status === 'pending').length,
      pendingReports: reports.filter((r) => r.status === 'pending').length,
      totalRooms,
      availableRooms,
      totalReviews: reviews.length
    };

    return res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
}

export async function getVerifications(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const verifications = store.getOwnerVerifications();
    return res.json({
      success: true,
      data: verifications
    });
  } catch (err) {
    next(err);
  }
}

const reviewVerificationSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  adminNotes: z.string().optional()
});

export async function reviewVerification(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { id } = req.params;

    const data = reviewVerificationSchema.parse(req.body);
    const ver = store.findVerificationById(id);
    if (!ver) return res.status(404).json({ success: false, error: 'Verification request not found' });

    const updated = store.updateOwnerVerification(id, {
      status: data.status,
      adminNotes: data.adminNotes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.id
    });

    // Update owner's verification status
    if (data.status === 'verified') {
      store.updateUser(ver.ownerId, { isVerified: true });

      // Update owner's properties to verified
      const houses = store.getBoardingHouses().filter((h) => h.ownerId === ver.ownerId);
      for (const h of houses) {
        store.updateBoardingHouse(h.id, {
          ownerVerified: true,
          verificationStatus: 'verified'
        });
      }
    }

    // Notify the owner
    store.addNotification({
      id: `notif-${Date.now()}`,
      userId: ver.ownerId,
      title: data.status === 'verified' ? 'Owner Verification Approved!' : 'Owner Verification Needs Attention',
      message:
        data.status === 'verified'
          ? 'Your owner identity has been verified by the SEAIT Administrator. Your listings now show the Verified badge.'
          : `Your verification submission was not approved: ${data.adminNotes || 'Please check your submitted documents.'}`,
      type: 'verification',
      linkUrl: '/dashboard/owner',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: data.status === 'verified' ? 'APPROVED_OWNER_VERIFICATION' : 'REJECTED_OWNER_VERIFICATION',
      entityType: 'owner_verification',
      entityId: id,
      details: { status: data.status, notes: data.adminNotes },
      createdAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Owner verification ${data.status}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function submitVerification(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const schema = z.object({
      governmentIdType: z.string().min(2),
      governmentIdNumber: z.string().min(2),
      documentUrl: z.string().url(),
      permitNumber: z.string().optional()
    });

    const data = schema.parse(req.body);

    const newVer: OwnerVerification = {
      id: `ver-${Date.now()}`,
      ownerId: req.user.id,
      ownerName: req.user.fullName,
      governmentIdType: data.governmentIdType,
      governmentIdNumber: data.governmentIdNumber,
      documentUrl: data.documentUrl,
      permitNumber: data.permitNumber,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    store.addOwnerVerification(newVer);

    return res.status(201).json({
      success: true,
      message: 'Verification documents submitted for admin review',
      data: newVer
    });
  } catch (err) {
    next(err);
  }
}

export async function getSystemSettings(_req: AuthRequest, res: Response) {
  return res.json({
    success: true,
    data: store.getSystemSettings()
  });
}

export async function updateSystemSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const updated = store.updateSystemSettings(req.body);

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'UPDATED_SYSTEM_SETTINGS',
      entityType: 'system_settings',
      entityId: 'settings',
      details: req.body,
      createdAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'System settings updated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(_req: AuthRequest, res: Response) {
  return res.json({
    success: true,
    data: store.getAuditLogs()
  });
}

export async function getUsersList(_req: AuthRequest, res: Response) {
  return res.json({
    success: true,
    data: store.getUsers()
  });
}
