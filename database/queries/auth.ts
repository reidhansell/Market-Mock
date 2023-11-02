import { ResultObject, executeQuery } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import User, { UserSensitive } from '../../models/User';
import RefreshToken from '../../models/RefreshToken';
import { getTransactionConnection } from '../databaseConnector';
import Order from '../../models/Order';

async function registerUser(username: string, email: string, password: string): Promise<number> {
    const query = 'INSERT INTO User (username, email, password) VALUES (?, ?, ?)';
    const parameters = [username, email, password];
    const results = await executeQuery(query, parameters) as ResultObject;
    if (!results.insertId) {
        throw new ExpectedError(
            'Could not register new user.',
            500,
            `Failed query: "${query}" with parameters: "${parameters}"`
        );
    }
    return results.insertId;
}

async function getUserData(user_id: number): Promise<User> {
    const query = `
        SELECT user_id, username, email, registration_date, starting_amount, current_balance, is_email_verified
        FROM User
        WHERE user_id = ?
    `;
    const parameters = [user_id];
    const results = await executeQuery(query, parameters) as User[];
    if (results.length === 0) {
        throw new ExpectedError(
            'Could not get user data.',
            500,
            `Failed query: "${query}" with parameters: "${parameters}"`
        );
    } else {
        return results[0];
    }
}

async function updateVerificationToken(user_id: number, verificationToken: string): Promise<void> {
    const query = 'UPDATE User SET verification_token = ? WHERE user_id = ?';
    const parameters = [verificationToken, user_id];
    const results = await executeQuery(query, parameters) as ResultObject;
    if (results.affectedRows === 0) {
        throw new ExpectedError(
            'Failed to update verification token.',
            500,
            `Failed query: "${query}" with parameters: "${parameters}"`
        );
    }
}

async function findUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM User WHERE email = ?';
    const parameters = [email];
    const results = await executeQuery(query, parameters) as User[];
    if (results.length === 0) {
        return null;
    }
    return results[0];
}

async function findUserSensitiveByEmail(email: string): Promise<UserSensitive | null> {
    const query = 'SELECT * FROM User WHERE email = ?';
    const parameters = [email];
    const results = await executeQuery(query, parameters) as UserSensitive[];
    if (results.length === 0) {
        return null;
    }
    return { ...results[0], password: results[0].password, verification_token: results[0].verification_token }
}

async function findUserByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM User WHERE username = ?';
    const parameters = [username];
    const results = await executeQuery(query, parameters) as User[];
    if (results.length === 0) {
        return null;
    }
    return results[0];
}

async function findUserById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM User WHERE user_id = ?';
    const parameters = [id];
    const results = await executeQuery(query, parameters) as User[];
    if (results.length === 0) {
        return null;
    }
    return results[0];
}

async function updateEmailVerificationStatus(user_id: number): Promise<void> {
    const query = 'UPDATE User SET is_email_verified = ? WHERE user_id = ?';
    const parameters = [true, user_id];
    const results = await executeQuery(query, parameters) as ResultObject;
    if (results.affectedRows === 0) {
        throw new ExpectedError(
            'Could not update email verification status',
            500,
            `Failed query: "${query}" with parameters: "${parameters}"`
        );
    }
}

async function storeRefreshToken(token: string, user_id: number): Promise<number> {
    const expiry_date = Math.floor(new Date().getTime() / 1000 + (7 * 24 * 60 * 60 * 1000));
    const query = 'INSERT INTO Refresh_Token (user_id, token, expiry_date) VALUES (?, ?, ?)';
    const parameters = [user_id, token, expiry_date];
    const results = await executeQuery(query, parameters) as ResultObject;
    if (!results.insertId) {
        throw new ExpectedError(
            'Could not store refresh token',
            500,
            `Failed query: "${query}" with parameters: "${parameters}"`
        );
    }
    return results.insertId;
}

async function isRefreshTokenStored(token: string): Promise<boolean> {
    const query = 'SELECT * FROM Refresh_Token WHERE token = ?';
    const parameters = [token];
    const results = await executeQuery(query, parameters) as RefreshToken[];
    if (results.length === 0) {
        return false;
    }
    return true;
}

async function deleteRefreshToken(token: string): Promise<void> {
    const query = 'DELETE FROM Refresh_Token WHERE token = ?';
    const parameters = [token];
    const results = await executeQuery(query, parameters) as ResultObject;
    if (results.affectedRows === 0) {
        throw new ExpectedError(
            'Could not delete refresh token',
            500,
            `Failed query: "${query}" with parameters: "${parameters}"`
        );
    }
}

async function cleanupExpiredTokens(): Promise<void> {
    const query = 'DELETE FROM Refresh_Token WHERE expiry_date < UNIX_TIMESTAMP(NOW()) * 1000';
    await executeQuery(query);
}

/* User_Reset (
                reset_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                starting_amount DECIMAL(15, 2),
                end_amount DECIMAL(15, 2),
                reset_date BIGINT DEFAULT (UNIX_TIMESTAMP()),
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )
*/

