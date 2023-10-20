jest.mock('../database/queries/notification');
jest.mock('../tools/middleware/authMiddleware');

import request from 'supertest';
import { Express } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getNotificiations, markNotificationAsRead } from '../database/queries/notification';
import { setupApp } from '../tools/utils/routeTestSetup';
import notificationRouter from './notification';

let app: Express;

beforeEach(() => {
    app = setupApp(notificationRouter);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('notificationRouter', () => {
    describe('GET /notification', () => {
        it('should successfully return a response', async () => {
            const mockNotifications = [{
                notification_id: 1,
                content: "test",
                user_id: 1,
                success: true,
                viewed: false,
            }];
            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { user_id: 1 };
                next();
            });
            (getNotificiations as jest.Mock).mockResolvedValue(mockNotifications);

            const response = await request(app).get('/api/');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNotifications);
            expect(getNotificiations).toHaveBeenCalled();
        });
    })
});