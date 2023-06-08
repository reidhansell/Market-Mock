import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import Home from './components/Home/Home.js';
import Login from './components/Auth/Login.js';
import Register from './components/Auth/Register.js';
import config from './config.json';
import './index.css';
import VerifyEmail from './components/Auth/VerifyEmail.js';

const refreshToken = async () => {
  try {
    const response = await axios.get(config.serverURL + '/api/auth/refresh_token');
    return response.data.accessToken;
  } catch (error) {
    console.error('Error refreshing token', error);
    return null;
  }
};

const isAuthenticated = async () => {
  let token = localStorage.getItem('token');

  if (!token) {
    token = await refreshToken();
    if (!token) {
      return false;
    }
    localStorage.setItem('token', token);
  }

  try {
    const response = await axios.get(config.serverURL + '/api/user/', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return true;
  } catch (error) {
    console.error('Error verifying token', error);
    return false;
  }
};

const App = () => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const res = await isAuthenticated();
      setAuth(res);
    };

    checkAuthentication();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  return (
    < Router >
      <Routes>
        <Route path="/login" element={auth ? <Home /> : <Login setAuth={setAuth} />} />
        <Route path="/register" element={auth ? <Home /> : <Register />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/" element={auth ? <Home /> : <Login setAuth={setAuth} />}
        />
      </Routes>
    </Router >)
};

createRoot(document.getElementById('root')).render(<App />);
