export type InputBufferScrollEvent = {
    readonly isBuffered: true;
    readonly literal: string;
    readonly isFirst: boolean;
    readonly isLatest: boolean;
    readonly viewKey: string;
} | {
    readonly isBuffered: false;
    readonly literal: string;
    readonly viewKey: string;
}