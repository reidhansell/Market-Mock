export default interface StockData {
    stock_id: number;
    ticker_symbol: string;
    current_price: number;
    previous_close: number;
    open_price: number;
    high_price: number;
    low_price: number;
    volume: number;
    market_cap: number;
    PE_ratio: number;
    dividend_yield: number;
    updated_at: Date;
}
