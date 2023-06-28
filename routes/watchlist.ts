import { Router, Request, Response, NextFunction } from 'express';
import { getWatchList } from '../database/queries/watchlist';
import { authenticateToken } from '../tools/authMiddleware';

interface RequestFromMiddleware extends Request {
    user: {
        user_id: number;
    }
}

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id: number = (req as RequestFromMiddleware).user.user_id;
        const watchlist = await getWatchList(user_id);
        res.status(200).json(watchlist);
    } catch (error) {
        next(error);
    }
});

export default router;

