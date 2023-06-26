const { executeQuery } = require('../queryExecutor');
const ExpectedError = require('../../tools/ExpectedError');

/*  Queries assume that the caller has already validated the data.
    As a last line of defense, the database has its own constraints
    which, when triggered, will be logged and returned as a 500.   */

async function getWatchList(user_id) {
    const sql = `
        SELECT stock_symbol
        FROM Watch_List
        WHERE user_id = ?
    `;
    const result = await executeQuery(sql, [user_id]);
    if (result.length === 0) {
        throw new ExpectedError('No watchlist found.', 404, `Query: "${sql}" with parameters: "${user_id}" returned no results`);
    }
    return result;
}

module.exports = {
    getWatchList,
};