async function resetUserData(user_id: Number, starting_amount: Number) {

    const transaction = await getTransactionConnection();

    const userSnapshotQuery = 'SELECT * FROM User WHERE user_id = ?'
    const snapshotParameters = [user_id];
    const userSnapshot = await executeQuery(userSnapshotQuery, snapshotParameters, transaction) as User[];

    const saveUserSnapshotQuery = 'INSERT INTO User_Reset (user_id, starting_amount, end_amount) VALUES (?, ?, ?)';
    const saveUserSnapshotParameters = [user_id, userSnapshot[0].starting_amount, userSnapshot[0].current_balance];
    const saveUserSnapshotResults = await executeQuery(saveUserSnapshotQuery, saveUserSnapshotParameters, transaction) as ResultObject;

    const resetUserDataQuery = 'UPDATE User SET current_balance = ?, starting_amount = ? WHERE user_id = ?';
    const resetUserDataParameters = [starting_amount, starting_amount, user_id];
    const resetUserDataResults = await executeQuery(resetUserDataQuery, resetUserDataParameters, transaction) as ResultObject;

    const clearUserNetWorthQuery = 'DELETE FROM User_Net_Worth WHERE user_id = ?';
    const clearUserNetWorthParameters = [user_id];
    const clearUserNetWorthResults = await executeQuery(clearUserNetWorthQuery, clearUserNetWorthParameters, transaction) as ResultObject;

    const setUserNetWorthQuery = 'INSERT INTO User_Net_Worth (user_id, net_worth) VALUES (?, ?)';
    const setUserNetWorthParameters = [user_id, starting_amount];
    const setUserNetWorthResults = await executeQuery(setUserNetWorthQuery, setUserNetWorthParameters, transaction) as ResultObject;

    const resetUserStocksQuery = 'DELETE FROM User_Stocks WHERE user_id = ?';
    const resetUserStocksParameters = [user_id];
    const resetUserStocksResults = await executeQuery(resetUserStocksQuery, resetUserStocksParameters, transaction) as ResultObject;

    const resetUserWatchlistQuery = 'DELETE FROM Watch_List WHERE user_id = ?';
    const resetUserWatchlistParameters = [user_id];
    const resetUserWatchlistResults = await executeQuery(resetUserWatchlistQuery, resetUserWatchlistParameters, transaction) as ResultObject;

    const resetUserQuestsQuery = 'DELETE FROM User_Quest WHERE user_id = ?';
    const resetUserQuestsParameters = [user_id];
    const resetUserQuestsResults = await executeQuery(resetUserQuestsQuery, resetUserQuestsParameters, transaction) as ResultObject;

    const resetUserNotificationsQuery = 'DELETE FROM Notification WHERE user_id = ?';
    const resetUserNotificationsParameters = [user_id];
    const resetUserNotificationsResults = await executeQuery(resetUserNotificationsQuery, resetUserNotificationsParameters, transaction) as ResultObject;

    const getUserOrdersQuery = 'SELECT * FROM Trade_Order WHERE user_id = ?';
    const getUserOrdersParameters = [user_id];
    const getUserOrdersResults = await executeQuery(getUserOrdersQuery, getUserOrdersParameters, transaction) as Order[];

    for (let order of getUserOrdersResults) {
        const resetUserTransactionsQuery = 'DELETE FROM Transaction WHERE order_id = ? ';
        const resetUserTransactionsParameters = [order.order_id];
        const resetUserTransactionsResults = await executeQuery(resetUserTransactionsQuery, resetUserTransactionsParameters, transaction) as ResultObject;
        if (resetUserTransactionsResults.affectedRows === 0) {
            transaction.rollback();
            throw new ExpectedError(
                'Could not reset user data',
                500,
                `Failed to delete order in resetUserData with parameters: "${user_id}", "${starting_amount}"`
            );
        }
    }
    const resetUserOrdersQuery = 'DELETE FROM Trade_Order WHERE user_id = ?';
    const resetUserOrdersParameters = [user_id];
    const resetUserOrdersResults = await executeQuery(resetUserOrdersQuery, resetUserOrdersParameters, transaction) as ResultObject;

    if (saveUserSnapshotResults.affectedRows === 0 ||
        resetUserDataResults.affectedRows === 0 ||
        clearUserNetWorthResults.affectedRows === 0 ||
        setUserNetWorthResults.affectedRows === 0 // ||
        //resetUserStocksResults.affectedRows === 0 ||
        //resetUserWatchlistResults.affectedRows === 0 ||
        //resetUserQuestsResults.affectedRows === 0 ||
        //resetUserNotificationsResults.affectedRows === 0 ||
        //resetUserTransactionsResults.affectedRows === 0 ||
        //resetUserOrdersResults.affectedRows === 0 
    ) {
        transaction.rollback();
        throw new ExpectedError(
            'Could not reset user data',
            500,
            `Failed a query in resetUserData with parameters: "${user_id}", "${starting_amount}"`
        );
    } else {
        transaction.commit();
    }
}

export {
    getUserData,
    registerUser,
    updateVerificationToken,
    findUserByEmail,
    findUserSensitiveByEmail,
    findUserByUsername,
    findUserById,
    updateEmailVerificationStatus,
    storeRefreshToken,
    isRefreshTokenStored,
    deleteRefreshToken,
    cleanupExpiredTokens,
    resetUserData
};
