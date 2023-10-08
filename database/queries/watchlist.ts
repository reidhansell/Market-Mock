import { executeQuery } from '../queryExecutor';
import WatchList from '../../models/WatchList';

async function getWatchList(user_id: number): Promise<WatchList[]> {
  const query = `
    SELECT wl.ticker_symbol, t.company_name
    FROM Watch_List wl
    JOIN Ticker t ON wl.ticker_symbol = t.ticker_symbol
    WHERE wl.user_id = ?
  `;
  const parameters = [user_id];
  const results = await executeQuery(query, parameters) as WatchList[];
  return results;
}

async function addTickerToWatchList(user_id: number, ticker_symbol: string): Promise<void> {
  const query = `
      INSERT INTO Watch_List (user_id, ticker_symbol)
      VALUES (?, ?)
  `;
  const parameters = [user_id, ticker_symbol];

  try {
    await executeQuery(query, parameters);
  } catch (error: any) {
    if (error.code !== 'ER_DUP_ENTRY') { //MySQL error code for duplicate entry
      throw error;
    }
  }
}


async function removeTickerFromWatchList(user_id: number, ticker_symbol: string): Promise<void> {
  const query = `
    DELETE FROM Watch_List
    WHERE user_id = ? AND ticker_symbol = ?
  `;
  const parameters = [user_id, ticker_symbol];
  await executeQuery(query, parameters);
}

export {
  getWatchList, addTickerToWatchList, removeTickerFromWatchList
};


