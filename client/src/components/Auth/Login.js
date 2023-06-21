import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { login } from '../../requests/auth';
import { AlertContext } from '../Common/AlertContext';

const Login = (props) => {
    const addAlert = useContext(AlertContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            let response = await login(email, password);
            if (response.status === 200) {
                props.setAuth(true);
            }
        } catch (error) {
            addAlert(error || 'An error occurred during login');
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="logo-placeholder">MARKET MOCK</h1>
            <h2>Login</h2>
            <div className="auth-form">
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
                <button onClick={handleLogin}>Login</button>
                <div className="auth-link">
                    <small><i>Don't have an account?</i></small>
                    <button style={{ width: '100%' }} onClick={() => navigate('/register')}>Register</button>
                </div>
            </div>
        </div>
    );
};

export default Login;

