import { executeQuery } from '../QueryExecutor';
import WatchList from '../../models/WatchList';

async function getWatchList(user_id: number): Promise<WatchList[]> {
    const query = `
    SELECT stock_symbol
    FROM Watch_List
    WHERE user_id = ?
  `;
    const parameters = [user_id];
    const results = await executeQuery(query, parameters) as WatchList[];
    /* Empty set acceptable, not looking for a particular record */
    return results;
}

export {
    getWatchList,
};


