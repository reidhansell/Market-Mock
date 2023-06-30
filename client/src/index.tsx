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
    const response = await Axios.get(`${config.serverURL}/api/auth/session/refresh_token`);
    return response.data.accessToken;
  } catch (error) {
    console.error('Error refreshing token', error);
    return null;
  }
};

const getToken = () => {
  return new Promise((resolve, reject) => {
    try {
      const token = localStorage.getItem('token');
      resolve(token);
    } catch (error) {
      reject(error);
    }
  });
};

const isAuthenticated = async () => {
  Axios.defaults.withCredentials = true;
  let token = await getToken() as string;
  Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  if (!token) {
    token = await refreshToken();
    if (!token) {
      return false;
    }
    localStorage.setItem('token', token);
    Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await Axios.get(`${config.serverURL}/api/auth/`, { withCredentials: true });
    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    token = await refreshToken();
    if (!token) {
      return false;
    }
    localStorage.setItem('token', token);
    Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await Axios.get(`${config.serverURL}/api/auth/`);
    if (response.status === 200) {
      return true;
    }
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
    <Router>
      <Routes>
        <Route path="/login" element={!auth ? <Login setAuth={setAuth} /> : <Navigate to="/" />} />
        <Route path="/register" element={!auth ? <Register /> : <Navigate to="/" />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/" element={auth ? <Home setAuth={setAuth} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={auth ? "/" : "/login"} />} />
      </Routes>
    </Router>
  </>
  );
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element");
}

createRoot(rootElement).render(<App />);
