import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getQuests } from '../database/queries/quests';
import { AuthenticatedRequest } from '../models/User';
import { insertHTTPRequest } from '../database/queries/monitor';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const quests = await getQuests(user_id);
        insertHTTPRequest(req.url, 200, req.ip);
        res.json(quests);
    } catch (error) {
        next(error);
    }
});

export default router;