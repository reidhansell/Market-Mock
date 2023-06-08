const connection = require('../databaseManager');

function registerUser(username, email, password) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO Users (username, email, password, is_email_verified) VALUES (?, ?, ?, ?)';
        const isEmailVerified = false;
        connection.query(query, [username, email, password, isEmailVerified], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.insertId);
            }
        });
    });
}

function updateVerificationToken(user_id, verificationToken) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE Users SET verification_token = ? WHERE user_id = ?';
        connection.query(query, [verificationToken, user_id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows > 0);
            }
        });
    });
}


function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Users WHERE email = ?';
        connection.query(query, [email], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

function findUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Users WHERE username = ?';
        connection.query(query, [username], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

const findUserById = async (id) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Users WHERE user_id = ?', [id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0]);
            }
        });
    });
}

function updateEmailVerificationStatus(user_id) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE Users SET is_email_verified = ? WHERE user_id = ?';
        connection.query(query, [true, user_id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.affectedRows === 0) {
                    reject(new Error('No rows were changed'));
                } else {
                    resolve();
                }
            }
        });
    });
}


function storeRefreshToken(token, user_id) {
    const query = "INSERT INTO Refresh_Tokens (user_id, token, expiry_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))";
    return new Promise((resolve, reject) => {
        connection.query(query, [user_id, token], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function isRefreshTokenStored(token) {
    const query = "SELECT * FROM Refresh_Tokens WHERE token = ?";
    return new Promise((resolve, reject) => {
        connection.query(query, [token], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
}

function deleteRefreshToken(token) {
    const query = "DELETE FROM Refresh_Tokens WHERE token = ?";
    return new Promise((resolve, reject) => {
        connection.query(query, [token], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function cleanupExpiredTokens() {
    const query = "DELETE FROM Refresh_Tokens WHERE expiry_date < NOW()";
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
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

