import { AssemblySettings } from '@allium/asm';
import { AwArchiveMetadata, ArchiverApi } from '@alliumworks/archiver';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { createUuid, joinFileNameParts, joinPath, Yfs, YfsAssetInput, YfsDelta, YfsDeltaType, YfsDirectory, YfsFile, YfsOutput, YfsStatus, YfsSymlink, YfsTransaction, YfsDeltaAssetType } from 'yfs';
import { FsList } from '../../fs-list';
import { Workspace } from '../../models/workspace.model';
import { ActiveWorkspace, _ActiveWorkspace } from '../../proxies/active-workspace.proxy';
import { WorkspaceManagerService } from '../../services/workspace-manager.service';
import { Utils } from '../utils';

export class CWorkspaceManagerService implements WorkspaceManagerService {
    public activeWorkspace(): Observable<ActiveWorkspace | null> {
        return this._activeWorkspace2;
    }

    public activeWorkspaceUpdated(): Observable<YfsDelta> {
        return this._deltas;
    }

    public hasActiveWorkspace(): Observable<boolean> {
        return this._activeWorkspace2.pipe(map(x => x !== null), distinctUntilChanged());
    }

    public workspaces(): Observable<Array<Workspace>> {
        return this._allWorkspaces;
    }

    public async closeWorkspace(discardChanges?: boolean): Promise<void> {
        const activeWorkspace = await this.activeWorkspace().pipe(take(1)).toPromise();
        if (activeWorkspace === null) {
            throw new Error('No workspace is open');
        } else {
            let discardCount = 0;
            if (!!this._activeWatcher) {
                this._activeWatcher.unsubscribe();
                this._activeWatcher = null;
            }

            const trackingFilePath = joinPath(activeWorkspace.absolutePath, joinFileNameParts(FsList.WorkspaceTrackingFile.title, FsList.WorkspaceTrackingFile.extension));
            const trackingFileExists = await this._yfs.assetExists(trackingFilePath);
            if (trackingFileExists.payload === true) {
                if (discardChanges === true) {
                    const transaction = await this._yfs.createTransaction();
                    const trackingFile = await transaction.readFile(trackingFilePath);
                    if (trackingFile.status === YfsStatus.OK) {
                        const afterTimestamp = Number.parseInt(trackingFile.payload.content, 10);
                        if (Number.isInteger(afterTimestamp)) {
                            discardCount = await transaction.discardDeltas(activeWorkspace.absolutePath, afterTimestamp);
                        }
                    }

                    if (discardCount > 0) {
                        await transaction.commit();
                    } else if (!transaction.isDisposed()) {
                        transaction.cancel();
                    }
                }
                await this._yfs.deleteAsset(trackingFilePath);
            }

            this._activeWorkspace2.next(null);

            if (discardCount > 0) {
                this._refreshAllWorkspaces.next(Math.random());
            }
        }
    }

    public async openWorkspace(workspaceId: string): Promise<void> {
        const activeWorkspace = await this.activeWorkspace().pipe(take(1)).toPromise();
        if (activeWorkspace === null) {
            const workspaceDir = await this._yfs.openDirectory(this.buildWorkspacePath(workspaceId));
            if (workspaceDir.status === YfsStatus.OK) {
                const trackingFileExists = await workspaceDir.payload.assetExists(joinFileNameParts(FsList.WorkspaceTrackingFile.title, FsList.WorkspaceTrackingFile.extension));
                if (trackingFileExists.payload !== true) {
                    await workspaceDir.payload.createFile('/', FsList.WorkspaceTrackingFile.title, FsList.WorkspaceTrackingFile.extension, Date.now().toString());
                }

                this._activeWatcher = workspaceDir.payload!.watchAsset('/', (delta) => {
                    this._deltas.next(delta);
                });

                const metadataFiles = await Utils.fetchFilesOrFailAsync(workspaceDir.payload!.findFiles(FsList.WorkspaceMetadataFile.title, FsList.WorkspaceMetadataFile.extension), this.deserializeMetadata.bind(this));
                this._activeWorkspace2.next(new _ActiveWorkspace(() => this._yfs, {
                    workspaceId: workspaceId,
                    title: metadataFiles[0].title
                }, workspaceDir.payload.absolutePath));
            } else {
                throw new Error(`Failed to open workspace; status = ${workspaceDir.status}`);
            }
        } else {
            throw new Error('A workspace is already open');
        }
    }

