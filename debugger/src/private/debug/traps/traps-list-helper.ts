import { Trap } from './trap';
import { TrapType } from './trap-type';
import { InstructionTrap } from './typed-definitions/instruction-trap';
import { RegisterTrap } from './typed-definitions/register-trap';
import { MemoryTrap } from './typed-definitions/memory-trap';
import { FlagTrap } from './typed-definitions/flag-trap';

export class TrapsListHelper {
    public static include(currentList: Array<Trap>, trap: Trap): Array<Trap> {
        if (trap.type === TrapType.InstructionBreak) {
            const targetAddress = TrapsListHelper.asInstructionTrap(trap).instructionAddress;
            if (!currentList.some(x => x.type === TrapType.InstructionBreak && TrapsListHelper.asInstructionTrap(x).instructionAddress.isEqualTo(targetAddress))) {
                const ib: InstructionTrap = { type: TrapType.InstructionBreak, instructionAddress: targetAddress };
                currentList.push(ib);
            }
            return currentList;
        } else if (trap.type === TrapType.FlagRaised) {
            const index = currentList.findIndex(x => x.type === TrapType.FlagRaised);
            if (index > -1) {
                const currentFr = TrapsListHelper.asFlagTrap(currentList[index]);
                TrapsListHelper.asFlagTrap(trap).flags.filter(x => !currentFr.flags.includes(x)).forEach(x => {
                    currentFr.flags.push(x);
                })
            } else {
                const fr: FlagTrap = { type: TrapType.FlagRaised, flags: TrapsListHelper.asFlagTrap(trap).flags }
                currentList.push(fr);
            }            
            return currentList;
        } else if (trap.type === TrapType.FlagAcknowledged) {
            const index = currentList.findIndex(x => x.type === TrapType.FlagAcknowledged);
            if (index > -1) {
                const currentFa = TrapsListHelper.asFlagTrap(currentList[index]);
                TrapsListHelper.asFlagTrap(trap).flags.filter(x => !currentFa.flags.includes(x)).forEach(x => {
                    currentFa.flags.push(x);
                })
            } else {
                const fa: FlagTrap = { type: TrapType.FlagAcknowledged, flags: TrapsListHelper.asFlagTrap(trap).flags }
                currentList.push(fa);
            }            
            return currentList;
        } else if (trap.type === TrapType.RegisterRead) {
            const index = currentList.findIndex(x => x.type === TrapType.RegisterRead);
            if (index > -1) {
                const currentRr = TrapsListHelper.asRegisterTrap(currentList[index]);
                TrapsListHelper.asRegisterTrap(trap).registers.filter(x => !currentRr.registers.includes(x)).forEach(x => {
                    currentRr.registers.push(x);
                })
            } else {
                const rr: RegisterTrap = { type: TrapType.RegisterRead, registers: TrapsListHelper.asRegisterTrap(trap).registers }
                currentList.push(rr);
            }            
            return currentList;
        } else if (trap.type === TrapType.RegisterWrite) {
            const index = currentList.findIndex(x => x.type === TrapType.RegisterWrite);
            if (index > -1) {
                const currentRw = TrapsListHelper.asRegisterTrap(currentList[index]);
                TrapsListHelper.asRegisterTrap(trap).registers.filter(x => !currentRw.registers.includes(x)).forEach(x => {
                    currentRw.registers.push(x);
                })
            } else {
                const rw: RegisterTrap = { type: TrapType.RegisterWrite, registers: TrapsListHelper.asRegisterTrap(trap).registers }
                currentList.push(rw);
            }            
            return currentList;
        } else if (trap.type === TrapType.MemoryRead) {
            const index = currentList.findIndex(x => x.type === TrapType.MemoryRead);
            if (index > -1) {
                const currentMr = TrapsListHelper.asMemoryTrap(currentList[index]);
                TrapsListHelper.asMemoryTrap(trap).addresses.filter(x => !currentMr.addresses.some(y => y.isEqualTo(x))).forEach(x => {
                    currentMr.addresses.push(x.clone());
                })
            } else {
                const mr: MemoryTrap = { type: TrapType.MemoryRead, addresses: TrapsListHelper.asMemoryTrap(trap).addresses.map(a => a.clone()) }
                currentList.push(mr);
            }            
            return currentList;
        } else if (trap.type === TrapType.MemoryWrite) {
            const index = currentList.findIndex(x => x.type === TrapType.MemoryWrite);
            if (index > -1) {
                const currentMw = TrapsListHelper.asMemoryTrap(currentList[index]);
                TrapsListHelper.asMemoryTrap(trap).addresses.filter(x => !currentMw.addresses.some(y => y.isEqualTo(x))).forEach(x => {
                    currentMw.addresses.push(x.clone());
                })
            } else {
                const mw: MemoryTrap = { type: TrapType.MemoryWrite, addresses: TrapsListHelper.asMemoryTrap(trap).addresses.map(a => a.clone()) }
                currentList.push(mw);
            }            
            return currentList;
        } else {
            throw new Error(`Unknown trap type: ${trap.type}`);
        }
    }

