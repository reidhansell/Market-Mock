import React, { useRef, useEffect } from 'react';
import './Tooltip.css';

interface TooltipProps {
    text: string[];
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tooltipElem = tooltipRef.current;
        if (tooltipElem) {
            const rect = tooltipElem.getBoundingClientRect();
            if (rect.top < 0) {
                tooltipElem.style.bottom = 'auto';
                tooltipElem.style.top = '125%';
            }
        }
    }, [text]);

    return (
        <div className="tooltip">
            <div className="tooltiptext" ref={tooltipRef}>
                {text.map((line, index) => (
                    <div key={index}>{line || <br />}</div>
                ))}
            </div>
        </div>
    );
};

export default Tooltip;
