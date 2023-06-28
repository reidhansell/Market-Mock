import { Router, Request, Response, NextFunction } from 'express';
import { searchTickersByCompanyName } from '../database/queries/ticker';
import ExpectedError from '../tools/ExpectedError';

const router = Router();

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyName: string = req.query.companyName as string;

        if (!companyName || !companyName.trim()) {
            throw new ExpectedError('Company name is required', 400, "Missing companyName in /search route");
        }

        const companyNameRegex = /^[a-zA-Z0-9\s.'-]{1,100}$/;

        if (!companyNameRegex.test(companyName)) {
            throw new ExpectedError('Invalid company name', 400, "Invalid companyName in /search route");
        }

        const results = await searchTickersByCompanyName(companyName);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

export default router;