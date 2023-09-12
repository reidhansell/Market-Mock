import { ResultObject, executeQuery } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import User, { UserSensitive } from '../../models/User';
import RefreshToken from '../../models/RefreshToken';

function convertDatabaseBoolToJS(dbBool: number): boolean {
    return dbBool === 1;
}

function convertJSToDatabaseBool(jsBool: boolean): number {
    return jsBool ? 1 : 0;
}

function mapUserResult(userData: any): User {
    return {
        user_id: userData.user_id,
        username: userData.username,
        email: userData.email,
        registration_date: userData.registration_date,
        starting_amount: userData.starting_amount,
        current_balance: userData.current_balance,
        is_email_verified: convertDatabaseBoolToJS(userData.is_email_verified),
    };
}

function mapUserSensitiveResult(userData: any): UserSensitive {
    return {
        user_id: userData.user_id,
        username: userData.username,
        email: userData.email,
        registration_date: userData.registration_date,
        starting_amount: userData.starting_amount,
        current_balance: userData.current_balance,
        is_email_verified: convertDatabaseBoolToJS(userData.is_email_verified),
        password: userData.password,
        verification_token: userData.verification_token,
    };
}

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
        return mapUserResult(results[0]);
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
    return mapUserResult(results[0]);
}

async function findUserSensitiveByEmail(email: string): Promise<UserSensitive | null> {
    const query = 'SELECT * FROM User WHERE email = ?';
    const parameters = [email];
    const results = await executeQuery(query, parameters) as UserSensitive[];
    if (results.length === 0) {
        return null;
    }
    return mapUserSensitiveResult(results[0]);
}

async function findUserByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM User WHERE username = ?';
    const parameters = [username];
    const results = await executeQuery(query, parameters) as User[];
    if (results.length === 0) {
        return null;
    }
    return mapUserResult(results[0]);
}

async function findUserById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM User WHERE user_id = ?';
    const parameters = [id];
    const results = await executeQuery(query, parameters) as User[];
    if (results.length === 0) {
        return null;
    }
    return mapUserResult(results[0]);
}

async function updateEmailVerificationStatus(user_id: number): Promise<void> {
    const query = 'UPDATE User SET is_email_verified = ? WHERE user_id = ?';
    const parameters = [convertJSToDatabaseBool(true), user_id];
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
    const expiry_date = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
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
    const query = 'DELETE FROM Refresh_Token WHERE expiry_date < NOW()';
    await executeQuery(query);
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
};