    public static remove(currentList: Array<Trap>, trap: Trap): Array<Trap> {
        if (trap.type === TrapType.InstructionBreak) {
            const targetAddress = TrapsListHelper.asInstructionTrap(trap).instructionAddress;
            const index = currentList.findIndex(x => x.type === TrapType.InstructionBreak && TrapsListHelper.asInstructionTrap(x).instructionAddress.isEqualTo(targetAddress));
            if (index > -1) {
                currentList.splice(index, 1);
            }
            return currentList;
        } else if (trap.type === TrapType.FlagRaised) {
            const index = currentList.findIndex(x => x.type === TrapType.FlagRaised);
            if (index > -1) {
                const currentFr = TrapsListHelper.asFlagTrap(currentList[index]);
                const param = TrapsListHelper.asFlagTrap(trap);
                if (currentFr.flags.length === param.flags.length && param.flags.every(f => currentFr.flags.includes(f))) {
                    currentList.splice(index, 1);
                } else {
                    const updatedTrap: FlagTrap = { type: TrapType.FlagRaised, flags: currentFr.flags.filter(f => !param.flags.includes(f))};
                    currentList[index] = updatedTrap;
                }
            }        
            return currentList;
        } else if (trap.type === TrapType.FlagAcknowledged) {
            const index = currentList.findIndex(x => x.type === TrapType.FlagAcknowledged);
            if (index > -1) {
                const currentFa = TrapsListHelper.asFlagTrap(currentList[index]);
                const param = TrapsListHelper.asFlagTrap(trap);
                if (currentFa.flags.length === param.flags.length && param.flags.every(f => currentFa.flags.includes(f))) {
                    currentList.splice(index, 1);
                } else {
                    const updatedTrap: FlagTrap = { type: TrapType.FlagAcknowledged, flags: currentFa.flags.filter(f => !param.flags.includes(f))};
                    currentList[index] = updatedTrap;
                }
            }        
            return currentList;
        } else if (trap.type === TrapType.RegisterRead) {
            const index = currentList.findIndex(x => x.type === TrapType.RegisterRead);
            if (index > -1) {
                const currentRr = TrapsListHelper.asRegisterTrap(currentList[index]);
                const param = TrapsListHelper.asRegisterTrap(trap);
                if (currentRr.registers.length === param.registers.length && param.registers.every(r => currentRr.registers.includes(r))) {
                    currentList.splice(index, 1);
                } else {
                    const updatedTrap: RegisterTrap = { type: TrapType.RegisterRead, registers: currentRr.registers.filter(r => !param.registers.includes(r))};
                    currentList[index] = updatedTrap;
                }
            }        
            return currentList;
        } else if (trap.type === TrapType.RegisterWrite) {
            const index = currentList.findIndex(x => x.type === TrapType.RegisterWrite);
            if (index > -1) {
                const currentRr = TrapsListHelper.asRegisterTrap(currentList[index]);
                const param = TrapsListHelper.asRegisterTrap(trap);
                if (currentRr.registers.length === param.registers.length && param.registers.every(r => currentRr.registers.includes(r))) {
                    currentList.splice(index, 1);
                } else {
                    const updatedTrap: RegisterTrap = { type: TrapType.RegisterWrite, registers: currentRr.registers.filter(r => !param.registers.includes(r))};
                    currentList[index] = updatedTrap;
                }
            }               
            return currentList;
        } else if (trap.type === TrapType.MemoryRead) {
            const index = currentList.findIndex(x => x.type === TrapType.MemoryRead);
            if (index > -1) {
                const currentMr = TrapsListHelper.asMemoryTrap(currentList[index]);
                const param = TrapsListHelper.asMemoryTrap(trap);
                if (currentMr.addresses.length === param.addresses.length && param.addresses.every(m => currentMr.addresses.some(x => x.isEqualTo(m)))) {
                    currentList.splice(index, 1);
                } else {
                    const updatedTrap: MemoryTrap = { type: TrapType.MemoryRead, addresses: currentMr.addresses.filter(x => !param.addresses.some(y => y.isEqualTo(x)))};
                    currentList[index] = updatedTrap;
                }
            }        
            return currentList;
        } else if (trap.type === TrapType.MemoryWrite) {
            const index = currentList.findIndex(x => x.type === TrapType.MemoryWrite);
            if (index > -1) {
                const currentMr = TrapsListHelper.asMemoryTrap(currentList[index]);
                const param = TrapsListHelper.asMemoryTrap(trap);
                if (currentMr.addresses.length === param.addresses.length && param.addresses.every(m => currentMr.addresses.some(x => x.isEqualTo(m)))) {
                    currentList.splice(index, 1);
                } else {
                    const updatedTrap: MemoryTrap = { type: TrapType.MemoryWrite, addresses: currentMr.addresses.filter(x => !param.addresses.some(y => y.isEqualTo(x)))};
                    currentList[index] = updatedTrap;
                }
            }        
            return currentList;
        } else {
            throw new Error(`Unknown trap type: ${trap.type}`);
        }
    }

    public static asInstructionTrap(n: Trap): InstructionTrap {
        if (n.type === TrapType.InstructionBreak) {
            return n as InstructionTrap;
        } else {
            throw new Error('Type mismatch');
        }
    }

    public static asRegisterTrap(t: Trap): RegisterTrap {
        if (t.type === TrapType.RegisterRead || t.type === TrapType.RegisterWrite) {
            return t as RegisterTrap;
        } else {
            throw new Error('Type mismatch');
        }
    }
    
    public static asMemoryTrap(t: Trap): MemoryTrap {
        if (t.type === TrapType.MemoryRead || t.type === TrapType.MemoryWrite) {
            return t as MemoryTrap;
        } else {
            throw new Error('Type mismatch');
        }
    }
    
    public static asFlagTrap(t: Trap): FlagTrap {
        if (t.type === TrapType.FlagRaised || t.type === TrapType.FlagAcknowledged) {
            return t as FlagTrap;
        } else {
            throw new Error('Type mismatch');
        }
    }
}