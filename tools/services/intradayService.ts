import axios, { AxiosResponse } from 'axios';
import { getLatestIntradayData, insertIntradayData } from '../../database/queries/ticker';
import TickerIntraday from '../../models/TickerIntraday';
import { marketStackKey } from '../../config.json';
import { toUnixTimestamp } from '../utils/timeConverter';

const isIntradayDataRecent = (intradayData: TickerIntraday[]): boolean => {
    if (intradayData.length < 1) return false;
    const dataTime = intradayData[0].date;
    const currentTime = Math.floor(Date.now() / 1000);
    const differenceInHours = Math.abs(currentTime - dataTime) / 3600;
    return differenceInHours <= 1;
};

const fetchMarketStackIntradayData = async (ticker: string): Promise<TickerIntraday[]> => {
    const axiosResponse = await axios.get(`https://api.marketstack.com/v1/intraday?access_key=${marketStackKey}&symbols=${ticker}`) as AxiosResponse;
    let convertedTickers: TickerIntraday[] = [];
    for (let dataPoint of axiosResponse.data.data) {
        convertedTickers.push({ ...dataPoint, date: toUnixTimestamp(dataPoint.date) } as TickerIntraday);
    }
    return convertedTickers;
}

export async function getIntradayDataForTicker(ticker: string): Promise<TickerIntraday[]> {
    let intradayData = await getLatestIntradayData(ticker);

    if (!intradayData || !isIntradayDataRecent(intradayData)) {
        const convertedTickers = await fetchMarketStackIntradayData(ticker);
        for (let ticker of convertedTickers) {
            await insertIntradayData(ticker);
        }
        intradayData = convertedTickers;
    }

    return intradayData;
}