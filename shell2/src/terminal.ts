import { Observable, BehaviorSubject } from 'rxjs';
import { TerminalOutputType } from './terminal-output-type';
import { filter, map } from 'rxjs/operators';
import { AwCli, Completion } from './cli/generated';
import { Utils } from './cli/utils';

export interface Terminal {
    stdin(input: string): void;
    stdout(): Observable<{ readonly text: string, readonly type: TerminalOutputType }>;
    getSuggestedCompletions(input: string): Array<Completion>;
    getBestCompletion(input: string): Completion | null;
}

export class Terminal implements Terminal {
    public stdin(input: string): void {
        this._send(input);
    }

    public stdout(): Observable<{ readonly text: string, readonly type: TerminalOutputType }> {
        return this._onOutput.pipe(filter(x => x !== null), map(x => x!));
    }

    public getSuggestedCompletions(input: string): Array<Completion> {
        return this._awCli.findCompletions(input);
    }

    public getBestCompletion(input: string): Completion | null {
        const completions = this.getSuggestedCompletions(input);
        return Utils.getBestCompletion(completions);
    }
    
    public constructor(send: (input: string) => void, receive: (listener: (output: string, type: TerminalOutputType) => void) => void, awCli: AwCli) {
        this._send = send;
        receive((output, type) => {
            this._onOutput.next({ text: output, type: type });
        });
        this._onOutput = new BehaviorSubject<{ readonly text: string, readonly type: TerminalOutputType } | null>(null);
        this._awCli = awCli;
    }
    
    private _onOutput: BehaviorSubject<{ readonly text: string, readonly type: TerminalOutputType } | null>;
    private readonly _send: (input: string) => void;
    private readonly _awCli: AwCli;
}
