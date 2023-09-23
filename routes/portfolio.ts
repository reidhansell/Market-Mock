import { Router, Request, Response, NextFunction } from 'express';
import { getUserNetWorthData } from '../database/queries/portfolio';
import { authenticateToken } from '../tools/middleware/authMiddleware';

const router = Router();

router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id, 10);
        const netWorthData = await getUserNetWorthData(id);
        return res.json(netWorthData);
    } catch (error) {
        next(error);
    }
});

export default router;
