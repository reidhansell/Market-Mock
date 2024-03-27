jest.mock('../database/queries/portfolio');
jest.mock('../tools/middleware/authMiddleware');
jest.mock('../tools/services/intradayService');
jest.mock('../database/queries/monitor');

import request from 'supertest';
import { Express } from 'express';
import {
    getUserNetWorthData,
    getUserStocks,
    getStockTransactions
} from '../database/queries/portfolio';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getIntradayDataForTicker } from '../tools/services/intradayService';
import { setupApp } from '../tools/utils/routeTestSetup';
import portfolioRouter from './portfolio';
import { insertHTTPRequest } from '../database/queries/monitor';

let app: Express;

beforeEach(() => {
    app = setupApp(portfolioRouter);
    (insertHTTPRequest as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('portfolioRouter', () => {
    describe('GET /', () => {
        it('should return net worth and user stocks data for a user', async () => {
            const mockUserStocks = [
                {
                    user_id: 1,
                    ticker_symbol: "AAPL",
                    quantity: 1,
                }
            ];
            const mockIntradayData = [
                {
                    last: 150,
                    open: 145
                }
            ];
            const mockTransactions = [
                {
                    quantity: 1,
                    price_per_share: 150
                }
            ];
            const mockNetWorthData = {
                user_id: 1,
                recorded_at: 1,
                net_worth: 10000
            };

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { user_id: 1 };
                next();
            });
            (getUserNetWorthData as jest.Mock).mockResolvedValue(mockNetWorthData);
            (getUserStocks as jest.Mock).mockResolvedValue(mockUserStocks);
            (getIntradayDataForTicker as jest.Mock).mockResolvedValue(mockIntradayData);
            (getStockTransactions as jest.Mock).mockResolvedValue(mockTransactions);

            const response = await request(app)
                .get('/api/');

            expect(response.status).toBe(200);
            expect(response.body.netWorthData).toEqual(mockNetWorthData);
            expect(response.body.userStocks[0].last).toBe(mockIntradayData[0].last);
            expect(response.body.userStocks[0].open).toBe(mockIntradayData[0].open);
        });
    });
});
