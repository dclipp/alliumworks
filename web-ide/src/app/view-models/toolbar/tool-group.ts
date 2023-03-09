import { ToolbarButton } from './toolbar-button';

export interface ToolGroup {
    readonly disabled: boolean;
    readonly buttons: Array<ToolbarButton>;
}