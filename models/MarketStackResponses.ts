/* https://api.marketstack.com/v1/intraday?access_key={ACCESSKEY}&symbols=AAPL */
interface IntradayResponse {
    pagination: {
        limit: number;
        offset: number;
        count: number;
        total: number;
    };
    data: {
        open: number;
        high: number;
        low: number;
        last: number;
        close: number;
        volume: number;
        date: string;
        symbol: string;
        exchange: string;
    }[];
}

/* https://api.marketstack.com/v1/exchanges/xnye/tickers?access_key={ACCESSKEY} */
interface ExchangeTickersResponse {
    pagination: {
        limit: number;
        offset: number;
        count: number;
        total: number;
    };
    data: {
        tickers: {
            name: string;
            symbol: string;
            has_intraday: boolean;
            has_eod: boolean;
        }[];
    };
}

export { IntradayResponse, ExchangeTickersResponse };