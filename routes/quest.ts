import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getQuests } from '../database/queries/quests';

const router = Router();

interface AuthenticatedRequest extends Request {
    user: {
        user_id: number;
    }
}

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const quests = await getQuests(user_id);
        res.json(quests);
    } catch (error) {
        next(error);
    }
});

export default router;