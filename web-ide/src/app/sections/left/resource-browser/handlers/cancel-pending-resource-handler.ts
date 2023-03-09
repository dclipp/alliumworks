import { ButtonBarButton } from 'src/app/view-models/left-section/button-bar/button-bar-button';
import { ButtonSets } from 'src/app/view-models/left-section/button-bar/button-sets';
import { ResourceBr2owserViewModel } from 'src/app/view-models/left-section/resource-browser/resource-browser-view-model';
import { HandlerContext } from '../handler-context';

export function cancelPendingResource(context: HandlerContext, isNew: boolean, resources: Array<ResourceBr2owserViewModel>,
    setIsEditing: (isEditing: boolean | undefined, resourceIndex?: number) => void,
    setResourceIsPending: (resourceIndex: number, isPending: boolean | undefined) => void,
    setResourcePendingName: (resourceIndex: number, pendingName: string | undefined) => void,
    setEditingParentPath: (path: string) => void): Promise<{
    readonly buttons: Array<ButtonBarButton>;
    readonly spliceResourceIndex: number;
    readonly success: boolean;
}> {
    return new Promise((resolve) => {
        context.removeEscapeKeyListener();
        setIsEditing(false);
        setEditingParentPath('');
        const index = resources.findIndex(r => r.isEditing === true);
        let spliceResourceIndex = -1;
        if (isNew) {
            spliceResourceIndex = index;
        } else {
            setResourcePendingName(index, undefined);
            setIsEditing(undefined, index);
            setResourceIsPending(index, undefined);
        }
        
        resolve({
            buttons: ButtonSets.ResourcesList.buttons,
            spliceResourceIndex: spliceResourceIndex,
            success: true
        });
    });
}