import { IoBus } from '@allium/arch';
import { CDebugger } from './private/machine/debugger';
import { Debugger } from './public/debugger';

export { Debugger } from './public/debugger';
export * from './private';

export { ComputerSpec } from './models/computer-specs/computer-spec.model';
export { ComputerSpecInput } from './models/computer-specs/computer-spec-input.model';
export { ComputerSpecCreateInput } from './models/computer-specs/computer-spec-create-input.model';
export { ComputerSpecOption } from './models/computer-specs/computer-spec-option.model';

export function createDebugger(ioBus: () => IoBus, ioCapacity?: number): Debugger {
    return new CDebugger(ioBus, ioCapacity);
}