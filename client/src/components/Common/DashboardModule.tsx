import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardModule.css';

interface Props {
    title: string;
    content: React.ReactNode;
    fullscreen?: boolean;
}

const DashboardModule: React.FC<Props> = ({ title, content, fullscreen = false }) => {
    const navigate = useNavigate();

    const toggleFullscreen = () => {
        navigate(`/${title.toLowerCase()}`);
    }

    return (
        <div className={`dashboard-module ${fullscreen ? 'dashboard-module-large' : ''}`}>
            <h1 className={`dashboard-module-header ${fullscreen ? 'dashboard-module-header-large' : ''}`} onClick={toggleFullscreen}>
                {title}
            </h1>
            <div className={`dashboard-module-content ${fullscreen ? 'dashboard-module-content-large' : ''}`}>
                {content}
            </div>
        </div>
    );
};

export default DashboardModule;
