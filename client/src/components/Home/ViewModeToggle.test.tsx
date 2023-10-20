import React from 'react';
import { render, screen } from '@testing-library/react';
import ViewModeToggle from './ViewModeToggle';

describe('<ViewModeToggle />', () => {

    it('renders without crashing', () => {
        render(<ViewModeToggle currentViewMode="intraday" viewModeToggle={() => { }} />);
        expect(screen.getByText("24h")).toBeTruthy();
        expect(screen.getByText("30d")).toBeTruthy();
    });
});
