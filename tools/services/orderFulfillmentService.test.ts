jest.mock('../../database/databaseConnector');
jest.mock('../../database/queries/portfolio');
jest.mock('../../database/queries/order');
jest.mock('../../database/queries/auth');
jest.mock('../../tools/services/intradayService');
jest.mock('./netWorthService');
jest.mock('../../database/queries/notification');
jest.mock('../../database/queries/quests');
jest.mock('../../database/queries/watchlist');

import { processOrder } from './orderFulfillmentService';
import { FulfilledOrder, OrderSubmission } from '../../models/Order';
import { UserQuest } from '../../models/Quest';
import { getIntradayDataForTicker } from './intradayService';
import { getUserData } from '../../database/queries/auth';
import { insertTransaction } from '../../database/queries/order';
import { updateUserBalance, updateUserStocks, getUserStocks } from '../../database/queries/portfolio';
import { calculateAndSaveUserNetWorth } from './netWorthService';
import { addNotification } from '../../database/queries/notification';
import { getQuests, updateQuest } from '../../database/queries/quests';
import quests from "../../database/quests.json"
import { getTransactionConnection } from '../../database/databaseConnector';
import { addTickerToWatchList } from '../../database/queries/watchlist';

describe('orderFulfillmentService', () => {

    describe('processOrder', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should process and fulfill a valid market buy order', async () => {
            const validOrder: OrderSubmission = {
                order_id: 1,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "MARKET",
                trigger_price: 150.00,
                quantity: 1,
            };
            const FulfilledOrder: FulfilledOrder = {
                order_id: 1,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "MARKET",
                trigger_price: 150.00,
                quantity: 1,
                cancelled: false,
                order_date: Math.floor(Date.now() / 1000) - 1,
                transaction_id: 1,
                price_per_share: 150,
                transaction_date: Math.floor(Date.now() / 1000),
            };
            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{
                open: 150,
                high: 160,
                low: 140,
                last: 150,
                close: 150,
                volume: 100000,
                symbol: "AAPL",
                exchange: "NASDAQ",
                date: Math.floor(Date.now() / 1000)
            }]);

            (getUserData as jest.Mock).mockResolvedValue({
                user_id: 1,
                username: "Placeholder",
                email: "Place@holder.com",
                registration_date: Math.floor(Date.now() / 1000) - 100000,
                starting_amount: 10000,
                current_balance: 10000,
                is_email_verified: true,
            });
            (insertTransaction as jest.Mock).mockResolvedValue(FulfilledOrder);
            (updateUserBalance as jest.Mock).mockResolvedValue(undefined);
            (updateUserStocks as jest.Mock).mockResolvedValue(undefined);
            (addTickerToWatchList as jest.Mock).mockResolvedValue(undefined);
            (calculateAndSaveUserNetWorth as jest.Mock).mockResolvedValue(undefined);
            (addNotification as jest.Mock).mockResolvedValue(undefined);
            (getQuests as jest.Mock).mockResolvedValue(quests as UserQuest[]);
            (updateQuest as jest.Mock).mockResolvedValue(undefined);
            (getTransactionConnection as jest.Mock).mockResolvedValue({
                beginTransaction: jest.fn(),
                commit: jest.fn(),
                rollback: jest.fn(),
            });
            const result = await processOrder(validOrder);
            expect(result).toEqual(FulfilledOrder);
        });

        it('should fulfill a valid limit buy order when current price is lower than trigger price', async () => {
            const limitBuyOrder: OrderSubmission = {
                order_id: 2,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "LIMIT",
                trigger_price: 160.00,
                quantity: 1,
            };

            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{
                open: 150,
                high: 160,
                low: 140,
                last: 150,
                close: 150,
                volume: 100000,
                symbol: "AAPL",
                exchange: "NASDAQ",
                date: Math.floor(Date.now() / 1000)
            }]);

            const result = await processOrder(limitBuyOrder);
            expect(result).toBeTruthy();
        });

        it('should not fulfill a valid limit buy order when current price is higher than trigger price', async () => {
            const limitBuyOrder: OrderSubmission = {
                order_id: 3,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "LIMIT",
                trigger_price: 140.00,
                quantity: 1,
            };

            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{
                open: 150,
                high: 160,
                low: 140,
                last: 150,
                close: 150,
                volume: 100000,
                symbol: "AAPL",
                exchange: "NASDAQ",
                date: Math.floor(Date.now() / 1000)
            }]);

            const result = await processOrder(limitBuyOrder);
            expect(result).toBeNull();
        });

        it('fulfills limit sell when current price is higher than trigger price', async () => {
            const order: OrderSubmission = {
                order_id: 4,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "LIMIT",
                trigger_price: 140.00,
                quantity: -1,
            };

            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{ last: 150 }]);
            (getUserData as jest.Mock).mockResolvedValue({ current_balance: 200 });
            (getUserStocks as jest.Mock).mockResolvedValue([{ ticker_symbol: "AAPL", quantity: 10 }]);
            (insertTransaction as jest.Mock).mockResolvedValue({ ...order, price_per_share: 150 });

            const result = await processOrder(order);
            expect(result).toBeTruthy();
        });

        it('does not fulfill limit sell when current price is lower than trigger price', async () => {
            const order: OrderSubmission = {
                order_id: 5,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "LIMIT",
                trigger_price: 160.00,
                quantity: -1,
            };

            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{ last: 150 }]);
            (getUserData as jest.Mock).mockResolvedValue({ current_balance: 200 });
            (getUserStocks as jest.Mock).mockResolvedValue([{ ticker_symbol: "AAPL", quantity: 10 }]);

            const result = await processOrder(order);
            expect(result).toBeNull();
        });


        it('fulfills stop buy when current price is higher than trigger price', async () => {
            const order: OrderSubmission = {
                order_id: 6,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "STOP",
                trigger_price: 145.00,
                quantity: 1,
            };
            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{ last: 150 }]);
            (getUserData as jest.Mock).mockResolvedValue({ current_balance: 200 });
            (getUserStocks as jest.Mock).mockResolvedValue([]);
            (insertTransaction as jest.Mock).mockResolvedValue({ ...order, price_per_share: 150 });
            const result = await processOrder(order);
            expect(result).toBeTruthy();
        });

        it('does not fulfill stop buy when current price is lower than trigger price', async () => {
            const order: OrderSubmission = {
                order_id: 7,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "STOP",
                trigger_price: 155.00,
                quantity: 1,
            };
            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{ last: 150 }]);
            (getUserData as jest.Mock).mockResolvedValue({ current_balance: 200 });
            (getUserStocks as jest.Mock).mockResolvedValue([]);
            const result = await processOrder(order);
            expect(result).toBeNull();
        });

        it('fulfills stop sell when current price is lower than trigger price', async () => {
            const order: OrderSubmission = {
                order_id: 8,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "STOP",
                trigger_price: 155.00,
                quantity: -1,
            };

            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{ last: 150 }]);
            (getUserData as jest.Mock).mockResolvedValue({ current_balance: 200 });
            (getUserStocks as jest.Mock).mockResolvedValue([{ ticker_symbol: "AAPL", quantity: 10 }]);
            (insertTransaction as jest.Mock).mockResolvedValue({ ...order, price_per_share: 150 });

            const result = await processOrder(order);
            expect(result).toBeTruthy();
        });

        it('does not fulfill stop sell when current price is higher than trigger price', async () => {
            const order: OrderSubmission = {
                order_id: 9,
                user_id: 1,
                ticker_symbol: "AAPL",
                order_type: "STOP",
                trigger_price: 145.00,
                quantity: -1,
            };

            (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{ last: 150 }]);
            (getUserData as jest.Mock).mockResolvedValue({ current_balance: 200 });
            (getUserStocks as jest.Mock).mockResolvedValue([{ ticker_symbol: "AAPL", quantity: 10 }]);

            const result = await processOrder(order);
            expect(result).toBeNull();
        });
    });
});
