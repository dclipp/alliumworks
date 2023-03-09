import { Trap } from './trap';
import { TrapType, ALL_TRAP_TYPES } from './trap-type';
import { TrapsListHelper } from './traps-list-helper';
import { InstructionTrap } from './typed-definitions/instruction-trap';
import { Register, QuadByte, MnemonicHelper, Mnemonic, FlagName, FlagHelper, ByteSequenceCreator } from '@allium/types';
import { RegisterTrap } from './typed-definitions/register-trap';
import { MemoryTrap } from './typed-definitions/memory-trap';
import { FlagTrap } from './typed-definitions/flag-trap';
import { IterationOutput, MutatorTarget, RegisterMutator, DebuggableComputer, ExecutorArgumentHelper, MemoryMutator } from '@allium/arch';

export class TrapsProcessor {
    public add(trap: Trap): void {
        this._traps = TrapsListHelper.include(this._traps, trap);
    }

    public remove(trap: Trap): void {
        this._traps = TrapsListHelper.remove(this._traps, trap);
    }

    public enableType(type: TrapType): void {
        if (!this._enabledTrapTypes.includes(type)) {
            this._enabledTrapTypes.push(type);
        }
    }

    public enableAllTypes(): void {
        ALL_TRAP_TYPES.filter(nt => !this._enabledTrapTypes.includes(nt)).forEach(nt => this._enabledTrapTypes.push(nt));
    }

    public disableType(type: TrapType): void {
        const index = this._enabledTrapTypes.indexOf(type);
        if (index > -1) {
            this._enabledTrapTypes.splice(index, 1);
        }
    }

    public disableAllTypes(): void {
        while (this._enabledTrapTypes.length > 0) {
            this._enabledTrapTypes.pop();
        }
    }

    public process(debugComputer: DebuggableComputer, output: IterationOutput): Array<Trap> | 'none' {
        const traps = new Array<Trap | 'none'>();

        traps.push(this.processInstructionBreakTraps(debugComputer));
        traps.push(this.processRegisterWriteTraps(output));
        traps.push(this.processRegisterReadTraps(output));
        traps.push(this.processMemoryWriteTraps(output));
        traps.push(this.processMemoryReadTraps(debugComputer, output));
        traps.push(this.processFlagRaisedTraps(output));
        traps.push(this.processFlagAcknowledgedTraps(debugComputer, output));

        const trapsCaught = traps.filter(n => n !== 'none').map(n => n as Trap);
        if (trapsCaught.length > 0) {
            return trapsCaught;
        } else {
            return 'none';
        }
    }

    private processInstructionBreakTraps(debugComputer: DebuggableComputer): Trap | 'none' {
        let trap: InstructionTrap | 'none' = 'none';
        if (this._traps.length > 0 && this._enabledTrapTypes.includes(TrapType.InstructionBreak)) {
            const iptrAddress = debugComputer.readRegisterValue(Register.InstructionPtr);
            const instructionBreak = this._traps.find(n => n.type === TrapType.InstructionBreak && TrapsListHelper.asInstructionTrap(n).instructionAddress.isEqualTo(iptrAddress));
            if (!!instructionBreak) {
                trap = { type: TrapType.InstructionBreak, instructionAddress: iptrAddress as QuadByte };
            }
        }
        return trap;
    }

    private processRegisterWriteTraps(output: IterationOutput): Trap | 'none' {
        let trap: RegisterTrap | 'none' = 'none';
        if (!!output.output && this._traps.length > 0 && this._enabledTrapTypes.includes(TrapType.RegisterWrite)) {
            const listenedRegisters = output.output.mutators
                .filter(m => m.target === MutatorTarget.Register)
                .map(m => m as RegisterMutator)
                .filter(rm => this._traps.some(n => n.type === TrapType.RegisterWrite && (TrapsListHelper.asRegisterTrap(n).registers || []).includes(rm.register)));
            if (listenedRegisters.length > 0) {
                trap = { type: TrapType.RegisterWrite, registers: listenedRegisters.map(r => r.register) };
            }
        }
        return trap;
    }

