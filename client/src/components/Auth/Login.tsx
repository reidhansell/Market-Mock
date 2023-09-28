import React, { useState, FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { login } from '../../requests/auth';
import Axios from 'axios';
import config from '../../config.json';
import { UserContext } from '../Common/UserProvider';

interface LoginProps {
    setAuth: (auth: boolean) => void;
}

const Login: FC<LoginProps> = ({ setAuth }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await login(email, password);
            if (response.status === 200) {
                const response = await Axios.get(`${config.serverURL}/api/auth/`);
                if (response.status === 200) {
                    setUser(response.data)
                    setAuth(true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="logo-placeholder"><span style={{ color: "var(--brand)" }}>M</span>ARKET <span style={{ color: "var(--brand)" }}>M</span>OCK</h1>
            <br />
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



