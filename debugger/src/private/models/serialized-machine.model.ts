import { SerializedComputer } from '@allium/arch';

export interface SerializedMachine {
    readonly computer: SerializedComputer | null;
    readonly breakpoints: Array<number>;
}