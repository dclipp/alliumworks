export interface PanelContainerApi {
    recenterInWindow(): void;
    setViewState(expanded: boolean): void;
    changeTitle(title: string): void;
    setForegroundPanel(key: string): void;
    readonly descriptorKey: string;
}