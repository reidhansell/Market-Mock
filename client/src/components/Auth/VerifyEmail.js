import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../requests/auth';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleVerification = async () => {
            try {
                const response = await verifyEmail(token);
                localStorage.setItem('token', token);
                if (response.status === 200) {
                    setSuccess(true);
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                } else {
                    // Handle the error case
                }
            } catch (error) {
                console.error('Verification error:', error);
            }
        };
        handleVerification();
    }, [navigate, token]);

    return (
        <div className="auth-container">
            <h1>Email Verification</h1>
            {success ? (
                <p>Success! Your email has been verified. Sending you to the login page shortly...</p>
            ) : (
                <p>Verifying your email...</p>
            )}
        </div>
    );
};

export default VerifyEmail;