    public async cloneWorkspace(sourceWorkspaceId: string, clonedTitle: string): Promise<string> {
        throw new Error('NOT IMPLEMENTED');//TODO
    }

    public async createWorkspace(workspaceTitle: string): Promise<string> {
        return this.internalCreateWorkspace(workspaceTitle, {
            createDefaultAssemblySettings: true
        });
    }

    public async deleteWorkspace(workspaceId: string): Promise<void> {
        const wsPath = this.buildWorkspacePath(workspaceId);
        const exists = await this._yfs.assetExists(wsPath);
        if (exists) {
            const status = await this._yfs.deleteAsset(wsPath);
            if (status === YfsStatus.OK) {
                this._refreshAllWorkspaces.next(Math.random());
            } else {
                throw new Error(`Failed to delete workspace; status = ${status}`);
            }
        } else {
            throw new Error('Specified workspace not found');
        }
    }

    public async renameWorkspace(workspaceId: string, newTitle: string): Promise<void> {
        let success = false;
        const allWorkspaces = await this.workspaces().pipe(take(1)).toPromise();
        if (allWorkspaces.some(ws => ws.title === newTitle)) {
            throw new Error('A workspace already exists with the specified title');
        } else {
            const wsPath = this.buildWorkspacePath(workspaceId);
            const exists = await this._yfs.assetExists(wsPath);
            if (exists) {
                const wsMetadataPath = joinPath(wsPath, `${FsList.WorkspaceMetadataFile.title}.${FsList.WorkspaceMetadataFile.extension}`);
                const currentMetadata = await this._yfs.readFile(wsMetadataPath);
                if (currentMetadata.status === YfsStatus.OK) {
                    const currentWs = this.deserializeMetadata(currentMetadata.payload.content);
                    const updateStatus = await this._yfs.updateFileContent(wsMetadataPath, this.serializeMetadata({
                        workspaceId: currentWs.workspaceId,
                        title: newTitle
                    }));

                    success = updateStatus === YfsStatus.OK;
                    if (success) {
                        this._refreshAllWorkspaces.next(Math.random());
                    }
                } else {
                    throw new Error(`Failed to get current workspace; status = ${currentMetadata.status}`);
                }
            } else {
                throw new Error('Specified workspace not found');
            }
        }
    }

    public async restoreWorkspace(workspaceId: string, version?: number): Promise<void> {
        let success = false;
        let transaction: YfsTransaction | null = null;
        try {
            const wsPath = this.buildWorkspacePath(workspaceId);
            transaction = await this._yfs.createTransaction();
            const history = await transaction.getAssetHistory(wsPath, true);
            const pathLevelHistory = history.filter(h => h.newPath === wsPath).sort((a, b) => b.timestamp - a.timestamp);
            const deletionExists = pathLevelHistory.length > 0 && pathLevelHistory[0].type === YfsDeltaType.Delete;// TODO version
            if (deletionExists) {
                const status = await transaction.restoreDeletedAsset(wsPath);
                if (status === YfsStatus.OK) {
                    success = true;
                } else {
                    throw new Error(`Failed to get restore workspace; status = ${status}`);
                }
            } else {
                throw new Error('Specified workspace does not exist or is not currently deleted');
            }
        } catch (ex) {
            throw ex;
        } finally {
            if (!!transaction) {
                if (success) {
                    await transaction.commit();
                    this._refreshAllWorkspaces.next(Math.random());
                } else if (!transaction.isDisposed()) {
                    transaction.cancel();
                }
            }
        }
    }

