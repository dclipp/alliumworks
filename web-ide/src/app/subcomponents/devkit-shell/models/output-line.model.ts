import { TerminalOutputType } from '@alliumworks/shell';

export interface OutputLineModel {
    readonly content: string;
    readonly timestamp: number;
    readonly type?: TerminalOutputType;
}