export interface ActiveSessionInfo {
    readonly hasActive: boolean,
    readonly workspaceId: string,
    readonly workspaceVersion?: string
}