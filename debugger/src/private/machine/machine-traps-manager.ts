import { DebugSession, TrapType, Trap, InstructionTrap, RegisterTrap, MemoryTrap, FlagTrap } from '../debug/index';
import { QuadByte, Register, FlagName } from '@allium/types';

export class MachineTrapsManager {
    
    /** data types:
     *      InstructionBreak: QuadByte;
     *      RegisterRead or RegisterWrite: Array<Register>;
     *      MemoryRead or MemoryWrite: Array<QuadByte>;
     *      FlagRaised or FlagAcknowledged: Array<FlagName>;
     */
    public addTrap(type: TrapType, ...data: Array<any>): void {
        const trap = this.getTypedTrapObject(type, data);
        const task: (session: DebugSession) => void = (session) => {
            session.traps.addTrap(trap);
        }
        if (this._isSessionReady) {
            task(this._getSession()!);
        } else {
            this._deferredTasks.push(task);
        }

        this.trackAdd(this.getTypedTrapObject(type, data));
    }

    /** data types:
     *      InstructionBreak: QuadByte;
     *      RegisterRead or RegisterWrite: Array<Register> or undefined;
     *      MemoryRead or MemoryWrite: Array<QuadByte> or undefined;
     *      FlagRaised or FlagAcknowledged: Array<FlagName> or undefined;
     */
    public removeTrap(type: TrapType, ...data: Array<any>): void {
        const trap = this.getTypedTrapObject(type, data);
        const task: (session: DebugSession) => void = (session) => {
            session.traps.removeTrap(trap);
        }
        if (this._isSessionReady) {
            task(this._getSession()!);
        } else {
            this._deferredTasks.push(task);
        }

        this.trackRemove(this.getTypedTrapObject(type, data));
    }

    public getAll(): Array<Trap> {
        return this._tracked;
    }

    public constructor(sessionReadyCallback: (cb: (isReady: boolean) => void) => void, getSession: () => DebugSession | null, trapSet: (trap: Trap) => void, trapUnset: (trap: Trap) => void) {
        this._getSession = getSession;
        this._trapSet = trapSet;
        this._trapUnset = trapUnset;
        this._tracked = new Array<Trap>();
        sessionReadyCallback((isReady) => {
            this._isSessionReady = isReady;
            if (isReady) {
                const session = this._getSession();
                for (let i = 0; i < this._deferredTasks.length; i++) {
                    this._deferredTasks[i](session!);
                }
            }
            this._deferredTasks = new Array<(session: DebugSession) => void>();
        })
    }

    private getTypedTrapObject(type: TrapType, data: Array<any>): Trap {
        if (type === TrapType.InstructionBreak) {
            const trap: InstructionTrap = { type: TrapType.InstructionBreak, instructionAddress: data[0] as QuadByte };
            return trap;
        } else if (type === TrapType.RegisterRead) {
            const trap: RegisterTrap = { type: TrapType.RegisterRead, registers: !!data ? data[0] as Register[] : [] };
            return trap;
        } else if (type === TrapType.RegisterWrite) {
            const trap: RegisterTrap = { type: TrapType.RegisterWrite, registers: !!data ? data[0] as Register[] : [] };
            return trap;
        } else if (type === TrapType.MemoryRead || type === TrapType.MemoryWrite) {
            const trap: MemoryTrap = { type: type, addresses: !!data ? data[0] as QuadByte[] : [] };
            return trap;
        } else if (type === TrapType.FlagRaised || type === TrapType.FlagAcknowledged) {
            const trap: FlagTrap = { type: type, flags: !!data ? data[0] as FlagName[] : [] };
            return trap;
        } else {
            throw new Error('Not implemented');
        }
    }

    private trackAdd(trap: Trap): void {
        let incomingArray: Array<any> | null = null;
        let getArray: ((t: Trap) => Array<any> | null) | null = null;
        let elementEquals: ((a: any, b: any) => boolean) | null = null;

        if (trap.type === TrapType.FlagAcknowledged || trap.type === TrapType.FlagRaised) {
            incomingArray = (trap as any).flags;
            getArray = (t) => {
                if (t.type === trap.type) {
                    return (t as any).flags;
                } else {
                    return null
                };
            }
            elementEquals = (a, b) => a === b;
        } else if (trap.type === TrapType.MemoryRead || trap.type === TrapType.MemoryWrite) {
            incomingArray = (trap as any).addresses;
            getArray = (t) => {
                if (t.type === trap.type) {
                    return (t as any).addresses;
                } else {
                    return null
                };
            }
            elementEquals = (a, b) => a.isEqualTo(b)
        } else if (trap.type === TrapType.RegisterRead || trap.type === TrapType.RegisterWrite) {
            incomingArray = (trap as any).registers;
            getArray = (t) => {
                if (t.type === trap.type) {
                    return (t as any).registers;
                } else {
                    return null
                };
            }
            elementEquals = (a, b) => a === b;
        }

        if (!!getArray && !!incomingArray && !!elementEquals) {
            if (!this._tracked.some(t => {
                if (t.type === trap.type) {
                    const arr =  getArray!(t);
                    return arr !== null && incomingArray!.every((x, xi) => elementEquals!(arr[xi], x));
                } else {
                    return false;
                }
            })) {
                this._tracked.push(trap);
                this._trapSet(trap);
            }
        }
    }

    private trackRemove(trap: Trap): void {
        let incomingArray: Array<any> | null = null;
        let getArray: ((t: Trap) => Array<any> | null) | null = null;
        let elementEquals: ((a: any, b: any) => boolean) | null = null;

        if (trap.type === TrapType.FlagAcknowledged || trap.type === TrapType.FlagRaised) {
            incomingArray = (trap as any).flags;
            getArray = (t) => {
                if (t.type === trap.type) {
                    return (t as any).flags;
                } else {
                    return null
                };
            }
            elementEquals = (a, b) => a === b;
        } else if (trap.type === TrapType.MemoryRead || trap.type === TrapType.MemoryWrite) {
            incomingArray = (trap as any).addresses;
            getArray = (t) => {
                if (t.type === trap.type) {
                    return (t as any).addresses;
                } else {
                    return null
                };
            }
            elementEquals = (a, b) => a.isEqualTo(b)
        } else if (trap.type === TrapType.RegisterRead || trap.type === TrapType.RegisterWrite) {
            incomingArray = (trap as any).registers;
            getArray = (t) => {
                if (t.type === trap.type) {
                    return (t as any).registers;
                } else {
                    return null
                };
            }
            elementEquals = (a, b) => a === b;
        }

        if (!!getArray && !!incomingArray && !!elementEquals) {
            const index = this._tracked.findIndex(t => {
                if (t.type === trap.type) {
                    const arr =  getArray!(t);
                    return arr !== null && incomingArray!.every((x, xi) => elementEquals!(arr[xi], x));
                } else {
                    return false;
                }
            });

            if (index > -1) {
                this._tracked.splice(index, 1);
                this._trapUnset(trap);
            }
        }
    }

    private _deferredTasks = new Array<(session: DebugSession) => void>();
    private _isSessionReady = false;
    private readonly _tracked: Array<Trap>;
    private readonly _trapUnset: (trap: Trap) => void;
    private readonly _trapSet: (trap: Trap) => void;
    private readonly _getSession: () => DebugSession | null;
}