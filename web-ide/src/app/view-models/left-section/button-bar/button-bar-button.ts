import { ButtonBarContextMenuItem } from './button-bar-context-menu-item';
import { ButtonSelectionRequirement } from './button-selection-requirement';

export interface ButtonBarButton {
    readonly iconName: string;
    readonly key: string;
    readonly selectionRequirement: ButtonSelectionRequirement;
    readonly additionalClass?: string;
    readonly tooltip?: string;
    readonly contextMenu?: Array<ButtonBarContextMenuItem>;
}