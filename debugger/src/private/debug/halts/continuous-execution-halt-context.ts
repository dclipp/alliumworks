import { ContinuousExecutionHaltOriginator } from './continuous-execution-halt-originator';
import { Trap } from '../traps/trap';

export interface ContinuousExecutionHaltContext {
    readonly originator: ContinuousExecutionHaltOriginator;
    readonly trapsCaught?: Array<Trap>;
}