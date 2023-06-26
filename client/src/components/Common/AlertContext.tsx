import React, { createContext, useState } from 'react';
import Alert from './Alert';

export const AlertContext = createContext();

const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const addAlert = (message) => {
        setAlerts((alerts) => [...alerts, message]);
    };

    return (
        <AlertContext.Provider value={addAlert}>
            {children}
            <div className='alert-container'>
                {alerts.map((alertMessage, i) => <Alert key={i} message={alertMessage} />)}
            </div>
        </AlertContext.Provider>
    );
}

export default AlertProvider;

