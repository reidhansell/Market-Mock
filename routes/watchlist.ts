import { Router, Request, Response, NextFunction } from 'express';
import { getWatchList, addTickerToWatchList, removeTickerFromWatchList } from '../database/queries/watchlist';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getQuests, updateQuest } from '../database/queries/quests';
import ExpectedError from '../tools/utils/ExpectedError';
import { getUserStocks } from '../database/queries/portfolio';
import { AuthenticatedRequest } from '../models/User';
import { insertHTTPRequest } from '../database/queries/monitor';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const watchlist = await getWatchList(user_id);


        /* The following code was too slow to be used in production, but could be optimized for detailed watchlists
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

        res.status(200).json(watchlistWithData);*/
        insertHTTPRequest(req.url, 200, req.ip);
        res.status(200).json(watchlist);
    } catch (error) {
        next(error);
    }
});

router.post('/add/:ticker_symbol', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const { ticker_symbol } = req.params;
        await addTickerToWatchList(user_id, ticker_symbol);
        const quests = await getQuests(user_id);
        const watchlistQuest = quests.find(quest => quest.name === 'Add a stock to your watchlist');
        if (watchlistQuest && watchlistQuest.completion_date === null) {
            await updateQuest(user_id, watchlistQuest.quest_id);
        }
        insertHTTPRequest(req.url, 200, req.ip);
        res.status(200).json({ message: 'Ticker added to watchlist successfully' });
    } catch (error) {
        next(error);
    }
});

router.delete('/remove/:ticker_symbol', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const { ticker_symbol } = req.params;
        const stocks = await getUserStocks(user_id);
        if (stocks.some(stock => { return stock.ticker_symbol === ticker_symbol })) {
            throw new ExpectedError('Cannot remove a stock from watchlist if you currently own it', 400, '/api/watchlist/remove failed, tried to remove owned stock');
        }
        await removeTickerFromWatchList(user_id, ticker_symbol);
        insertHTTPRequest(req.url, 200, req.ip);
        res.status(200).json({ message: 'Ticker removed from watchlist successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
