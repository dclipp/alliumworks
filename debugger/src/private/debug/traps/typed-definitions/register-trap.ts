import { Trap } from '../trap';
import { Register } from '@allium/types';

export interface RegisterTrap extends Trap {
    readonly registers: Array<Register>;
}