    public async purgeWorkspace(workspaceId: string): Promise<void> {
        let success = false;
        let transaction: YfsTransaction | null = null;
        try {
            const wsPath = this.buildWorkspacePath(workspaceId);
            transaction = await this._yfs.createTransaction();
            const asset = await transaction.getAsset(wsPath);
            if (asset.status === YfsStatus.OK && asset.payload.isDeleted) {
                const status = await transaction.purgeAsset(wsPath);
                if (status === YfsStatus.OK) {
                    success = true;
                } else {
                    throw new Error(`Failed to get purge workspace; status = ${status}`);
                }
            } else {
                throw new Error('Specified workspace does not exist or is not currently deleted');
            }
        } catch (ex) {
            throw ex;
        } finally {
            if (!!transaction) {
                if (success) {
                    await transaction.commit();
                    this._refreshAllWorkspaces.next(Math.random());
                } else if (!transaction.isDisposed()) {
                    transaction.cancel();
                }
            }
        }
    }

    public async exportWorkspaces(...workspaceIds: Array<string>): Promise<string> {
        const packageMetadata: AwArchiveMetadata = {
            timestamp: Date.now(),
            formatVersion: 0,//TODO,
            creator: ''//TODO
        };
        
        const ar = {
            workspaces: new Array<string>()
        };
        
        for (let i = 0; i < workspaceIds.length; i++) {
            const workspaceId = workspaceIds[i];
            const virtualPath = this.buildWorkspacePath(workspaceId);
            const workspacesDir = await this._yfs.openDirectory(virtualPath);
            if (workspacesDir.status === YfsStatus.OK) {
                const dataset = await workspacesDir.payload.asInputDataset();
                const rsrcPath = joinPath(virtualPath, FsList.WorkspaceResourcesDirectory);
                
                const indexOfMetadataFile = dataset.assets.findIndex(a => a.containerPath === virtualPath
                    && !a.isDirectory
                    && a.title === FsList.WorkspaceMetadataFile.title
                    && a.extension === FsList.WorkspaceMetadataFile.extension);
                
                const workspaceMetadata = this.deserializeMetadata((dataset.assets[indexOfMetadataFile] as any).content);
                const resources = dataset.assets.filter((a) => a.containerPath === rsrcPath);
                const creator = ''//TODO
                const producer = ''//TODO
                this._archiverApi.workspace.beginArchiveInput(creator, producer, workspaceMetadata.workspaceId, workspaceMetadata.title);
                resources.forEach(r => {
                    if (!r.isDirectory) {
                    //     return {
                    //         name: r.name,
                    //         containerPath: r.containerPath.replace(rsrcPath, '/'),
                    //         isDirectory: r.isDirectory,
                    //         isDeleted: r.isDeleted,
                    //         delta: !!r.delta
                    //             ? {
                    //                 oldPath: r.delta.oldPath.replace(rsrcPath, ''),
                    //                 newPath: r.delta.newPath.replace(rsrcPath, ''),
                    //                 type: r.delta.type,
                    //                 timestamp: r.delta.timestamp,
                    //                 detail: r.delta.detail
                    //             }
                    //             : r.delta,
                    //         isLoaded: r.isLoaded,
                    //         isSymlink: r.isSymlink,
                    //         targetPath: r.isSymlink === true
                    //             ? r.targetPath.replace(rsrcPath, '/')
                    //             : undefined
                    //     } as FsInputEntity
                    // } else {
                        this._archiverApi.workspace.addFile({
                            title: r.title,
                            extension: r.extension,
                            content: r.content || '',
                            containerPath: r.containerPath.replace(rsrcPath, '/')
                        });
                    }
                });

                ar.workspaces.push(this._archiverApi.serializeEntity(this._archiverApi.workspace.finishArchiveInput()));
            } else if (workspacesDir.status === YfsStatus.AssetNotFound) {
                throw new Error('No workspace found with the provided id');
            } else {
                throw new Error(`Workspace export failed; status = ${workspacesDir.status}`);
            }
        }


        return JSON.stringify(ar);
        // return AwArchiveApi.serialize(ar);
    }

