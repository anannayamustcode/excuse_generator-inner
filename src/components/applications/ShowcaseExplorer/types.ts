export type RelationKey =
    | 'Friend'
    | 'Best Friend'
    | 'Family'
    | 'Date'
    | 'Coworker'
    | 'Boss'
    | 'Client'
    | 'Other';

export type ClosenessKey =
    | 'Stranger'
    | 'Acquaintance'
    | 'Friend'
    | 'Close Friend'
    | 'Best Friend'
    | 'Family';

export type EventKey =
    | 'Coffee'
    | 'Lunch'
    | 'Dinner'
    | 'Movie'
    | 'Birthday'
    | 'Party'
    | 'Meeting'
    | 'Trip'
    | 'Interview'
    | 'Other';

export type ImportanceKey = 'Casual' | 'Planned' | 'Important' | 'Very Important';
export type NoticeKey =
    | '15 minutes'
    | '1 hour'
    | 'Today'
    | 'Tomorrow'
    | 'A few days'
    | 'A week';
export type ToneKey = 'Casual' | 'Professional' | 'Formal' | 'Very apologetic';

export interface InputState {
    relationship: RelationKey | '';
    relationshipCustom: string;
    closeness: ClosenessKey | '';
    event: EventKey | '';
    eventCustom: string;
    importance: ImportanceKey | '';
    notice: NoticeKey | '';
    tone: ToneKey | '';
    previousExcuses: string[];
    previousExcuseInput: string;
    additionalContext: string;
}

export interface ExcuseTemplate {
    id: string;
    category: string;
    variants: string[];
    relationshipSuitability: RelationKey[];
    eventSuitability: EventKey[];
    noticeSuitability: NoticeKey[];
    importanceSuitability: ImportanceKey[];
    toneSuitability: ToneKey[];
    baseConfidence: number;
    explanation: string;
    keywords: string[]; // used to detect this category inside previous excuses / context
}

export interface Recommendation {
    id: string;
    category: string;
    text: string;
    explanation: string;
    score: number;
}
