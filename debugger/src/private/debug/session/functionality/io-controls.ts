// import { Byte, DeviceProfile, DeviceStateInput, IoCommand, DynamicByteSequence } from '@allium/types';
// import { DeviceHooks, DeviceInstallationContext } from '@allium/arch';
// import { Observable } from 'rxjs';

// export interface IoControls {
//     installDevice(port: Byte, profile: DeviceProfile, hooks: DeviceHooks): void;
//     attachDevice(port: Byte, context: DeviceInstallationContext): void;
//     detachDevice(port: Byte): void;
//     isIoPortInUse(port: Byte): boolean;
//     getIoPortsInUse(): Array<{ readonly port: Byte, readonly profile: DeviceProfile, readonly isAttached: boolean }>;
//     sendCommandToDevice(port: Byte, command: IoCommand): boolean;
//     changeDeviceState(port: Byte, state: DeviceStateInput): boolean;
//     transmitPacketAsDevice(port: Byte, data: DynamicByteSequence): boolean;
//     transmitPacketAsMachine(port: Byte, data: DynamicByteSequence): boolean;
//     writeToDeviceLog(port: Byte, s: string): boolean;
//     clearDeviceLog(port: Byte): boolean;
//     // subscribeToDeviceLog(port: Byte): Observable<Array<{ readonly timestamp: number, readonly s: string }>>;
//     getDeviceLog(port: Byte): Array<{ readonly timestamp: number, readonly s: string }>;
// }
// // export interface IoControls {
// //     installInputDevice(channel: Byte, profile: DeviceProfile, hooks: IoDeviceHooks): void;
// //     installOutputDevice(channel: Byte, profile: DeviceProfile, hooks: IoDeviceHooks): void;
// //     attachDevice(channel: Byte): void;
// //     detachDevice(channel: Byte): void;
// //     isIoChannelInUse(channel: Byte): boolean;
// //     getIoPortsInUse(): Array<{ readonly port: Byte, readonly profile: DeviceProfile, readonly isAttached: boolean }>;
// //     changeDeviceState(port: Byte, state: DeviceStateInput): boolean;
// //     transmitPacketAsDevice(port: Byte, data: DynamicByteSequence): boolean;
// //     transmitPacketAsMachine(port: Byte, data: DynamicByteSequence): boolean;
// //     writeToDeviceLog(port: Byte, s: string): boolean;
// //     clearDeviceLog(port: Byte): boolean;
// //     // subscribeToDeviceLog(port: Byte): Observable<Array<{ readonly timestamp: number, readonly s: string }>>;
// //     getDeviceLog(port: Byte): Array<{ readonly timestamp: number, readonly s: string }>;
// // }