export interface ArchivedDeviceProfile {
    readonly primaryDeviceIdentifier?: string;
    readonly secondaryDeviceIdentifier?: string;
    readonly clientToHostBufferSize?: number;
    readonly hostToClientBufferSize?: number;
}