    private processRegisterReadTraps(output: IterationOutput): Trap | 'none' {
        let trap: RegisterTrap | 'none' = 'none';
        if (!!output && !!output.argument && this._traps.length > 0 && this._enabledTrapTypes.includes(TrapType.RegisterRead)) {
            const registersRead = new Array<Register>();
            let hasVarReg1 = false;
            let hasVarReg2 = false;
            let hasVarReg3 = false;

            if (MnemonicHelper.opArgs.isImplicitAccumulatorOp(output.mnemonic)) {
                registersRead.push(Register.Accumulator);
                hasVarReg1 = true;
            }

            if (MnemonicHelper.opArgs.isOneRegisterOp(output.mnemonic)) {
                hasVarReg1 = true;
            }
            if (MnemonicHelper.opArgs.isTwoRegisterOp(output.mnemonic)) {
                hasVarReg2 = true;
            }
            if (MnemonicHelper.opArgs.isThreeRegisterOp(output.mnemonic)) {
                hasVarReg3 = true;
            }
            if (MnemonicHelper.opArgs.isRegisterAndByteOp(output.mnemonic) || MnemonicHelper.opArgs.isRegisterAndDoubleByteOp(output.mnemonic)
                || MnemonicHelper.opArgs.isRegisterAndTriByteOp(output.mnemonic)) {
                hasVarReg1 = true;
            }

            if (hasVarReg1) {
                const varReg1 = output.argument.variableRegisterName1;
                if (!ExecutorArgumentHelper.isNullExecutorArgument(varReg1)) {
                    registersRead.push(varReg1.register);
                }
            }
            if (hasVarReg2) {
                const varReg2 = output.argument.variableRegisterName2;
                if (!ExecutorArgumentHelper.isNullExecutorArgument(varReg2)) {
                    registersRead.push(varReg2.register);
                }
            }
            if (hasVarReg3) {
                const varReg3 = output.argument.variableRegisterName3;
                if (!ExecutorArgumentHelper.isNullExecutorArgument(varReg3)) {
                    registersRead.push(varReg3.register);
                }
            }

            if (MnemonicHelper.opArgs.isOneRegisterOp(output.mnemonic) || MnemonicHelper.opArgs.isRegisterAndByteOp(output.mnemonic)
                || MnemonicHelper.opArgs.isRegisterAndDoubleByteOp(output.mnemonic) || MnemonicHelper.opArgs.isRegisterAndTriByteOp(output.mnemonic)
                || MnemonicHelper.opArgs.isThreeRegisterOp(output.mnemonic) || MnemonicHelper.opArgs.isTwoRegisterOp(output.mnemonic)) {
                registersRead.push(Register.Accumulator);
            }

            const listenedRegisters = registersRead
                .filter(r => this._traps.some(t => t.type === TrapType.RegisterRead && TrapsListHelper.asRegisterTrap(t).registers.includes(r)));

            if (listenedRegisters.length > 0) {
                trap = { type: TrapType.RegisterRead, registers: listenedRegisters };
            }
        }
        return trap;
    }

    private processMemoryWriteTraps(output: IterationOutput): Trap | 'none' {
        let trap: MemoryTrap | 'none' = 'none';
        if (!!output.output && this._traps.length > 0 && this._enabledTrapTypes.includes(TrapType.MemoryWrite)) {
            const listenedAddresses = output.output.mutators
                .filter(m => m.target === MutatorTarget.Memory)
                .map(m => m as MemoryMutator)
                .filter(mm => this._traps.some(t => t.type === TrapType.MemoryWrite && TrapsListHelper.asMemoryTrap(t).addresses.some(a => a.isEqualTo(mm.address))));
            if (listenedAddresses.length > 0) {
                trap = { type: TrapType.MemoryWrite, addresses: listenedAddresses.map(a => a.address.clone()) };
            }
        }
        return trap;
    }

