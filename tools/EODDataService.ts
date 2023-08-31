import axios from 'axios';
import { getLatestEODData, insertEODData } from '../database/queries/ticker';
import TickerEndOfDay from '../models/TickerEndOfDay';
import { EODResponse } from '../models/MarketStackResponses';
import { marketStackKey } from '../config.json';

const isEODDataRecent = (eodData: TickerEndOfDay[]): boolean => {
    if (!eodData.length) return false;
    const dataTime = new Date(eodData[0].date);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime.getTime() - dataTime.getTime());
    const differenceInHours = timeDifference / (1000 * 3600);
    return differenceInHours <= 24;
};

export async function getEODDataForTicker(ticker: string) {
    let eodData = await getLatestEODData(ticker);

    if (!eodData || !isEODDataRecent(eodData)) {
        const response = await axios.get(`https://api.marketstack.com/v1/eod?access_key=${marketStackKey}&symbols=${ticker}&limit=30`) as EODResponse;
        for (let dataPoint of response.data) {
            await insertEODData(dataPoint as TickerEndOfDay);
        }
        eodData = response.data;
    }

    return eodData;
}
