import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../components/Common/UserProvider';

describe('<App />', () => {
    let App: React.FC;

    beforeAll(() => {
        const root = document.createElement('div');
        root.id = 'root';
        document.body.appendChild(root);
        App = require('../index').default;
    });

    afterAll(() => {
        const root = document.getElementById('root');
        if (root) {
            document.body.removeChild(root);
        }
    });

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
