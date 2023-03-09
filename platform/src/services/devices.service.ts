import { Observable } from 'rxjs';
import { Byte, ByteSequenceLength, DeviceProfile } from '@allium/types';
import { IoPortStatus } from '@allium/arch';
import { DeviceInstallationDescriptor } from '../models/devices/device-installation-descriptor.model';
import { DeviceBrowserHome } from '../models/devices/device-browser-home.model';
import { DeviceInstallationDetails } from '../models/devices/device-installation-details.model';
import { AlliumWorksDeviceBundle } from '../models/devices/aw-device-bundle.model';
import { SerializationFormat } from '../serialization-format';

export interface DevicesService {

    onLogSetAvailable(): Observable<Array<{
        readonly portIndex: Byte;
        readonly key: string;
        readonly installationTitle: string;
        listener(): Observable<Array<{ readonly timestamp: number, readonly entry: string }>>;
    }>>;

    onLogSetUnavailable(): Observable<Array<{
        readonly portIndex: Byte;
        readonly key: string;
        readonly installationTitle: string;
    }>>;

    install(bundleId: string, descriptor: DeviceInstallationDescriptor, profile: DeviceProfile): Promise<boolean>;
    uninstall(portIndex: Byte): void;
    write(portIndex: Byte, data: Array<Byte>): boolean;
    testWriteToMachine(portIndex: Byte, data: Array<Byte>): boolean;
    flush(portIndex: Byte): void;
    readableLength(portIndex: Byte): number;
    read(portIndex: Byte, count: ByteSequenceLength): Array<Byte>;
    getStatus(portIndex: Byte): { readonly status: IoPortStatus; readonly installationKey: string; readonly installationTitle: string; } | null;
    getStatuses(): Array<{ readonly status: IoPortStatus; readonly installationKey: string; readonly installationTitle: string; }>;
    writeToLog(portIndex: Byte, s: string): boolean;
    getLog(portIndex: Byte): Array<{ readonly timestamp: number, readonly entry: string }>;
    clearLog(portIndex: Byte): boolean;

    deviceInstalled(): Observable<DeviceInstallationDetails>;

    getDeveloperName(developerId: string): Promise<string | null>;
    getBundle(bundleId: string): Promise<AlliumWorksDeviceBundle | null>;
    getBrowserHome(): Promise<DeviceBrowserHome>;

    importDeviceBundles(serializedList: string, serializationFormat: SerializationFormat, includeBundleIds?: Array<string>): Promise<Array<AlliumWorksDeviceBundle>>;
    // importDeviceBundle(bundle: {
    //     readonly bundleId: string,
    //     readonly profile: DeviceProfile,
    //     readonly metadata: DeviceMetadata,
    //     readonly html: string,
    //     readonly script: string,
    //     readonly stylesheet: string,
    //     readonly readme?: DeviceReadme
    //   }): Promise<DeviceBundle | null>;
}