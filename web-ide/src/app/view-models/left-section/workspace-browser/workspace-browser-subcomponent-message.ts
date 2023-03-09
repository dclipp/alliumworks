export interface WorkspaceBrowserSubcomponentMessage {
    readonly to: string;
    readonly subject: string;
    readonly body: any;
}