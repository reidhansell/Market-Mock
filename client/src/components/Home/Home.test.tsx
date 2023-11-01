jest.mock('../../requests/notification', () => ({
    getNotifications: jest.fn().mockResolvedValue([])
}));

jest.mock('recharts');

jest.mock('../../requests/portfolio', () => ({
    getUserPortfolio: jest.fn().mockResolvedValue({
        netWorthData: [],
        userStocks: []
    })
}));

jest.mock('../../requests/order', () => ({
    getUserOrders: jest.fn().mockResolvedValue([])
}));

jest.mock('../../requests/watchlist', () => ({
    getWatchlist: jest.fn().mockResolvedValue([])
}));

jest.mock('../../requests/quest', () => ({
    getUserQuests: jest.fn().mockResolvedValue([])
}));

import React from 'react';
import { render, act, RenderResult } from '@testing-library/react';
import { UserProvider } from '../Common/UserProvider';
import Home from './Home';
import { MemoryRouter as Router } from 'react-router-dom';
import { getUserPortfolio } from '../../requests/portfolio';
import { getUserOrders } from '../../requests/order';
import { getWatchlist } from '../../requests/watchlist';
import { getUserQuests } from '../../requests/quest';


describe('<Home />', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders Portfolio', async () => {
        let utils: RenderResult;
        (getUserPortfolio as jest.Mock).mockResolvedValueOnce({
            netWorthData: [],
            userStocks: []
        });
        (getUserOrders as jest.Mock).mockResolvedValueOnce([]);
        await act(async () => {
            utils = render(
                <Router>
                    <UserProvider>
                        <Home />
                    </UserProvider>
                </Router>
            );
        });
        const { getByText } = utils!;
        expect(getByText(/Portfolio/i)).toBeTruthy();
    });

    it('renders Watchlist', async () => {
        let utils: RenderResult;
        (getWatchlist as jest.Mock).mockResolvedValueOnce([]);
        await act(async () => {
            utils = render(
                <Router>
                    <UserProvider>
                        <Home />
                    </UserProvider>
                </Router>
            );
        });
        const { getByText } = utils!;
        expect(getByText(/Watchlist/i)).toBeTruthy();
    });

    it('renders Quests', async () => {
        let utils: RenderResult;
        (getUserQuests as jest.Mock).mockResolvedValueOnce([]);
        await act(async () => {
            utils = render(
                <Router>
                    <UserProvider>
                        <Home />
                    </UserProvider>
                </Router>
            );
        });
        const { getByText } = utils!;
        expect(getByText(/Quests/i)).toBeTruthy();
    });
});
