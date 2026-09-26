import { Request, Response, NextFunction } from 'express';
import { store } from '../data/mockStore';

export async function getComparison(req: Request, res: Response, next: NextFunction) {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ success: false, error: 'Provide at least 2 boarding house IDs via ?ids=id1,id2' });
    }

    let idList: string[] = [];
    if (typeof ids === 'string') {
      idList = ids.split(',').map((id) => id.trim());
    } else if (Array.isArray(ids)) {
      idList = (ids as string[]).map((id) => String(id).trim());
    }
    if (idList.length < 2) {
      return res.status(400).json({ success: false, error: 'Must select at least 2 boarding houses to compare' });
    }

    const houses = idList
      .map((id) => store.findBoardingHouseById(id))
      .filter((h): h is NonNullable<typeof h> => h !== undefined);

    if (houses.length < 2) {
      return res.status(404).json({ success: false, error: 'Could not find at least 2 valid boarding houses to compare' });
    }

    // Build comparison matrix
    const comparisonMatrix = {
      properties: houses.map((h) => ({
        id: h.id,
        name: h.name,
        slug: h.slug,
        coverImage: h.coverImage,
        ownerName: h.ownerName,
        ownerVerified: h.ownerVerified,
        address: h.address,
        purok: h.purok,
        distanceFromSeaitMeters: h.distanceFromSeaitMeters,
        walkingTimeMinutes: h.walkingTimeMinutes,
        lowestPriceMonthly: h.lowestPriceMonthly,
        highestPriceMonthly: h.highestPriceMonthly,
        availabilityStatus: h.availabilityStatus,
        availableRooms: h.availableRooms,
        genderPolicy: h.genderPolicy,
        ratingAverage: h.ratingAverage,
        ratingCount: h.ratingCount,
        curfewTime: h.curfewTime,
        hasCurfew: h.hasCurfew,
        isGated: h.isGated,
        hasCctv: h.hasCctv,
        cookingAllowed: h.cookingAllowed,
        visitorsAllowed: h.visitorsAllowed,
        waterIncluded: h.waterIncluded,
        electricityIncluded: h.electricityIncluded,
        internetIncluded: h.internetIncluded,
        amenities: h.amenities,
        roomTypes: h.rooms.map((r) => ({
          name: r.name,
          category: r.category,
          monthlyRate: r.monthlyRate,
          rateType: r.rateType,
          isAirconditioned: r.isAirconditioned,
          hasPrivateBathroom: r.hasPrivateBathroom,
          availableSlots: r.availableSlots
        }))
      }))
    };

    return res.json({
      success: true,
      data: comparisonMatrix
    });
  } catch (err) {
    next(err);
  }
}
