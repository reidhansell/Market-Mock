import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('<Modal />', () => {
    it('closes when clicking outside', () => {
        const mockOnCancel = jest.fn();
        render(<Modal isOpen={true} onCancel={mockOnCancel} onConfirm={() => { }} />);

        fireEvent.click(screen.getByTestId('modal-overlay'));

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not close when clicking inside', () => {
        const mockOnCancel = jest.fn();
        render(<Modal isOpen={true} onCancel={mockOnCancel} onConfirm={() => { }} />);

        fireEvent.click(screen.getByTestId('modal-content'));

        expect(mockOnCancel).toHaveBeenCalledTimes(0);
    });
});
