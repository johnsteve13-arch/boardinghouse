import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';
import { Room } from '@seait-stay/types';

const roomSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['single', 'double', 'quad', 'bedspace', 'studio']),
  capacity: z.number().min(1),
  availableSlots: z.number().min(0),
  monthlyRate: z.number().min(100),
  rateType: z.enum(['per_room', 'per_person']).default('per_room'),
  depositAmount: z.number().min(0).default(0),
  advanceMonths: z.number().min(0).default(1),
  isAirconditioned: z.boolean().default(false),
  hasPrivateBathroom: z.boolean().default(false),
  hasWindow: z.boolean().default(true),
  isFurnished: z.boolean().default(true),
  description: z.string().optional(),
  photos: z.array(z.string()).default([])
});

export async function addRoom(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { boardingHouseId } = req.params;

    const house = store.findBoardingHouseById(boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    if (house.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const data = roomSchema.parse(req.body);

    const newRoom: Room = {
      id: `r-${Date.now()}`,
      boardingHouseId: house.id,
      ...data
    };

    house.rooms.push(newRoom);

    // Recalculate price bounds & available rooms
    const prices = house.rooms.map((r) => r.monthlyRate);
    const availableTotal = house.rooms.reduce((sum, r) => sum + r.availableSlots, 0);

    store.updateBoardingHouse(house.id, {
      totalRooms: house.rooms.length,
      availableRooms: availableTotal,
      lowestPriceMonthly: Math.min(...prices),
      highestPriceMonthly: Math.max(...prices),
      availabilityStatus: availableTotal > 0 ? (availableTotal <= 2 ? 'few_slots' : 'available') : 'fully_occupied'
    });

    return res.status(201).json({
      success: true,
      message: 'Room added successfully',
      data: newRoom
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRoom(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { boardingHouseId, roomId } = req.params;

    const house = store.findBoardingHouseById(boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    if (house.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const roomIndex = house.rooms.findIndex((r) => r.id === roomId);
    if (roomIndex === -1) return res.status(404).json({ success: false, error: 'Room not found' });

    house.rooms[roomIndex] = { ...house.rooms[roomIndex], ...req.body };

    // Recalculate summary metrics
    const prices = house.rooms.map((r) => r.monthlyRate);
    const availableTotal = house.rooms.reduce((sum, r) => sum + r.availableSlots, 0);

    store.updateBoardingHouse(house.id, {
      availableRooms: availableTotal,
      lowestPriceMonthly: Math.min(...prices),
      highestPriceMonthly: Math.max(...prices),
      availabilityStatus: availableTotal > 0 ? (availableTotal <= 2 ? 'few_slots' : 'available') : 'fully_occupied'
    });

    return res.json({
      success: true,
      message: 'Room updated successfully',
      data: house.rooms[roomIndex]
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRoom(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { boardingHouseId, roomId } = req.params;

    const house = store.findBoardingHouseById(boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    if (house.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    house.rooms = house.rooms.filter((r) => r.id !== roomId);

    const prices = house.rooms.length > 0 ? house.rooms.map((r) => r.monthlyRate) : [0];
    const availableTotal = house.rooms.reduce((sum, r) => sum + r.availableSlots, 0);

    store.updateBoardingHouse(house.id, {
      totalRooms: house.rooms.length,
      availableRooms: availableTotal,
      lowestPriceMonthly: Math.min(...prices),
      highestPriceMonthly: Math.max(...prices),
      availabilityStatus: availableTotal > 0 ? 'available' : 'fully_occupied'
    });

    return res.json({
      success: true,
      message: 'Room removed successfully'
    });
  } catch (err) {
    next(err);
  }
}
