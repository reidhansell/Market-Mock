jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardModule from './DashboardModule';

describe('<DashboardModule />', () => {
    it('renders the passed title and content', () => {
        render(<DashboardModule title="Test Title" content="Test Content" />);
        expect(screen.getByText('Test Title')).toBeTruthy();
        expect(screen.getByText('Test Content')).toBeTruthy();
    });
});
