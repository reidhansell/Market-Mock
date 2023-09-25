import React from 'react';
import './ViewModeToggle.css';

interface ViewModeToggleProps {
    currentViewMode: 'intraday' | 'EOD';
    viewModeToggle: () => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ currentViewMode, viewModeToggle }) => {
    return (
        <div className="view-mode-toggle" onClick={() => viewModeToggle()}>
            <span
                className={currentViewMode === 'intraday' ? 'active' : ''}>
                24h
            </span>
            &nbsp;|&nbsp;
            <span
                className={currentViewMode === 'EOD' ? 'active' : ''}>
                30d
            </span>
        </div>
    );
};

export default ViewModeToggle;
