export default interface Quest {
    quest_id: number;
    name: string;
    description: string;
}

export interface UserQuest extends Quest {
    completion_date: number;
}

export interface UserQuestUnchecked extends Quest {
    completion_date: number | null;
}