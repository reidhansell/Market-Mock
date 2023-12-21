jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('validator');

jest.mock('../tools/services/emailService');
jest.mock('../tools/middleware/authMiddleware');
jest.mock('../database/queries/auth');
jest.mock('../tools/services/emailService');
jest.mock('../tools/services/netWorthService');
jest.mock('../database/queries/monitor');

import request from 'supertest';
import { Express } from 'express';
import { findUserByEmail, findUserByUsername, registerUser, updateVerificationToken, } from '../database/queries/auth';
import { generateVerificationToken, sendVerificationEmail } from '../tools/services/emailService';
import { calculateAndSaveUserNetWorth } from '../tools/services/netWorthService';
import bcrypt from 'bcrypt';
import { setupApp } from '../tools/utils/routeTestSetup';
import authRouter from './auth';
import { insertHTTPRequest } from '../database/queries/monitor';

let app: Express;

beforeEach(() => {
    app = setupApp(authRouter);
    (insertHTTPRequest as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('authRouter', () => {
    describe('POST /register', () => {
        it('should successfully register a user with valid data', async () => {
            (findUserByEmail as jest.Mock).mockResolvedValueOnce(null);
            (findUserByUsername as jest.Mock).mockResolvedValueOnce(null);
            (bcrypt.hash as jest.Mock).mockResolvedValueOnce('placeholder2');
            (registerUser as jest.Mock).mockResolvedValueOnce(1);
            (generateVerificationToken as jest.Mock).mockReturnValueOnce('placeholder');
            (updateVerificationToken as jest.Mock).mockResolvedValueOnce(undefined);
            (sendVerificationEmail as jest.Mock).mockResolvedValueOnce(undefined);
            (calculateAndSaveUserNetWorth as jest.Mock).mockResolvedValueOnce(undefined);
            const response = await request(app)
                .post('/api/register')
                .send({ username: "Placeholder", email: "place@holder.com", password: "placeholdeR1!" });
            expect(response.status).toBe(200);
            expect(response.body).toBeNull();
        });

        it('should fail if the email already exists', async () => {
            (findUserByEmail as jest.Mock).mockResolvedValueOnce({
                user_id: 1,
                username: 'Placeholder2',
                registration_date: Math.floor(Date.now() / 1000) - 36000,
                starting_amount: 10000,
                current_balance: 10000,
                is_email_verified: true,
                email: "place@holder.com"
            });
            const response = await request(app)
                .post('/api/register')
                .send({ username: "Placeholder", email: "place@holder.com", password: "placeholdeR1!" });
            expect(response.status).toBe(400);
        });

        it('should fail if the username already exists', async () => {
            (findUserByEmail as jest.Mock).mockResolvedValueOnce(null);
            (findUserByUsername as jest.Mock).mockResolvedValueOnce({
                user_id: 1,
                username: "Placeholder",
                registration_date: Math.floor(Date.now() / 1000) - 36000,
                starting_amount: 10000,
                current_balance: 10000,
                is_email_verified: true,
                email: "place2@holder.com"
            });
            const response = await request(app)
                .post('/api/register')
                .send({ username: "Placeholder", email: "place@holder.com", password: "placeholdeR1!" });
            expect(response.status).toBe(400);
        });

        it('should fail if missing username', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({ email: "place@holder.com", password: "placeholdeR1!" });
            expect(response.status).toBe(400);
        });
        it('should fail if missing email', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({ username: "Placeholder", password: "placeholdeR1!" });
            expect(response.status).toBe(400);
        });
        it('should fail if missing password', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({ username: "Placeholder", email: "place@holder.com" });
            expect(response.status).toBe(400);
        });
        it('should fail if invalid username', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({ username: "%", email: "place@holder.com", password: "placeholdeR1!" });
            expect(response.status).toBe(400);
        });
        it('should fail if invalid email', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({ username: "Placeholder", email: "%", password: "placeholdeR1!" });
            expect(response.status).toBe(400);
        });
        it('should fail if invalid password', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({ username: "Placeholder", email: "place@holder.com", password: "%" });
            expect(response.status).toBe(400);
        });
    });
});