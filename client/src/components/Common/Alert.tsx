import React, { useEffect } from 'react';

interface AlertProps {
    message: string;
    onClose: () => void;
    success?: boolean;
    customOnClick?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose, success, customOnClick }) => {
    useEffect(() => {
        if (!customOnClick) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [onClose]);

    return (
        <div className={`alert ${success ? 'success' : null}`}>
            {message}
            {<h3><span className="closebtn" onClick={customOnClick ? customOnClick : onClose}>&times;</span></h3>}
        </div>
    );
}

export default Alert;