    // public async exportManyWorkspaces(...workspaceIds: Array<string>): Promise<Array<{
    //     readonly workspaceId: string;
    //     readonly serializedWorkspace: string;
    // }>> {
    //     const exportedWorkspaces = new Array<{
    //         readonly workspaceId: string;
    //         readonly serializedWorkspace: string;
    //     }>();
    //     let allWorkspaces = await this.workspaces().pipe(take(1)).toPromise();
    //     if (!!workspaceIds && workspaceIds.length > 0) {
    //         allWorkspaces = allWorkspaces.filter(ws => workspaceIds.includes(ws.workspaceId));
    //     }

    //     for (let i = 0; i < allWorkspaces.length; i++) {
    //         const serializedWorkspace = await this.exportWorkspace(allWorkspaces[i].workspaceId);
    //         exportedWorkspaces.push({
    //             workspaceId: allWorkspaces[i].workspaceId,
    //             serializedWorkspace: serializedWorkspace
    //         });
    //     }

    //     return exportedWorkspaces;
    // }

    
    // public async importWorkspace(workspaceId: string, importTitle: string, serializedWorkspace: string): Promise<void> {
    //     await this.internalImportWorkspace(workspaceId, importTitle, serializedWorkspace);
    // }

    public async importWorkspaces(serializedArchive: string, ...includeWorkspaces: Array<{
        readonly workspaceId: string;
        readonly importTitle: string;
    }>): Promise<void> {
        let transaction: YfsTransaction | null = null;
        let success = false;

        try {
            const ar: {
                readonly workspaces: Array<string>;
            } = JSON.parse(serializedArchive);
            const deserializedWorkspaces = ar.workspaces.map(ws => this._archiverApi.workspace.deserialize(ws));

            const workspaceData = new Array<{
                readonly workspaceId: string;
                readonly workspaceImportSequence: Array<string>;
                readonly importTitle: string;
                readonly assets: Array<YfsAssetInput>;
            }>();

            for (let i = 0; i < deserializedWorkspaces.length; i++) {
                const iw = includeWorkspaces.find(w => w.workspaceId === deserializedWorkspaces[i].workspaceId);
                if (!!iw) {
                    const id = createUuid();
                    workspaceData.push({
                        workspaceId: id,
                        workspaceImportSequence: deserializedWorkspaces[i].importSequence.concat(iw.workspaceId),
                        importTitle: iw.importTitle,
                        assets: deserializedWorkspaces[i].files.map(f => {
                            return {
                                containerPath: joinPath(`/${FsList.WorkspacesDirectory}`, id, FsList.WorkspaceResourcesDirectory, f.containerPath.substring(1)),
                                isDirectory: false,
                                isDeleted: false,
                                title: f.title,
                                extension: f.extension,
                                content: f.content
                            }
                        })
                    });
                }
            }

            if (workspaceData.length > 0) {
                let errorMessage: string | null = null;
                
                transaction = await this._yfs.createTransaction();
                for (let i = 0; i < workspaceData.length && errorMessage === null; i++) {
                    try {
                        await this.internalImportWorkspace2(workspaceData[i], transaction);

                        const createImportFile = await transaction.createFile(joinPath(`/${FsList.WorkspacesDirectory}`, workspaceData[i].workspaceId), FsList.WorkspaceImportFile.title, FsList.WorkspaceImportFile.extension, workspaceData[i].workspaceImportSequence.join('\n'));
                        if (createImportFile !== YfsStatus.OK) {
                            throw new Error(`; status = ${createImportFile}`);
                        }
                    } catch (err) {
                        errorMessage = err.message;
                    }
                }

                if (errorMessage === null) {
                    success = true;
                } else {
                    throw new Error(errorMessage);
                }
            }
        } catch (outerError) {
            throw outerError;
        } finally {
            if (!!transaction) {
                if (success) {
                    await transaction.commit();
                } else if (!transaction.isDisposed()) {
                    transaction.cancel();
                }
            }
        }
    }

