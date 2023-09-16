import { executeQuery } from '../queryExecutor';
import NetWorthData from '../../models/NetWorthData';

async function getUserNetWorthData(user_id: number): Promise<NetWorthData[]> {
    const query = `
    SELECT user_id, recorded_at, net_worth
    FROM User_Net_Worth
    WHERE user_id = ?
    ORDER BY recorded_at DESC
    LIMIT 30
  `;
    const parameters = [user_id];
    const results = await executeQuery(query, parameters) as NetWorthData[];
    return results;
}

export {
    getUserNetWorthData,
};
