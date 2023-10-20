import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingCircle from './LoadingCircle';

describe('<LoadingCircle />', () => {
    it('renders the loading circle with loader class', () => {
        render(<LoadingCircle />);

        const element = screen.getByTestId('loading-circle');
        expect(element.classList.contains('loader')).toBeTruthy();
    });
});
