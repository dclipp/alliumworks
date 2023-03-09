import { DeviceBundleReference } from './device-bundle-reference.model';

export interface DeviceBrowserHome {
    readonly favorites: Array<DeviceBundleReference>;
    readonly importedDevices: Array<DeviceBundleReference>;
    readonly topDevicesByCategory: { [key: string]: Array<{ bundleId: string, name: string }> };
    readonly categoryLocalizations: { [key: string]: string };
    readonly categoryDetails: Array<{ name: string, iconName: string, order: number }>;
}