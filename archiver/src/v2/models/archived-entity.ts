export interface ArchivedEntity<T> {
    readonly schemaVersion: number;
    readonly creator: string;
    readonly producer: string;
    readonly timestamp: number;
    readonly payloadType: string;
    readonly payload: T;
}