import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

interface SelectProps {
    options: string[];
    onChange: (selectedOption: string) => void;
}

const Select: React.FC<SelectProps> = ({ options, onChange }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string>(options[0]);

    const ref = useRef<HTMLDivElement>(null);

    const handleSelect = (option: string): void => {
        setSelectedOption(option);
        setIsOpen(false);
        if (onChange) {
            onChange(option);
        }
    };

    const handleClickOutside = (event: MouseEvent): void => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="select-container" ref={ref}>
            <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
                {selectedOption}
                <span className="arrow">{isOpen ? '▼' : '◄'}</span>
            </div>
            {isOpen && (
                <div className="options-container">
                    {options.map((option) => (
                        <div
                            key={option}
                            className="option"
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Select;
