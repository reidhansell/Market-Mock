import React from 'react';
import './Version.css';

type VersionProps = {
    version: string;
};

const Version: React.FC<VersionProps> = ({ version }) => {
    return (
        <div className='version'>
            <p>{version}</p>
        </div>
    );
};

export default Version;
