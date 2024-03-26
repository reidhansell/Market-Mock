import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../requests/auth';
import logo from '../../../logo/android-chrome-192x192.png';
import { Box, Header, SpaceBetween } from '../../../theme/build/components/index';

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
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        };
        handleVerification();
    }, [navigate, token]);

    return (
        <Box padding="m">
            <SpaceBetween size='m'>
                <Header variant="h1">
                    Email Verification
                </Header>
                {success ? (
                    <p>Success! Your email has been verified. Sending you to the login page shortly...</p>
                ) : (
                    <p>Verifying your email...</p>
                )}
            </SpaceBetween>
        </Box>
    );
};

export default VerifyEmail;
