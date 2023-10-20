jest.mock('axios');
jest.mock('../../requests/auth');

import React from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import Register from './Register';
import '@testing-library/jest-dom';
import Axios from 'axios';
import { login } from '../../requests/auth';

describe('Login Component', () => {
    let renderedComponent: any;
    beforeEach(() => {
        renderedComponent = render(<Router>
            <Routes>
                <Route path="/" element={<Login setAuth={() => { }} />} />
                <Route path="/login" element={<Login setAuth={() => { }} />} />
                <Route path="/register" element={<Register addAlert={() => { return undefined }} />} />
            </Routes>
        </Router>)
    });



    it('navigates to the Register page when Register button is clicked', () => {
        const { getByTestId } = renderedComponent;

        const registerButton = getByTestId('login-page-register-button');
        fireEvent.click(registerButton);
        const loginButton = getByTestId('register-page-login-button');
        expect(loginButton).toBeInTheDocument();
    });

    it('updates form fields on input', () => {
        const { getByPlaceholderText } = renderedComponent;
        fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test@email.com' } });
        fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'testPassword' } });

        expect((getByPlaceholderText('Email') as HTMLInputElement).value).toBe('test@email.com');
        expect((getByPlaceholderText('Password') as HTMLInputElement).value).toBe('testPassword');
    });

    it('attempts to log in when form is submitted', async () => {
        (login as jest.Mock).mockResolvedValue({ user: "user information" });
        (Axios.get as jest.Mock).mockResolvedValue({ status: 200, data: {} });

        const { getByPlaceholderText, getByTestId } = renderedComponent;

        fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test@email.com' } });
        fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'testPassword' } });

        const loginButton = getByTestId('login-page-login-button');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(login).toHaveBeenCalled();
        });
    });
});
