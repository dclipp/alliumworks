import { Trap } from '../trap';
import { QuadByte } from '@allium/types';

export interface MemoryTrap extends Trap {
    readonly addresses: Array<QuadByte>;
}