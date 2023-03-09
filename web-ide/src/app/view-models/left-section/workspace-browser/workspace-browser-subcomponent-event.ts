import { ButtonBarButton } from '../button-bar/button-bar-button';

export interface WorkspaceBrowserSubcomponentEvent<T> {
    readonly buttons?: Array<ButtonBarButton>;
    readonly disabledButtonKeys?: Array<string>;
    readonly hasData: boolean;
    readonly data?: T;
}