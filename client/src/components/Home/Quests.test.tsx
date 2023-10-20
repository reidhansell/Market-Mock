jest.mock('../../requests/quest', () => ({
    getUserQuests: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

import React from 'react';
import { render } from '@testing-library/react';
import Quests from './Quests';
import { UserProvider } from '../Common/UserProvider';

describe('<Quests />', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders without crashing', async () => {
        const mockQuests = [
            {
                quest_id: 1,
                name: "Test Quest",
                description: "This is a test quest",
                completion_date: null
            }
        ];

        const mockContext = {
            quests: mockQuests,
            setQuests: jest.fn(),
        };

        const { getUserQuests } = require('../../requests/quest');
        getUserQuests.mockResolvedValue(mockQuests);

        jest.spyOn(React, 'useContext').mockImplementation(() => mockContext);

        render(
            <UserProvider>
                <Quests fullscreen={true} />
            </UserProvider>
        );
    });
});
