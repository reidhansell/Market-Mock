export default interface Notification {
    notification_id: number;
    content: string;
    user_id: number;
    success: boolean;
    viewed: boolean;
}