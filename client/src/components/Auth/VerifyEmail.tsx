import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../requests/auth';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleVerification = async () => {
            if (!token) {
                navigate('/');
                return;
            }
            await verifyEmail(token);
            localStorage.setItem('token', token);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        };
        handleVerification();
    }, [navigate, token]);

    return (
        <div className="auth-container">
            <h1 className="logo-placeholder"><span style={{ color: "var(--brand)" }}>M</span>ARKET <span style={{ color: "var(--brand)" }}>M</span>OCK</h1>
            <h2>Email Verification</h2>
            {success ? (
                <p>Success! Your email has been verified. Sending you to the login page shortly...</p>
            ) : (
                <p>Verifying your email...</p>
            )}
        </div>
    );
};

export default VerifyEmail;
