import { SourceToken } from './source-token';

export interface SourceLineViewModel {
    readonly lineIndex: number;
    readonly isSubordinate: boolean;
    readonly tokens: Array<SourceToken>;
}