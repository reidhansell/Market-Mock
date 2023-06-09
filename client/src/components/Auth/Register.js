import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { register } from '../../requests/auth';
import LoadingCircle from '../Common/LoadingCircle';
import { AlertContext } from '../Common/AlertContext'

const Register = () => {
    const addAlert = useContext(AlertContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            setLoading(true);
            let response = await register(username, email, password);
            if (response.status === 200) {
                setRegistrationSuccess(true);
            }
        } catch (error) {
            addAlert(error || 'An error occurred during registration');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-container">
            <h1 className="logo-placeholder">MARKET MOCK</h1>
            {!registrationSuccess ? (<>
                <h2>Register</h2>
                <div className="auth-form">
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
                    <button onClick={handleRegister}>Register {loading ? <LoadingCircle /> : ""}</button>
                    <div className="auth-link">
                        <small><i>Already have an account?</i></small>
                        <button style={{ width: '100%' }} onClick={() => navigate('/login')}>Login</button>
                    </div>
                </div></>) : (<>
                    <h2>A verification email has been sent.</h2>
                    <p>Please follow the link in the email from marketmock@gmail.com.</p>
                </>)}

        </div>
    );
};

export default Register;
