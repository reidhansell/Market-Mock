jest.mock('../queryExecutor');

import { executeQuery } from '../queryExecutor';
import {
    getOrdersAndTransactionsByUserId,
} from './order';
import { FulfilledOrder } from '../../models/Order';

describe('Trade Order DB Layer', () => {

    beforeEach(() => {
        (executeQuery as jest.Mock).mockClear();
    });

    describe('getOrdersAndTransactionsByUserId', () => {
        it('should return orders and transactions for a user', async () => {
            const mockResult: FulfilledOrder[] = [
                {
                    order_id: 1,
                    user_id: 1,
                    ticker_symbol: "AAPL",
                    order_type: "buy",
                    order_date: 1,
                    trigger_price: 100,
                    quantity: 10,
                    cancelled: false,
                    transaction_id: 1,
                    price_per_share: 100,
                    transaction_date: 1,
                }
            ];
            (executeQuery as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await getOrdersAndTransactionsByUserId(1);
            expect(result).toEqual(mockResult);
        });
    });
});

