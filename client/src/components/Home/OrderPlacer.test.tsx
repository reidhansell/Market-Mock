jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ ticker: 'AAPL' }),
    useNavigate: jest.fn(),
}));

jest.mock('axios');
jest.mock('../../config.json', () => ({
    serverURL: 'http://localhost:5000'
}));

import React from 'react';
import axios from 'axios';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OrderPlacer from './OrderPlacer';
import { UserProvider } from '../Common/UserProvider';

const mockUser = {
    user_id: 1,
}

const mockData = {
    data: [
        { last: 1 }
    ]
};

describe('<OrderPlacer />', () => {
    beforeEach(() => {
        (axios.get as jest.Mock).mockResolvedValueOnce(mockData);
    });

    it('renders the component without crashing', async () => {
        jest.spyOn(React, 'useContext').mockImplementation(() => mockUser);

        await act(async () => {
            render(
                <UserProvider>
                    <OrderPlacer />
                </UserProvider>
            );
        });

        expect(screen.getByText('Order Placer')).toBeTruthy();
    });
});