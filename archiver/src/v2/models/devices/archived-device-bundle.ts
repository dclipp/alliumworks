import { ArchivedDeviceMetadata } from './archived-device-metadata';
import { ArchivedDeviceProfile } from './archived-device-profile';
import { ArchivedDeviceReadme } from './archived-device-readme';

export interface ArchivedDeviceBundle {
    readonly bundleId?: string;
    readonly profile?: ArchivedDeviceProfile;
    readonly metadata?: ArchivedDeviceMetadata;
    readonly html?: string;
    readonly script?: string;
    readonly stylesheet?: string;
    readonly readme?: ArchivedDeviceReadme;
}