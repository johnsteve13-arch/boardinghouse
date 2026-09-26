import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';
import { PropertyReport } from '@seait-stay/types';

const createReportSchema = z.object({
  boardingHouseId: z.string(),
  reason: z.enum([
    'inaccurate_location',
    'fake_pricing',
    'unavailable_marked_available',
    'safety_hazard',
    'scam',
    'other'
  ]),
  details: z.string().min(10)
});

export async function createReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const data = createReportSchema.parse(req.body);
    const house = store.findBoardingHouseById(data.boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    const newReport: PropertyReport = {
      id: `rep-${Date.now()}`,
      boardingHouseId: house.id,
      reporterId: req.user.id,
      reporterName: req.user.fullName,
      reason: data.reason,
      details: data.details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    store.addPropertyReport(newReport);

    return res.status(201).json({
      success: true,
      message: 'Report submitted for administrator investigation',
      data: newReport
    });
  } catch (err) {
    next(err);
  }
}

export async function getReports(_req: AuthRequest, res: Response) {
  return res.json({
    success: true,
    data: store.getPropertyReports()
  });
}

export async function updateReportStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = store.updatePropertyReport(id, { status });
    return res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}
