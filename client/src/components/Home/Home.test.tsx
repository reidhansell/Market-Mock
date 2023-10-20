jest.mock('../../requests/notification', () => ({
    getNotifications: jest.fn().mockResolvedValue([])
}));

jest.mock('recharts');

import React from 'react';
import { render } from '@testing-library/react';
import { UserProvider } from '../Common/UserProvider';
import Home from './Home';
import { MemoryRouter as Router } from 'react-router-dom';

describe('<Home />', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders Portfolio', () => {
        const { getByText } = render(
            <Router>
                <UserProvider>
                    <Home />
                </UserProvider>
            </Router>
        );

        expect(getByText(/Portfolio/i)).toBeTruthy();
    });

    it('renders Watchlist', () => {
        const { getByText } = render(
            <Router>
                <UserProvider>
                    <Home />
                </UserProvider>
            </Router>
        );

        expect(getByText(/Watchlist/i)).toBeTruthy();
    });

    it('renders Quests', () => {
        const { getByText } = render(
            <Router>
                <UserProvider>
                    <Home />
                </UserProvider>
            </Router>
        );

        expect(getByText(/Quests/i)).toBeTruthy();
    });
});
