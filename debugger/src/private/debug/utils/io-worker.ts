// import { ByteSequenceCreator, Byte, DynamicByteSequence } from '@allium/types';
// import { IoControlResponse, IoControlResponseStatus, IoController, MachineInstallationContext, DeviceInstallationContext } from '@allium/arch';

// export class IoWorker {
//     public asMachine(port: Byte, action: (ifc: MachineInstallationContext) => IoControlResponse<any>): boolean {
//         const mi = this.getController().asMachine(port);
//         if (!!mi) {
//             return action(mi).status !== IoControlResponseStatus.Failed;
//         } else {
//             return false;
//         }
//     }

//     public asDevice(port: Byte, action: (ifc: DeviceInstallationContext) => IoControlResponse<any>): boolean {
//         const di = this.getController().asDevice(port);
//         if (!!di) {
//             return action(di).status !== IoControlResponseStatus.Failed;
//         } else {
//             return false;
//         }
//     }

//     public getByteArrayFromSequence(seq: DynamicByteSequence): Array<Byte> {
//         if (seq.LENGTH === 4) {
//             return [
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(1))),
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(2))),
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(3))),
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(4)))
//             ]
//         } else if (seq.LENGTH === 3) {
//             return [
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(1))),
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(2))),
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(3)))
//             ]
//         } else if (seq.LENGTH === 2) {
//             return [
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(1))),
//                 ByteSequenceCreator.Byte(ByteSequenceCreator.Unbox(seq.getByte(2)))
//             ]
//         } else {
//             return [seq.getByte(1).clone()];
//         }
//     }

//     public readonly getController: () => IoController;

//     public constructor(ioController: () => IoController) {
//         this.getController = () => { return ioController() };
//     }
// }