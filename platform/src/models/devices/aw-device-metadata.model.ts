import { DeviceMetadata } from '@allium/types';

export interface AlliumWorksDeviceMetadata extends DeviceMetadata {
    readonly preferredWidth: {
        readonly amount: number;
        readonly units: 'rel' | 'px';
    };
    readonly preferredHeight: {
        readonly amount: number;
        readonly units: 'rel' | 'px';
    };
}