import { Request, Response, NextFunction } from 'express';
import { store } from '../data/mockStore';

export async function getRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const { budget, maxDistanceMeters, gender, roomType, amenities } = req.query;

    const maxBudget = budget ? Number(budget) : 3500;
    const maxDist = maxDistanceMeters ? Number(maxDistanceMeters) : 1500;
    const reqGender = gender as string | undefined;
    const reqRoomType = roomType as string | undefined;
    const reqAmenities: string[] = amenities
      ? Array.isArray(amenities)
        ? (amenities as string[])
        : (amenities as string).split(',').map((a) => a.trim())
      : ['wifi'];

    const allHouses = store.getBoardingHouses();

    const scoredHouses = allHouses.map((house) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Budget check (30 points)
      if (house.lowestPriceMonthly <= maxBudget) {
        score += 30;
        reasons.push(`₱${house.lowestPriceMonthly.toLocaleString()} fits within your ₱${maxBudget.toLocaleString()} budget`);
      } else if (house.lowestPriceMonthly <= maxBudget * 1.15) {
        score += 15;
        reasons.push(`Close to your budget at ₱${house.lowestPriceMonthly.toLocaleString()}`);
      }

      // 2. Distance check (30 points)
      if (house.distanceFromSeaitMeters <= maxDist) {
        score += 30;
        reasons.push(`${house.distanceFromSeaitMeters}m walk to SEAIT (${house.walkingTimeMinutes} mins)`);
      } else if (house.distanceFromSeaitMeters <= maxDist * 1.3) {
        score += 15;
        reasons.push(`Within easy commute (${house.distanceFromSeaitMeters}m from campus)`);
      }

      // 3. Gender Policy (15 points)
      if (!reqGender || reqGender === 'all') {
        score += 15;
      } else if (house.genderPolicy === reqGender) {
        score += 15;
        reasons.push(`Matches your gender policy (${reqGender.replace('_', ' ')})`);
      } else if (house.genderPolicy === 'all') {
        score += 10;
        reasons.push('Co-ed / open policy');
      }

      // 4. Room Type (15 points)
      if (reqRoomType) {
        const hasRoom = house.rooms.some((r) => r.category === reqRoomType && r.availableSlots > 0);
        if (hasRoom) {
          score += 15;
          reasons.push(`Available ${reqRoomType} rooms in stock`);
        }
      } else {
        score += 15;
      }

      // 5. Amenities (10 points)
      const matchedAmenities = reqAmenities.filter((a) => house.amenities.includes(a));
      if (reqAmenities.length > 0) {
        const amenityRatio = matchedAmenities.length / reqAmenities.length;
        score += Math.round(amenityRatio * 10);
        if (matchedAmenities.length > 0) {
          reasons.push(`Has ${matchedAmenities.length} of your requested amenities (${matchedAmenities.join(', ')})`);
        }
      } else {
        score += 10;
      }

      // Bonus for verification and ratings
      if (house.verificationStatus === 'verified') score += 5;
      if (house.ratingAverage >= 4.7) score += 5;

      return {
        ...house,
        matchPercentage: Math.min(100, score),
        matchReasons: reasons
      };
    });

    // Sort by highest match score
    scoredHouses.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json({
      success: true,
      data: scoredHouses.slice(0, 6)
    });
  } catch (err) {
    next(err);
  }
}
