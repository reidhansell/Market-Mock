import TickerIntraday from './TickerIntraday';

export default interface WatchList {
    user_id?: number; // Does not return to user
    ticker_symbol: string;
    company_name?: string; // Does not go to server
    ticker_data?: TickerIntraday; // Does not go to server
}
