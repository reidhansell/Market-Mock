import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import Axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { UserContext } from './components/Common/UserProvider';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import AlertComponent from './components/Common/Alert';
import Ticker from './components/Home/Ticker';
import TickerSearch from './components/Home/TickerSearch';
import { logout, getUser } from './requests/auth';
import './index.css';
import './components/Common/Alert.css';
import Portfolio from './components/Home/Portfolio';
import Watchlist from './components/Home/Watchlist';
import Quests from './components/Home/Quests';
import OrderPlacer from './components/Home/OrderPlacer';
import Nav from './components/Home/Nav';
import { UserProvider } from './components/Common/UserProvider';
import LoadingCircle from './components/Common/LoadingCircle';
import { markNotificationAsRead } from './requests/notification';
import DashboardModule from './components/Common/DashboardModule';

/*
 * Alert System and Axios Interceptors:
 * 
 * Keeping both the alert system and Axios interceptors in the index.tsx file addresses a mutual dependency issue:
 *    - The Axios interceptors depend on the alert system to display error messages to the user.
 *    - The alert system relies on state variables defined in this component to function properly.
 * 
 * Keeping the interceptor definition outside of the App component (but within useEffect) addresses a re-instantiation issue:
 *    - Defining the Axios interceptors outside of the App component prevents them from being recreated with every component render, avoiding bugs such as displaying multiple alerts for a single error.
 *
 * Future developers should maintain this structure to prevent the reintroduction of circular dependencies and other bugs that arise from separating these interdependent systems.
 */

interface Alert {
  id: string;
  message: string;
}

const App = () => {
  const [auth, setAuth] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUser, notifications, setNotifications } = useContext(UserContext);

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

  useEffect(() => {
    const axiosInterceptor = Axios.interceptors.response.use(
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

    getUser()
      .then(response => {
        setUser(response.data);
        setAuth(true);
      })
      .catch(error => {
        setAuth(false);
      })
      .finally(() => {
        setLoading(false);
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

  if (loading) {
    return <h1><LoadingCircle /></h1>
  }

  return (
    <Router>
      {auth ? <Nav setAuth={setAuth} /> : null}

      <div className="app-container">
        <div className='alert-container'>
          {notifications.map((notification) => (
            <AlertComponent key={notification.notification_id} message={notification.content} success={notification.success} onClose={() => {
              setNotifications([...notifications.filter(n => { return notification.notification_id !== n.notification_id })])
            }} customOnClick={() => {
              setNotifications([...notifications.filter(n => { return notification.notification_id !== n.notification_id })])
              markNotificationAsRead(notification.notification_id);
            }} />
          ))}
          {alerts.map((alert) => (
            <AlertComponent key={alert.id} message={alert.message} onClose={() => removeAlert(alert.id)} />
          ))}
        </div>

        {/**
         * Currently, components displayed in fullscreen are wrapped in a DashboardModule 
         * to standardize presentation. Future iterations may explore direct component 
         * rendering for a more streamlined approach.
         */
        }
        <Routes>
          <Route path="/login" element={!auth ? <Login setAuth={setAuth} /> : <Navigate to="/" />} />
          <Route path="/register" element={!auth ? <Register /> : <Navigate to="/" />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/" element={auth ? <Home /> : <Navigate to="/login" />} />
          <Route path="/portfolio" element={auth ? <DashboardModule title="Portfolio" content={<Portfolio fullscreen={true} />} fullscreen={true} /> : <Navigate to="/login" />} />
          <Route path="/watchlist" element={auth ? <DashboardModule title="Watchlist" content={<Watchlist />} fullscreen={true} /> : <Navigate to="/login" />} />
          <Route path="/quests" element={auth ? <DashboardModule title="Quests" content={<Quests />} fullscreen={true} /> : <Navigate to="/login" />} />
          <Route path="/ticker/:symbol" element={auth ? <Ticker /> : <Navigate to="/login" />} />
          <Route path="/tickersearch" element={auth ? <TickerSearch /> : <Navigate to="/login" />} />
          <Route path="/orderplacer/:ticker" element={auth ? <OrderPlacer /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={auth ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element");
}

createRoot(rootElement).render(<UserProvider><App /></UserProvider>);