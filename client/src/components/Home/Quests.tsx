import React from 'react';
import { useNavigate } from 'react-router-dom';

const Quests: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            Quests content
            <button onClick={() => navigate('/')}>Exit Fullscreen</button>
        </div>
    );
};

export default Quests;
