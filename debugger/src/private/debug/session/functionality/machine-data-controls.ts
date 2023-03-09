import { QuadByte, VariableRegisterReference, DynamicByteSequence, Register, Byte, FlagName } from '@allium/types';
import { CpuInfo } from '@allium/arch';

export interface MachineDataControls {
    editMemoryValue(address: QuadByte, value: Byte): void;
    editRegisterValue(register: Register | VariableRegisterReference, value: DynamicByteSequence): void;

    getMemoryValue(address: QuadByte): Byte;
    getRegisterValue(register: Register | VariableRegisterReference): DynamicByteSequence;

    isFlagRaised(flag: FlagName): boolean;
    raiseFlag(flag: FlagName): void;
    clearFlag(flag: FlagName): void;

    getCpuInfo(): CpuInfo;
    
    getCycleCount(): QuadByte;
    setCycleCount(value: QuadByte): void;
}