const connection = require('../databaseManager');

async function getWatchList(user_id) {
    const sql = `
        SELECT stock_symbol
        FROM Watch_List
        WHERE user_id = ?
    `;

    const result = await connection.query(sql, [user_id]);

    if (!result[0].length) {
        throw new Error(`No watchlist found for user ID: ${user_id}`);
    }

    return result[0];
}

module.exports = {
    getWatchList,
};

