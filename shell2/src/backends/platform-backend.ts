import { VERSION_STRINGS } from '../version-strings';
import { FilesystemDelegate } from '../filesystem/filesystem-delegate';
import { SharedBackendContext } from '../shared-backend-context';
import { BackendBase } from './backend-base';
import { Platform } from '@alliumworks/platform';
import { AwCli, CommandOutput, Completion } from '../cli/generated';
import { Utils } from '../cli/utils';

export class PlatformBackend extends BackendBase {
    public constructor(awPlatform: Platform, filesystem: FilesystemDelegate, sharedContext: SharedBackendContext, awCli: AwCli) {
        super(awPlatform, filesystem, sharedContext, awCli);
    }

    protected executeCommandInternal<T = never>(input: string): Promise<CommandOutput<T>> {
        // const transformedInput = this.transformInput(input);
        const useInput = this._sharedContext.resolveProps2(input);

        const commandCompletion = Utils.getBestCompletion(this._awCli.findCompletions(useInput));
        if (commandCompletion === null) {
            return Promise.resolve(Utils.cmdPrependInput(useInput, Utils.cmdError('Unknown command')));
        } else {
            return this._awCli.invoke(commandCompletion.commandName, useInput, commandCompletion.variableValues);
        }
    }

    protected initialize(awPlatform: Platform): void {
        let initialOutput = '';
        initialOutput += '-- Allium Platform Shell --\n';
        initialOutput += `-- version ${VERSION_STRINGS.platform} --\n\n`;

        this.write(initialOutput);

        awPlatform.workspaceManager.activeWorkspace().subscribe(activeWorkspace => {
            if (!!activeWorkspace) {
                this.writeLine(`Opened workspace "${activeWorkspace.title}" (id: ${activeWorkspace.workspaceId})`);
            } else if (this._initialWorkspaceLoaded) {
                this.writeLine('workspace closed');
            }
            this._initialWorkspaceLoaded = true;
        })
    }
}