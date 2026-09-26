import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';

const updateAvailabilitySchema = z.object({
  availabilityStatus: z.enum(['available', 'few_slots', 'fully_occupied']),
  availableRooms: z.number().min(0).optional()
});

export async function updateAvailability(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { boardingHouseId } = req.params;

    const house = store.findBoardingHouseById(boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    if (house.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const data = updateAvailabilitySchema.parse(req.body);

    const updates: any = {
      availabilityStatus: data.availabilityStatus,
      lastAvailabilityConfirmedAt: new Date().toISOString()
    };

    if (data.availableRooms !== undefined) {
      updates.availableRooms = data.availableRooms;
    }

    const updated = store.updateBoardingHouse(house.id, updates);

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'UPDATED_AVAILABILITY',
      entityType: 'boarding_house',
      entityId: house.id,
      details: { status: data.availabilityStatus, availableRooms: data.availableRooms },
      createdAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Availability updated and confirmed',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmAvailability(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { boardingHouseId } = req.params;

    const house = store.findBoardingHouseById(boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    if (house.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const updated = store.updateBoardingHouse(house.id, {
      lastAvailabilityConfirmedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Availability confirmed fresh as of today',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}
