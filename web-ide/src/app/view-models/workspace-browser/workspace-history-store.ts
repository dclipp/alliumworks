import { WorkspaceHistory } from 'src/app/data-models/workspace/workspace-history';

export interface WorkspaceHistoryStore {
    [key: string]: Array<WorkspaceHistory>;
}