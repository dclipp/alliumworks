import { DeviceMetadataEntity } from './device-metadata.entity';
import { DeviceProfileEntity } from './device-profile.entity';
import { DeviceReadmeEntity } from './device-readme.entity';

export interface DeviceEntity {
    readonly bundleId?: string;
    readonly profile?: DeviceProfileEntity;
    readonly metadata?: DeviceMetadataEntity;
    readonly html?: string;
    readonly script?: string;
    readonly stylesheet?: string;
    readonly readme?: DeviceReadmeEntity;
}