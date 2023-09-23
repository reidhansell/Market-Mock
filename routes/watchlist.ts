import { Router, Request, Response, NextFunction } from 'express';
import { getWatchList } from '../database/queries/watchlist';
import { getIntradayDataForTicker } from '../tools/services/intradayService'; // import your new service here
import { authenticateToken } from '../tools/middleware/authMiddleware';

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

        const watchlistWithData = [];
        for (const item of watchlist) {
            const intradayData = await getIntradayDataForTicker(item.ticker_symbol);
            if (intradayData && intradayData.length > 0) {
                const lastDataPoint = intradayData[0];
                watchlistWithData.push({
                    ...item,
                    open_price: lastDataPoint.open,
                    current_price: lastDataPoint.last,
                });
            } else {
                watchlistWithData.push(item);
            }
        }

        res.status(200).json(watchlistWithData);
    } catch (error) {
        next(error);
    }
});

export default router;
