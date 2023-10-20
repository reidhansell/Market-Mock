jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true)
    })
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import config from '../../config.json';
import { sendVerificationEmail, generateVerificationToken } from './emailService';

describe('Email Verification', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send verification email', async () => {
        const email = 'test@example.com';
        const verificationToken = 'dummyToken';

        await sendVerificationEmail(email, verificationToken);

        const sendMailMock = (nodemailer.createTransport()).sendMail;
        expect(sendMailMock).toHaveBeenCalledWith({
            from: config.email,
            to: email,
            subject: 'Email Verification',
            html: expect.stringContaining(verificationToken)
        });
    });

    it('should generate verification token', () => {
        const userId = 1;
        const dummySignedToken = 'dummySignedToken';

        (jwt.sign as jest.MockedFunction<typeof jwt.sign>).mockImplementation(() => dummySignedToken);

        const token = generateVerificationToken(userId);

        expect(jwt.sign).toHaveBeenCalledWith(
            { user_id: userId },
            config.jwtSecret,
            { expiresIn: '1d' }
        );
        expect(token).toEqual(dummySignedToken);
    });
});
