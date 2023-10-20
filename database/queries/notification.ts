import { executeQuery, ResultObject } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import Notification from '../../models/Notification';
import { Connection } from 'mysql';

async function getNotificiations(user_id: number): Promise<Notification[]> {
    const getQuery = `SELECT * FROM Notification WHERE user_id = ? AND viewed = false`;
    const parameters = [user_id];
    const queryResults = await executeQuery(getQuery, parameters) as Notification[];
    return queryResults;
}

async function addNotification(notification: Notification, connection?: Connection): Promise<void> {
    const addQuery = `INSERT INTO Notification (content, user_id, success) VALUES (?, ?, ?)`;
    const parameters = [notification.content, notification.user_id, notification.success];
    const queryResults = connection ? await executeQuery(addQuery, parameters, connection) as ResultObject : await executeQuery(addQuery, parameters) as ResultObject;
    if (queryResults.affectedRows === 0) {
        throw new ExpectedError('Failed to add notification', 500, `Failed query: "${addQuery}" with parameters: "${parameters}"`);
    }
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
