import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Nav';
import { act } from 'react-dom/test-utils';

jest.mock('../../requests/auth', () => ({
    logout: jest.fn().mockResolvedValue({})
}));

describe('<Navigation />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('displays the brand name', () => {
        render(
            <MemoryRouter>
                <Navigation setAuth={jest.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByText(/ARKET/i)).toBeTruthy();
    });

    it('shows the user menu when menu icon is clicked', () => {
        const { container } = render(
            <MemoryRouter>
                <Navigation setAuth={jest.fn()} />
            </MemoryRouter>
        );

        const menuIcon = container.querySelector('.icon-wrapper');
        fireEvent.click(menuIcon!);

        expect(screen.getByText('Portfolio')).toBeTruthy();
        expect(screen.getByText('Watchlist')).toBeTruthy();
        expect(screen.getByText('Quests')).toBeTruthy();
        expect(screen.getByText('Signout')).toBeTruthy();
    });

    it('handles the logout process', async () => {
        const mockSetAuth = jest.fn();
        const { container } = render(
            <MemoryRouter>
                <Navigation setAuth={mockSetAuth} />
            </MemoryRouter>
        );

        const menuIcon = container.querySelector('.icon-wrapper');
        fireEvent.click(menuIcon!);

        await act(async () => {
            fireEvent.click(screen.getByText('Signout'));
        });

        expect(mockSetAuth).toHaveBeenCalledWith(false);
    });
});