    // public async importManyWorkspaces(...workspaces: Array<{
    //     readonly workspaceId: string;
    //     readonly importTitle: string;
    //     readonly serializedWorkspace: string;
    // }>): Promise<void> {
    //     const transaction = await this._yfs.createTransaction();
    //     let errorMessage: string | null = null;
    //     for (let i = 0; i < workspaces.length && errorMessage === null; i++) {
    //         try {
    //             await this.internalImportWorkspace(workspaces[i].workspaceId, workspaces[i].importTitle, workspaces[i].serializedWorkspace, transaction);
    //         } catch (ex) {
    //             errorMessage = ex.message || '';
    //         }
    //     }

    //     if (errorMessage === null) {
    //         await transaction.commit();
    //         this._refreshAllWorkspaces.next(Math.random());
    //     } else {
    //         transaction.cancel();
    //         throw new Error(`Failed to import workspaces: ${errorMessage}`);
    //     }
    // }

    public async histories(): Promise<Array<{
        readonly workspaceId: string;
        readonly isDeleted: boolean;
        readonly versions: Array<{
            readonly timestamp: number;
            readonly title: string;
        }>;
    }>> {
        const histories = new Array<{
            readonly workspaceId: string;
            readonly isDeleted: boolean;
            readonly versions: Array<{
                readonly timestamp: number;
                readonly title: string;
            }>;
        }>();

        let deltas = await this._yfs.getAssetHistory(`/${FsList.WorkspacesDirectory}/*`, true);
        deltas = deltas.sort((a, b) => b.timestamp - a.timestamp);

        for (let i = 0; i < deltas.length; i++) {
            const delta = deltas[i];
            const workspaceId = delta.newPath.replace(`/${FsList.WorkspacesDirectory}/`, '');
            const index = histories.findIndex(h => h.workspaceId === workspaceId);

            const metadataFilePath = `/${FsList.WorkspacesDirectory}/${workspaceId}/${FsList.WorkspaceMetadataFile.title}.${FsList.WorkspaceMetadataFile.extension}`;
            let metadataFile = await this._yfs.getAssetFromHistory(
                metadataFilePath,
                delta.timestamp,
                'less-than-or-eq');
            if (metadataFile.status !== YfsStatus.OK) {
                metadataFile = await this._yfs.getAsset(metadataFilePath)
            }

            const versionTitle = metadataFile.status === YfsStatus.OK
                ? this.deserializeMetadata((metadataFile.payload as YfsFile).content).title
                : '(indeterminate)';

            if (index > -1) {
                if (!histories[index].versions.some(v => v.timestamp === delta.timestamp)) {
                    histories[index].versions.push({
                        timestamp: delta.timestamp,
                        title: versionTitle
                    });
                }
            } else {
                histories.push({
                    workspaceId: workspaceId,
                    isDeleted: delta.type === YfsDeltaType.Delete,
                    versions: [{
                        timestamp: delta.timestamp,
                        title: versionTitle
                    }]
                });
            }
            
        }
        
        return histories;
    }

    public constructor(rootYfs: Yfs, archiverApi: ArchiverApi) {
        this._yfs = rootYfs;
        this._archiverApi = archiverApi;
        this._activeWatcher = null;
        
        const wsDir = joinPath('/', FsList.WorkspacesDirectory);
        this._refreshAllWorkspaces.pipe(distinctUntilChanged(), debounceTime(500)).subscribe(() => {
            this._yfs.readDirectory(wsDir, true).then(assets => {
                if (assets.status === YfsStatus.OK) {
                    const metadataName = `${FsList.WorkspaceMetadataFile.title}.${FsList.WorkspaceMetadataFile.extension}`;
                    const workspaces = new Array<Workspace>();
                    assets.payload.filter(p => !p.isDirectory && p.publicName === metadataName).forEach(p => {
                        const file = p as YfsFile;
                        const ws = this.deserializeMetadata(file.content);
                        if (!workspaces.some(w => w.workspaceId === ws.workspaceId)) {
                            workspaces.push(ws);
                        }
                    });

                    this._allWorkspaces.next(workspaces);
                }
            })
        });
        this._yfs.watchAsset(wsDir, () => {
            this._refreshAllWorkspaces.next(Math.random());
        });
        this._refreshAllWorkspaces.next(Math.random());
    }

