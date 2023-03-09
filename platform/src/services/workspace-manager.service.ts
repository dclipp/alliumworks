import { Observable } from 'rxjs';
import { YfsDelta } from 'yfs';
import { Workspace } from '../models/workspace.model';
import { ActiveWorkspace } from '../proxies/active-workspace.proxy';

export interface WorkspaceManagerService {
    activeWorkspace(): Observable<ActiveWorkspace | null>;
    activeWorkspaceUpdated(): Observable<YfsDelta>;
    hasActiveWorkspace(): Observable<boolean>;
    workspaces(): Observable<Array<Workspace>>;

    closeWorkspace(discardChanges?: boolean): Promise<void>;
    openWorkspace(workspaceId: string): Promise<void>;
    cloneWorkspace(sourceWorkspaceId: string, clonedTitle: string): Promise<string>;
    
    createWorkspace(workspaceTitle: string): Promise<string>;
    deleteWorkspace(workspaceId: string): Promise<void>;
    renameWorkspace(workspaceId: string, newTitle: string): Promise<void>;
    restoreWorkspace(workspaceId: string, version?: number): Promise<void>;
    purgeWorkspace(workspaceId: string): Promise<void>;

    exportWorkspaces(...workspaceIds: Array<string>): Promise<string>;
    // exportWorkspace(workspaceId: string): Promise<string>;
    // exportManyWorkspaces(...workspaceIds: Array<string>): Promise<Array<{
    //     readonly workspaceId: string;
    //     readonly serializedWorkspace: string;
    // }>>;
    importWorkspaces(serializedArchive: string, ...includeWorkspaces: Array<{
        readonly workspaceId: string;
        readonly importTitle: string;
    }>): Promise<void>;
    // importWorkspace(workspaceId: string, importTitle: string, serializedWorkspace: string): Promise<void>;
    // importManyWorkspaces(...workspaces: Array<{
    //     readonly workspaceId: string;
    //     readonly importTitle: string;
    //     readonly serializedWorkspace: string;
    // }>): Promise<void>;
    // exportWorkspace(workspaceId: string): Promise<string>;
    // exportManyWorkspaces(...workspaceIds: Array<string>): Promise<Array<{
    //     readonly workspaceId: string;
    //     readonly serializedWorkspace: string;
    // }>>;
    // importWorkspace(workspaceId: string, importTitle: string, serializedWorkspace: string): Promise<void>;
    // importManyWorkspaces(...workspaces: Array<{
    //     readonly workspaceId: string;
    //     readonly importTitle: string;
    //     readonly serializedWorkspace: string;
    // }>): Promise<void>;

    histories(): Promise<Array<{
        readonly workspaceId: string;
        readonly isDeleted: boolean;
        readonly versions: Array<{
            readonly timestamp: number;
            readonly title: string;
        }>;
    }>>;
}