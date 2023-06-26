export default interface User {
    user_id: number;
    username: string;
    email: string;
    password: string;
    registration_date: Date;
    starting_amount: number;
    current_balance: number;
    is_email_verified: boolean;
    verification_token: string;
}