    private processMemoryReadTraps(debugComputer: DebuggableComputer, output: IterationOutput): Trap | 'none' {
        let trap: MemoryTrap | 'none' = 'none';
        if (!!output && !!output.argument && this._traps.length > 0 && this._enabledTrapTypes.includes(TrapType.MemoryRead)) {
            const addressesRead = new Array<QuadByte>();

            if (output.mnemonic === Mnemonic.MEMREAD) {
                const memAddressRegister = output.argument.variableRegisterName1;
                if (!ExecutorArgumentHelper.isNullExecutorArgument(memAddressRegister)) {
                    const memAddress = debugComputer.readRegisterValue(memAddressRegister.register, memAddressRegister.mask);
                    if (memAddress.LENGTH === 4) {
                        addressesRead.push(memAddress as QuadByte);
                    }
                }
            }

            const instructionAddress = debugComputer.readRegisterValue(Register.InstructionPtr);
            if (!addressesRead.some(a => a.isEqualTo(instructionAddress))) {
                addressesRead.push(instructionAddress as QuadByte);
            }

            if (addressesRead.length > 0) {
                const listeningForAddresses = this._traps
                    .filter(t => t.type === TrapType.MemoryRead)
                    .map(t => TrapsListHelper.asMemoryTrap(t).addresses)
                    .reduce((x, y) => x.concat(y.filter(z => !x.some(a => a.isEqualTo(z)))), []);

                const listenedTraps = listeningForAddresses.filter(a => addressesRead.some(x => x.isEqualTo(a)));

                if (listenedTraps.length > 0) {
                    trap = { type: TrapType.MemoryRead, addresses: listenedTraps };
                }
            }
        }

        return trap;
    }

    private processFlagRaisedTraps(output: IterationOutput): Trap | 'none' {
        let trap: FlagTrap | 'none' = 'none';
        if (!!output.output && this._traps.length > 0 && this._enabledTrapTypes.includes(TrapType.FlagRaised)) {
            const listenedFlags = output.output.flags
                .filter(f => this._traps.some(t => t.type === TrapType.FlagRaised && TrapsListHelper.asFlagTrap(t).flags.includes(f)));
            if (listenedFlags.length > 0) {
                trap = { type: TrapType.FlagRaised, flags: listenedFlags };
            }
        }
        return trap;
    }

    private processFlagAcknowledgedTraps(debugComputer: DebuggableComputer, output: IterationOutput): Trap | 'none' {
        let trap: FlagTrap | 'none' = 'none';
        if (!!output.output && !!output.argument && this._traps.length > 0 && this._enabledTrapTypes.includes(TrapType.FlagAcknowledged)) {
            const listenedFlags = this._traps
                .filter(t => t.type === TrapType.FlagAcknowledged)
                .map(t => TrapsListHelper.asFlagTrap(t).flags)
                .reduce((x, y) => x.concat(y), []);

            // const listenedFlags = output.output.flags
                // .filter(f => this._traps.some(t => t.type === TrapType.FlagAcknowledged && TrapsListHelper.asFlagTrap(t).flags.includes(f)));

            if (listenedFlags.length > 0) {
                const flagsAcknowledged = new Array<FlagName>();
                if (output.mnemonic === Mnemonic.FLAG_ACK) {
                    const flagCode = output.argument.inlineValue;
                    if (!ExecutorArgumentHelper.isNullExecutorArgument(flagCode)) {
                        FlagHelper.TryGetFlagFromNumber(ByteSequenceCreator.Unbox(flagCode), (flagName) => {
                            flagsAcknowledged.push(flagName);
                        });
                    }
                }

                const listenedFlagsAcknowledged = flagsAcknowledged.filter(f => listenedFlags.includes(f));
                if (listenedFlagsAcknowledged.length > 0) {
                    trap = { type: TrapType.FlagAcknowledged, flags: listenedFlagsAcknowledged };
                }
            }
        }
        return trap;
    }

    public constructor() {
        this._enabledTrapTypes = ALL_TRAP_TYPES;
        this._traps = new Array<Trap>();
    }
    
    private _traps: Array<Trap>;
    private readonly _enabledTrapTypes: Array<TrapType>;
}