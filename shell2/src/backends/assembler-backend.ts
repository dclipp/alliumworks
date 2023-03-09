import { VERSION_STRINGS } from '../version-strings';
import { AsmMessageHelper, AsmMessageClassification } from '@allium/asm';
import { debounceTime } from 'rxjs/operators';
import { FilesystemDelegate } from '../filesystem/filesystem-delegate';
import { SharedBackendContext } from '../shared-backend-context';
import { BackendBase } from './backend-base';
import { TerminalOutputType } from '../terminal-output-type';
import { Platform } from '@alliumworks/platform';
import { AwCli, CommandOutput } from '../cli/generated';
import { Utils } from '../cli/utils';

export class AssemblerBackend extends BackendBase {
    public constructor(awPlatform: Platform, filesystem: FilesystemDelegate, sharedContext: SharedBackendContext, awCli: AwCli) {
        super(awPlatform, filesystem, sharedContext, awCli);
    }

    protected executeCommandInternal(input: string): Promise<CommandOutput> {
        // const AsmCmds = [AsmBuildWorkspaceCommand, AsmInlineCompileCommand];

        // const transformedInput = this.transformInput(input);
        // const useInput = transformedInput.output;
        const commandCompletion = Utils.getBestCompletion(this._awCli.findCompletions(input));
        if (commandCompletion === null) {
            return Promise.resolve(Utils.cmdPrependInput(input, Utils.cmdError('Unknown command')));
        } else {
            return this._awCli.invoke(commandCompletion.commandName, input, commandCompletion.variableValues);
        }
    }

    protected initialize(awPlatform: Platform): void {
        let initialOutput = '';
        initialOutput += '-- Allium Assembler --\n';
        initialOutput += `-- version ${VERSION_STRINGS.asm} --\n\n`;

        this.write(initialOutput);

        // context.workspaceManagerService.activeWorkspace().subscribe(activeWorkspace => {
        //     if (!!activeWorkspace) {
        //         this.writeLine(`Opened workspace "${activeWorkspace.title}" (id: ${activeWorkspace.id})`);
        //     } else if (this._initialWorkspaceLoaded) {
        //         this.writeLine('workspace closed');
        //     }
        //     this._initialWorkspaceLoaded = true;
        // })

        awPlatform.assembler.assembly().pipe(debounceTime(2500)).subscribe(assembly => {
            if (!!assembly) {
                if (assembly.buildSucceeded) {
                    this.writeLine('Build succeeded', 'success');
                } else {
                    this.writeLine('Build failed', 'error');
                }
                let line = '';
                const locale = this._sharedContext.envProps.get('locale') || 'default_default';
                assembly.messages.forEach(m => {
                    line += `\nin ${m.objectName}: ${AsmMessageHelper.localizeMessage(m.code, locale)}`;
                })
                this.writeLine(line);
            } else {
                if (this._initialWorkspaceLoaded) {
                    this.writeLine('No assembly');
                }
            }
        })

        awPlatform.assembler.assemblerMessages().pipe(debounceTime(2500)).subscribe(am => {
            const locale = this._sharedContext.envProps.get('locale') || 'default_default';
            am.forEach(m => {
                this.writeLine(`\nin "${m.objectName}": ${AsmMessageHelper.localizeMessage(m.code, locale)}`, this.mapMessageClassificationToOutputType(m.classification));
            })
        })
    }

    private mapMessageClassificationToOutputType(classification: AsmMessageClassification): TerminalOutputType {
        let ot: TerminalOutputType = 'info';

        switch (classification) {
            case AsmMessageClassification.Warning:
                ot = 'warning';
                break;
            case AsmMessageClassification.Critical:
            case AsmMessageClassification.Fatal:
                ot = 'error';
                break;
        }

        return ot;
    }
}