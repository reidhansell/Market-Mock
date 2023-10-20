jest.mock('../queryExecutor');

import { executeQuery } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import { getNotificiations, addNotification, markNotificationAsRead } from './notification';
import Notification from '../../models/Notification';

describe('Notification DB layer', () => {

    beforeEach(() => {
        (executeQuery as jest.Mock).mockClear();
    });

    describe('getNotificiations', () => {
        it('should return notifications for a user', async () => {
            const mockResult: Notification[] = [{
                notification_id: 1,
                viewed: false,
                content: "Test Content",
                user_id: 1,
                success: true,
            }];
            (executeQuery as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await getNotificiations(1);
            expect(result).toEqual(mockResult);
        });
    });

    describe('addNotification', () => {
        it('should add a notification and throw no errors', async () => {
            (executeQuery as jest.Mock).mockResolvedValueOnce({ affectedRows: 1 });

            const notification: Notification = {
                notification_id: 1,
                viewed: false,
                content: "Test Content",
                user_id: 1,
                success: true,
            };

            await expect(addNotification(notification)).resolves.not.toThrow();
        });

        it('should throw an error if no rows are affected', async () => {
            (executeQuery as jest.Mock).mockResolvedValueOnce({ affectedRows: 0 });

            const notification: Notification = {
                notification_id: 1,
                viewed: false,
                content: "Test Content",
                user_id: 1,
                success: true,
            };

            await expect(addNotification(notification)).rejects.toThrow(ExpectedError);
        });
    });

    describe('markNotificationAsRead', () => {
        it('should mark a notification as read', async () => {
            (executeQuery as jest.Mock).mockResolvedValueOnce({ affectedRows: 1 });

            await expect(markNotificationAsRead(123)).resolves.toBeTruthy();
        });

        it('should throw an error if no rows are affected', async () => {
            (executeQuery as jest.Mock).mockResolvedValueOnce({ affectedRows: 0 });

            await expect(markNotificationAsRead(123)).rejects.toThrow(ExpectedError);
        });
    });

});
