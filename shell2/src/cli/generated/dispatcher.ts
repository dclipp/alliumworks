import { CommandOutput } from './command-output';

export class Dispatcher {
    public registerHandler(handlerName: string, fn: (input: string, variables: Array<string>) => Promise<CommandOutput>): void {
        const handlerIndex = this._handlers.findIndex(h => h.name === handlerName);
        if (handlerIndex > -1) {
            this._handlers[handlerIndex] = {
                name: handlerName,
                fn: fn
            };
        } else {
            this._handlers.push({
                name: handlerName,
                fn: fn
            });
        }
    }

    public unregisterHandler(handlerName: string): boolean {
        const handlerIndex = this._handlers.findIndex(h => h.name === handlerName);
        if (handlerIndex > -1) {
            this._handlers.splice(handlerIndex, 1);
            return true;
        } else {
            return false;
        }
    }

    public invoke<TOut = never>(handlerName: string, input: string, variables: Array<string>): Promise<CommandOutput<TOut>> {
        const handlerIndex = this._handlers.findIndex(h => h.name === handlerName);
        if (handlerIndex > -1) {
            return this._handlers[handlerIndex].fn(input, variables);
        } else {
            return Promise.resolve({
                messages: [
                    {
                        type: 'error',
                        timestamp: Date.now(),
                        message: `Unknown command: ${handlerName}`
                    }
                ],
                isError: true
            });
        }
    }

    private readonly _handlers = new Array<{
        readonly name: string;
        readonly fn: (input: string, variables: Array<string>) => Promise<CommandOutput<any>>;
    }>();
}