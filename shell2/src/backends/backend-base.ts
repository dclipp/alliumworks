import { Observable, BehaviorSubject } from 'rxjs';
import { FilesystemDelegate } from '../filesystem/filesystem-delegate';
import { SharedBackendContext } from '../shared-backend-context';
import { filter, map } from 'rxjs/operators';
import { TerminalOutputType } from '../terminal-output-type';
import { Platform } from '@alliumworks/platform';
import { AwCli, CommandOutput } from '../cli/generated';

export abstract class BackendBase {
    public executeCommand(input: string): void {
        this.executeCommandInternal(input).then(output => {
            if (!!output) {
                output.messages.forEach(m => this.writeLine(m.message, m.type));
            }
        })
    }

    public outputStream(): Observable<{ readonly stream: string, readonly type: TerminalOutputType }> {
        return this._onOutput.pipe(filter(x => x !== null), map(x => x!));
    }

    protected abstract executeCommandInternal<T = never>(input: string): Promise<CommandOutput<T>>;
    protected abstract initialize(awPlatform: Platform): void;

    protected constructor(awPlatform: Platform, filesystem: FilesystemDelegate, sharedContext: SharedBackendContext, awCli: AwCli) {
        this._sharedContext = sharedContext;
        this._onOutput = new BehaviorSubject<{ readonly stream: string, readonly type: TerminalOutputType } | null>(null);
        this._initialWorkspaceLoaded = false;

        this._awCli = awCli;
        // this._awCli.invoke
        // this._dispatcher = new CommandDispatcher(awPlatform, (line) => this.writeLine(line), filesystem, (key, value) => {
        //     this._sharedContext.envProps.set(key, value);
        // }, (key) => {
        //     if (this._sharedContext.envProps.has(key)) {
        //         return this._sharedContext.envProps.delete(key);
        //     } else {
        //         return false;
        //     }
        // }, (prop, value) => {
        //     this._sharedContext.envProps.set(prop, value);
        // }, (prop) => {
        //     return this._sharedContext.envProps.get(prop);
        // }, (key) => {
        //     return this._sharedContext.envProps.get(key);
        // });

        this.initialize(awPlatform);
    }

    protected write(text: string, type?: TerminalOutputType): void {
        this._onOutput.next({ stream: text, type: type || 'info' });
    }

    protected writeLine(line: string, type?: TerminalOutputType): void {
        this.write(`${line}\n`, type);
    }

    protected transformInput(input: string): {
        readonly output: string,
        readonly unresolvedVars: Array<string>
    } {
        let transformed = '';
        const whitespace = RegExp(/[ \t]/);
        if (whitespace.test(input.charAt(0))) {
            let i = 0;
            while (i < input.length && whitespace.test(input.charAt(i))) {
                i++;
            }
            transformed = input.substring(i);
        } else {
            transformed = input;
        }

        if (transformed.startsWith('.r')) {
            transformed = transformed.replace('.r', 'mac reg');
        } else if (transformed.startsWith('.m')) {
            transformed = transformed.replace('.m', 'mac mem');
        } else if (transformed.startsWith('.f')) {
            transformed = transformed.replace('.f', 'mac flag');
        } else if (transformed.startsWith('.x')) {
            transformed = transformed.replace('.x', 'mac');
        } else if (transformed.startsWith('.bp')) {
            transformed = transformed.replace('.bp', 'mac bp');
        } else if (transformed.startsWith('.t')) {
            transformed = transformed.replace('.t', 'mac trap');
        } else if (transformed.startsWith('.d')) {
            transformed = transformed.replace('.d', 'mac dev');
        }

        let tempExclamation = 'exc_' + Math.random().toString().split('.')[1];
        while (transformed.includes(tempExclamation)) {
            tempExclamation = 'exc_' + Math.random().toString().split('.')[1];
        }

        // const isEcho = RegExp(/^([ \t]{0,}env[ \t]{1,}echo)|([ \t]{0,}echo)/).test(transformed);
        transformed = transformed.replace(/!!!/g, tempExclamation);
        const envVars = transformed.match(/!!([a-zA-Z0-9_]+)/g);
        const unresolvedVars = new Array<string>();
        
        if (!!envVars && envVars.length > 0) {
            envVars.forEach(v => {
                const key = v.replace('!!', '');
                const value = this.getKeyValue(key);
                if (value === null) {
                    unresolvedVars.push(key);
                    transformed = transformed.replace(RegExp(`!!${key}`, 'g'), '');
                } else {
                    transformed = transformed.replace(RegExp(`!!${key}`, 'g'), value);
                }
            })
        }

        transformed = transformed.replace(RegExp(tempExclamation, 'g'), '!!');

        return {
            output: transformed,
            unresolvedVars: unresolvedVars
        }
    }

    private getKeyValue(key: string): string | null {
        if (this._sharedContext.envProps.has(key)) {
            return this._sharedContext.envProps.get(key)!;
        } else {
            return null;
        }
    }

    protected _initialWorkspaceLoaded: boolean;
    protected readonly _sharedContext: SharedBackendContext;
    // protected readonly _dispatcher: CommandDispatcher;
    protected readonly _awCli: AwCli;
    private _onOutput: BehaviorSubject<{ readonly stream: string, readonly type: TerminalOutputType } | null>;
}