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

export {
  getWatchList,
};


