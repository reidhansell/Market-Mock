import { toUnixTimestamp } from './timeConverter';

describe('toUnixTimestamp', () => {

    it('should return the correct Unix timestamp for a given date string', () => {
        const dateString = '2023-10-18T12:00:00.000Z';
        const expectedTimestamp = 1697630400;

        const result = toUnixTimestamp(dateString);
        expect(result).toBe(expectedTimestamp);
    });

    it('should handle date strings with different formats', () => {
        const dateString = 'October 18, 2023 12:00:00 UTC';
        const expectedTimestamp = 1697630400;

        const result = toUnixTimestamp(dateString);
        expect(result).toBe(expectedTimestamp);
    });

    it('should return NaN for an invalid date string', () => {
        const invalidDateString = 'invalid date';
        const result = toUnixTimestamp(invalidDateString);
        expect(isNaN(result)).toBe(true);
    });

});

