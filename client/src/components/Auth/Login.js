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

    const handleLogin = async (event) => {
        event.preventDefault();
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
            <h1 className="logo-placeholder"><span style={{ color: "var(--brand)" }}>M</span>ARKET <span style={{ color: "var(--brand)" }}>M</span>OCK</h1>
            <h2>Login</h2>
            <form className="auth-form" onSubmit={handleLogin}>
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
                <button type="submit">Login</button>
                <div className="auth-link">
                    <small><i>Don't have an account?</i></small>
                    <button type="button" style={{ width: '100%' }} onClick={() => navigate('/register')}>Register</button>
                </div>
            </form>
        </div >
    );
};

export default Login;


