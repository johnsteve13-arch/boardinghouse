import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';
import { BoardingHouse } from '@seait-stay/types';
import { calculateDistanceToSeaitMeters, calculateWalkingTimeMinutes, SEAIT_CAMPUS } from '../config/seait';

export async function getBoardingHouses(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      query,
      radiusMeters,
      minPrice,
      maxPrice,
      genderPolicy,
      roomCategory,
      availability,
      amenities,
      verifiedOnly,
      sortBy
    } = req.query;

    let results = store.getBoardingHouses();

    // Query text match
    if (query && typeof query === 'string' && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.purok.toLowerCase().includes(q)
      );
    }

    // SEAIT Radius Filter
    if (radiusMeters) {
      const radius = Number(radiusMeters);
      if (!isNaN(radius) && radius > 0) {
        results = results.filter((h) => h.distanceFromSeaitMeters <= radius);
      }
    }

    // Price Filter
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        results = results.filter((h) => h.highestPriceMonthly >= min);
      }
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        results = results.filter((h) => h.lowestPriceMonthly <= max);
      }
    }

    // Gender Policy Filter
    if (genderPolicy && genderPolicy !== 'all') {
      results = results.filter((h) => h.genderPolicy === genderPolicy || h.genderPolicy === 'all');
    }

    // Room Category Filter
    if (roomCategory && typeof roomCategory === 'string') {
      results = results.filter((h) => h.rooms.some((r) => r.category === roomCategory));
    }

    // Availability Filter
    if (availability && typeof availability === 'string') {
      results = results.filter((h) => h.availabilityStatus === availability);
    }

    // Verified Only Filter
    if (String(verifiedOnly) === 'true') {
      results = results.filter((h) => h.verificationStatus === 'verified');
    }

    // Amenities Filter
    if (amenities) {
      const amenityList = Array.isArray(amenities)
        ? (amenities as string[])
        : (amenities as string).split(',').map((a) => a.trim());

      results = results.filter((h) =>
        amenityList.every((reqAmenity) => h.amenities.includes(reqAmenity))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'distance_asc':
        results.sort((a, b) => a.distanceFromSeaitMeters - b.distanceFromSeaitMeters);
        break;
      case 'price_asc':
        results.sort((a, b) => a.lowestPriceMonthly - b.lowestPriceMonthly);
        break;
      case 'price_desc':
        results.sort((a, b) => b.lowestPriceMonthly - a.lowestPriceMonthly);
        break;
      case 'rating_desc':
        results.sort((a, b) => b.ratingAverage - a.ratingAverage);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // Default: Sort by nearest to SEAIT
        results.sort((a, b) => a.distanceFromSeaitMeters - b.distanceFromSeaitMeters);
        break;
    }

    return res.json({
      success: true,
      meta: {
        total: results.length,
        seaitCampus: SEAIT_CAMPUS
      },
      data: results
    });
  } catch (err) {
    next(err);
  }
}

export async function getBoardingHouseById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const house = store.findBoardingHouseById(id);

    if (!house) {
      return res.status(404).json({ success: false, error: 'Boarding house not found' });
    }

    return res.json({
      success: true,
      data: house
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyBoardingHouses(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const houses = store.getBoardingHouses().filter((h) => h.ownerId === req.user?.id);
    return res.json({
      success: true,
      data: houses
    });
  } catch (err) {
    next(err);
  }
}

const createBoardingHouseSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  address: z.string().min(5),
  purok: z.string().default('Purok 7, Crossing Rubber'),
  barangay: z.string().default('Crossing Rubber'),
  municipality: z.string().default('Tupi'),
  province: z.string().default('South Cotabato'),
  latitude: z.number(),
  longitude: z.number(),
  genderPolicy: z.enum(['all', 'male_only', 'female_only']).default('all'),
  curfewTime: z.string().optional().default('10:00 PM'),
  hasCurfew: z.boolean().default(true),
  isGated: z.boolean().default(true),
  hasCctv: z.boolean().default(false),
  hasWarden: z.boolean().default(false),
  cookingAllowed: z.boolean().default(true),
  visitorsAllowed: z.boolean().default(true),
  petsAllowed: z.boolean().default(false),
  waterIncluded: z.boolean().default(true),
  electricityIncluded: z.boolean().default(false),
  internetIncluded: z.boolean().default(true),
  totalRooms: z.number().min(1).default(1),
  availableRooms: z.number().min(0).default(1),
  lowestPriceMonthly: z.number().min(0),
  highestPriceMonthly: z.number().min(0),
  coverImage: z.string().url(),
  amenities: z.array(z.string()).default([]),
  safetyNotes: z.string().optional()
});

