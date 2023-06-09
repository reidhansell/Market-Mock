const connection = require('../databaseManager');

async function getUserData(user_id) {
    const sql = `
        SELECT user_id, username, email, registration_date, starting_amount, current_balance
        FROM Users
        WHERE user_id = ?
    `;

    const result = await connection.query(sql, [user_id]);

    if (!result[0].length) {
        throw new Error(`No user found with ID: ${user_id}`);
    }

    return result[0][0];
}

module.exports = {
    getUserData,
};


