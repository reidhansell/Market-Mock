const connection = require('../databaseManager');

function getWatchList(user_id) {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT stock_symbol
      FROM Watch_List
      WHERE user_id = ?
    `;
        connection.query(sql, [user_id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    getWatchList,
};
