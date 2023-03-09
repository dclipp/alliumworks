import { ButtonBarButton } from 'src/app/view-models/left-section/button-bar/button-bar-button';
import { ButtonSets } from 'src/app/view-models/left-section/button-bar/button-sets';
import { ResourceBr2owserViewModel } from 'src/app/view-models/left-section/resource-browser/resource-browser-view-model';
import { HandlerContext } from '../handler-context';

export function handleRenameResource(context: HandlerContext, selectedPaths: Array<string>, resources: Array<ResourceBr2owserViewModel>, setIsEditing: (isEditing: boolean, resourceIndex?: number) => void): Promise<{
    readonly updatedButtons: Array<ButtonBarButton>;
    readonly success: boolean;
}> {
    return new Promise((resolve) => {
        setIsEditing(true);
        const fullPath = selectedPaths[0];
        const resourceIndex = resources.findIndex(r => r.fullPath === fullPath);
        setIsEditing(true, resourceIndex);

        context.addEscapeKeyListener();

        setTimeout(() => {
            document.getElementById('resource-browser-rename-input-for-' + fullPath).focus();
        }, 450);

        resolve({
            updatedButtons: ButtonSets.PendingChange,
            success: true
        });
    });
}