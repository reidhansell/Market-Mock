const connection = require('../databaseManager');

async function registerUser(username, email, password) {
    const isEmailVerified = false;
    const query = 'INSERT INTO Users (username, email, password, is_email_verified) VALUES (?, ?, ?, ?)';
    const results = await connection.query(query, [username, email, password, isEmailVerified]);

    if (results.affectedRows === 0) {
        throw new Error(`Could not register user: ${username}`);
    }

    return results.insertId;
}

async function updateVerificationToken(user_id, verificationToken) {
    const query = 'UPDATE Users SET verification_token = ? WHERE user_id = ?';
    const results = await connection.query(query, [verificationToken, user_id]);

    if (results.affectedRows === 0) {
        throw new Error(`Could not update verification token for user: ${user_id}`);
    }

    return results.affectedRows > 0;
}

async function findUserByEmail(email) {
    const query = 'SELECT * FROM Users WHERE email = ?';
    const results = await connection.query(query, [email]);
    if (results.length === 0) {
        return null;
    }

    return results[0];
}

async function findUserByUsername(username) {
    const query = 'SELECT * FROM Users WHERE username = ?';
    const results = await connection.query(query, [username]);

    if (results.length === 0) {
        return null;
    }

    return results[0];
}


async function findUserById(id) {
    const query = 'SELECT * FROM Users WHERE user_id = ?';
    const results = await connection.query(query, [id]);

    if (results.length === 0) {
        return null;
    }

    return results[0];
}


async function updateEmailVerificationStatus(user_id) {
    const query = 'UPDATE Users SET is_email_verified = ? WHERE user_id = ?';
    const results = await connection.query(query, [true, user_id]);

    if (results.affectedRows === 0) {
        throw new Error(`Could not update email verification status for user: ${user_id}`);
    }

    return results.affectedRows > 0;
}

async function storeRefreshToken(token, user_id) {
    const expiry_date = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const query = "INSERT INTO Refresh_Tokens (user_id, token, expiry_date) VALUES (?, ?, ?)";
    const results = await connection.query(query, [user_id, token, expiry_date]);

    if (results.affectedRows === 0) {
        throw new Error(`Could not store refresh token for user: ${user_id}`);
    }

    return results.insertId;
}

async function isRefreshTokenStored(token) {
    const query = "SELECT * FROM Refresh_Tokens WHERE token = ?";
    const rows = await connection.query(query, [token]);

    if (rows.length === 0) {
        throw new Error(`Refresh token not found: ${token}`);
    }

    return true;
}

async function deleteRefreshToken(token) {
    const query = "DELETE FROM Refresh_Tokens WHERE token = ?";
    const results = await connection.query(query, [token]);

    if (results.affectedRows === 0) {
        throw new Error(`Could not delete refresh token: ${token}`);
    }

    return results.affectedRows > 0;
}

async function cleanupExpiredTokens() {
    const query = "DELETE FROM Refresh_Tokens WHERE expiry_date < NOW()";
    await connection.query(query);
}

module.exports = {
    registerUser,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    updateEmailVerificationStatus,
    updateVerificationToken,
    storeRefreshToken,
    isRefreshTokenStored,
    deleteRefreshToken,
    cleanupExpiredTokens
};

