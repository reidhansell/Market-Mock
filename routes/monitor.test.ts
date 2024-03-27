jest.mock('../database/queries/monitor');
jest.mock('../tools/middleware/authMiddleware');
jest.mock('../database/queries/monitor');

import request from 'supertest';
import { Express } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getSevenDayHTTPRequests, getSevenDayHardwareLoadLogs } from '../database/queries/monitor';
import { setupApp } from '../tools/utils/routeTestSetup';
import monitorRouter from './monitor';
import { insertHTTPRequest } from '../database/queries/monitor';

let app: Express;

beforeEach(() => {
    app = setupApp(monitorRouter);
    (insertHTTPRequest as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('monitorRouter', () => {
    describe('GET /monitor', () => {
        it('should successfully return a response', async () => {
            const mockHardwareData = [
                {
                    date: 1,
                    cpu_load: 50,
                    memory_usage: 50,
                    disk_usage: 50
                }
            ];
            const mockHTTPData = [
                {
                    request_id: 1,
                    request_url: "test_url",
                    response_status: 200,
                    request_date: 1,
                    request_ip: "test_ip"
                }
            ];

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { email: 'reidhansell@gmail.com' };
                next();
            });
            (getSevenDayHardwareLoadLogs as jest.Mock).mockResolvedValue(mockHardwareData);
            (getSevenDayHTTPRequests as jest.Mock).mockResolvedValue(mockHTTPData);

            const response = await request(app).get('/api/');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ hardwareLoadLogs: mockHardwareData, httpRequests: mockHTTPData });
            expect(getSevenDayHTTPRequests).toHaveBeenCalled();
            expect(getSevenDayHardwareLoadLogs).toHaveBeenCalled();
        });
    })
});