jest.mock('../database/queries/order');
jest.mock('../tools/middleware/authMiddleware');
jest.mock('../tools/services/orderFulfillmentService');
jest.mock('../database/queries/monitor');

import request from 'supertest';
import { Express } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { insertOrder, getOrdersAndTransactionsByUserId } from '../database/queries/order';
import { processOrder } from '../tools/services/orderFulfillmentService';
import { setupApp } from '../tools/utils/routeTestSetup';
import orderRouter from './order';
import { insertHTTPRequest } from '../database/queries/monitor';

let app: Express;

beforeEach(() => {
    app = setupApp(orderRouter);
    (insertHTTPRequest as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('orderRouter', () => {
    describe('GET /', () => {
        it('should return orders for a user', async () => {
            const mockOrders = [
                {
                    ticker_symbol: "AAPL",
                    order_type: "MARKET",
                    trigger_price: 150,
                    quantity: 1,
                    order_id: 1,
                    user_id: 1,
                    cancelled: false,
                    order_date: Math.floor(Date.now() / 1000),
                }
            ];
            (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
                req.user = { user_id: 1 };
                next();
            });
            (getOrdersAndTransactionsByUserId as jest.Mock).mockResolvedValue(mockOrders);
            const response = await request(app)
                .get('/api/');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockOrders);
        });
    });
});
