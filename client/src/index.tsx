import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import Axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import AlertComponent from './components/Common/Alert';
import Ticker from './components/Home/Ticker';
import { getUser, logout } from './requests/Auth';
import './index.css';
import './components/Common/Alert.css';

interface Alert {
  id: string;
  message: string;
}

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

  const AxiosRefreshInstance: AxiosInstance = Axios.create({
    baseURL: Axios.defaults.baseURL,
    headers: {
      ...Axios.defaults.headers,
    },
  });

  Axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (error?.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const response = await AxiosRefreshInstance.get('/api/auth/session/refresh_token', {});
          const token = response.data.data.token;

          Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          AxiosRefreshInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          localStorage.setItem('token', token);

          return Axios(originalRequest);
        } catch (error) {
          await logout();
          setAuth(false);
        }
      }

      const errorMessage = (error as any).response.data.error;
      if (errorMessage && errorMessage !== 'Failed authentication.' && errorMessage !== 'Failed logout.') {
        addAlert(errorMessage);
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    getUser()
      .then(response => {
        setAuth(true);
      })
      .catch(error => {
        setAuth(false);
      });
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
        <Route path="/ticker/:symbol" element={auth ? <Ticker /> : <Navigate to="/login" />} />
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
