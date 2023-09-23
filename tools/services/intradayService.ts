import axios from 'axios';
import { getLatestIntradayData, insertIntradayData } from '../../database/queries/ticker';
import TickerIntraday from '../../models/TickerIntraday';
import { IntradayResponse } from '../../models/MarketStackResponses';
import { marketStackKey } from '../../config.json';

const isIntradayDataRecent = (intradayData: TickerIntraday[]): boolean => {
    if (!intradayData.length) return false;
    const dataTime = new Date(intradayData[0].date);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime.getTime() - dataTime.getTime());
    const differenceInHours = timeDifference / (1000 * 3600);
    return differenceInHours <= 1;
};

export async function getIntradayDataForTicker(ticker: string) {
    let intradayData = await getLatestIntradayData(ticker);

    if (!intradayData || !isIntradayDataRecent(intradayData)) {
        const response = await axios.get(`https://api.marketstack.com/v1/intraday?access_key=${marketStackKey}&symbols=${ticker}`) as IntradayResponse;
        for (let dataPoint of response.data) {
            await insertIntradayData(dataPoint as TickerIntraday);
        }
        intradayData = response.data;
    }

    return intradayData;
}