    private buildWorkspacePath(workspaceId: string): string {
        return `/${FsList.WorkspacesDirectory}/${workspaceId}`;
    }

    private deserializeMetadata(content: string): Workspace {
        return JSON.parse(content) as Workspace;
    }
    
    private serializeMetadata(workspace: Workspace): string {
        return JSON.stringify(workspace);
    }

    private async tryDeleteAsset(path: string, yfs: Yfs): Promise<void> {
        try {
            await yfs.deleteAsset(path);
        } catch (ex) { }
    }

    private async awaitOk(action: () => Promise<YfsStatus | YfsOutput<any>>): Promise<boolean> {
        const result = await action();

        return typeof result === 'object'
            ? result.status === YfsStatus.OK
            : result === YfsStatus.OK;
    }

    private async internalCreateWorkspace(workspaceTitle: string, options?: {
        readonly useId?: string;
        readonly assets?: Array<YfsAssetInput>;
        readonly createDefaultAssemblySettings?: boolean;
        readonly transaction?: YfsTransaction;
    }): Promise<string> {
        const autoManageTransaction = !(!!options && !!options.transaction);
        const transaction = autoManageTransaction
            ? await this._yfs.createTransaction()
            : options!.transaction!;
        let workspaceId: string | null = null;
        let errorMessage: string | null = null;

        try {
            const workspacesDir = await Utils.getPayloadOrFailAsync(transaction.openDirectory(`/${FsList.WorkspacesDirectory}`));
            const allWorkspaceMetadata = await Utils.fetchFilesOrFailAsync(workspacesDir.findFiles(FsList.WorkspaceMetadataFile.title, FsList.WorkspaceMetadataFile.extension), this.deserializeMetadata.bind(this), true);

            if (allWorkspaceMetadata.some(m => m.title === workspaceTitle)) {
                throw new Error('A workspace already exists with the provided title');
            } else {
                const generateId = !(!!options && !!options.useId);
                let newId = generateId
                    ? createUuid()
                    : options!.useId!;
                while (generateId && allWorkspaceMetadata.some(m => m.workspaceId === newId)) {
                    newId = createUuid();
                }
                
                const createDir = await workspacesDir.createDirectory('/', newId);
                if (createDir === YfsStatus.OK) {
                    const createRsrcDir = await workspacesDir.createDirectory(`/${newId}`, FsList.WorkspaceResourcesDirectory);
                    if (createRsrcDir === YfsStatus.OK) {
                        const createFile = await workspacesDir.createFile(`/${newId}`, FsList.WorkspaceMetadataFile.title, FsList.WorkspaceMetadataFile.extension, this.serializeMetadata({
                            workspaceId: newId,
                            title: workspaceTitle
                        }));
                        // const jf = await workspacesDir.readFile(`/${newId}/metadata.json`)

                        if (createFile === YfsStatus.OK) {
                            let failed = false;

                            if (!!options && !!options.assets && options.assets.length > 0) {
                                const ok = await this.awaitOk(() => transaction.importAssets(...options!.assets!));
                                failed = !ok;
                            }

                            if (!!options && options.createDefaultAssemblySettings === true) {
                                const createSettingsFile = await workspacesDir.createFile(joinPath(`/${newId}`, FsList.WorkspaceResourcesDirectory), 'assembly', 'json', AssemblySettings.serialize(AssemblySettings.default()));
                                failed = createSettingsFile !== YfsStatus.OK;
                            }

                            if (!failed) {
                                workspaceId = newId;
                            }
                        }
                    }
                } else {
                    throw new Error(`create dir failed; status = ${createDir.toString()}`);
                }
            }
        } catch (ex) {
            errorMessage = ex.message;
            if (autoManageTransaction && !transaction.isDisposed()) {
                transaction.cancel();
            }
            throw ex;
        } finally {
            if (workspaceId === null) {
                if (autoManageTransaction && !transaction.isDisposed()) {
                    transaction.cancel();
                }
                throw new Error(errorMessage || 'failed to create workspace');
            } else {
                if (autoManageTransaction) {
                    await transaction.commit();
                    this._refreshAllWorkspaces.next(Math.random());
                }
                return workspaceId;
            }
        }
    }

