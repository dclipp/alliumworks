import { ArchivedViewStateCustomProperty } from './archived-view-state-custom-property';

export interface ArchivedViewState {
    readonly activeWorkspaceId: string;
    readonly userId: string;
    readonly customProperties: Array<ArchivedViewStateCustomProperty>;
}