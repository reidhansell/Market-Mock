import Transaction from "../models/Transaction";

export default interface Order {
    order_id: number;
    user_id: number;
    ticker_symbol: string;
    order_type: string;
    trigger_price: number;
    quantity: number;
    cancelled: boolean;
    order_date: Date;
    transaction?: Transaction;
}
