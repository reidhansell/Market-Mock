import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { marketStackKey } from '../config.json';
import { getLatestIntradayData, searchTickersByCompanyName, insertIntradayData } from '../database/queries/ticker';
import ExpectedError from '../tools/utils/ExpectedError';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import TickerIntraday from '../models/TickerIntraday';
import { IntradayResponse } from '../models/MarketStackResponses';
import { getEODDataForTicker } from '../tools/services/endOfDayService';
import { toUnixTimestamp } from '../tools/utils/timeConverter';


const router = Router();

const COMPANYNAME_PATTERN = /^[a-zA-Z0-9\s.'-]{1,100}$/;

const isIntradayDataRecent = (intradayData: TickerIntraday[]): boolean => {
    if (!intradayData.length) return false;
    const dataTime = new Date(intradayData[0].date);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime.getTime() - dataTime.getTime());
    const differenceInHours = timeDifference / (1000 * 3600);
    return differenceInHours <= 1;
};

function formatTimestampForMySQL(timestamp: string) {
    const withoutTimezone = timestamp.slice(0, -5);

    const formatted = withoutTimezone.replace('T', ' ');

    return formatted;
}

router.get('/search/:company_name', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {

        const companyName: string = req.params.company_name as string;
        if (!companyName || !companyName.trim()) {
            throw new ExpectedError('Company name is required', 400, "Missing companyName in /search route");
        }
        if (!COMPANYNAME_PATTERN.test(companyName)) {
            throw new ExpectedError('Invalid company name', 400, "Invalid companyName in /search route");
        }
        const tickers = await searchTickersByCompanyName(companyName);
        res.json({ tickers: tickers });
    } catch (error) {
        next(error);
    }
});

router.get('/eod/:ticker', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticker = req.params.ticker;
        const eodData = await getEODDataForTicker(ticker);
        return res.json(eodData);
    } catch (error) {
        next(error);
    }
});

router.get('/intraday/:ticker', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticker = req.params.ticker;
        const intradayData = await getLatestIntradayData(ticker);

        if (!intradayData || !isIntradayDataRecent(intradayData)) {
            const axiosResponse = await axios.get(`https://api.marketstack.com/v1/intraday?access_key=${marketStackKey}&symbols=${ticker}&limit=24&interval=1hour`);
            const response = axiosResponse.data as IntradayResponse;
            for (let dataPoint of response.data) {
                dataPoint.date = formatTimestampForMySQL(dataPoint.date);
                await insertIntradayData({ ...dataPoint, date: toUnixTimestamp(dataPoint.date) } as TickerIntraday);
            }
            return res.json(response.data);
        }

        return res.json(intradayData);
    } catch (error) {
        next(error);
    }
});


export default router;
