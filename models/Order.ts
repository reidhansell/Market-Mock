export default interface Order {
    order_id: number;
    user_id: number;
    ticker_symbol: string;
    order_type: string;
    trigger_price: number;
    quantity: number;
    fulfilled: boolean;
    order_date: Date;
}
