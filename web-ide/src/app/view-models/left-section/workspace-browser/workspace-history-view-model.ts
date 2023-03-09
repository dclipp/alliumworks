// export interface WorkspaceHistoryViewModel {
//     workspaceTitle: string;
//     key: string;
//     version: number;
//     workspaceId: string;
// }
export interface WorkspaceHistoryViewModel {
    workspaceTitle: string;
    workspaceId: string;
    versions: Array<{
        key: string;
        version: string;
    }>;
}