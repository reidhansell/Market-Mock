const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('./config.json');

async function sendVerificationEmail(email, verificationToken) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.emailpassword,
            },
        });

        const emailContent = `
        <table style="width: 100%; height: 100%; min-height: 100vh; border-collapse: collapse; margin: 0; background-color: hsl(50.59, 10%, 10%); color: hsl(50.59, 15%, 85%);">
            <tr>
                <td style="text-align: center; vertical-align: middle;">
                    <div>
                        <h1 style="margin-top: 0.5rem; margin-bottom: 0.5rem; color: hsl(50.59, 15%, 85%);">
                            <span style="color: #FFD700;">M</span>ARKET <span style="color: #FFD700;">M</span>OCK
                        </h1>
                        <h1 style="margin-top: 0.5rem; margin-bottom: 0.5rem; color: hsl(50.59, 15%, 85%);">Email Verification</h1>
                        <p style="color: hsl(50.59, 15%, 85%);">Please click the following link to verify your email:</p>
                        <a href="${config.serverURL}/verify/${verificationToken}" style="color: hsl(50.59, 15%, 85%);">Verify Email</a>
                    </div>
                </td>
            </tr>
        </table>
    `;

        const mailOptions = {
            from: config.email,
            to: email,
            subject: 'Email Verification',
            html: emailContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function generateVerificationToken(user_id) {
    const expiresIn = '1d';
    const signedToken = jwt.sign({ user_id: user_id }, config.jwtSecret, { expiresIn });
    return signedToken;
}

module.exports = { sendVerificationEmail, generateVerificationToken };
