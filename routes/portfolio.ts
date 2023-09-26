import { Router, Request, Response, NextFunction } from 'express';
import { getUserNetWorthData } from '../database/queries/portfolio';
import { authenticateToken } from '../tools/middleware/authMiddleware';

const router = Router();

interface AuthenticatedRequest extends Request {
    user: {
        user_id: number;
    }
}

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const netWorthData = await getUserNetWorthData(user_id);
        return res.json(netWorthData);
    } catch (error) {
        next(error);
    }
});

export default router;
