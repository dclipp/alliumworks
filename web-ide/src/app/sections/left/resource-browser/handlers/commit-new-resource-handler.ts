import { ButtonBarButton } from 'src/app/view-models/left-section/button-bar/button-bar-button';
import { ButtonSets } from 'src/app/view-models/left-section/button-bar/button-sets';
import { ResourceBr2owserViewModel } from 'src/app/view-models/left-section/resource-browser/resource-browser-view-model';
import { YfsStatus } from 'yfs';
import { HandlerContext } from '../handler-context';

export function commitNewResource(context: HandlerContext, resources: Array<ResourceBr2owserViewModel>, inputFieldValue: string | undefined,
    setResourceIsPending: (resourceIndex: number, isPending: boolean) => void,
    setResourcePendingName: (resourceIndex: number, pendingName: string) => void,
    cancelPendingResource: (isNew: boolean) => void): Promise<{
    readonly buttons: Array<ButtonBarButton>;
    readonly isLoading: boolean;
    readonly isEditing: boolean;
    readonly parentPath: '';
    readonly name: string;
    readonly extension?: string;
    readonly isDirectory: boolean;
    readonly success: true;
} | {
    readonly success: false;
}> {
    return new Promise((resolve) => {
        try {
            context.removeEscapeKeyListener();
            if (!!inputFieldValue && !!inputFieldValue.trim()) {
                const index = resources.findIndex(r => r.isEditing === true);
                if (inputFieldValue.includes('/')) {
                    console.log('Invalid nameTODO');
                    resolve({
                        success: false
                    });
                } else {
                    console.log(JSON.stringify(resources[index], null, 2))
                    context.setIsLoading(true);
                    const isFile = resources[index].isFile;
                    setResourceIsPending(index, true);
                    setResourcePendingName(index, inputFieldValue);
                    const lastDotIndex = inputFieldValue.lastIndexOf('.');
                    resolve({
                        isLoading: false,
                        isEditing: false,
                        parentPath: '',
                        name: isFile
                            ? inputFieldValue.substring(0, lastDotIndex)
                            : inputFieldValue,
                        extension: isFile
                            ? inputFieldValue.substring(lastDotIndex + 1)
                            : undefined,
                        isDirectory: !isFile,
                        buttons: ButtonSets.ResourcesList.buttons,
                        success: true
                    });
                }
            } else {
                cancelPendingResource(true);
                resolve({
                    success: false
                });
            }
        } catch (exc) {
            resolve({
                success: false
            });
        }
    });

}