import { FilesystemDelegate } from './filesystem/filesystem-delegate';
import { Terminal } from './terminal';
import { PlatformBackend } from './backends/platform-backend';
import { AssemblerBackend } from './backends/assembler-backend';
import { TerminalOutputType } from './terminal-output-type';
import { Platform } from '@alliumworks/platform';
import { AwCli } from './cli/generated';
import { Handlers } from './cli/handlers';
import { HandlerContext } from './cli/handlers/common';
import { Definitions } from './cli/definitions';

export interface Shell {
    readonly platform: Terminal;
    readonly assembler: Terminal;
}

export function Shell(awPlatform: Platform, filesystem: FilesystemDelegate): Shell {
    HandlerContext.platform = awPlatform;
    const awCli = new AwCli(Definitions, Handlers);
    
    const shellContext: {
        readonly platformBackend: PlatformBackend,
        readonly assemblerBackend: AssemblerBackend,
        readonly deferredOutputActions: Array<() => void>
    } = {
        platformBackend: new PlatformBackend(awPlatform, filesystem, HandlerContext.sharedContext, awCli),
        assemblerBackend: new AssemblerBackend(awPlatform, filesystem, HandlerContext.sharedContext, awCli),
        deferredOutputActions: new Array<() => void>()
    }

    let pbListener: (output: string, type: TerminalOutputType) => void;
    shellContext.platformBackend.outputStream().subscribe(output => {
        if (!!pbListener) {
            pbListener(output.stream, output.type);
        } else {
            shellContext.deferredOutputActions.push(() => {
                pbListener(output.stream, output.type);
            });
        }
    });

    let abListener: (output: string, type: TerminalOutputType) => void;
    shellContext.assemblerBackend.outputStream().subscribe(output => {
        if (!!abListener) {
            abListener(output.stream, output.type);
        } else {
            shellContext.deferredOutputActions.push(() => {
                abListener(output.stream, output.type);
            });
        }
    });

    return {
        platform: new Terminal(
            (input) => { shellContext.platformBackend.executeCommand(input) },
            (listener) => {
                pbListener = listener;

                if (!!pbListener && !!abListener) {
                    setTimeout(() => {
                        while (shellContext.deferredOutputActions.length > 0) {
                            shellContext.deferredOutputActions.splice(0, 1)[0]();
                        }
                    }, 400);
                }
            },
            awCli),
        assembler: new Terminal(
            (input) => { shellContext.assemblerBackend.executeCommand(input) },
            (listener) => {
                abListener = listener;

                if (!!pbListener && !!abListener) {
                    setTimeout(() => {
                        while (shellContext.deferredOutputActions.length > 0) {
                            shellContext.deferredOutputActions.splice(0, 1)[0]();
                        }
                    }, 400);
                }
            },
            awCli)
    }
}