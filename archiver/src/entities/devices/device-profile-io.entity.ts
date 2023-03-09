export type DeviceProfileIoEntity = {
    readonly supported: true;
    readonly preferredBufferLength?: number;
} | {
    readonly supported: false;
}
