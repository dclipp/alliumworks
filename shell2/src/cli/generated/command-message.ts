export interface CommandMessage {
    readonly type: 'error' | 'info' | 'warning' | 'success';
    readonly timestamp: number;
    readonly message: string;
    readonly icon?: string;
}