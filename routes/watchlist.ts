import { Router, Request, Response, NextFunction } from 'express';
import { getWatchList, addTickerToWatchList, removeTickerFromWatchList } from '../database/queries/watchlist';
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

        console.log(watchlistWithData);
        res.status(200).json(watchlistWithData);
    } catch (error) {
        next(error);
    }
});

router.post('/add/:ticker_symbol', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const { ticker_symbol } = req.params;
        await addTickerToWatchList(user_id, ticker_symbol);
        res.status(200).json({ message: 'Ticker added to watchlist successfully' });
    } catch (error) {
        next(error);
    }
});

router.delete('/remove/:ticker_symbol', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const { ticker_symbol } = req.params;
        await removeTickerFromWatchList(user_id, ticker_symbol);
        res.status(200).json({ message: 'Ticker removed from watchlist successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
