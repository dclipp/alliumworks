export interface HistoryQueryMatchModel {
    readonly chars: Array<{
        readonly index: number;
        readonly value: string;
    }>;
}