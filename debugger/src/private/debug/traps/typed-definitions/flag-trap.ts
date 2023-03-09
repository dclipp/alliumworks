import { Trap } from '../trap';
import { FlagName } from '@allium/types';

export interface FlagTrap extends Trap {
    readonly flags: Array<FlagName>;
}