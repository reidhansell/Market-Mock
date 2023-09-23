export default interface Transaction {
    transaction_id: number;
    user_id: number;
    ticker_symbol: string;
    transaction_type: string;
    quantity: number;
    price_per_share: number;
    transaction_date: Date;
}