    // private async internalImportWorkspace(workspaceId: string, importTitle: string, serializedWorkspace: string, transaction?: YfsTransaction): Promise<void> {
    //     const workspacePath = this.buildWorkspacePath(workspaceId);
    //     const workspacesDir = await this._yfs.openDirectory(workspacePath);
    //     if (workspacesDir.status === YfsStatus.AssetNotFound) {
    //         const deserializedAssets = JSON.parse(serializedWorkspace) as {
    //             readonly absolutePath: string;
    //             readonly assets: Array<YfsAssetInput>;
    //         };

    //         await this.internalCreateWorkspace(importTitle, {
    //             useId: workspaceId,
    //             assets: deserializedAssets.assets.filter(a => {
    //                 if (a.isDirectory) {
    //                     return true;
    //                 } else {
    //                     const file = a as YfsFile;
    //                     return !(file.containerPath === workspacePath && file.title === FsList.WorkspaceMetadataFile.title && file.extension === FsList.WorkspaceMetadataFile.extension);
    //                 }
    //             }),
    //             transaction: transaction
    //         });
    //     } else if (workspacesDir.status === YfsStatus.OK) {
    //         throw new Error('A workspace already exists with the provided id');
    //     } else {
    //         throw new Error(`Workspace export failed; status = ${workspacesDir.status}`);
    //     }
    // }
    private async internalImportWorkspace2(workspaceData: {
        readonly workspaceId: string;
        readonly importTitle: string;
        // readonly absolutePath: string;
        readonly assets: Array<YfsAssetInput>;
    }, transaction: YfsTransaction): Promise<void> {
        const workspacePath = this.buildWorkspacePath(workspaceData.workspaceId);
        const workspacesDir = await this._yfs.openDirectory(workspacePath);
        if (workspacesDir.status === YfsStatus.AssetNotFound) {
            await this.internalCreateWorkspace(workspaceData.importTitle, {
                useId: workspaceData.workspaceId,
                assets: workspaceData.assets.filter(a => {
                    if (a.isDirectory) {
                        return true;
                    } else {
                        const file = a as YfsFile;
                        return !(file.containerPath === workspacePath && file.title === FsList.WorkspaceMetadataFile.title && file.extension === FsList.WorkspaceMetadataFile.extension);
                    }
                }),
                transaction: transaction
            });
        } else if (workspacesDir.status === YfsStatus.OK) {
            throw new Error('A workspace already exists with the provided id');
        } else {
            throw new Error(`Workspace export failed; status = ${workspacesDir.status}`);
        }
    }

    // private _activeWorkspace: Yfs | null;
    private _activeWatcher: { unsubscribe(): void } | null;
    private _deltas = new BehaviorSubject<YfsDelta>({
        oldPath: '',
        newPath: '',
        type: YfsDeltaType.Create,
        timestamp: 0,
        detail: 'initial emit',
        assetType: YfsDeltaAssetType.DirectoryLoaded,
        trackingKey: ''
    });
    private readonly _allWorkspaces = new BehaviorSubject<Array<Workspace>>([]);
    private readonly _refreshAllWorkspaces = new BehaviorSubject<number>(-1);
    private readonly _activeWorkspace2 = new BehaviorSubject<ActiveWorkspace | null>(null);
    private readonly _yfs: Yfs;
    private readonly _archiverApi: ArchiverApi;

}