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
import { getUserData } from '../../database/queries/auth'
import { getIntradayDataForTicker } from "../../tools/services/intradayService";
import Transaction from '../../models/Transaction';
import Order from '../../models/Order';
import { Connection } from 'mysql';
import { calculateAndSaveUserNetWorth } from './NetWorthService';
import { addNotification } from '../../database/queries/notification';
import Notification from '../../models/Notification';

const processOrder = async (order: Order, transactionConnection: Connection) => {
    const tickerData = await getIntradayDataForTicker(order.ticker_symbol);
    const currentPrice = tickerData[tickerData.length - 1].close;
    const totalCost = currentPrice * order.quantity;
    const userData = await getUserData(order.user_id);
    console.log(`Processing order ${order.order_id} for user ${order.user_id} with current price ${currentPrice} and total cost ${totalCost}`);

    console.log(`Is order ${order.order_id} a buy order? ${order.quantity > 0}`)
    if (order.quantity < 0) {
        const userStocks = await getUserStocks(order.user_id);
        console.log(`User ${order.user_id} has ${userStocks.length} stocks`);
        const userStock = userStocks.find(stock => stock.ticker_symbol === order.ticker_symbol);
        console.log(`User ${order.user_id} has ${userStock ? userStock.quantity : 0} stocks of ${order.ticker_symbol}`);
        if (!userStock || userStock.quantity < Math.abs(order.quantity)) {
            console.log(`Insufficient stocks for order ${order.order_id} with quantity ${order.quantity} and user stock quantity ${userStock ? userStock.quantity : 0}`);
            const result = await cancelOrder(order.order_id);
            console.log("result: " + result);
            if (result) {
                return { ...order, cancelled: true }
            } else {
                throw new Error("Error while cancelling due to insufficient stocks");
            }
        }
    }

    console.log(`User ${order.user_id} has ${userData.current_balance} balance`);
    if (userData.current_balance < totalCost) {
        console.log(`Insufficient funds for order ${order.order_id} with total cost ${totalCost} and current balance ${userData.current_balance}`);
        const result = await cancelOrder(order.order_id);
        if (result) {
            return { ...order, cancelled: true }
        } else {
            throw new Error("Error while cancelling due to insufficient stocks");
        }
    }

    let fulfilledOrder = null;
    console.log(`Is order ${order.order_id} a market order? ${order.order_type === 'MARKET'}`);
    console.log(`Is order ${order.order_id} a limit order? ${order.order_type === 'LIMIT'}`);
    console.log(`Is order ${order.order_id} a stop order? ${order.order_type === 'STOP'}`);
    console.log(`Performing checks for limit and stop orders based on current price and trigger price with values: ${currentPrice} and ${order.trigger_price}`)
    if (order.order_type === 'MARKET' ||
        (order.order_type === 'LIMIT' && ((order.quantity > 0 && currentPrice <= order.trigger_price) || (order.quantity < 0 && currentPrice >= order.trigger_price))) ||
        (order.order_type === 'STOP' && ((order.quantity > 0 && currentPrice >= order.trigger_price) || (order.quantity < 0 && currentPrice <= order.trigger_price)))) {
        fulfilledOrder = await insertTransaction({ order_id: order.order_id, price_per_share: currentPrice } as Transaction, transactionConnection);
    } else {
        console.log(`Order ${order.order_id} is not a market order and current price ${currentPrice} is not within trigger price ${order.trigger_price}`);
    }

    if (fulfilledOrder != null) {
        console.log(`Fulfilled order ${order.order_id} with transaction ${fulfilledOrder.transaction_id}`);
        await updateUserBalance(order.user_id, totalCost, transactionConnection);
        await updateUserStocks(order.user_id, order.ticker_symbol, order.quantity, transactionConnection);
        await calculateAndSaveUserNetWorth(order.user_id);
    }
    console.log(`Processed order ${order.order_id} and got ${fulfilledOrder}`);
    addNotification({ user_id: order.user_id, content: `Your order for ${order.quantity} shares of ${order.ticker_symbol} has been fulfilled.`, success: true } as Notification)
    return fulfilledOrder;
}

const fulfillOpenOrders = async () => {
    const openOrders = await getOpenOrders();
    console.log('===============================');
    console.log(`Fulfilling ${openOrders.length} open orders`);

    for (const order of openOrders) {
        console.log(`Fulfilling order ${order.order_id}`);
        const transactionConnection = await getTransactionConnection();
        try {
            transactionConnection.beginTransaction();
            const fulfilledOrder = await processOrder(order, transactionConnection);
            console.log(`Tried to process ${order.order_id} and got ${fulfilledOrder}`);
            if (fulfilledOrder != null) {
                if (fulfilledOrder.cancelled) {
                    console.log(`Order ${order.order_id} was cancelled`);
                } else { console.log(`Fulfilled order ${order.order_id}`); }

                transactionConnection.commit();
            } else {
                console.log(`Failed to fulfill order ${order.order_id}`);
                transactionConnection.rollback();
            }
        } catch (error) {
            console.error(`Failed to fulfill order ${order.order_id}:`, error);
            transactionConnection.rollback();
        } finally {
            transactionConnection.end();
        }
    }
}

export { fulfillOpenOrders, processOrder }
