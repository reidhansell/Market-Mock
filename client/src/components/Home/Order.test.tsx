jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ order: '1' }),
    Link: jest.fn(({ children }) => children),
    useNavigate: jest.fn(),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserProvider } from '../Common/UserProvider';
import Order from './Order';

const mockContext = {
    orders: [
        {
            order_id: 1,
            ticker_symbol: "AAPL",
            quantity: 10,
            cancelled: false,
            transaction_id: 123,
            trigger_price: 150,
            price_per_share: 152,
            order_date: 1,
            transaction_date: 1,
            order_type: "BUY",
            status: "Fulfilled",
            user_id: 1
        }
    ]
};

describe('<Order />', () => {

    it('displays the order details correctly', () => {

        jest.spyOn(React, 'useContext').mockImplementation(() => mockContext);

        render(
            <UserProvider>
                <Order />
            </UserProvider>
        );

        expect(screen.getByText(/AAPL/i)).toBeTruthy();
        expect(screen.getByText(/BUY/i)).toBeTruthy();
        expect(screen.getByText(/Status: Fulfilled/i)).toBeTruthy();
        expect(screen.getByText(/Trigger Price: 150/i)).toBeTruthy();
        expect(screen.getByText(/Fulfilled price: 152/i)).toBeTruthy();
    });
});
