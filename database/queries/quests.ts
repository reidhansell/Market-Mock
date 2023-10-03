import { executeQuery, ResultObject } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import { UserQuest } from '../../models/Quest';
import { addNotification } from './notification';
import Notification from '../../models/Notification';
import { Connection } from 'mysql';

async function getQuests(user_id: number): Promise<UserQuest[]> {
    const query = `SELECT 
        q.*,
        uq.completion_date
        FROM 
        Quest q
        LEFT JOIN 
        User_Quest uq ON q.quest_id = uq.quest_id AND uq.user_id = ?`;
    const params = [user_id];
    const results = await executeQuery(query, params) as UserQuest[];
    return results;
}

async function updateQuest(user_id: number, quest_id: number, connection?: Connection): Promise<void> {
    const query = `INSERT IGNORE INTO User_Quest(user_id, quest_id) VALUES (?, ?)`;
    const parameters = [user_id, quest_id];
    const results = connection ? await executeQuery(query, parameters, connection) as ResultObject : await executeQuery(query, parameters) as ResultObject;
    const getQuery = `SELECT * FROM Quest WHERE quest_id = ?`;
    const getParams = [quest_id];
    const quests = await executeQuery(getQuery, getParams) as UserQuest[];
    connection ? await addNotification({ content: `You have completed a quest! "${quests[0].name}"`, user_id: user_id, success: true } as Notification, connection) : await addNotification({ content: `You have completed a quest! "${quests[0].name}"`, user_id: user_id, success: true } as Notification);
}

export { getQuests, updateQuest };