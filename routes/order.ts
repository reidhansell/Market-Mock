import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import ExpectedError from '../tools/utils/ExpectedError';
import {
    getOrdersAndTransactionsByUserId,
    insertOrder,
    insertTransaction,
    cancelOrder
} from '../database/queries/order';
import Order from '../models/Order';
import { getIntradayDataForTicker } from "../tools/services/intradayService";
import Transaction from '../models/Transaction';
import { getUserData } from '../database/queries/auth';
import { getTransactionConnection } from '../database/databaseConnector';
import { updateUserBalance, updateUserStocks, getUserStocks } from '../database/queries/portfolio';

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
        res.json({ orders: orders });
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

        const tickerData = await getIntradayDataForTicker(ticker_symbol);
        const userData = await getUserData(user_id);
        const currentPrice = tickerData[tickerData.length - 1].close;
        const totalCost = currentPrice * quantity

        if (userData.current_balance < totalCost) {
            await cancelOrder(order.order_id, transactionConnection);
            throw new ExpectedError("Insufficient funds", 400, "Order was placed but cannot be fulfilled due to insufficient funds and therefore has been cancelled");
        }

        let fulfilledOrder;
        if (order_type === 'MARKET') {
            fulfilledOrder = await insertTransaction({ order_id: order.order_id, price_per_share: currentPrice } as Transaction, transactionConnection);
        } else if (order_type === 'LIMIT') {
            if ((quantity > 0 && currentPrice <= trigger_price) || (quantity < 0 && currentPrice >= trigger_price)) {
                fulfilledOrder = await insertTransaction({ order_id: order.order_id, price_per_share: currentPrice } as Transaction, transactionConnection);
            }
        } else if (order_type === 'STOP') {
            if ((quantity > 0 && currentPrice >= trigger_price) || (quantity < 0 && currentPrice <= trigger_price)) {
                fulfilledOrder = await insertTransaction({ order_id: order.order_id, price_per_share: currentPrice } as Transaction, transactionConnection);
            }
        }

        if (fulfilledOrder) {
            updateUserBalance(user_id, totalCost, transactionConnection);
            updateUserStocks(user_id, ticker_symbol, quantity, transactionConnection);
            transactionConnection.commit();
            return res.json(fulfilledOrder);
        } else {
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
