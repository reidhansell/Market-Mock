jest.mock('../../requests/Ticker', () => ({
    getTickerData: jest.fn(),
}));

jest.mock('../../requests/watchlist', () => ({
    addTickerToWatchlist: jest.fn(),
    removeTickerFromWatchlist: jest.fn(),
    getWatchlist: jest.fn(),
}));

jest.mock('recharts');

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ symbol: 'AAPL' }),
    Link: jest.fn(({ children }) => children),
}));

import React from 'react';
import { render, act } from '@testing-library/react';
import Ticker from './Ticker';
import { UserProvider } from '../Common/UserProvider';
import { getTickerData } from '../../requests/Ticker';
import { addTickerToWatchlist, removeTickerFromWatchlist, getWatchlist } from '../../requests/watchlist';

describe('<Ticker />', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders without crashing', async () => {
        const mockContext = {
            removeTicker: jest.fn(),
            stocks: [],
            setWatchlist: jest.fn(),
        };
        (getTickerData as jest.Mock).mockResolvedValue([]);
        (addTickerToWatchlist as jest.Mock).mockResolvedValue(true);
        (removeTickerFromWatchlist as jest.Mock).mockResolvedValue(true);
        (getWatchlist as jest.Mock).mockResolvedValue([]);

        jest.spyOn(React, 'useContext').mockImplementation(() => mockContext);

        await act(async () => {
            render(
                <UserProvider>
                    <Ticker />
                </UserProvider>
            );
        });
    });
});
