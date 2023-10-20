jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

jest.mock('../../requests/portfolio', () => ({
    getUserPortfolio: jest.fn(),
}));

jest.mock('../../requests/order', () => ({
    getUserOrders: jest.fn(),
}));

jest.mock('../../requests/portfolio', () => ({
    getUserPortfolio: jest.fn(),
}));

jest.mock('recharts');

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { UserProvider } from '../Common/UserProvider';
import Portfolio from './Portfolio';
import Order from '../../../../models/Order'
import UserStock from '../../../../models/UserStock';
import User from '../../../../models/User';
import { getUserPortfolio } from '../../requests/portfolio';
import { getUserOrders } from '../../requests/order';

describe('Portfolio component', () => {
    it('renders the portfolio data correctly', async () => {
        const mockNetWorth = [{
            recorded_at: 1672540800,
            net_worth: 11000
        }];
        const mockStocks: UserStock[] = [];
        const mockOrders: Order[] = [];
        const mockUser: User = {
            starting_amount: 5000,
            current_balance: 7000,
            user_id: 1,
            username: 'test',
            email: '',
            registration_date: 1,
            is_email_verified: true,
        };

        const mockContext = {
            netWorth: mockNetWorth,
            setNetWorth: jest.fn(),
            setStocks: jest.fn(),
            user: mockUser,
            stocks: mockStocks,
            orders: mockOrders,
            setOrders: jest.fn(),
        };

        jest.spyOn(React, 'useContext').mockImplementation(() => mockContext);

        (getUserPortfolio as jest.Mock).mockResolvedValue({ mockNetWorth, mockStocks });

        (getUserOrders as jest.Mock).mockResolvedValue(mockOrders);

        render(
            <UserProvider >
                <Portfolio />
            </UserProvider>
        );

        await act(async () => { });

        expect(screen.getByText(/Initial Investment:/i)).toBeTruthy();
        expect(screen.getByText(/\$5000/)).toBeTruthy();

        expect(screen.getByText(/Current Wallet Balance:/i)).toBeTruthy();
        expect(screen.getByText(/\$7000/)).toBeTruthy();
    });
});