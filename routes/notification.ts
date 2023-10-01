import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getNotificiations, addNotification, markNotificationAsRead } from '../database/queries/notification';

interface AuthenticatedRequest extends Request {
    user: {
        user_id: number;
    }
}

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;

        const notifications = await getNotificiations(user_id);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;

        const notification = await addNotification({ ...req.body, user_id });
        res.json(notification);
    } catch (error) {
        next(error);
    }
});

router.put('/:notification_id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { notification_id } = req.params;

        await markNotificationAsRead(parseInt(notification_id));
        res.json();
    } catch (error) {
        next(error);
    }
});

export default router;