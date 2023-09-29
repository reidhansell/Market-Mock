import { executeQuery, ResultObject } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import Order, { FulfilledOrder } from '../../models/Order';
import Transaction from '../../models/Transaction';
import { Connection } from 'mysql';

async function getOrdersAndTransactionsByUserId(user_id: number): Promise<Order[]> {
    const query = `
        SELECT o.*, t.transaction_id, t.price_per_share, t.transaction_date
        FROM Trade_Order o
        LEFT JOIN Transaction t ON o.order_id = t.order_id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC, t.transaction_date DESC
        LIMIT 1000;
    `;
    const parameters = [user_id];
    const results = await executeQuery(query, parameters) as any[];
    return results.map(result => ({
        order_id: result.order_id,
        user_id: result.user_id,
        ticker_symbol: result.ticker_symbol,
        order_type: result.order_type,
        trigger_price: result.trigger_price,
        quantity: result.quantity,
        fulfilled: result.fulfilled,
        cancelled: result.cancelled,
        order_date: result.order_date,
        transaction: result.transaction_id ? {
            transaction_id: result.transaction_id,
            order_id: result.order_id,
            price_per_share: result.price_per_share,
            transaction_date: result.transaction_date
        } : undefined
    }));
}

async function getOpenOrders(): Promise<Order[]> {
    const insertQuery = `SELECT o.*
    FROM Trade_Order o
    LEFT JOIN Transaction t ON o.order_id = t.order_id
    WHERE t.order_id IS NULL
    AND o.cancelled IS FALSE;`;
    const queryResults = await executeQuery(insertQuery, []) as Order[];
    return queryResults;
}

async function insertOrder(order: Order, connection?: Connection): Promise<Order> {
    const insertQuery = `
        INSERT INTO Trade_Order (user_id, ticker_symbol, order_type, trigger_price, quantity)
        VALUES (?, ?, ?, ?, ?)`;
    const parameters = [order.user_id, order.ticker_symbol, order.order_type, order.trigger_price, order.quantity];
    const queryResults = await executeQuery(insertQuery, parameters, connection) as ResultObject;

    if (queryResults.affectedRows === 0) {
        throw new ExpectedError('Failed to insert order', 500, `Failed query: "${insertQuery}" with parameters: "${parameters}"`);
    }

    const orderId = queryResults.insertId;
    const selectQuery = `SELECT * FROM Trade_Order WHERE order_id = ?`;
    const orderResults = await executeQuery(selectQuery, [orderId], connection) as Order[];

    if (orderResults.length === 0) {
        throw new ExpectedError('Failed to retrieve the inserted order', 500, `Failed to find the inserted order with ID: ${orderId}`);
    }

    return orderResults[0] as Order;
}

async function insertTransaction(transaction: Transaction, connection?: Connection): Promise<FulfilledOrder> {
    const insertQuery = `
        INSERT INTO Transaction (order_id, price_per_share)
        VALUES (?, ?)
    `;
    const insertParameters = [transaction.order_id, transaction.price_per_share];
    const insertResults = await executeQuery(insertQuery, insertParameters, connection) as ResultObject;

    if (insertResults.affectedRows === 0) {
        throw new ExpectedError('Failed to insert transaction', 500, `Failed query: "${insertQuery}" with parameters: "${insertParameters}"`);
    }

    const transactionId = insertResults.insertId;

    const selectJoinedOrderQuery = `
        SELECT o.*, t.*
        FROM Trade_Order o
        JOIN Transaction t ON o.order_id = t.order_id
        WHERE t.transaction_id = ?
    `;

    const joinedOrderResult = await executeQuery(selectJoinedOrderQuery, [transactionId], connection) as Order[];
    console.log(joinedOrderResult);
    const joinedOrder = joinedOrderResult[0] as FulfilledOrder;

    if (!joinedOrder) {
        throw new ExpectedError('Failed to fetch the joined order', 500, `Failed to fetch the joined order with transaction_id: "${transactionId}"`);
    }

    return joinedOrder;
}

async function cancelOrder(orderId: number, connection?: Connection): Promise<boolean> {
    const cancelQuery = `
        UPDATE Trade_Order 
        SET cancelled = true
        WHERE order_id = ? AND cancelled = false
    `;
    const parameters = [orderId];
    const queryResults = connection ? await executeQuery(cancelQuery, parameters, connection) as ResultObject : await executeQuery(cancelQuery, parameters) as ResultObject;
    if (queryResults.affectedRows === 0) {
        throw new ExpectedError('Failed to cancel the order', 500, `Failed to cancel the order with ID: ${orderId}`);
    }

    return true;
}

export {
    getOrdersAndTransactionsByUserId,
    getOpenOrders,
    insertOrder,
    insertTransaction,
    cancelOrder
};
