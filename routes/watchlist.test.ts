jest.mock('../database/queries/watchlist');
jest.mock('../tools/middleware/authMiddleware');
jest.mock('../database/queries/quests');
jest.mock('../database/queries/portfolio');
jest.mock('../database/queries/monitor');

import request from 'supertest';
import { Express } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getWatchList } from '../database/queries/watchlist';
import { getQuests } from '../database/queries/quests';
import { getUserStocks } from '../database/queries/portfolio';
import { setupApp } from '../tools/utils/routeTestSetup';
import watchlistRouter from './watchlist';
import UserStock from '../models/UserStock';
import { insertHTTPRequest } from '../database/queries/monitor';

let app: Express;

beforeEach(() => {
    app = setupApp(watchlistRouter);
    (insertHTTPRequest as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('watchlistRouter', () => {
    describe('GET /', () => {
        it('should return a user\'s watchlist', async () => {
            const mockWatchlist = ["AAPL", "GOOG", "MSFT"];

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { user_id: 1 };
                next();
            });
            (getWatchList as jest.Mock).mockResolvedValue(mockWatchlist);

            const response = await request(app).get('/api/');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockWatchlist);
        });
    });

    describe('POST /add/:ticker_symbol', () => {
        it('should add a ticker to a user\'s watchlist', async () => {
            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { user_id: 1 };
                next();
            });
            (getQuests as jest.Mock).mockResolvedValue([]);

            const response = await request(app).post('/api/add/AAPL');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ticker added to watchlist successfully');
        });
    });

    describe('DELETE /remove/:ticker_symbol', () => {
        it('should remove a ticker from a user\'s watchlist', async () => {
            const mockUserStocks: UserStock[] = [];

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { user_id: 1 };
                next();
            });
            (getUserStocks as jest.Mock).mockResolvedValue(mockUserStocks);

            const response = await request(app).delete('/api/remove/AAPL');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ticker removed from watchlist successfully');
        });

        it('should not remove a ticker if the user owns the stock', async () => {
            const mockUserStocks = [{ ticker_symbol: "AAPL", quantity: 5 }];

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { user_id: 1 };
                next();
            });
            (getUserStocks as jest.Mock).mockResolvedValue(mockUserStocks);

            const response = await request(app).delete('/api/remove/AAPL');
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Cannot remove a stock from watchlist if you currently own it');
        });
    });
});
