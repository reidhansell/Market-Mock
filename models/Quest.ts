export default interface Quest {
    quest_id: number;
    name: string;
    description: string;
}

export interface UserQuest extends Quest {
    completion_date: Date;
}