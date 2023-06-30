import { Router, Request, Response, NextFunction } from 'express';
import { getWatchList } from '../database/queries/WatchList';
import { authenticateToken } from '../tools/AuthMiddleware';

interface AuthenticatedRequest extends Request {
    user: {
        user_id: number;
    }
}

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const watchlist = await getWatchList(user_id);
        res.status(200).json(watchlist);
    } catch (error) {
        next(error);
    }
});

export default router;