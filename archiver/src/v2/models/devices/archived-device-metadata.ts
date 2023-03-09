export interface ArchivedDeviceMetadata {
    readonly developerId?: string;
    readonly deviceCategory?: string;
    readonly humanReadableDeviceName?: string;

    readonly preferredWidth?: {
        readonly amount?: number;
        readonly units?: 'rel' | 'px';
    };
    readonly preferredHeight?: {
        readonly amount?: number;
        readonly units?: 'rel' | 'px';
    };
}