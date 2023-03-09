export interface DeviceInstancePopupEvent {
    readonly type: 'focusLost' | 'focusGained' | 'movedToMainWindow';
    readonly key: string;
}