import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import ExpectedError from '../tools/utils/ExpectedError';
import {
    getOrdersAndTransactionsByUserId,
    insertOrder,
    cancelOrder
} from '../database/queries/order';
import Order, { FulfilledOrder } from '../models/Order';
import { getTransactionConnection } from '../database/databaseConnector';
import { updateUserBalance, updateUserStocks, getUserStocks } from '../database/queries/portfolio';
import { processOrder } from '../tools/services/orderFulfillmentService'
import { getQuests, updateQuest } from '../database/queries/quests';

interface AuthenticatedRequest extends Request {
    user: {
        user_id: number;
    }
}

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;

        const orders = await getOrdersAndTransactionsByUserId(user_id);
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    const transactionConnection = await getTransactionConnection();
    try {
        const { ticker_symbol, order_type, trigger_price, quantity } = req.body;
        const { user_id } = (req as AuthenticatedRequest).user;

        if (!ticker_symbol || typeof ticker_symbol !== 'string') {
            throw new ExpectedError("Invalid ticker symbol", 400, "Order creation failed with invalid ticker symbol");
        }

        const validOrderTypes = ['MARKET', 'LIMIT', 'STOP'];
        if (!order_type || !validOrderTypes.includes(order_type)) {
            throw new ExpectedError("Invalid order type", 400, "Order creation failed with invalid order type");
        }

        if (typeof trigger_price !== 'number') {
            throw new ExpectedError("Invalid trigger price", 400, "Order creation failed with invalid trigger price");
        }

        if (!quantity || typeof quantity !== 'number' || quantity === 0) {
            throw new ExpectedError("Invalid quantity. Quantity must be a non-zero number.", 400, "Order creation failed with invalid quantity");
        }

        transactionConnection.beginTransaction();

        const order = await insertOrder({
            user_id,
            ticker_symbol,
            order_type,
            trigger_price,
            quantity,
        } as Order, transactionConnection);

        if (quantity < 0) {
            const userStocks = await getUserStocks(user_id);
            const userStock = userStocks.find(stock => stock.ticker_symbol === ticker_symbol);
            if (!userStock || userStock.quantity < Math.abs(quantity)) {
                await cancelOrder(order.order_id, transactionConnection);
                throw new ExpectedError("Insufficient stocks", 400, "Order was placed but cannot be fulfilled due to insufficient stocks and therefore has been cancelled");
            }
        }

        const quests = await getQuests(user_id);
        const buyOrderQuest = quests.find(quest => quest.name === 'Place a buy order');
        const sellOrderQuest = quests.find(quest => quest.name === 'Place a sell order');
        const limitOrderQuest = quests.find(quest => quest.name === 'Place a limit order');
        const stopOrderQuest = quests.find(quest => quest.name === 'Place a stop order');
        const marketOrderQuest = quests.find(quest => quest.name === 'Place a market order');

        buyOrderQuest && buyOrderQuest.completion_date === null && order.quantity > 0 ? await updateQuest(user_id, buyOrderQuest.quest_id, transactionConnection) : null;
        sellOrderQuest && sellOrderQuest.completion_date === null && order.quantity < 0 ? await updateQuest(user_id, sellOrderQuest.quest_id, transactionConnection) : null;
        limitOrderQuest && limitOrderQuest.completion_date === null && order.order_type === 'LIMIT' ? await updateQuest(user_id, limitOrderQuest.quest_id, transactionConnection) : null;
        stopOrderQuest && stopOrderQuest.completion_date === null && order.order_type === 'STOP' ? await updateQuest(user_id, stopOrderQuest.quest_id, transactionConnection) : null;
        marketOrderQuest && marketOrderQuest.completion_date === null && order.order_type === 'MARKET' ? await updateQuest(user_id, marketOrderQuest.quest_id, transactionConnection) : null;

        const fulfilledOrder = await processOrder(order, transactionConnection) as FulfilledOrder;

        if (fulfilledOrder) {
            await updateUserBalance(user_id, fulfilledOrder.price_per_share * fulfilledOrder.quantity, transactionConnection);
            await updateUserStocks(user_id, ticker_symbol, quantity, transactionConnection);
            transactionConnection.commit();
            return res.json(fulfilledOrder);
        } else {
            transactionConnection.commit();
            return res.json(order);
        }
    } catch (error) {
        if (transactionConnection) transactionConnection.rollback();
        next(error);
    } finally {
        if (transactionConnection) transactionConnection.end();
    }
});

export default router;
