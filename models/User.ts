export default interface User {
    user_id: number;
    username: string;
    email: string;
    password?: string; /* ? This is only used when a user registers. */
    registration_date: Date;
    starting_amount: number;
    current_balance: number;
    is_email_verified: boolean;
    verification_token?: string; /* ? This is only used when a user registers. */
}

export interface UserSensitive extends User {
    password: string;
    verification_token?: string;
}