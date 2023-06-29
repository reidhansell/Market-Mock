import { NextFunction, Request as Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
    storeRefreshToken,
    isRefreshTokenStored,
    registerUser,
    findUserByEmail,
    findUserSensitiveByEmail,
    findUserByUsername,
    findUserById,
    updateEmailVerificationStatus,
    updateVerificationToken,
    deleteRefreshToken,
    getUserData
} from '../database/queries/Auth';
import config from '../config.json';
import { sendVerificationEmail, generateVerificationToken } from '../tools/EmailService';
import { authenticateToken } from '../tools/AuthMiddleware';
import ExpectedError from '../tools/ExpectedError';
import isEmail from 'validator/lib/isEmail';
import Filter from 'bad-words';
import User from '../models/User';

interface RequestFromMiddleware extends Request {
    user: {
        user_id: number;
    }
}

const router: Router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id: number = (req as RequestFromMiddleware).user.user_id;
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

        const usernamePattern = /^[a-zA-Z0-9]{3,20}$/;
        if (!usernamePattern.test(username)) {
            throw new ExpectedError("Username must be alphanumeric, between 3 to 20 characters.", 400, "/register failed with invalid username");
        }

        const filter = new Filter();
        const filteredUsername = filter.clean(username);
        if (filteredUsername !== username) {
            throw new ExpectedError("Username contains inappropriate content.", 400, "/register failed with inappropriate username");
        }

        if (!isEmail(email)) {
            throw new ExpectedError("Invalid email format.", 400, "/register failed with invalid email");
        }

        const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,255}$/;
        if (!passwordPattern.test(password)) {
            throw new ExpectedError("Password must be between 8 and 255 characters, and include at least one uppercase letter, one lowercase letter, one number, and one special character.", 400, "/register failed with invalid password");
        }

        const existingUserEmail = await findUserByEmail(email);
        if (existingUserEmail) {
            throw new ExpectedError("Email already exists", 400, "/register failed with existing email");
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            throw new ExpectedError("Username already exists", 400, "/register failed with existing username");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user_id = await registerUser(username, email, hashedPassword);

        const verificationToken = generateVerificationToken(user_id);

        await updateVerificationToken(user_id, verificationToken);
        await sendVerificationEmail(email, verificationToken);

        res.status(200).json({ message: 'Registration successful', user_id });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !isEmail(email)) {
            throw new ExpectedError("Invalid email format.", 400, "/login failed with invalid email");
        }

        if (!password || password.length < 8) {
            throw new ExpectedError("Invalid password.", 400, "/login failed with invalid password");
        }

        const user = await findUserSensitiveByEmail(email);
        if (!user) {
            throw new ExpectedError('Invalid credentials', 401, "/login failed with email not found");
        }

        const isPasswordValid = bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ExpectedError('Invalid credentials', 401, "/login failed with invalid password");
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
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
});

router.post('/verify/:token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;

        if (!token) {
            throw new ExpectedError("Token is required.", 400, "/verify failed with missing token");
        }
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new ExpectedError("Token expired. Please verify your email again.", 401, "/verify failed with expired token");
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new ExpectedError("Invalid token.", 401, "/verify failed with invalid token");
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

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
});

router.get('/session/refresh_token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies ? req.cookies.refreshToken : null;
        if (!refreshToken) {
            throw new ExpectedError('Refresh token is required', 403, "/session/refresh_token failed with missing refresh token");
        }

        if (!(await isRefreshTokenStored(refreshToken))) {
            throw new ExpectedError('Refresh token is not in store', 403, "/session/refresh_token failed with invalid refresh token");
        }

        let payload;
        try {
            payload = jwt.verify(refreshToken, config.refreshTokenSecret) as User;
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new ExpectedError("Refresh token expired. Please login again.", 401, "/session/refresh_token failed with expired refresh token");
            } else if (err instanceof jwt.JsonWebTokenError) {
                throw new ExpectedError("Invalid refresh token.", 401, "/session/refresh_token failed with invalid refresh token");
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
            throw new ExpectedError('No refresh token provided', 401, "/session/logout failed with missing refresh token");
        }

        if (!(await isRefreshTokenStored(refreshToken))) {
            throw new ExpectedError('Already logged out', 403, "/session/logout failed as user is already logged out");
        }

        await deleteRefreshToken(refreshToken);

        res.clearCookie('refreshToken', { path: '/api/auth/session' });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        next(error);
    }
});

export default router;
