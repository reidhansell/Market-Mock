import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import Axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { UserContext } from './UserProvider';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import Ticker from './components/Home/Ticker';
import TickerSearch from './components/Home/TickerSearch';
import { logout, getUser } from './requests/auth';
import Portfolio from './components/Home/Portfolio';
import Watchlist from './components/Home/Watchlist';
import Quests from './components/Home/Quests';
import OrderPlacer from './components/Home/OrderPlacer';
import Order from './components/Home/Order';
import Nav from './components/Home/Nav';
import { UserProvider } from './UserProvider';
import { markNotificationAsRead } from './requests/notification';
import config from './config.json';
import Admin from './components/Home/Admin';
import { Flashbar, Spinner, Box } from "../theme/build/components/index";
import { applyMode, Mode } from '@cloudscape-design/global-styles';
import './index.scss';

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

interface RetryRequestConfig extends InternalAxiosRequestConfig<any> {
  retryFlag?: boolean;
}

// Axios error objects are not typed by default, so we define our own type here. However, the wrapper object returned by the server is typed.
type CustomErrorObject = { error: string };

interface Alert {
  id: string;
  message: string;
}

const App = () => {
  applyMode(Mode.Dark);
  const [auth, setAuth] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUser, notifications, setNotifications } = useContext(UserContext);

  const generateId = (): string => {
    return Math.random().toString(36).slice(0, 8);
  };

  const addAlert = (message: string) => {
    const id = generateId();
    const newAlert = { id, message };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
    setTimeout(() => removeAlert(id), 5000);
  };

  const removeAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
  };

  const removeNotification = (id: number) => {
    const updatedNotifications = notifications.filter(notification => notification.notification_id !== id);
    setNotifications(updatedNotifications);
  };

  const isAuthError = (error: AxiosError): boolean => {
    return error?.response?.status === 401;
  }

  const haveNotRetried = (request: RetryRequestConfig): boolean => {
    return !request.retryFlag;
  }

  const setRetryFlag = (request: RetryRequestConfig) => {
    request.retryFlag = true;
  }

  const fetchAndSetRefreshToken = async () => {
    const response = await AxiosRefreshInstance.get('/api/auth/session/refresh_token', {});
    const token = response.data.data.token;

    Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    AxiosRefreshInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    localStorage.setItem('token', token);
  }

  Axios.defaults.baseURL = config.serverURL;
  const AxiosRefreshInstance: AxiosInstance = Axios.create({
    baseURL: Axios.defaults.baseURL,
    headers: {
      ...Axios.defaults.headers,
    },
  });

  useEffect(() => {
    Axios.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError<CustomErrorObject>) => {

        const originalRequest = error.config as RetryRequestConfig;

        if (isAuthError(error) && haveNotRetried(originalRequest)) {
          setRetryFlag(originalRequest);

          try {
            fetchAndSetRefreshToken();

            return Axios(originalRequest);
          } catch (error) {
            await logout();
            setAuth(false);
          }
        }

        if (error.response) {
          const errorMessage = error.response.data.error;
          if (errorMessage && errorMessage !== 'Failed authentication.' && errorMessage !== 'Failed logout.') {
            addAlert(errorMessage);
          }
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

  if (loading) {
    return <Spinner />
  }

  return (
    <Router>
      {auth ? <><Nav setAuth={setAuth} /><br /><br /><br /></> : null}
      <div style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <Flashbar items={alerts.map(alert => ({
          dismissible: true,
          dismissLabel: 'Dismiss',
          header: alert.message,
          onDismiss: () => { removeAlert(alert.id) }
        }))} />
        <Flashbar items={notifications.map(notification => ({
          dismissible: true,
          dismissLabel: 'Mark as Read',
          header: notification.content,
          onDismiss: () => { markNotificationAsRead(notification.notification_id); removeNotification(notification.notification_id) }
        }))} />
      </div>
      <Routes>
        <Route path="/login" element={!auth ? <Login setAuth={setAuth} /> : <Navigate to="/" />} />
        <Route path="/register" element={!auth ? <Register addAlert={addAlert} /> : <Navigate to="/" />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/" element={auth ? <Home /> : <Navigate to="/login" />} />
        <Route path="/portfolio" element={auth ? <Portfolio fullscreen={true} /> : <Navigate to="/login" />} />
        <Route path="/watchlist" element={auth ? <Watchlist fullscreen={true} /> : <Navigate to="/login" />} />
        <Route path="/quests" element={auth ? <Quests fullscreen={true} /> : <Navigate to="/login" />} />
        <Route path="/ticker/:symbol" element={auth ? <Ticker /> : <Navigate to="/login" />} />
        <Route path="/tickersearch" element={auth ? <TickerSearch /> : <Navigate to="/login" />} />
        <Route path="/orderplacer/:ticker" element={auth ? <OrderPlacer /> : <Navigate to="/login" />} />
        <Route path="/order/:order" element={auth ? <Order /> : <Navigate to="/login" />} />
        <Route path="/admin" element={auth ? <Admin /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={auth ? "/" : "/login"} />} />
      </Routes>
      <div style={{
        position: "fixed",
        bottom: "0",
        left: "0",
        zIndex: "1000"
      }}>
        <Box>
          <small>{"v1.1.0"}</small>
        </Box>
      </div>
    </Router>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element");
}

createRoot(rootElement).render(<UserProvider><App /></UserProvider>);

export default App;