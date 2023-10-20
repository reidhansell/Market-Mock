import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Select from './Select';

describe('<Select />', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with the first option as the default selected option', () => {
        const options = ['Option 1', 'Option 2', 'Option 3'];
        render(<Select options={options} onChange={mockOnChange} />);

        expect(screen.getByText('Option 1')).toBeTruthy();
    });

    it('selects an option when clicked and triggers onChange', () => {
        const options = ['Option 1', 'Option 2', 'Option 3'];
        render(<Select options={options} onChange={mockOnChange} />);

        fireEvent.click(screen.getByText('Option 1'));
        fireEvent.click(screen.getByText('Option 2'));

        expect(mockOnChange).toHaveBeenCalledWith('Option 2');
        expect(screen.getByText('Option 2')).toBeTruthy();
        expect(screen.queryByText('Option 3')).not.toBeTruthy();
    });
});

