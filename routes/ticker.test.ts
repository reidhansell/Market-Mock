jest.mock('../database/queries/ticker');
jest.mock('../tools/middleware/authMiddleware');
jest.mock('../tools/services/endOfDayService');
jest.mock('../tools/services/intradayService');

import request from 'supertest';
import { Express } from 'express';
import { searchTickers } from '../database/queries/ticker';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getEODDataForTicker } from '../tools/services/endOfDayService';
import { getIntradayDataForTicker } from '../tools/services/intradayService';
import { setupApp } from '../tools/utils/routeTestSetup';
import tickerRouter from './ticker';

let app: Express;

beforeEach(() => {
    app = setupApp(tickerRouter);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('tickerRouter', () => {
    describe('GET /search/:search_term', () => {
        it('should return tickers based on search term', async () => {
            const mockTickers = ["AAPL", "GOOG", "MSFT"];

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => next());
            (searchTickers as jest.Mock).mockResolvedValue(mockTickers);

            const response = await request(app)
                .get('/api/search/AAPL');

            expect(response.status).toBe(200);
            expect(response.body.tickers).toEqual(mockTickers);
        });
    });

    describe('GET /eod/:ticker', () => {
        it('should return end of day data for a ticker', async () => {
            const mockEODData = {
                ticker: "AAPL",
                close: 150,
            };

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => next());
            (getEODDataForTicker as jest.Mock).mockResolvedValue(mockEODData);

            const response = await request(app)
                .get('/api/eod/AAPL');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockEODData);
        });
    });

    describe('GET /intraday/:ticker', () => {
        it('should return intraday data for a ticker', async () => {
            const mockIntradayData = [
                { time: "10:00", price: 149 },
            ];

            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => next());
            (getIntradayDataForTicker as jest.Mock).mockResolvedValue(mockIntradayData);

            const response = await request(app)
                .get('/api/intraday/AAPL');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockIntradayData);
        });
    });
});
