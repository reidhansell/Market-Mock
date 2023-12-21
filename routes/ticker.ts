import { Router, Request, Response, NextFunction } from 'express';
import { searchTickers } from '../database/queries/ticker';
import ExpectedError from '../tools/utils/ExpectedError';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getEODDataForTicker } from '../tools/services/endOfDayService';
import { getIntradayDataForTicker } from '../tools/services/intradayService';
import { insertHTTPRequest } from '../database/queries/monitor';

const router = Router();

const COMPANYNAME_PATTERN = /^[a-zA-Z0-9\s.'-]{1,100}$/;

router.get('/search/:search_term', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {

        const search_term: string = req.params.search_term as string;
        if (!search_term || !search_term.trim()) {
            throw new ExpectedError('Search term is required', 400, "Missing search term in /search route");
        }
        if (!COMPANYNAME_PATTERN.test(search_term)) {
            throw new ExpectedError('Invalid search term', 400, "Invalid search term in /search route");
        }
        const tickers = await searchTickers(search_term);
        insertHTTPRequest(req.url, 200, req.ip);
        res.json({ tickers: tickers });
    } catch (error) {
        next(error);
    }
});

router.get('/eod/:ticker', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticker = req.params.ticker;
        const eodData = await getEODDataForTicker(ticker);
        insertHTTPRequest(req.url, 200, req.ip);
        return res.json(eodData);
    } catch (error) {
        next(error);
    }
});

router.get('/intraday/:ticker', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const intradayData = await getIntradayDataForTicker(req.params.ticker);
        insertHTTPRequest(req.url, 200, req.ip);
        return res.json(intradayData);
    } catch (error) {
        next(error);
    }
});


export default router;
