import { NextFunction, Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import isEmail from 'validator/lib/isEmail';
import Filter from 'bad-words';
import User from '../models/User';
import { sendVerificationEmail, generateVerificationToken } from '../tools/services/emailService';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import ExpectedError from '../tools/utils/ExpectedError';
import { findUserByEmail, findUserByUsername, registerUser, updateVerificationToken, getUserData, findUserSensitiveByEmail, storeRefreshToken, findUserById, updateEmailVerificationStatus, isRefreshTokenStored, deleteRefreshToken } from '../database/queries/auth';
import config from '../config.json';

interface AuthenticatedRequest extends Request {
    user: {
        user_id: number;
    }
}

const router: Router = Router();

const USERNAME_PATTERN = /^[a-zA-Z0-9]{3,20}$/;
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,255}$/;
const FILTER = new Filter();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id: number = (req as AuthenticatedRequest).user.user_id;
        const userData: User | null = await getUserData(user_id);
        res.status(200).json(userData);
    } catch (error) {
        next(error);
    }
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            throw new ExpectedError("Missing required fields.", 400, "/register failed with missing fields");
        }

        if (!USERNAME_PATTERN.test(username)) {
            throw new ExpectedError("Username must be alphanumeric, between 3 to 20 characters.", 400, "/register failed with invalid username");
        }

        const filteredUsername = FILTER.clean(username);
        if (filteredUsername !== username) {
            throw new ExpectedError("Username contains inappropriate content.", 400, "/register failed with inappropriate username");
        }

        if (!isEmail(email)) {
            throw new ExpectedError("Invalid email format.", 400, "/register failed with invalid email");
        }

        if (!PASSWORD_PATTERN.test(password)) {
            throw new ExpectedError("Password must include 8-255 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.", 400, "/register failed with invalid password");
        }

        if (await findUserByEmail(email)) {
            throw new ExpectedError("Email already exists", 400, "/register failed with existing email");
        }

        if (await findUserByUsername(username)) {
            throw new ExpectedError("Username already exists", 400, "/register failed with existing username");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user_id = await registerUser(username, email, hashedPassword);
        const verificationToken = generateVerificationToken(user_id);
        await updateVerificationToken(user_id, verificationToken);
        await sendVerificationEmail(email, verificationToken);

        res.status(200).json(null);
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !isEmail(email)) {
            throw new ExpectedError("Invalid credentials", 400, "/login failed with invalid email");
        }

        if (!password) {
            throw new ExpectedError("Invalid credentials", 400, "/login failed with missing password");
        }

        const user = await findUserSensitiveByEmail(email);
        if (!user) {
            throw new ExpectedError('Invalid credentials', 401, "/login failed with invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ExpectedError('Invalid credentials', 401, "/login failed with invalid credentials");
        }

        if (!user.is_email_verified) {
            throw new ExpectedError('Email not verified', 401, "/login failed with unverified email");
        }

        const token = jwt.sign({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
        }, config.jwtSecret, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ user_id: user.user_id }, config.refreshTokenSecret);
        await storeRefreshToken(refreshToken, user.user_id);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/api/auth/session', sameSite: 'none', secure: true });
        res.status(200).json({ token: token });
    } catch (error) {
        next(error);
    }
});

router.post('/verify/:token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;

        if (!token) {
            throw new ExpectedError("Verification token is required.", 400, "/verify failed with missing token");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new ExpectedError("Verification token expired. Please verify your email again.", 401, "/verify failed with expired token");
                //TODO generate a new token and send a new email
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new ExpectedError("Invalid Verification token.", 400, "/verify failed with invalid token");
            } else {
                throw error;
            }
        }

        const { user_id } = decoded as User;
        const user = await findUserById(user_id);
        if (!user) {
            throw new ExpectedError("Invalid user.", 400, "/verify failed with invalid user");
        }

        await updateEmailVerificationStatus(user_id);
        res.status(200).json(null);
    } catch (error) {
        next(error);
    }
});

router.get('/session/refresh_token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies ? req.cookies.refreshToken : null;
        if (!refreshToken) {
            throw new ExpectedError('Failed authentication.', 400, "/refresh_token failed with missing refresh token");
        }

        if (!(await isRefreshTokenStored(refreshToken))) {
            throw new ExpectedError('Failed authentication.', 401, "/refresh_token failed with invalid refresh token");
        }

        let payload;
        try {
            payload = jwt.verify(refreshToken, config.refreshTokenSecret) as User;
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new ExpectedError("Session expired, please login again.", 401, "/refresh_token failed with expired refresh token");
            } else if (err instanceof jwt.JsonWebTokenError) {
                throw new ExpectedError("Failed authentication.", 401, "/refresh_token failed with invalid refresh token");
            } else {
                throw err;
            }
        }

        const token = jwt.sign({ user_id: payload.user_id }, config.jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ accessToken: token });
    } catch (error) {
        next(error);
    }
});

router.post('/session/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies ? req.cookies.refreshToken : null;
        if (!refreshToken) {
            throw new ExpectedError('Failed logout.', 400, "/logout failed with missing refresh token");
        }

        if (!(await isRefreshTokenStored(refreshToken))) {
            throw new ExpectedError('Failed logout.', 400, "/logout failed with invalid refresh token");
        }

        await deleteRefreshToken(refreshToken);
        res.status(200).json(null);
    } catch (error) {
        next(error);
    }
});

export default router;
