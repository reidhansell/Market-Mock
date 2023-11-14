import React from 'react';
import { render } from '@testing-library/react';
import Version from './Version';

test('renders version component', () => {
    render(<Version version="1.0.0" />);
});
