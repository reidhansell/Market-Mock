import { Router, Request, Response, NextFunction } from 'express';
import { searchTickersByCompanyName } from '../database/queries/Ticker';
import ExpectedError from '../tools/ExpectedError';
import { authenticateToken } from '../tools/AuthMiddleware';

const router = Router();

const COMPANYNAME_PATTERN = /^[a-zA-Z0-9\s.'-]{1,100}$/;

router.get('search', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {

        const companyName: string = req.query.companyName as string;
        if (!companyName || !companyName.trim()) {
            throw new ExpectedError('Company name is required', 400, "Missing companyName in /search route");
        }
        if (!COMPANYNAME_PATTERN.test(companyName)) {
            throw new ExpectedError('Invalid company name', 400, "Invalid companyName in /search route");
        }
        const results = await searchTickersByCompanyName(companyName);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

export default router;
