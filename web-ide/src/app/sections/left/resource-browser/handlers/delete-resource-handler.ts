import { FsList } from '@alliumworks/platform';
import { YfsStatus } from 'yfs';
import { HandlerContext } from '../handler-context';

export function handleDeleteResource(context: HandlerContext, selectedPaths: Array<string>): Promise<{
    readonly updatedSelectedPaths: Array<string>;
    readonly success: boolean;
}> {
    return new Promise((resolve) => {
        let body = '';
        if (selectedPaths.length > 1) {
            const bodyPaths = new Array<string>();
            selectedPaths.filter((p, pi) => pi < 10).forEach(p => bodyPaths.push(`${p.replace(context.virtualRootPath(), '')}`));
            if (selectedPaths.length > 10) {
                bodyPaths.push(`plus <strong>${selectedPaths.length - 10}</strong> others`);
            }

            body = `^Are you sure you want to delete these resources? ~${bodyPaths.join('|')}~^`;
        } else {
            body = `^Are you sure you want to delete "${selectedPaths[0].replace(context.virtualRootPath(), '')}"?^`;
        }

        context.modalService().launchModal('Delete resources', body, (affirmative) => {
            if (affirmative) {
                context.setIsLoading(true);
                const deletePaths = JSON.parse(JSON.stringify(selectedPaths)) as Array<string>;
                const pathPrefix = `/${FsList.WorkspaceResourcesDirectory}`;
                Promise.all(deletePaths.map(p => context.dir().deleteAsset(p.replace(context.virtualRootPath(), pathPrefix)))).then((yfsStatuses) => {
                // Promise.all(deletePaths.map(p => this.bh_deleteResource(p))).then((success) => {
                    context.setIsLoading(false);
                    if (yfsStatuses.every(s => s === YfsStatus.OK)) {
                        resolve({
                            updatedSelectedPaths: selectedPaths.filter(p => !deletePaths.includes(p)),
                            success: true
                        });
                    } else {
                        context.modalService().launchModal('Delete resources', 'Failed to delete resources', () => { }, { hideNoButton: true, yes: 'OK', no: '' });
                        resolve({
                            updatedSelectedPaths: [],
                            success: false
                        });
                    }
                });
            }
        }, { yes: 'Yes', no: 'No' }, true);
    });
}