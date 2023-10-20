jest.mock('../../requests/auth');

import React from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import VerifyEmail from './VerifyEmail';
import '@testing-library/jest-dom';
import { verifyEmail } from '../../requests/auth';

describe('Register Component', () => {
    let renderedComponent: any;
    beforeEach(() => {
        renderedComponent = render(<Router>
            <Routes>
                <Route path="/" element={<VerifyEmail />} />
                <Route path="/verify" element={<VerifyEmail />} />
            </Routes>
        </Router>)
    });


    it('navigates to the Login page after successful verification', () => {
        (verifyEmail as jest.Mock).mockResolvedValue({ status: 200, data: {} });
        const { getByTestId } = renderedComponent;

        setTimeout(() => {
            const loginButton = getByTestId('login-page-register-button');
            expect(loginButton).toBeInTheDocument();
        }, 5000);
    });
});