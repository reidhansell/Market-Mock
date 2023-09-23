import nodemailer, { Transporter } from 'nodemailer';
import jwt from 'jsonwebtoken';
import config from '../../config.json';

const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email,
        pass: config.emailpassword,
    },
});

function getEmailContent(verificationToken: string): string {
    return `
        <table style="width: 100%; height: 100%; min-height: 100vh; border-collapse: collapse; margin: 0; background-color: hsl(50.59, 10%, 10%); color: hsl(50.59, 15%, 85%);">
            <tr>
                <td style="text-align: center; vertical-align: middle;">
                    <div>
                        <h1 style="margin-top: 0.5rem; margin-bottom: 0.5rem; color: hsl(50.59, 15%, 85%);">
                            <span style="color: #FFD700;">M</span>ARKET <span style="color: #FFD700;">M</span>OCK
                        </h1>
                        <h1 style="margin-top: 0.5rem; margin-bottom: 0.5rem; color: hsl(50.59, 15%, 85%);">Email Verification</h1>
                        <p style="color: hsl(50.59, 15%, 85%);">Please click the following link to verify your email:</p>
                        <a href="${config.clientURL}/verify/${verificationToken}" style="color: hsl(50.59, 15%, 85%);">Verify Email</a>
                    </div>
                </td>
            </tr>
        </table>
    `;
}

async function sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    try {
        const emailContent: string = getEmailContent(verificationToken);

        const mailOptions: nodemailer.SendMailOptions = {
            from: config.email,
            to: email,
            subject: 'Email Verification',
            html: emailContent,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function generateVerificationToken(user_id: number): string {
    const expiresIn: string = '1d';
    const payload = { user_id };
    const signedToken: string = jwt.sign(payload, config.jwtSecret, { expiresIn });
    return signedToken;
}

export { sendVerificationEmail, generateVerificationToken };

