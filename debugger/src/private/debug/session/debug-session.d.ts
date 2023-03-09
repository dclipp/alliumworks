import { Byte, QuadByte } from '@allium/types';
import { Observable } from 'rxjs';
import { ContinuousExecutionHaltContext } from '../halts/continuous-execution-halt-context';
import { SessionTrapControls } from './functionality/session-trap-controls';
import { MachineDataControls } from './functionality/machine-data-controls';
// import { IoControls } from './functionality/io-controls';
import { PostExecutionListeners } from './functionality/post-execution-listeners';
import { MachineStateControls } from './functionality/machine-state-controls';

export declare class DebugSession {
    public readonly postExecutionListeners: PostExecutionListeners;
    public readonly machineData: MachineDataControls;
    public readonly machineState: MachineStateControls;
    public readonly traps: SessionTrapControls;
    // public readonly io: IoControls;

    public loadProgram(program: Array<Byte> | ReadonlyArray<Byte>): void;
    public onContinuousExecutionHalted(): Observable<ContinuousExecutionHaltContext>;
    public endSession(): void;

    public static create(computerMemorySize: QuadByte): DebugSession;
}