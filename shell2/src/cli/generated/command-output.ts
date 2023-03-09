import { CommandMessage } from './command-message';

export interface CommandOutput<T = never> {
    readonly messages: Array<CommandMessage>;
    readonly isError: boolean;
    readonly payload?: T;
}