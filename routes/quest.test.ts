jest.mock('../database/queries/quests');
jest.mock('../tools/middleware/authMiddleware');
jest.mock('../database/queries/monitor');

import request from 'supertest';
import { Express } from 'express';
import { getQuests } from '../database/queries/quests';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { setupApp } from '../tools/utils/routeTestSetup';
import questRouter from './quest';
import { insertHTTPRequest } from '../database/queries/monitor';

let app: Express;

beforeEach(() => {
    app = setupApp(questRouter);
    (insertHTTPRequest as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('questRouter', () => {
    describe('GET /', () => {
        it('should return quests for a user', async () => {
            const mockQuests = [
                {
                    quest_id: 1,
                    quest_name: "Sample Quest 1",
                    progress: 50
                },
                {
                    quest_id: 2,
                    quest_name: "Sample Quest 2",
                    progress: 80
                }
            ];

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { user_id: 1 };
                next();
            });
            (getQuests as jest.Mock).mockResolvedValue(mockQuests);

            const response = await request(app)
                .get('/api/');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockQuests);
        });
    });
});
