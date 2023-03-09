import { Byte } from '@allium/types';

export interface DeviceInstallationDescriptor {
    readonly portIndex: Byte;
    readonly installationTitle?: string;
    readonly clientToHostBufferSize: number;
    readonly hostToClientBufferSize: number;
}