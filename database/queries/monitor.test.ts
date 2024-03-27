jest.mock('../queryExecutor');

import { executeQuery } from '../queryExecutor';
import { getSevenDayHTTPRequests } from './monitor';
import HTTPRequest from '../../models/HTTPRequest';

describe('Monitor DB layer', () => {

    beforeEach(() => {
        (executeQuery as jest.Mock).mockClear();
    });

    describe('getSevenDayHTTPRequests', () => {
        it('should return seven days of HTTPRequests', async () => {
            const mockResult: HTTPRequest[] = [{
                request_id: 1,
                request_url: "Test URL",
                response_status: 200,
                request_date: 1,
                request_ip: "Test IP",
            }];
            (executeQuery as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await getSevenDayHTTPRequests();
            expect(result).toEqual(mockResult);
        });
    });
});