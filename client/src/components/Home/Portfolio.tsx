import React from 'react';
import { useNavigate } from 'react-router-dom';

const Portfolio: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            Portfolio content
            <button onClick={() => navigate('/')}>Exit Fullscreen</button>
        </div>
    );
};

export default Portfolio;