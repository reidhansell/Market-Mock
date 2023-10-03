import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../components/Common/UserProvider';
import App from '../index';

describe('<App />', () => {
    it('renders without crashing', () => {
        render(
            <UserProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </UserProvider>
        );
    });
});
