import { AlliumWorksDeviceMetadata } from './aw-device-metadata.model';

export interface DeviceInstallationDetails {
    readonly bundleId: string;
    readonly instanceId: string;
    readonly clientToHostBufferSize: number;
    readonly hostToClientBufferSize: number;
    readonly metadata: AlliumWorksDeviceMetadata;
    readonly installationTitle: string
    readonly portIndex: number
}