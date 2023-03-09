import { DeviceProfile } from '@allium/types';

export interface DeviceInfo {
    readonly profile: DeviceProfile;
    readonly bundleId: string;
    readonly name: string;
    readonly category: string;
}
