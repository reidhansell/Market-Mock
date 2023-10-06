export interface OrderSubmission {
    order_id: number;
    user_id: number;
    ticker_symbol: string;
    order_type: string;
    trigger_price: number;
    quantity: number;
}

export default interface Order extends OrderSubmission {
    cancelled: boolean;
    order_date: number;
}

export interface FulfilledOrder extends Order {
    transaction_id: number;
    price_per_share: number;
    transaction_date: number;
}
