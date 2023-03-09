import { Trap } from '../traps/trap';
import { IterationOutput } from '@allium/arch';

export interface DebugIterationOutput extends IterationOutput {
    readonly trapsCaught: Array<Trap>;
}