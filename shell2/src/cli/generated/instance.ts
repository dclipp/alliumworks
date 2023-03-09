import { CommandOutput } from './command-output';
import { Engine } from './engine';
import { CommandDefinition } from './command-definition';
import { Dispatcher } from './dispatcher';
import { Completion } from './completion';

export interface AwCli {
    findCompletions(input: string): Array<Completion>;
    invoke(handlerName: string, input: string, variables: Array<string>): Promise<CommandOutput>;
}

export class AwCli implements AwCli {
    public findCompletions(input: string): Array<Completion> {
        return this._engine.findCompletions(this._commandDefs, input);
    }

    public invoke(handlerName: string, input: string, variables: Array<string>): Promise<CommandOutput> {
        return this._dispatcher.invoke(handlerName, input, variables);
    }

    public constructor(commandDefs: Array<CommandDefinition>, handlers: { readonly [name: string]: (input: string, variables: Array<string>) => Promise<CommandOutput>}) {
        this._engine = new Engine();
        this._commandDefs = commandDefs;
        this._dispatcher = new Dispatcher();
        Object.keys(handlers).forEach(k => {
            this._dispatcher.registerHandler(k, handlers[k]);
        });
    }

    private readonly _dispatcher: Dispatcher;
    private readonly _commandDefs: Array<CommandDefinition>;
    private readonly _engine: Engine;
}