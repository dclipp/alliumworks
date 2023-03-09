import { DebugSession, TrapType, InstructionTrap } from '../debug/index';
import { ByteSequence, ByteSequenceCreator } from '@allium/types';

export class MachineBreakpointManager {
    
    public addBreakpoint(instructionAddress: ByteSequence<4>): boolean {
        let added = false;
        const bpNumeric = ByteSequenceCreator.Unbox(instructionAddress);
        if (!this._definedBreakpoints.includes(bpNumeric)) {
            added = true;
            this._definedBreakpoints.push(bpNumeric);
            if (this._isSessionReady) {
                this.pushBreakpointToSession(bpNumeric);
            }
        }
        return added;
    }

    public removeBreakpoint(instructionAddress: ByteSequence<4>): boolean {
        let removed = false;
        const bpNumeric = ByteSequenceCreator.Unbox(instructionAddress);
        const bpIndex = this._definedBreakpoints.indexOf(bpNumeric);
        if (bpIndex > -1) {
            removed = true;
            this._definedBreakpoints.splice(bpIndex, 1);
            if (this._isSessionReady) {
                this.removeBreakpointFromSession(bpNumeric);
            }
        }
        return removed;
    }

    public setBreakMode(enableBreak: boolean): void {
        if (this._isSessionReady) {
            const session = this._getSession();
            if (enableBreak) {
                session!.traps.enableTrapType(TrapType.InstructionBreak);
                this._breakModeChange = 'none';
            } else {
                session!.traps.disableTrapType(TrapType.InstructionBreak);
                this._breakModeChange = 'none';
            }
        } else {
            this._breakModeChange = enableBreak;
        }
    }

    public serialize(): Array<number> {
        return this._definedBreakpoints;
    }

    public constructor(sessionReadyCallback: (cb: (isReady: boolean) => void) => void, getSession: () => DebugSession | null) {
        this._getSession = getSession;
        sessionReadyCallback((isReady) => {
            this._isSessionReady = isReady;
            if (isReady) {
                this._definedBreakpoints.filter(bp => !this._sessionBreakpoints.includes(bp)).forEach(bp => {
                    this.pushBreakpointToSession(bp);
                })

                this._sessionBreakpoints.filter(bp => !this._definedBreakpoints.includes(bp)).forEach(bp => {
                    this.removeBreakpointFromSession(bp);
                })

                if (this._breakModeChange !== 'none') {
                    this.setBreakMode(this._breakModeChange);
                }
            }
        })
    }

    private pushBreakpointToSession(bpNumeric: number): void {
        const debugSession = this._getSession();
        if (!!debugSession) {
            const trap: InstructionTrap = { type: TrapType.InstructionBreak, instructionAddress: ByteSequenceCreator.QuadByte(bpNumeric) };
            debugSession.traps.addTrap(trap);
            this._sessionBreakpoints.push(bpNumeric);
        }
    }

    private removeBreakpointFromSession(bpNumeric: number): void {
        const debugSession = this._getSession();
        if (!!debugSession) {
            const trap: InstructionTrap = { type: TrapType.InstructionBreak, instructionAddress: ByteSequenceCreator.QuadByte(bpNumeric) };
            debugSession.traps.removeTrap(trap);
            const sessionBpIndex = this._sessionBreakpoints.indexOf(bpNumeric);
            if (sessionBpIndex > -1) {
                this._sessionBreakpoints.splice(sessionBpIndex, 1);
            }
        }
    }

    private _breakModeChange: boolean | 'none' = 'none';
    private _isSessionReady = false;
    private readonly _sessionBreakpoints = new Array<number>();
    private readonly _definedBreakpoints = new Array<number>();
    private readonly _getSession: () => DebugSession | null;
}