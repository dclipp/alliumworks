import { joinPath, Yfs, YfsAsset, YfsAssetInput, YfsDelta, YfsFile, YfsOutput, YfsStatus } from 'yfs';
import { YfsTransaction } from 'yfs/dist/interfaces/yfs-transaction';
import { FsList } from '../fs-list';
import { Workspace } from '../models/workspace.model';

export interface ActiveWorkspace extends Yfs, Workspace {
}

export class _ActiveWorkspace implements ActiveWorkspace {
    public async openDirectory(path: string): Promise<YfsOutput<Yfs>> {
        const r = await this.getRoot();
        return r.openDirectory(path);
    }
    public async createTransaction(): Promise<YfsTransaction> {
        const r = await this.getRoot();
        return r.createTransaction();
    }
    public async createDirectory(containerPath: string, name: string, isLoaded?: boolean): Promise<YfsStatus> {
        const r = await this.getRoot();
        return r.createDirectory(containerPath, name, isLoaded);
    }
    public async createSymlink(containerPath: string, name: string, targetPath: string): Promise<YfsStatus> {
        const r = await this.getRoot();
        return r.createSymlink(containerPath, name, targetPath);
    }
    public async createFile(containerPath: string, title: string, extension: string, content?: string): Promise<YfsStatus> {
        const r = await this.getRoot();
        return r.createFile(containerPath, title, extension, content);
    }
    public async getAsset(path: string): Promise<YfsOutput<YfsAsset>> {
        const r = await this.getRoot();
        return r.getAsset(path);
    }
    public async moveAsset(oldPath: string, newContainerPath: string): Promise<YfsStatus> {
        const r = await this.getRoot();
        return r.moveAsset(oldPath, newContainerPath);
    }
    public async renameAsset(path: string, newName: string): Promise<YfsStatus> {
        const r = await this.getRoot();
        return r.renameAsset(path, newName);
    }
    public async deleteAsset(path: string): Promise<YfsStatus> {
        const r = await this.getRoot();
        return r.deleteAsset(path);
    }
    public async getAssetFromHistory(path: string, versionTimestamp: number, versionMatch?: 'exact' | 'less-than' | 'greater-than' | 'less-than-or-eq' | 'greater-than-or-eq'): Promise<YfsOutput<YfsAsset>> {
        const r = await this.getRoot();
        return r.getAssetFromHistory(path, versionTimestamp, versionMatch);
    }
    public async updateFileContent(path: string, updatedContent: string): Promise<YfsStatus> {
        const r = await this.getRoot();
        return r.updateFileContent(path, updatedContent);
    }
    public async readDirectory(path: string, recursive?: boolean): Promise<YfsOutput<YfsAsset[]>> {
        const r = await this.getRoot();
        return r.readDirectory(path, recursive);
    }
    public async readFile(path: string): Promise<YfsOutput<YfsFile>> {
        const r = await this.getRoot();
        return r.readFile(path);
    }
    public async findFiles(title: string, extension: string, containerPath?: string): Promise<YfsOutput<YfsFile[]>> {
        const r = await this.getRoot();
        return r.findFiles(title, extension, containerPath);
    }
    public async loadRemoteDirectory(path: string, force?: boolean): Promise<YfsStatus> {
        const r = await this.getRoot();
        return r.loadRemoteDirectory(path, force);
    }
    public async assetExists(path: string): Promise<YfsOutput<boolean>> {
        const r = await this.getRoot();
        return r.assetExists(path);
    }
    public async getDeltas(): Promise<YfsDelta[]> {
        const r = await this.getRoot();
        return r.getDeltas();
    }
    public async getAssetHistory(pathQuery: string, includeDeletes?: boolean): Promise<Array<YfsDelta>> {
        const r = await this.getRoot();
        return r.getAssetHistory(pathQuery, includeDeletes);
    }
    public watchAsset(path: string, subscriber: (delta: YfsDelta) => void): { unsubscribe(): void; } {
        return this._root().watchAsset(joinPath(this.absolutePath, path), subscriber);
    }
    public async serializeAssets(): Promise<string> {
        const r = await this.getRoot();
        return r.serializeAssets();
    }
    public async asInputDataset(): Promise<{
        readonly absolutePath: string;
        readonly assets: Array<YfsAssetInput>;
    }> {
        const r = await this.getRoot();
        return await r.asInputDataset();
    }
    public readonly absolutePath: string;
    public readonly workspaceId: string;
    public readonly title: string;

    public constructor(root: () => Yfs, workspace: Workspace, absolutePath: string) {
        this._root = root;
        this.absolutePath = absolutePath;
        this.workspaceId = workspace.workspaceId;
        this.title = workspace.title;
    }

    private async getRoot(): Promise<Yfs> {
        const output = await this._root().openDirectory(joinPath('/', FsList.WorkspacesDirectory, this.workspaceId));
        if (output.status === YfsStatus.OK) {
            return output.payload;
        } else {
            throw new Error('Failed to get workspace directory');
        }
    }

    private readonly _root: () => Yfs;
}
