import axios, { AxiosResponse } from 'axios';
import { getLatestIntradayData, insertIntradayData, deleteIntradayData } from '../../database/queries/ticker';
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

const getDatesForAPIRequest = () => {
    let currentDate = new Date();

    let formattedCurrentDate = currentDate.getFullYear() + '-'
        + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-'
        + ('0' + currentDate.getDate()).slice(-2);

    let yesterdayDate = new Date();
    yesterdayDate.setDate(currentDate.getDate() - 1);

    let formattedYesterdayDate = yesterdayDate.getFullYear() + '-'
        + ('0' + (yesterdayDate.getMonth() + 1)).slice(-2) + '-'
        + ('0' + yesterdayDate.getDate()).slice(-2);

    return [formattedYesterdayDate, formattedCurrentDate]
}

const fetchMarketStackIntradayData = async (ticker: string): Promise<TickerIntraday[]> => {
    const [dateFrom, dateTo] = getDatesForAPIRequest();
    const axiosResponse = await axios.get(`https://api.marketstack.com/v1/intraday?access_key=${marketStackKey}&symbols=${ticker}&interval=1hour&date_from=${dateFrom}&date_to=${dateTo}`) as AxiosResponse;
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
        await deleteIntradayData(ticker);
        for (let ticker of convertedTickers) {
            await insertIntradayData(ticker);
        }
        intradayData = convertedTickers;
    }

    return intradayData;
}