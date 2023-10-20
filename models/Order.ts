export interface OrderClientSubmission {
    ticker_symbol: string;
    order_type: string;
    trigger_price: number;
    quantity: number;
}

export interface OrderSubmission extends OrderClientSubmission {
    order_id: number;
    user_id: number;
}

export default interface Order extends OrderSubmission {
    cancelled: boolean;
    order_date: number;
    transaction_id?: number;
}

export interface FulfilledOrder extends Order {
    transaction_id: number;
    price_per_share: number;
    transaction_date: number;
}