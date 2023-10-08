import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import ExpectedError from '../tools/utils/ExpectedError';
import { getOrdersAndTransactionsByUserId, insertOrder } from '../database/queries/order';
import Order from '../models/Order';
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

        console.log(`User ${user_id} is attempting to create an order with the following parameters: ${JSON.stringify(req.body)}`)
        const order = await insertOrder({
            user_id,
            ticker_symbol,
            order_type,
            trigger_price,
            quantity,
        } as Order);
        console.log(`User ${user_id} successfully created an order with the following return: ${JSON.stringify(order)}`)

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

        console.log(`User ${user_id} is attempting to process an order with the following parameters: ${JSON.stringify(order)}`)
        const resultingOrder = await processOrder(order);
        console.log(`User ${user_id} successfully processed an order with the following return: ${JSON.stringify(resultingOrder)}`)
        if (resultingOrder === null) {
            return res.json(order);
        } else {
            return res.json(resultingOrder);
        }
    } catch (error) {
        next(error);
    }
});

export default router;
