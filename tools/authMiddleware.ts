import jwt from 'jsonwebtoken';
import config from '../config.json';
import { findUserById, isRefreshTokenStored } from '../database/queries/Auth';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import User from '../models/User';

interface Request extends ExpressRequest {
    user?: User;
}

const verifyToken = (token: string, secret: string): User | null => {
    try {
        return jwt.verify(token, secret) as User;
    } catch {
        return null;
    }
};

const authenticate = (getToken: (req: Request) => string | null, verifyStoredToken?: (token: string) => Promise<boolean>) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = getToken(req);

        if (!token) {
            res.status(401).json({ error: '' });
            return;
        }

        const user = verifyToken(token, config.jwtSecret);

        if (!user || verifyStoredToken && !(await verifyStoredToken(token))) {
            res.status(403).json({ error: '' });
            return;
        }

        req.user = user;
        next();
    };

const authenticateToken = authenticate(
    req => (req.headers.authorization?.split(' ')[1]) ?? null,
    async token => {
        const user = await findUserById((verifyToken(token, config.jwtSecret) as User).user_id);
        return Boolean(user && user.is_email_verified);
    },
);

const authenticateRefreshToken = authenticate(
    req => req.cookies.refreshToken ?? null,
    isRefreshTokenStored,
);


export { authenticateToken, authenticateRefreshToken };
