jest.mock('../../database/queries/auth');
jest.mock('jsonwebtoken');

import jwt from 'jsonwebtoken';
import { authenticateToken, authenticateRefreshToken } from './authMiddleware';
import { findUserById, isRefreshTokenStored } from '../../database/queries/auth';
import { Request, Response, NextFunction } from 'express';
import ExpectedError from '../utils/ExpectedError';

describe('Authentication Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe('authenticateToken', () => {
        afterAll(() => {
            jest.clearAllMocks();
        });
        it('should authenticate a valid token', async () => {
            req.headers = { authorization: 'Bearer validToken' };
            (jwt.verify as jest.Mock).mockReturnValue({ user_id: 1, });
            (findUserById as jest.Mock).mockResolvedValue({ is_email_verified: true });

            await authenticateToken(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should handle invalid tokens', async () => {
            req.headers = { authorization: 'Bearer invalidToken' };
            (jwt.verify as jest.Mock).mockReturnValue(null);

            await authenticateToken(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(ExpectedError));
        });
    });

    describe('authenticateRefreshToken', () => {
        it('should authenticate a valid refresh token', async () => {
            req.cookies = { refreshToken: 'validRefreshToken' };
            (jwt.verify as jest.Mock).mockReturnValue({ user_id: 1 });
            (isRefreshTokenStored as jest.Mock).mockResolvedValue(true);

            await authenticateRefreshToken(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should handle invalid refresh tokens', async () => {
            req.cookies = { refreshToken: 'invalidRefreshToken' };
            (jwt.verify as jest.Mock).mockReturnValue(null);

            await authenticateRefreshToken(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(ExpectedError));
        });
    });
});
