import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { AuthenticatedRequest } from '../models/User';
import { getSevenDayHardwareLoadLogs, getSevenDayHTTPRequests } from '../database/queries/monitor';
import { insertHTTPRequest } from '../database/queries/monitor';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = (req as AuthenticatedRequest).user;

        if (email !== 'reidhansell@gmail.com') {
            insertHTTPRequest(req.url, 403, req.ip);
            res.status(403).json({ message: 'You are not authorized to view this page. The admin has been notified of this attempt.' });
            return;
        }

        const hardwareDataPromise = getSevenDayHardwareLoadLogs(); //TODO: add current hardware data
        const HTTPDataPromise = getSevenDayHTTPRequests();
        const [hardwareData, HTTPData] = await Promise.all([hardwareDataPromise, HTTPDataPromise]);

        insertHTTPRequest(req.url, 200, req.ip);
        res.json({ hardwareLoadLogs: hardwareData, httpRequests: HTTPData });
    } catch (error) {
        next(error);
    }
});

export default router;