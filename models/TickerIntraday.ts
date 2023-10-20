export default interface TickerIntraday {
    open: number;
    high: number;
    low: number;
    last: number;
    close: number;
    volume: number;
    symbol: string;
    exchange: string;
    date: number;
}