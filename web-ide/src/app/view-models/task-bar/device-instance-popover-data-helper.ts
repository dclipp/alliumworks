import { Byte, ByteSequenceCreator } from '@allium/types';

export class DeviceInstancePopoverDataHelper {
    public readonly BUFFER_SIZE: number;
    public readonly PACKET_SIZE: number;

    // public bytes = new Array<Byte>();
    public packets = new Array<Array<Byte>>();

    // public insertByte(afterIndex: number): void {
    //     if (this.canAdd) {
    //         this.bytes = this.bytes.filter((b, i) => i <= afterIndex).concat([ByteSequenceCreator.Byte(0)].concat(this.bytes.filter((b, i) => i > afterIndex)));
    //     }
    // }

    // public removeByte(index: number): void {
    //     this.bytes = this.bytes.filter((b, i) => i !== index);
    // }

    public moveByteUp(packetIndex: number, byteIndex: number): void {
        if (this.canMoveUp(byteIndex)) {
            this.packets = this.packets.map((p, i) => {
                if (i === packetIndex) {
                    const bytesBefore = p.filter((b, bIdx) => bIdx < byteIndex);
                    const bytesAfter = p.filter((b, bIdx) => bIdx > byteIndex + 1);
                    return bytesBefore.concat([p[byteIndex + 1]].concat([p[byteIndex]]).concat(bytesAfter));
                } else {
                    return p;
                }
            })
        }
    }

    public moveByteDown(packetIndex: number, byteIndex: number): void {
        if (this.canMoveDown(byteIndex)) {
            this.packets = this.packets.map((p, i) => {
                if (i === packetIndex) {
                    const bytesBefore = p.filter((b, bIdx) => bIdx < byteIndex - 1);
                    const bytesAfter = p.filter((b, bIdx) => bIdx > byteIndex);
                    return bytesBefore.concat([p[byteIndex]].concat([p[byteIndex - 1]]).concat(bytesAfter));
                } else {
                    return p;
                }
            })
        }
    }

    public get canSend(): boolean {
        return this.packets.length > 0;//.bytes.length > 0 && this.bytes.length % this.PACKET_SIZE === 0;
    }

    public get canAdd(): boolean {
        return this.packets.length < (this.BUFFER_SIZE / this.PACKET_SIZE);
    }

    public get canRemove(): boolean {
        return this.packets.length > 1;
    }

    public canMoveUp(byteIndex: number): boolean {
        return byteIndex < this.PACKET_SIZE - 1;
    }

    public canMoveDown(byteIndex: number): boolean {
        return byteIndex > 0;
    }

    public insertPacket(afterIndex: number): void {
        if (this.canAdd) {
            const packet = new Array<Byte>();
            for (let i = 0; i < this.PACKET_SIZE; i++) {
                packet.push(ByteSequenceCreator.Byte(0));
            }
            this.packets = this.packets.map((p, i) => {
                if (i < afterIndex || i > afterIndex) {
                    return [p];
                } else { // i === afterIndex
                    return [p, packet];
                }
            }).reduce((x, y) => x.concat(y), []);
            // this.packets.push(packet);
        }
    }

    public removePacket(index: number): void {
        if (this.canRemove) {
            // this.packets.pop();
            this.packets = this.packets.filter((p, i) => i !== index);
        }
    }

    // public get BYTE_COUNT(): number {
    //     return this.bytes.length;
    // }

    public constructor(bufferSize: number, packetSize: number) {
        this.BUFFER_SIZE = bufferSize;
        this.PACKET_SIZE = packetSize;
        if (bufferSize > 0 && packetSize > 0) {
            const packet = new Array<Byte>();
            for (let i = 0; i < packetSize; i++) {
                packet.push(ByteSequenceCreator.Byte(0));
            }
            this.packets.push(packet);
        }
    }
}