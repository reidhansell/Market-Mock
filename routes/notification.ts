import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getNotificiations, markNotificationAsRead } from '../database/queries/notification';
import { AuthenticatedRequest } from '../models/User';
import { insertHTTPRequest } from '../database/queries/monitor';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;

        const notifications = await getNotificiations(user_id);
        insertHTTPRequest(req.url, 200, req.ip);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

router.put('/:notification_id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { notification_id } = req.params;

        await markNotificationAsRead(parseInt(notification_id));
        insertHTTPRequest(req.url, 200, req.ip);
        res.json();
    } catch (error) {
        next(error);
    }
});

export default router;