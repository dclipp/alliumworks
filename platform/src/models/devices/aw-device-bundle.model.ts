import { AlliumWorksDeviceReadme } from './aw-device-readme.model';
import { AlliumWorksDeviceMetadata } from './aw-device-metadata.model';
import { DeviceBundle } from '@allium/types';

export interface AlliumWorksDeviceBundle extends DeviceBundle {
    readonly metadata: AlliumWorksDeviceMetadata;
    readonly html: string;
    readonly script: string;
    readonly stylesheet: string;
    readonly readme?: AlliumWorksDeviceReadme;
}