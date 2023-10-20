jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: jest.fn(({ children }) => children),
}));

jest.mock('../../requests/Ticker', () => ({
    searchTickers: jest.fn()
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import TickerSearch from './TickerSearch';
import { UserProvider } from '../Common/UserProvider';

describe('<TickerSearch />', () => {
    it('renders without crashing', () => {
        render(<UserProvider><TickerSearch /></UserProvider>);
        expect(screen.getByPlaceholderText("Search all tickers...")).toBeTruthy();
    });
});

