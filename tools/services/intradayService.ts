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

const formatDate = (date: Date) => {
    return date.getFullYear() + '-'
        + ('0' + (date.getMonth() + 1)).slice(-2) + '-'
        + ('0' + date.getDate()).slice(-2);
}

const getDatesForAPIRequest = () => {
    let currentDate = new Date();

    let formattedCurrentDate = formatDate(currentDate);

    let yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(currentDate.getDate() - 1);
    let formattedYesterdayDate = formatDate(yesterdayDate);

    if (currentDate.getDay() === 0) {
        let dayBeforeYesterday = new Date(currentDate);
        dayBeforeYesterday.setDate(currentDate.getDate() - 2);
        let formattedDayBeforeYesterday = formatDate(dayBeforeYesterday);
        return [formattedDayBeforeYesterday, formattedYesterdayDate];
    }

    return [formattedYesterdayDate, formattedCurrentDate];
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