import React from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { render, fireEvent } from '@testing-library/react';
import Login from './Login';
import Register from './Register';
import '@testing-library/jest-dom';

describe('Register Component', () => {
    let renderedComponent: any;
    beforeEach(() => {
        renderedComponent = render(<Router>
            <Routes>
                <Route path="/" element={<Register addAlert={() => { return undefined }} />} />
                <Route path="/register" element={<Register addAlert={() => { return undefined }} />} />
                <Route path="/login" element={<Login setAuth={() => { }} />} />
            </Routes>
        </Router>)
    });


    it('navigates to the Register page when Register button is clicked', () => {
        const { getByTestId } = renderedComponent;

        const registerButton = getByTestId('register-page-login-button');
        fireEvent.click(registerButton);
        const loginButton = getByTestId('login-page-register-button');
        expect(loginButton).toBeInTheDocument();
    });
});