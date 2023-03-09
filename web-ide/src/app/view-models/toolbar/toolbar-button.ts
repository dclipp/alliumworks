export interface ToolbarButton {
    readonly disabled: boolean;
    readonly iconName: string;
    readonly buttonKey: string;
    readonly tooltip?: string;
    readonly enableStatus?: boolean;
}