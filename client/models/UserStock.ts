export default interface UserStock {
    user_id: number;
    ticker_symbol: string;
    quantity: number;
}

export interface UserStockWithPrices extends UserStock {
    last: number; // Not a part of the table
    open: number; // Not a part of the table
    purchased_price: number; // Not a part of the table
}