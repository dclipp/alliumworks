import { AssemblySettings } from '@allium/asm';
import { FsList } from '@alliumworks/platform';
import { ButtonBarButton } from 'src/app/view-models/left-section/button-bar/button-bar-button';
import { ButtonSets } from 'src/app/view-models/left-section/button-bar/button-sets';
import { ResourceBr2owserViewModel } from 'src/app/view-models/left-section/resource-browser/resource-browser-view-model';
import { joinPath, YfsFile, YfsStatus, YfsTransaction } from 'yfs';
import { HandlerContext } from '../handler-context';

function maybeUpdateSourceImport(context: HandlerContext, transaction: YfsTransaction, previousPath: string, newPath: string): Promise<void> {
    return new Promise((resolve) => {
        const settingsPath = joinPath(context.virtualRootPath(), 'assembly.json');
        transaction.getAsset(settingsPath).then(settingsRsrc => {
            if (settingsRsrc.status === YfsStatus.OK) {
                const settings = AssemblySettings.fromJson((settingsRsrc.payload as YfsFile).content);
                const siIndex = settings.sourceImports.findIndex(si => joinPath(context.virtualRootPath(), si.filePath) === previousPath);
                if (siIndex > -1) {
                    context.modalService().launchModal(
                        'Update source import',
                        `^The file "${previousPath.replace(context.virtualRootPath(), '')}" is imported by the assembly.^
                        ^Do you want to update the assembly settings with the new file name?^`,
                        (affirmative) => {
                            if (affirmative) {
                                const updatedJson = AssemblySettings.serialize(settings.update({
                                    sourceImports: settings.sourceImports.map((si, sii) => {
                                        if (sii === siIndex) {
                                            return {
                                                filePath: `/${newPath}`,
                                                referenceName: si.referenceName
                                            }
                                        } else {
                                            return si;
                                        }
                                    })
                                }));
                                transaction.updateFileContent(settingsPath, updatedJson).then(status => {
                                    if (status === YfsStatus.OK) {
                                        resolve();
                                    } else {
                                        context.modalService().launchModal(
                                            'Update source import',
                                            'Failed to update assembly settings',
                                            () => {
                                                resolve();
                                            },
                                            { yes: 'OK', no: '', hideNoButton: true});
                                    }
                                }).catch(() => {
                                    context.modalService().launchModal(
                                        'Update source import',
                                        'Failed to update assembly settings',
                                        () => {
                                            resolve();
                                        },
                                        { yes: 'OK', no: '', hideNoButton: true});
                                })
                            } else {
                                resolve();
                            }
                        },
                        { yes: 'Yes', no: 'No' },
                        true);
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        })
    });
}

export function handleMoveResource(context: HandlerContext, resources: Array<ResourceBr2owserViewModel>, newContainerPath: string, resourceIndex: number,
    setResourceIsPending: (resourceIndex: number, isPending: boolean) => void,
    setResourceIsEditing: (resourceIndex: number, isEditing: boolean) => void): Promise<{
    readonly buttons: Array<ButtonBarButton>;
    readonly isEditing: boolean;
    readonly success: true;
} | {
    readonly success: false;
}> {
    return new Promise((resolve) => {
        context.removeEscapeKeyListener();
        context.setIsLoading(true);
        setResourceIsPending(resourceIndex, true);
        const previousPath = resources[resourceIndex].fullPath;
        context.dir().createTransaction().then(transaction => {
            transaction.moveAsset(previousPath, newContainerPath).then(status => {
                context.setIsLoading(false);
                if (status === YfsStatus.OK) {
                    context.removeEscapeKeyListener();
                    maybeUpdateSourceImport(context, transaction, previousPath, joinPath(newContainerPath, resources[resourceIndex].name)).then(() => {
                        transaction.commit().then(() => {
                            setResourceIsPending(resourceIndex, false);
                            setResourceIsEditing(resourceIndex, false);
                            resolve({
                                success: true,
                                isEditing: false,
                                buttons: ButtonSets.ResourcesList.buttons
                            })
                        })
                    })
                } else {
                    transaction.cancel();
                    context.modalService().launchModal('Move resource', 'Failed to move resource', () => { }, { hideNoButton: true, yes: 'OK', no: '' });
                    setResourceIsPending(resourceIndex, false);
                    resolve({
                        success: false
                    });
                }
            })
        })
    });
}