import { ButtonSets } from 'src/app/view-models/left-section/button-bar/button-sets';
import { ResourceBr2owserViewModel } from 'src/app/view-models/left-section/resource-browser/resource-browser-view-model';
import { HandlerContext } from '../handler-context';

export function handleNewFile(context: HandlerContext, selectedPaths: Array<string>, resources: Array<ResourceBr2owserViewModel>,
    setIsEditing: (isEditing: boolean, resourceIndex?: number) => void,
    setEditingParentPath: (path: string) => void,
    getEditingParentPath: () => string,
    pushResource: (r: ResourceBr2owserViewModel) => void): Promise<{
    readonly success: boolean;
}> {
    return new Promise((resolve) => {
        if (selectedPaths.length > 0) {
            const topSelection = selectedPaths[0];
            let afterIndex = resources.findIndex((r, ri, ra) => r.containerPath === topSelection && !ra.some((r2, r2i) => r2i > ri && r2.containerPath === topSelection));
            let depthFromTop = 0;
            if (afterIndex < 0) {
                afterIndex = resources.findIndex((r, ri, ra) => r.fullPath === topSelection && !ra.some((r2, r2i) => r2i > ri && r2.fullPath === topSelection));
                depthFromTop = resources[afterIndex].depthFromTop;
            } else {
                depthFromTop = resources[afterIndex].depthFromTop + 1;
            }

            setEditingParentPath(topSelection + '/');
            setIsEditing(true);
            pushResource({
                containerPath: topSelection,
                name: '',
                fullPath: topSelection + '/',
                isFile: true,
                isSourceFile: false,
                depthFromTop: depthFromTop,
                iconName: context.getIconNameForResource('', false, false),
                isEditing: true
            });
        } else {
            const afterIndex = resources.findIndex((r, ri, ra) => r.containerPath === '/' && !ra.some((r2, r2i) => r2i > ri && r2.containerPath === '/'));
            setEditingParentPath('/');
            setIsEditing(true);
            pushResource({
                containerPath: '/',
                name: '',
                fullPath: '/',
                isFile: true,
                isSourceFile: false,
                depthFromTop: 0,
                iconName: context.getIconNameForResource('', false, false),
                isEditing: true
            });
        }

        context.setButtons(ButtonSets.PendingChange);
        context.addEscapeKeyListener();

        setTimeout(() => {
            document.getElementById('resource-browser-input-for-' + getEditingParentPath()).focus();
        }, 450);

        resolve({
            success: true
        });
    });
}