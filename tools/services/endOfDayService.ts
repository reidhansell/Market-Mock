import axios, { AxiosResponse } from 'axios';
import { getLatestEODData, insertEODData, deleteEODData } from '../../database/queries/ticker';
import TickerEndOfDay from '../../models/TickerEndOfDay';
import { marketStackKey } from '../../config.json';
import { toUnixTimestamp } from '../utils/timeConverter';

const isEODDataRecent = (eodData: TickerEndOfDay[]): boolean => {
    if (eodData.length < 1) return false;
    const dataTime = eodData[0].date;
    const currentTime = Math.floor(Date.now() / 1000);
    const differenceInHours = Math.abs(currentTime - dataTime) / 3600;
    return differenceInHours <= 24;
};

const getDatesForAPIRequest = () => {
    let currentDate = new Date();

    let formattedCurrentDate = currentDate.getFullYear() + '-'
        + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-'
        + ('0' + currentDate.getDate()).slice(-2);

    let lastMonthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        Math.min(28, currentDate.getDate())
    );

    let formattedLastMonthDate = lastMonthDate.getFullYear() + '-'
        + ('0' + (lastMonthDate.getMonth() + 1)).slice(-2) + '-'
        + ('0' + lastMonthDate.getDate()).slice(-2);

    return [formattedLastMonthDate, formattedCurrentDate]
}


const fetchMarketStackData = async (ticker: string): Promise<TickerEndOfDay[]> => {
    const [dateFrom, dateTo] = getDatesForAPIRequest();
    const axiosResponse = await axios.get(`https://api.marketstack.com/v1/eod?access_key=${marketStackKey}&symbols=${ticker}&interval=24hour&date_from=${dateFrom}&date_to=${dateTo}`) as AxiosResponse;
    let convertedTickers: TickerEndOfDay[] = [];
    for (let dataPoint of axiosResponse.data.data) {
        convertedTickers.push({ ...dataPoint, date: toUnixTimestamp(dataPoint.date) } as TickerEndOfDay);
    }
    return convertedTickers;
}

export async function getEODDataForTicker(ticker: string): Promise<TickerEndOfDay[]> {
    let eodData = await getLatestEODData(ticker);

    if (!eodData || !isEODDataRecent(eodData)) {

        const convertedTickers = await fetchMarketStackData(ticker);
        await deleteEODData(ticker);
        for (let ticker of convertedTickers) {
            await insertEODData(ticker);
        }
        eodData = convertedTickers;
    }

    return eodData;
}