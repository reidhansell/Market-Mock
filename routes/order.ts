import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import ExpectedError from '../tools/utils/ExpectedError';
import { cancelOrder, getOrdersAndTransactionsByUserId, insertOrder, getOrder } from '../database/queries/order';
import Order from '../models/Order';
import { processOrder } from '../tools/services/orderFulfillmentService'
import { getQuests, updateQuest } from '../database/queries/quests';
import { getTransactionConnection } from '../database/databaseConnector';

interface AuthenticatedRequest extends Request {
    user: {
        user_id: number;
    }
}

async function handleOrderQuests(user_id: number, order: Order) {
    const quests = await getQuests(user_id);
    const buyOrderQuest = quests.find(quest => quest.name === 'Place a buy order');
    const sellOrderQuest = quests.find(quest => quest.name === 'Place a sell order');
    const limitOrderQuest = quests.find(quest => quest.name === 'Place a limit order');
    const stopOrderQuest = quests.find(quest => quest.name === 'Place a stop order');
    const marketOrderQuest = quests.find(quest => quest.name === 'Place a market order');

    buyOrderQuest && buyOrderQuest.completion_date === null && order.quantity > 0 ? await updateQuest(user_id, buyOrderQuest.quest_id) : null;
    sellOrderQuest && sellOrderQuest.completion_date === null && order.quantity < 0 ? await updateQuest(user_id, sellOrderQuest.quest_id) : null;
    limitOrderQuest && limitOrderQuest.completion_date === null && order.order_type === 'LIMIT' ? await updateQuest(user_id, limitOrderQuest.quest_id) : null;
    stopOrderQuest && stopOrderQuest.completion_date === null && order.order_type === 'STOP' ? await updateQuest(user_id, stopOrderQuest.quest_id) : null;
    marketOrderQuest && marketOrderQuest.completion_date === null && order.order_type === 'MARKET' ? await updateQuest(user_id, marketOrderQuest.quest_id) : null;
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

        const order = await insertOrder({
            user_id,
            ticker_symbol,
            order_type,
            trigger_price,
            quantity,
        } as Order);

        await handleOrderQuests(user_id, order);

        const resultingOrder = await processOrder(order);

        if (resultingOrder === null) {
            return res.json(order);
        } else {
            return res.json(resultingOrder);
        }
    } catch (error) {
        next(error);
    }
});

router.delete('/:order_id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.params;
        const { user_id } = (req as AuthenticatedRequest).user;

        if (!order_id) {
            throw new ExpectedError("Invalid order id", 400, "Order cancellation failed with invalid order id");
        }

        const connection = await getTransactionConnection();

        const order = await getOrder(parseInt(order_id), connection);

        if (order.user_id !== user_id) {
            throw new ExpectedError("Invalid order id", 400, "User attempted to cancel an order that does not belong to them");
        }

        if (order.cancelled || order.transaction_id !== null) {
            throw new ExpectedError("Order is not open", 400, "Order cancellation failed with order not open");
        }

        const result = await cancelOrder(parseInt(order_id), connection);

        if (result) {
            connection.commit();

            res.json({ message: "Order cancelled successfully" });
        } else {
            connection.rollback();
        }

    } catch (error) {
        next(error);
    }
});

export default router;
