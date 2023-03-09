import { WorkspaceBrowserSubcomponentMessage } from './workspace-browser-subcomponent-message';

export interface WorkspaceBrowserSubcomponent {
    readonly subcomponentName: string;
    clearSelections(): void;
    buttonClicked(buttonKey: string): void;
    pushMessage(message: WorkspaceBrowserSubcomponentMessage): void;
}