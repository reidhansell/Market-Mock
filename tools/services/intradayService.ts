import axios, { AxiosResponse } from 'axios';
import { getLatestIntradayData, insertIntradayData, deleteIntradayData } from '../../database/queries/ticker';
import TickerIntraday from '../../models/TickerIntraday';
import { marketStackKey } from '../../config.json';
import { toUnixTimestamp } from '../utils/timeConverter';

const isIntradayDataRecent = (intradayData: TickerIntraday[]): boolean => {
    // TODO: Make this function account for weekends, holidays, and non-trading hours.
    //          This todo is not absolutely necessary, but would cut down on API calls.
    if (intradayData.length < 1) return false;
    const dataTime = intradayData[0].date;
    const currentTime = Math.floor(Date.now() / 1000);
    const differenceInHours = Math.abs(currentTime - dataTime) / 3600;
    return differenceInHours <= 1;
};

const formatDate = (date: Date) => {
    return date.getFullYear() + '-'
        + ('0' + (date.getMonth() + 1)).slice(-2) + '-'
        + ('0' + date.getDate()).slice(-2);
}

const getDatesForAPIRequest = () => {
    let currentDate = new Date();

    let formattedCurrentDate = formatDate(currentDate);

    let lastWeekDate = new Date(currentDate);
    lastWeekDate.setDate(currentDate.getDate() - 7);
    let formattedLastWeekDate = formatDate(lastWeekDate);

    return [formattedLastWeekDate, formattedCurrentDate];
}

const fetchMarketStackIntradayData = async (ticker: string): Promise<TickerIntraday[]> => {
    const [dateFrom, dateTo] = getDatesForAPIRequest();
    const axiosResponse = await axios.get(`https://api.marketstack.com/v1/intraday?access_key=${marketStackKey}&symbols=${ticker}&interval=1hour&date_from=${dateFrom}&date_to=${dateTo}`) as AxiosResponse;

    let convertedTickers: TickerIntraday[] = [];
    let mostRecentDate = new Date(axiosResponse.data.data[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);


    let previousDate = new Date(mostRecentDate);
    previousDate.setDate(mostRecentDate.getDate() - 1);
    previousDate.setHours(0, 0, 0, 0);

    for (let dataPoint of axiosResponse.data.data) {
        let dataPointDate = new Date(dataPoint.date);
        dataPointDate.setHours(0, 0, 0, 0);

        if (dataPointDate.getTime() === mostRecentDate.getTime() || dataPointDate.getTime() === previousDate.getTime()) {
            convertedTickers.push({ ...dataPoint, date: toUnixTimestamp(dataPoint.date) } as TickerIntraday);
        } else {
            break
        }
    }

    return convertedTickers.slice(0, 6);
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