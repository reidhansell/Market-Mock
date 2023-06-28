import React, { useEffect } from 'react';

interface AlertProps {
    message: string;
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    return (
        <div className='alert'>
            <h3><span className="closebtn" onClick={onClose}>&times;</span></h3>
            {message}
        </div>
    );
}

export default Alert;
