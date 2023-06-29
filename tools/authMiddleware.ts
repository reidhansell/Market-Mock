import jwt from 'jsonwebtoken';
import config from '../config.json';
import { findUserById, isRefreshTokenStored } from '../database/queries/Auth';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import User from '../models/User';

interface Request extends ExpressRequest {
    user?: User;
}

const handleErrors = (error: Error, res: Response, message: string) => {
    console.error(message, error);
    res.status(500).json({ error: 'Internal server error' });
};

const verifyToken = (token: string, secret: string): User => {
    try {
        return jwt.verify(token, secret) as User;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const user = verifyToken(token, config.jwtSecret);
        const db_user = await findUserById(user.user_id);

        if (!db_user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (!db_user.is_email_verified) {
            res.status(403).json({ error: 'Email not verified' });
            return;
        }

        req.user = db_user;
        next();
    } catch (error: any) {
        handleErrors(error, res, 'Error authenticating token');
    }
};

const authenticateRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const user = verifyToken(refreshToken, config.refreshTokenSecret);
        const tokenIsStored = await isRefreshTokenStored(refreshToken);

        if (!tokenIsStored) {
            res.status(403).json({ error: 'Refresh token is not valid' });
            return;
        }

        req.user = user;
        next();
    } catch (error: any) {
        handleErrors(error, res, 'Error authenticating refresh token');
    }
};

export { authenticateToken, authenticateRefreshToken };
