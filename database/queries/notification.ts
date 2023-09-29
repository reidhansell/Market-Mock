import { executeQuery, ResultObject } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import Notification from '../../models/Notification';

async function getNotificiations(user_id: number): Promise<Notification[]> {
    const getQuery = `SELECT * FROM Notification WHERE user_id = ? AND viewed = false`;
    const parameters = [user_id];
    const queryResults = await executeQuery(getQuery, parameters) as Notification[];
    return queryResults;
}

async function addNotification(notification: Notification): Promise<Notification> {
    const addQuery = `INSERT INTO Notification (content, user_id) VALUES (?, ?)`;
    const parameters = [notification.content, notification.user_id];
    const queryResults = await executeQuery(addQuery, parameters) as ResultObject;
    if (queryResults.affectedRows === 0) {
        throw new ExpectedError('Failed to add notification', 500, `Failed query: "${addQuery}" with parameters: "${parameters}"`);
    }
    const addedNotification: Notification = {
        notification_id: queryResults.insertId,
        content: notification.content,
        user_id: notification.user_id,
        success: true,
        viewed: false
    };
    return addedNotification;
}

async function markNotificationAsRead(notification_id: number): Promise<boolean> {
    const updateQuery = `UPDATE Notification SET viewed = true WHERE notification_id = ?`;
    const parameters = [notification_id];
    const queryResults = await executeQuery(updateQuery, parameters) as ResultObject;
    if (queryResults.affectedRows === 0) {
        throw new ExpectedError('Failed to mark notification as read', 500, `Failed query: "${updateQuery}" with parameters: "${parameters}"`);
    }
    return true;
}

export {
    getNotificiations,
    addNotification,
    markNotificationAsRead
};
