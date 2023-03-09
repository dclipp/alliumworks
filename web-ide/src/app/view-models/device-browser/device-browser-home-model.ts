import { DeviceInfo } from '../device-manager/device-info';

export interface DeviceBrowserHomeModel {
    readonly favorites: Array<DeviceInfo>;
    readonly importedDevices: Array<DeviceInfo>;
    readonly topDevicesByCategory: { [key: string]: Array<{ bundleId: string, name: string }> };
    readonly categoryLocalizations: { [key: string]: string };
    readonly categoryDetails: Array<{ name: string, iconName: string, order: number }>;
}
