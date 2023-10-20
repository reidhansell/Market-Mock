jest.mock('../../requests/watchlist', () => ({
    getWatchlist: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: jest.fn(({ children }) => children),
    useNavigate: jest.fn(),
}));

import React from 'react';
import { render, act } from '@testing-library/react';
import Watchlist from './Watchlist';
import { UserProvider } from '../Common/UserProvider';

describe('<Watchlist />', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders without crashing', async () => {
        const mockContext = {
            stocks: [],
            watchlist: [],
            setWatchlist: jest.fn(),
        };

        const { getWatchlist } = require('../../requests/watchlist');
        getWatchlist.mockResolvedValue([]);

        jest.spyOn(React, 'useContext').mockImplementation(() => mockContext);

        await act(async () => {
            render(
                <UserProvider>
                    <Watchlist fullscreen={false} />
                </UserProvider>
            );
        });

        expect(getWatchlist).toHaveBeenCalledTimes(1);
    });
});
