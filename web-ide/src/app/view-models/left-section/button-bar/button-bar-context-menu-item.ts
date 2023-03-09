export interface ButtonBarContextMenuItem {
    readonly key: string;
    readonly caption: string;
    readonly emitButtonKey: string;
    readonly tooltip?: string;
}