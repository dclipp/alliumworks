import { DeviceProfileIoEntity } from './device-profile-io.entity';

export interface DeviceProfileEntity {
    readonly primaryDeviceIdentifier?: string;
    readonly secondaryDeviceIdentifier?: string;
    readonly input?: DeviceProfileIoEntity;
    readonly output?: DeviceProfileIoEntity;
    readonly syncInterval?: 50 | 100 | 200 | 400 | 800;
}