export async function createBoardingHouse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only owners or admins can list boarding houses' });
    }

    const data = createBoardingHouseSchema.parse(req.body);

    // Calculate distance to SEAIT campus
    const distanceMeters = calculateDistanceToSeaitMeters(data.latitude, data.longitude);
    const settings = store.getSystemSettings();

    // Geographic validation: check if within max search radius
    if (distanceMeters > settings.maxSearchRadiusKm * 1000 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: `Property is ${(distanceMeters / 1000).toFixed(1)}km away from SEAIT. The maximum allowable service radius is ${settings.maxSearchRadiusKm}km.`
      });
    }

    const walkingTime = calculateWalkingTimeMinutes(distanceMeters);
    const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newHouse: BoardingHouse = {
      id: `bh-${Date.now()}`,
      ownerId: req.user.id,
      ownerName: req.user.fullName,
      ownerPhone: req.user.phone,
      ownerAvatar: req.user.avatarUrl,
      ownerVerified: req.user.isVerified,
      name: data.name,
      slug,
      description: data.description,
      address: data.address,
      purok: data.purok,
      barangay: data.barangay,
      municipality: data.municipality,
      province: data.province,
      latitude: data.latitude,
      longitude: data.longitude,
      distanceFromSeaitMeters: distanceMeters,
      walkingTimeMinutes: walkingTime,
      genderPolicy: data.genderPolicy,
      curfewTime: data.curfewTime,
      hasCurfew: data.hasCurfew,
      isGated: data.isGated,
      hasCctv: data.hasCctv,
      hasWarden: data.hasWarden,
      cookingAllowed: data.cookingAllowed,
      visitorsAllowed: data.visitorsAllowed,
      petsAllowed: data.petsAllowed,
      waterIncluded: data.waterIncluded,
      electricityIncluded: data.electricityIncluded,
      internetIncluded: data.internetIncluded,
      verificationStatus: req.user.role === 'admin' ? 'verified' : 'unverified',
      availabilityStatus: data.availableRooms > 0 ? 'available' : 'fully_occupied',
      totalRooms: data.totalRooms,
      availableRooms: data.availableRooms,
      lowestPriceMonthly: data.lowestPriceMonthly,
      highestPriceMonthly: data.highestPriceMonthly,
      ratingAverage: 0,
      ratingCount: 0,
      coverImage: data.coverImage,
      photos: [
        {
          id: `p-${Date.now()}`,
          boardingHouseId: `bh-${Date.now()}`,
          url: data.coverImage,
          caption: 'Cover Photo',
          category: 'exterior',
          isCover: true,
          sortOrder: 1
        }
      ],
      rooms: [],
      amenities: data.amenities,
      safetyNotes: data.safetyNotes,
      lastAvailabilityConfirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.addBoardingHouse(newHouse);

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'CREATED_BOARDING_HOUSE',
      entityType: 'boarding_house',
      entityId: newHouse.id,
      details: { name: newHouse.name, distanceMeters },
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Boarding house listed successfully',
      data: newHouse
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBoardingHouse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { id } = req.params;

    const existing = store.findBoardingHouseById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Boarding house not found' });
    }

    if (existing.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied to edit this property' });
    }

    const updates = req.body;
    // If coordinates changed, re-calculate distance to SEAIT
    if (updates.latitude && updates.longitude) {
      updates.distanceFromSeaitMeters = calculateDistanceToSeaitMeters(updates.latitude, updates.longitude);
      updates.walkingTimeMinutes = calculateWalkingTimeMinutes(updates.distanceFromSeaitMeters);
    }

    const updated = store.updateBoardingHouse(existing.id, updates);
    return res.json({
      success: true,
      message: 'Boarding house updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteBoardingHouse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { id } = req.params;

    const existing = store.findBoardingHouseById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Boarding house not found' });
    }

    if (existing.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    store.deleteBoardingHouse(existing.id);

    return res.json({
      success: true,
      message: 'Boarding house deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
