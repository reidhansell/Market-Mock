const { executeQuery } = require('../queryExecutor');
const ExpectedError = require('../../tools/ExpectedError');

/*  Queries assume that the caller has already validated the data.
    As a last line of defense, the database has its own constraints
    which, when triggered, will be logged and returned as a 500 by the middleware.   */

async function registerUser(username, email, password) {
    const query = 'INSERT INTO User (username, email, password) VALUES (?, ?, ?)';
    const parameters = [username, email, password];
    const results = await executeQuery(query, parameters);
    if (!results.insertId) {
        throw new ExpectedError('Could not register new user.', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
    return results.insertId;
}

async function getUserData(user_id) {
    const query = `
        SELECT user_id, username, email, registration_date, starting_amount, current_balance
        FROM User
        WHERE user_id = ?
      `;
    const parameters = [user_id];
    const result = await executeQuery(query, parameters);
    if (result.length === 0) {
        return null;
    } else {
        return result[0]
    }
}

async function updateVerificationToken(user_id, verificationToken) {
    const query = 'UPDATE User SET verification_token = ? WHERE user_id = ?';
    const parameters = [verificationToken, user_id];
    const results = await executeQuery(query, parameters);
    if (results.affectedRows === 0) {
        throw new ExpectedError('Failed to update verification token.', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
    return true;
}

async function findUserByEmail(email) {
    const query = 'SELECT * FROM User WHERE email = ?';
    const parameters = [email];
    const results = await executeQuery(query, parameters);
    if (results.length === 0) {
        return null
    }
    return results[0];
}

async function findUserByUsername(username) {
    const query = 'SELECT * FROM User WHERE username = ?';
    const parameters = [username];
    const results = await executeQuery(query, parameters);
    if (results.length === 0) {
        return null
    }
    return results[0];
}

async function findUserById(id) {
    const query = 'SELECT * FROM User WHERE user_id = ?';
    const parameters = [id];
    const results = await executeQuery(query, parameters);
    if (results.length === 0) {
        return null;
    }
    return results[0];
}


async function updateEmailVerificationStatus(user_id) {
    const query = 'UPDATE User SET is_email_verified = ? WHERE user_id = ?';
    const parameters = [true, user_id];
    const results = await executeQuery(query, parameters);
    if (results.affectedRows === 0) {
        throw new ExpectedError('Could not update email verification status', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
    return true;
}


async function storeRefreshToken(token, user_id) {
    const expiry_date = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
    const query = "INSERT INTO Refresh_Token (user_id, token, expiry_date) VALUES (?, ?, ?)";
    const parameters = [user_id, token, expiry_date];
    const results = await executeQuery(query, parameters);
    if (!results.insertId) {
        throw new ExpectedError('Could not store refresh token', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
    return results.insertId;
}

async function isRefreshTokenStored(token) {
    const query = "SELECT * FROM Refresh_Token WHERE token = ?";
    const parameters = [token];
    const results = await executeQuery(query, parameters);
    if (results.length === 0) {
        return false;
    }
    return true;
}

async function deleteRefreshToken(token) {
    const query = "DELETE FROM Refresh_Token WHERE token = ?";
    const parameters = [token];
    const results = await executeQuery(query, parameters);
    if (results.affectedRows === 0) {
        throw new ExpectedError('Could not delete refresh token', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
    return true;
}

async function cleanupExpiredTokens() {
    const query = "DELETE FROM Refresh_Token WHERE expiry_date < NOW()";
    await executeQuery(query);
    return true;
}

module.exports = {
    getUserData,
    registerUser,
    updateVerificationToken,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    updateEmailVerificationStatus,
    storeRefreshToken,
    isRefreshTokenStored,
    deleteRefreshToken,
    cleanupExpiredTokens
};

