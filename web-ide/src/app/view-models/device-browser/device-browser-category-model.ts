import { DeviceInfo } from '../device-manager/device-info';

export interface DeviceBrowserCategoryModel {
    readonly itemCount: number;
    readonly hasMore: boolean;
    readonly devices: Array<DeviceInfo>;
}
