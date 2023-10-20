import React from 'react';
import { render, act } from '@testing-library/react';
import { UserProvider, UserContext } from './UserProvider';

describe('UserProvider', () => {
    it('provides default context values', async () => {
        let receivedContext;

        await act(async () => {
            render(
                <UserProvider>
                    <UserContext.Consumer>
                        {context => {
                            receivedContext = context;
                            return null;
                        }}
                    </UserContext.Consumer>
                </UserProvider>
            );
        });

        expect(receivedContext).not.toBeNull();
    });
});
