import { NextFunction, Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import isEmail from 'validator/lib/isEmail';
import Filter from 'bad-words';
import User from '../models/User';
import { sendVerificationEmail, generateVerificationToken } from '../tools/services/emailService';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import ExpectedError from '../tools/utils/ExpectedError';
import { findUserByEmail, findUserByUsername, registerUser, updateVerificationToken, getUserData, findUserSensitiveByEmail, storeRefreshToken, findUserById, updateEmailVerificationStatus, isRefreshTokenStored, deleteRefreshToken, resetUserData } from '../database/queries/auth';
import config from '../config.json';
import { calculateAndSaveUserNetWorth } from '../tools/services/netWorthService';
import { AuthenticatedRequest } from '../models/User';
import { insertHTTPRequest } from '../database/queries/monitor';

const router: Router = Router();

const USERNAME_PATTERN = /^[a-zA-Z0-9]{3,20}$/;
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,255}$/;
const FILTER = new Filter();

const USER_ERRORS = {
    MISSING_FIELDS: "Missing required fields.",
    INVALID_USERNAME: "Username must be alphanumeric, between 3 to 20 characters.",
    INAPPROPRIATE_USERNAME: "Username contains inappropriate content.",
    INVALID_EMAIL: "Invalid email format.",
    INVALID_PASSWORD: "Password must include 8-255 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.",
    EMAIL_EXISTS: "Email already exists",
    USERNAME_EXISTS: "Username already exists",
    INVALID_CREDENTIALS: "Invalid credentials",
    EMAIL_NOT_VERIFIED: "Email not verified"
};

const validateUsername = (username: string, route: string): void => {
    if (!USERNAME_PATTERN.test(username)) throw new ExpectedError(USER_ERRORS.INVALID_USERNAME, 400, `${route} failed with invalid username`);
    if (FILTER.clean(username) !== username) throw new ExpectedError(USER_ERRORS.INAPPROPRIATE_USERNAME, 400, `${route} failed with inappropriate username`);
};

const validateEmail = (email: string, route: string): void => {
    if (!isEmail(email)) throw new ExpectedError(USER_ERRORS.INVALID_EMAIL, 400, `/${route} failed with invalid email`);

};

const validatePassword = (password: string, route: string): void => {
    if (password && !PASSWORD_PATTERN.test(password)) throw new ExpectedError(USER_ERRORS.INVALID_PASSWORD, 400, `/${route} failed with invalid password`);
}

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id: number = (req as AuthenticatedRequest).user.user_id;
        const userData: User | null = await getUserData(user_id);

        insertHTTPRequest(req.url, 200, req.ip);
        res.status(200).json(userData);
    } catch (error) {
        next(error);
    }
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            throw new ExpectedError(USER_ERRORS.MISSING_FIELDS, 400, "/register failed with missing fields");
        }

        validateUsername(username, "register");
        validateEmail(email, "register");
        validatePassword(password, "register");

        if (await findUserByEmail(email)) {
            throw new ExpectedError(USER_ERRORS.EMAIL_EXISTS, 400, "/register failed with existing email");
        }

        if (await findUserByUsername(username)) {
            throw new ExpectedError(USER_ERRORS.USERNAME_EXISTS, 400, "/register failed with existing username");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user_id = await registerUser(username, email, hashedPassword);
        const verificationToken = generateVerificationToken(user_id);
        await updateVerificationToken(user_id, verificationToken);
        await sendVerificationEmail(email, verificationToken);
        await calculateAndSaveUserNetWorth(user_id);

        insertHTTPRequest(req.url, 200, req.ip);
        res.status(200).json(null);
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ExpectedError(USER_ERRORS.MISSING_FIELDS, 400, "/login failed with missing fields");
        }

        validateEmail(email, "login");
        validatePassword(password, "login");

        const user = await findUserSensitiveByEmail(email);
        if (!user) {
            throw new ExpectedError(USER_ERRORS.INVALID_CREDENTIALS, 401, "/login failed with invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ExpectedError(USER_ERRORS.INVALID_CREDENTIALS, 401, "/login failed with invalid credentials");
        }

        if (!user.is_email_verified) {
            throw new ExpectedError(USER_ERRORS.EMAIL_NOT_VERIFIED, 401, "/login failed with unverified email");
        }

        const token = jwt.sign({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
        }, config.jwtSecret, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ user_id: user.user_id }, config.refreshTokenSecret);
        await storeRefreshToken(refreshToken, user.user_id);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/api/auth/session', sameSite: 'none', secure: true });
        insertHTTPRequest(req.url, 200, req.ip);
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
                const unsafeDecoded = jwt.decode(token);
                const { user_id } = unsafeDecoded as User;

                const user = await findUserById(user_id);
                if (!user) {
                    throw new ExpectedError("Invalid user.", 400, "/verify failed with invalid user");
                }

                const newVerificationToken = generateVerificationToken(user_id);
                await updateVerificationToken(user_id, newVerificationToken);

                await sendVerificationEmail(user.email, newVerificationToken);

                throw new ExpectedError("Verification token expired. A new verification email has been sent.", 401, "/verify failed with expired token");
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
        insertHTTPRequest(req.url, 200, req.ip);
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
        insertHTTPRequest(req.url, 200, req.ip);
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
        insertHTTPRequest(req.url, 200, req.ip);
        res.status(200).json(null);
    } catch (error) {
        next(error);
    }
});

router.post('/reset_progress', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { starting_amount } = req.body;
        const user_id: number = (req as AuthenticatedRequest).user.user_id;
        await resetUserData(user_id, starting_amount);
        insertHTTPRequest(req.url, 200, req.ip);
        res.status(200).json(null);
    } catch (error) {
        next(error);
    }
});

export default router;