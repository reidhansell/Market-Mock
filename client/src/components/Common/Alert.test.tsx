import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from './Alert';

describe('<Alert />', () => {
    it('renders the passed message', () => {
        render(<Alert message="Test Message" onClose={() => { }} />);
        expect(screen.getByText('Test Message')).toBeTruthy();
    });
});
