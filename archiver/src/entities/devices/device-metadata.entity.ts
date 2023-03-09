export interface DeviceMetadataEntity {
    readonly developerId?: string;
    readonly deviceCategory?: string;
    readonly humanReadableDeviceName?: string;
    readonly preferredWidth?: string | number;
    readonly preferredHeight?: string | number;
}