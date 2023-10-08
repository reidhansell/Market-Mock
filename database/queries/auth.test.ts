jest.mock('../queryExecutor');

import {
    registerUser,
    getUserData,
    findUserByEmail,
    storeRefreshToken,
    isRefreshTokenStored,
} from './auth';
import { executeQuery } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';

describe('User Management', () => {
    beforeEach(() => {
        (executeQuery as jest.Mock).mockClear();
    });

    it('should register a user', async () => {
        (executeQuery as jest.Mock).mockResolvedValueOnce({ insertId: 1 });
        const userId = await registerUser('testuser', 'test@example.com', 'password123');
        expect(userId).toBe(1);
    });

    it('should throw error when registering a user fails', async () => {
        (executeQuery as jest.Mock).mockResolvedValueOnce({ insertId: undefined });
        await expect(registerUser('testuser', 'test@example.com', 'password123')).rejects.toThrow(ExpectedError);
    });

    it('should get user data by ID', async () => {
        const mockUserData = { user_id: 1, username: 'testuser', email: 'test@example.com' };
        (executeQuery as jest.Mock).mockResolvedValueOnce([mockUserData]);
        const userData = await getUserData(1);
        expect(userData).toEqual(mockUserData);
    });

    it('should find a user by email', async () => {
        const mockUserData = { user_id: 1, username: 'testuser', email: 'test@example.com' };
        (executeQuery as jest.Mock).mockResolvedValueOnce([mockUserData]);
        const userData = await findUserByEmail('test@example.com');
        expect(userData).toEqual(mockUserData);
    });
});

describe('Token Management', () => {

    it('should store a refresh token', async () => {
        (executeQuery as jest.Mock).mockResolvedValueOnce({ insertId: 1 });
        const tokenId = await storeRefreshToken('someToken', 1);
        expect(tokenId).toBe(1);
    });

    it('should check if a refresh token is stored', async () => {
        const mockTokenData = { token: 'someToken', user_id: 1, expiry_date: 'someDate' };
        (executeQuery as jest.Mock).mockResolvedValueOnce([mockTokenData]);
        const tokenStored = await isRefreshTokenStored('someToken');
        expect(tokenStored).toBeTruthy();
    });
});
