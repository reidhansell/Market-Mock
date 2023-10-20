import React from 'react';
import { render } from '@testing-library/react';
import Tooltip from './Tooltip';

describe('<Tooltip />', () => {

    it('renders tooltip content', () => {
        const lines = ['Line 1', 'Line 2', 'Line 3'];
        const { getByText } = render(<Tooltip text={lines} />);

        lines.forEach(line => {
            expect(getByText(line)).toBeTruthy();
        });
    });
});