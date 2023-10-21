import React, { useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import './Auth.css';
import { register, ResponseData } from '../../requests/auth';
import LoadingCircle from '../Common/LoadingCircle';

interface RegisterProps {
    addAlert: (message: string) => void;
}

const Register: FC<RegisterProps> = ({ addAlert }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (password !== password2) {
                addAlert("Passwords do not match");
                return;
            }
            setLoading(true);
            const response: AxiosResponse<ResponseData> = await register(username, email, password);
            if (response.status === 200) {
                setRegistrationSuccess(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <img src="../../android-chrome-192x192.png" alt="logo" className="logo" style={{ width: "50%", marginLeft: "auto", marginRight: "auto" }} />
            <h1 className="logo-placeholder"><span style={{ color: "var(--brand)" }}>M</span>ARKET <span style={{ color: "var(--brand)" }}>M</span>OCK</h1>
            <br />
            {!registrationSuccess ? (
                <>
                    <h2>Register</h2>
                    <form className="auth-form" onSubmit={handleRegister}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                        />
                        <button type="submit">
                            Register {loading ? <LoadingCircle /> : ""}
                        </button>

                        <div className="auth-link">
                            <small><i>Already have an account?</i></small>
                            <button data-testid="register-page-login-button" type="button" style={{ width: '100%' }} onClick={() => navigate('/login')}>Login</button>
                        </div>
                    </form>
                </>
            ) : (
                <>
                    <h2>A verification email has been sent.</h2>
                    <p>Please follow the link in the email from marketmock@gmail.com.</p>
                </>
            )}
        </div>
    );
};

export default Register;
