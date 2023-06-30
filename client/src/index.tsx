import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import Axios, { AxiosResponse, AxiosError } from 'axios';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import config from './config.json';
import VerifyEmail from './components/Auth/VerifyEmail';
import AlertComponent from './components/Common/Alert';
import './index.css';
import './components/Common/Alert.css';

interface Alert {
  id: string;
  message: string;
}

const refreshToken = async () => {
  try {
    const response = await Axios.get(`${config.serverURL}/api/auth/session/refresh_token`, { withCredentials: true });
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
    await Axios.get(`${config.serverURL}/api/auth/session/refresh_token`, { withCredentials: true, headers: { 'Access-Control-Allow-Origin': 'http://localhost:3000', Authorization: `Bearer ${token}` } });

    return true;
  } catch (error) {
    console.error('Error verifying token', error);
    return false;
  }
};

const App = () => {
  const [auth, setAuth] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const addAlert = (message: string) => {
    const id = generateId();
    const newAlert = { id, message };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  /*  Interceptor must be called at the top level and within a component. */
  Axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      const errorMessage = (error?.response?.data as { error: string }).error;
      if (errorMessage) {
        addAlert(errorMessage);
      }
      return Promise.reject();
    }
  );

  useEffect(() => {
    const checkAuthentication = async () => {
      const res = await isAuthenticated();
      setAuth(res);
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (alerts.length > 0) {
        removeAlert(alerts[0].id);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [alerts]);


  return (<>
    <div className='alert-container'>
      {alerts.map((alert) => (
        <AlertComponent
          key={alert.id}
          message={alert.message}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
    {
      auth ?
        <Router>
          <Routes>
            <Route path="/" element={<Home setAuth={setAuth} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        :
        <Router>
          <Routes>
            <Route path="/login" element={auth ? <Home setAuth={setAuth} /> : <Login setAuth={setAuth} />} />
            <Route path="/register" element={auth ? <Home setAuth={setAuth} /> : <Register />} />
            <Route path="/verify/:token" element={<VerifyEmail />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
    }
  </>
  );
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element");
}

createRoot(rootElement).render(<App />);

