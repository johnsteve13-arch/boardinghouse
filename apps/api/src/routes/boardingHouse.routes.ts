import { Router } from 'express';
import {
  getBoardingHouses,
  getBoardingHouseById,
  getMyBoardingHouses,
  createBoardingHouse,
  updateBoardingHouse,
  deleteBoardingHouse
} from '../controllers/boardingHouse.controller';
import { addRoom, updateRoom, deleteRoom } from '../controllers/rooms.controller';
import { updateAvailability, confirmAvailability } from '../controllers/availability.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getBoardingHouses);
router.get('/my/listings', requireAuth, requireRole('owner', 'admin'), getMyBoardingHouses);
router.get('/:id', getBoardingHouseById);

// Owner/Admin listing management
router.post('/', requireAuth, requireRole('owner', 'admin'), createBoardingHouse);
router.patch('/:id', requireAuth, requireRole('owner', 'admin'), updateBoardingHouse);
router.delete('/:id', requireAuth, requireRole('owner', 'admin'), deleteBoardingHouse);

// Room Inventory
router.post('/:boardingHouseId/rooms', requireAuth, requireRole('owner', 'admin'), addRoom);
router.patch('/:boardingHouseId/rooms/:roomId', requireAuth, requireRole('owner', 'admin'), updateRoom);
router.delete('/:boardingHouseId/rooms/:roomId', requireAuth, requireRole('owner', 'admin'), deleteRoom);

// Real-Time Availability Updates
router.patch('/:boardingHouseId/availability', requireAuth, requireRole('owner', 'admin'), updateAvailability);
router.post('/:boardingHouseId/confirm-availability', requireAuth, requireRole('owner', 'admin'), confirmAvailability);

export default router;
