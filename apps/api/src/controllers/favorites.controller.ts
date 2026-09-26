import { Response, NextFunction } from 'express';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';

export async function getFavorites(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const favIds = store.getFavorites(req.user.id);
    const houses = favIds
      .map((id) => store.findBoardingHouseById(id))
      .filter((h): h is NonNullable<typeof h> => h !== undefined);

    return res.json({
      success: true,
      meta: { total: houses.length },
      data: houses
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { boardingHouseId } = req.params;

    const house = store.findBoardingHouseById(boardingHouseId);
    if (!house) return res.status(404).json({ success: false, error: 'Boarding house not found' });

    const isFavorited = store.toggleFavorite(req.user.id, house.id);

    return res.json({
      success: true,
      message: isFavorited ? 'Saved to favorites' : 'Removed from favorites',
      data: { isFavorited }
    });
  } catch (err) {
    next(err);
  }
}
