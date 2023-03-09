import { Observable } from 'rxjs';
import { ByteSequence, QuadByte, Register, VariableRegisterReference, Byte, FlagName } from '@allium/types';
import { Trap, ExecutionInterval, MemoryExplorerModel, MachineState, SerializedMachine } from '../private';
import { AssemblySourceMap } from '@allium/asm';
import { DebugIoController } from '@allium/emulator';
import { ComputerSpec } from '../models/computer-specs/computer-spec.model';
import { IoBus } from '@allium/arch';

export interface Debugger {

    activeInstructionIdentity(): Observable<string>;

    activeInstructionAddress(): Observable<QuadByte | 'na'>;

    currentMachineState(): Observable<MachineState>;

    sessionIsDefined(): Observable<boolean>;

    machineBecameIdle(): Observable<void>;

    readonly registers: {
        readonly values: () => Observable<Map<Register, QuadByte>>,
        readonly updateValue: (register: Register | VariableRegisterReference, value: ByteSequence<1 | 2 | 3 | 4>) => void
    };

    readonly memory: {
        readonly updateValue: (address: QuadByte, value: Byte) => void,
        readonly onValueUpdated: () => Observable<QuadByte>
    };

    toggleBreakpoints(): void;

    addBreakpoint(instructionAddress: QuadByte): boolean;

    removeBreakpoint(instructionAddress: QuadByte): boolean;

    loadProgram(programBytes: Array<Byte>, stopCurrentProgram?: boolean, sourceMap?: AssemblySourceMap): void;

    changeActiveInstruction(instructionAddress: QuadByte): void;

    getIoController(): DebugIoController;

    getIoBus(): IoBus;

    readonly computerControls: {
        readonly run: () => void,
        readonly pause: () => void,
        readonly cyclePipeline: () => void,
        readonly advancePipeline: () => void,
        readonly powerOn: (computer: ComputerSpec) => void,
        readonly powerOff: () => void,
        readonly setExecutionInterval: (interval: ExecutionInterval) => void,
        readonly getExecutionInterval: () => ExecutionInterval
    };

    readonly traps: {
        readonly onCaught: () => Observable<Array<Trap>>,
        readonly onSet: () => Observable<Trap>,
        readonly onUnset: () => Observable<Trap>,
        readonly instructionBreaks: () => Observable<QuadByte>,
        readonly getAll: () => Array<Trap>,
        readonly registerReads: {
            readonly remove: (registers?: Array<Register>) => void,
            readonly listen: (registers?: Array<Register>) => void
        },
        readonly registerWrites: {
            readonly remove: (registers?: Array<Register>) => void,
            readonly listen: (registers?: Array<Register>) => void
        },
        readonly memoryReads: {
            readonly remove: (addresses?: Array<QuadByte>) => void,
            readonly listen: (addresses?: Array<QuadByte>) => void
        },
        readonly memoryWrites: {
            readonly remove: (addresses?: Array<QuadByte>) => void,
            readonly listen: (addresses?: Array<QuadByte>) => void
        },
        readonly flagRaises: {
            readonly remove: (flags?: Array<FlagName>) => void,
            readonly listen: (flags?: Array<FlagName>) => void
        },
        readonly flagAcknowledgements: {
            readonly remove: (flags?: Array<FlagName>) => void,
            readonly listen: (flags?: Array<FlagName>) => void
        }
    };

    readonly memoryExplorer: {
        readonly MAX_VALUES_PER_PAGE: number,
        readonly getValuesBeginningAt: (offset: QuadByte) => Promise<Array<Byte>>,
        readonly fetchValues: (addresses: Array<QuadByte>) => Promise<Array<{ address: QuadByte, value: Byte }>>,
        readonly model: () => Observable<MemoryExplorerModel>
    };

    readonly flags: {
        readonly isFlagRaised: (flag: FlagName) => boolean,
        readonly raiseFlag: (flag: FlagName) => void,
        readonly clearFlag: (flag: FlagName) => void
    };

    serialize(): SerializedMachine;

    dispose(): void;
    isDisposed(): boolean;
}
