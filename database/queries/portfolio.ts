import { executeQuery } from '../queryExecutor';
import NetWorthData from '../../models/NetWorthData';
import UserStock from '../../models/UserStock';
import { Connection } from 'mysql';
import Transaction, { TransactionWithQuantity } from '../../models/Transaction';

async function getUserNetWorthData(user_id: number): Promise<NetWorthData[]> {
  const query = `
    SELECT user_id, recorded_at, net_worth
    FROM User_Net_Worth
    WHERE user_id = ?
    ORDER BY recorded_at DESC
    LIMIT 30
  `;
  const parameters = [user_id];
  const results = await executeQuery(query, parameters) as NetWorthData[];
  return results;
}

async function getUserStocks(user_id: number): Promise<UserStock[]> {
  const query = `SELECT *
    FROM User_Stocks
    WHERE user_id = ?
    AND quantity > 0`;
  const parameters = [user_id];
  const results = await executeQuery(query, parameters) as UserStock[];
  return results;
}

async function updateUserBalance(userId: number, amount: number, connection?: Connection): Promise<void> {
  const lockQuery = `SELECT * FROM User WHERE user_id = ? FOR UPDATE`;
  const lockParameters = [userId];
  await executeQuery(lockQuery, lockParameters, connection);

  const query = `UPDATE User SET current_balance = current_balance + ? WHERE user_id = ?`;
  const parameters = [amount, userId];
  await executeQuery(query, parameters, connection);
}

async function updateUserStocks(userId: number, tickerSymbol: string, quantity: number, connection?: Connection): Promise<void> {
  const checkQuery = `SELECT * FROM User_Stocks WHERE user_id = ? AND ticker_symbol = ?`;
  const checkParameters = [userId, tickerSymbol];
  const result = await executeQuery(checkQuery, checkParameters, connection) as UserStock[];

  if (result.length > 0) {
    const updateQuery = `UPDATE User_Stocks SET quantity = quantity + ? WHERE user_id = ? AND ticker_symbol = ?`;
    const updateParameters = [quantity, userId, tickerSymbol];
    await executeQuery(updateQuery, updateParameters, connection);
  } else {
    const insertQuery = `INSERT INTO User_Stocks (user_id, ticker_symbol, quantity) VALUES (?, ?, ?)`;
    const insertParameters = [userId, tickerSymbol, quantity];
    await executeQuery(insertQuery, insertParameters, connection);
  }
}

async function removeUserStocks(userId: number, tickerSymbol: string, connection?: Connection): Promise<void> {
  const query = `DELETE FROM User_Stocks WHERE user_id = ? AND ticker_symbol = ?`;
  const parameters = [userId, tickerSymbol];
  await executeQuery(query, parameters, connection);
}

async function getStockTransactions(userId: number, tickerSymbol: string) {
  const query = `SELECT Transaction.transaction_id, Transaction.price_per_share, Trade_Order.quantity, Transaction.transaction_date 
  FROM Transaction
  INNER JOIN Trade_Order ON Transaction.order_id = Trade_Order.order_id
  WHERE Trade_Order.ticker_symbol = ? AND Trade_Order.user_id = ? AND Trade_Order.quantity > 0
  ORDER BY Transaction.transaction_date ASC;
  `;
  const parameters = [tickerSymbol, userId];
  const result = await executeQuery(query, parameters) as TransactionWithQuantity[];
  return result;
}

export {
  getUserNetWorthData,
  getUserStocks,
  updateUserBalance,
  updateUserStocks,
  removeUserStocks,
  getStockTransactions
};
