import { executeQuery } from '../QueryExecutor';
import ExpectedError from '../../tools/ExpectedError';
import WatchList from '../../models/WatchList';

async function getWatchList(user_id: number): Promise<WatchList[]> {
    const sql = `
    SELECT stock_symbol
    FROM Watch_List
    WHERE user_id = ?
  `;
    const results = await executeQuery(sql, [user_id]) as WatchList[];
    if (results.length === 0) {
        throw new ExpectedError(
            'No watchlist found.',
            404,
            `Query: "${sql}" with parameters: "${user_id}" returned no results`
        );
    }
    return results;
}

export {
    getWatchList,
};


