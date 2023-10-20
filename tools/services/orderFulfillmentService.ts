/**
 * orderFulfillmentService
 * 
 * Responsibilities:
 * 
 * 1. processOrder Function:
 *    - Processes an individual order based on order type, user balance, and stock availability.
 *    - Fetches the latest market data to determine if the order can be fulfilled.
 *    - Validates the user’s funds and stock availability, and cancels the order if necessary.
 *    - Inserts transaction data and updates the user’s balance and stocks if the order is fulfilled.
 *    - Utilized by both the route handler for immediate order fulfillment and the fulfillOpenOrders function.
 *
 * 2. fulfillOpenOrders Function:
 *    - Retrieves all open orders and attempts to fulfill them.
 *    - Initiates transactions and calls the processOrder function for each order.
 *    - Handles transaction commits and rollbacks based on the outcome of the processOrder function.
 *    - Intended to be used by a cron job or scheduled task for batch processing of open orders.
 * 
 * Note: Transaction connection closures are handled by the caller/wrapper of these functions.
 */

import { getTransactionConnection } from '../../database/databaseConnector';
import { updateUserBalance, updateUserStocks, getUserStocks } from '../../database/queries/portfolio';
import { cancelOrder, insertTransaction, getOpenOrders } from '../../database/queries/order';
import { getUserData } from '../../database/queries/auth';
import { getIntradayDataForTicker } from "../../tools/services/intradayService";
import { calculateAndSaveUserNetWorth } from './netWorthService';
import { addNotification } from '../../database/queries/notification';
import { getQuests, updateQuest } from '../../database/queries/quests';
import Notification from '../../models/Notification';
import Order, { FulfilledOrder, OrderSubmission } from '../../models/Order';
import User from '../../models/User';
import UserStock from '../../models/UserStock';
import Transaction from '../../models/Transaction';
import { Connection } from 'mysql';
import { addTickerToWatchList } from '../../database/queries/watchlist';

async function handleQuestCompletion(fulfilledOrder: FulfilledOrder, transactionConnection: Connection) {
    const quests = await getQuests(fulfilledOrder.user_id);

    const fulfillBuyOrderQuest = quests.find(quest => quest.name === 'Fulfill a buy order');
    if (fulfillBuyOrderQuest && fulfillBuyOrderQuest.completion_date === null && fulfilledOrder.quantity > 0) {
        await updateQuest(fulfilledOrder.user_id, fulfillBuyOrderQuest.quest_id, transactionConnection);
    }

    const fulfillSellOrderQuest = quests.find(quest => quest.name === 'Fulfill a sell order');
    if (fulfillSellOrderQuest && fulfillSellOrderQuest.completion_date === null && fulfilledOrder.quantity < 0) {
        await updateQuest(fulfilledOrder.user_id, fulfillSellOrderQuest.quest_id, transactionConnection);
    }

    const profitQuest = quests.find(quest => quest.name === 'Make a profit');
    if (profitQuest && profitQuest.completion_date === null && fulfilledOrder.price_per_share > fulfilledOrder.trigger_price && fulfilledOrder.quantity < 0) {
        await updateQuest(fulfilledOrder.user_id, profitQuest.quest_id, transactionConnection);
    }
}

const checkAndCancelOrderIfInsufficientFunds = async (order: OrderSubmission, currentPrice: number, userData: User) => {
    const totalCost = parseFloat((currentPrice * order.quantity).toFixed(2));
    if (userData.current_balance < totalCost) {
        return await cancelOrder(order.order_id);
    }
    return false;
};

const checkAndCancelOrderIfInsufficientStocks = async (order: OrderSubmission, userStocks: UserStock[]) => {
    if (order.quantity < 0) {
        const userStock = userStocks.find(stock => stock.ticker_symbol === order.ticker_symbol);
        if (!userStock || userStock.quantity < Math.abs(order.quantity)) {
            return await cancelOrder(order.order_id);
        }
    }
    return false;
};

const canFulfillOrder = (order: OrderSubmission, currentPrice: number) => {
    return order.order_type === 'MARKET' ||
        (order.order_type === 'LIMIT' && ((order.quantity > 0 && currentPrice <= order.trigger_price) || (order.quantity < 0 && currentPrice >= order.trigger_price))) ||
        (order.order_type === 'STOP' && ((order.quantity > 0 && currentPrice >= order.trigger_price) || (order.quantity < 0 && currentPrice <= order.trigger_price)));
};

const processOrder = async (order: OrderSubmission): Promise<Order | FulfilledOrder | null> => {
    const transactionConnection = await getTransactionConnection();
    const tickerData = await getIntradayDataForTicker(order.ticker_symbol);
    const currentPrice = tickerData[0].last;
    transactionConnection.beginTransaction();
    const userData = await getUserData(order.user_id);

    if (canFulfillOrder(order, currentPrice)) {
        if (await checkAndCancelOrderIfInsufficientFunds(order, currentPrice, userData)) {
            return { ...order, cancelled: true } as Order;
        }

        const userStocks = await getUserStocks(order.user_id);
        if (await checkAndCancelOrderIfInsufficientStocks(order, userStocks)) {
            return { ...order, cancelled: true } as Order;
        }
        const fulfilledOrder = await insertTransaction({ order_id: order.order_id, price_per_share: currentPrice } as Transaction, transactionConnection);

        if (fulfilledOrder) {
            await updateUserBalance(fulfilledOrder.user_id, parseFloat((currentPrice * fulfilledOrder.quantity).toFixed(2)), transactionConnection);
            await updateUserStocks(fulfilledOrder.user_id, fulfilledOrder.ticker_symbol, fulfilledOrder.quantity, transactionConnection);
            transactionConnection.commit();
            await addTickerToWatchList(fulfilledOrder.user_id, fulfilledOrder.ticker_symbol);

            await handleQuestCompletion(fulfilledOrder, transactionConnection);

            await calculateAndSaveUserNetWorth(fulfilledOrder.user_id);

            await addNotification({ user_id: fulfilledOrder.user_id, content: `Your order for ${fulfilledOrder.quantity} shares of ${fulfilledOrder.ticker_symbol} has been fulfilled at $${fulfilledOrder.price_per_share}.`, success: true } as Notification, transactionConnection);

            return fulfilledOrder;
        }
    }

    transactionConnection.rollback();
    return null;
};

const fulfillOpenOrders = async () => {
    const openOrders = await getOpenOrders();
    for (const order of openOrders) {
        try {
            await processOrder(order);
        } catch (error) {
            console.error(error);
        }
    }
};

export { fulfillOpenOrders, processOrder };