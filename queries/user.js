const connection = require('../databaseManager');

function getUserData(user_id) {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT user_id, username, email, registration_date, starting_amount, current_balance
      FROM Users
      WHERE user_id = ?
    `;
        connection.query(sql, [user_id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0]);
            }
        });
    });
};

module.exports = {
    getUserData,
};
