import React from 'react';
import { useNavigate } from 'react-router-dom';

const Watchlist: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            Watchlist content
            <button onClick={() => navigate('/')}>Exit Fullscreen</button>
        </div>
    );
};

export default Watchlist;
