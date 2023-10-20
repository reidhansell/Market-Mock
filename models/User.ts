import { Request } from 'express';

export default interface User {
    user_id: number;
    username: string;
    email: string;
    registration_date: number;
    starting_amount: number;
    current_balance: number;
    is_email_verified: boolean;
}

export interface UserSensitive extends User {
    password: string;
    verification_token?: string;
}

export interface AuthenticatedRequest extends Request {
    user: User
}