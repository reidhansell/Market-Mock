import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { marketStackKey } from '../config.json';
import { getLatestEODData, getLatestIntradayData, searchTickersByCompanyName } from '../database/queries/Ticker';
import ExpectedError from '../tools/ExpectedError';
import { authenticateToken } from '../tools/AuthMiddleware';
import { insertEODData, insertIntradayData } from '../database/queries/Ticker';
import TickerEndOfDay from '../models/TickerEndOfDay';
import TickerIntraday from '../models/TickerIntraday';

const router = Router();

const COMPANYNAME_PATTERN = /^[a-zA-Z0-9\s.'-]{1,100}$/;

const isEODDataRecent = (eodData: TickerEndOfDay[]): boolean => {
    if (!eodData.length) return false;
    const dataTime = new Date(eodData[0].date);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime.getTime() - dataTime.getTime());
    const differenceInHours = timeDifference / (1000 * 3600);
    return differenceInHours <= 24;
};

const isIntradayDataRecent = (intradayData: TickerIntraday[]): boolean => {
    if (!intradayData.length) return false;
    const dataTime = new Date(intradayData[0].date);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime.getTime() - dataTime.getTime());
    const differenceInHours = timeDifference / (1000 * 3600);
    return differenceInHours <= 1;
};


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
        const eodData = await getLatestEODData(ticker);

        if (!eodData || !isEODDataRecent(eodData)) {
            const response = await axios.get(`https://api.marketstack.com/v1/eod?access_key=${marketStackKey}&symbols=${ticker}&limit=30`) as EODResponse;
            for (let dataPoint of response.data) {
                await insertEODData(dataPoint as TickerEndOfDay);
            }
            return res.json(response.data);
        }

        return res.json(eodData);
    } catch (error) {
        next(error);
    }
});

router.get('intraday/:ticker', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticker = req.params.ticker;
        const intradayData = await getLatestIntradayData(ticker);

        if (!intradayData || !isIntradayDataRecent(intradayData)) {
            const response = await axios.get(`https://api.marketstack.com/v1/intraday?access_key=${marketStackKey}&symbols=${ticker}&limit=24`) as IntradayResponse;
            for (let dataPoint of response.data) {
                await insertIntradayData(dataPoint as TickerIntraday);
            }
            return res.json(response.data);
        }

        return res.json(intradayData);
    } catch (error) {
        next(error);
    }
});


export default router;
