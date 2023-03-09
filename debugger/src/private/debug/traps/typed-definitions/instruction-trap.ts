import { Trap } from '../trap';
import { QuadByte } from '@allium/types';

export interface InstructionTrap extends Trap {
    readonly instructionAddress: QuadByte;
}