export default interface Transaction {
    transaction_id: number;
    order_id: number;
    price_per_share: number;
    transaction_date: Date;
}

export interface OptionalTransaction {
    transaction_id?: number;
    order_id?: number;
    price_per_share?: number;
    transaction_date?: Date;
}
