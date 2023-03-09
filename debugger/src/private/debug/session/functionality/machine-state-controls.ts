import { ExecutionInterval } from '../execution-interval';
import { ClockType } from '@allium/arch';

export interface MachineStateControls {
    setExecutionInterval(interval: ExecutionInterval): void;
    getExecutionInterval(): ExecutionInterval;
    beginExecution(): void;
    haltExecution(): void;
    isExecuting(): boolean;
    setClockType(type: ClockType): void;
    getClockType(): ClockType;
    isIdle(): boolean;
}