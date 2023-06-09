import React, { useState } from 'react';
import Alert from './Alert';
import { AlertContext } from './AlertContext';

const AlertContainer = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const addAlert = (message) => {
        setAlerts([...alerts, { message }]);
    };

    const removeAlert = (index) => {
        setAlerts(alerts.filter((_, i) => i !== index));
    };

    return (
        <AlertContext.Provider value={addAlert}>
            {children}
            <div className='alert-container'>
                {alerts.map((alert, index) => (
                    <Alert
                        key={index}
                        message={alert.message}
                        onClose={() => {
                            removeAlert(index);
                        }}
                    />
                ))}
            </div>
        </AlertContext.Provider>
    );
};

export default AlertContainer;


