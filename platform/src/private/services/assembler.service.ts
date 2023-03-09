import { AlmAssembler, Assembly, AssemblySettings, ExtendedAsmMessage, FileMap, SourceLine } from '@allium/asm';
import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs';
import { bufferTime, debounceTime, map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { joinPath, Yfs, YfsAsset, YfsFile, YfsOutput, YfsStatus } from 'yfs';
import { FsList } from '../../fs-list';
import { AssemblerService } from '../../services/assembler.service';
import { WorkspaceManagerService } from '../../services/workspace-manager.service';
import { QuadByte } from '@allium/types';
import { Debugger } from '@alliumworks/debugger';

export class CAssemblerService implements AssemblerService {
    public sourceObjects(): Observable<Array<{
        readonly filePath: string;
        readonly referenceName?: string;
        readonly rawContent: string;
        readonly lines: Array<SourceLine>;
        readonly isIncludedInAssembly: boolean;
    }>> {
        return this._workspace.pipe(withLatestFrom(this._unincludedSourceFiles), map(([workspaceObj, unincludedSourceFiles]) => {
            const objects = new Array<{
                readonly filePath: string;
                readonly referenceName?: string;
                readonly rawContent: string;
                readonly lines: Array<SourceLine>;
                readonly isIncludedInAssembly: boolean;
            }>();

            if (workspaceObj !== null && workspaceObj.latestBuild !== null && !!workspaceObj.latestBuild.sourceMap) {
                workspaceObj.latestBuild.sourceMap.LINES.forEach(ln => {
                    const sourceImport = workspaceObj.settings.sourceImports.find(si => si.referenceName === ln.objectName);
                    if (!!sourceImport) {
                        const filePath = sourceImport.filePath;
                        const oIndex = objects.findIndex(o => o.filePath === filePath);
                        if (oIndex > -1) {
                            objects[oIndex].lines.push(ln);
                        } else {
                            objects.push({
                                filePath: filePath,
                                referenceName: sourceImport.referenceName,
                                rawContent: workspaceObj.fileMap.find(fm => fm.referenceName === sourceImport.referenceName)!.fileContent,
                                lines: [ln],
                                isIncludedInAssembly: true
                            });
                        }
                    }
                })
            }

            unincludedSourceFiles.forEach(file => {
                objects.push({
                    filePath: file.filePath,
                    rawContent: file.rawContent,
                    lines: file.lines,
                    isIncludedInAssembly: false
                });
            })

            return objects;
        }))
    }
    
    public settings(): Observable<AssemblySettings | null> {
        return this._workspace.pipe(map(x => {
            if (!!x) {
                return x.settings;
            } else {
                return null;
            }
        }));
    }

    public assembly(): Observable<Assembly | null> {
        return this._workspace.pipe(map(x => {
            if (!!x && !!x.latestBuild) {
                return x.latestBuild;
            } else {
                return null;
            }
        }));
    }

    public fileMap(): Observable<FileMap | null> {
        return this._workspace.pipe(map(x => {
            if (!!x) {
                return x.fileMap;
            } else {
                return null;
            }
        }));
    }

    public blocks(): Observable<Array<{
        readonly name: string;
        readonly filePath: string;
        readonly isIncluded: boolean;
    }>> {
        return this._workspace.pipe(switchMap(this.mapBlocks.bind(this)));
    }

    public activeInstruction(): Observable<{
        readonly objectName: string;
        readonly lineIndex: number;
    } | null> {
        return combineLatest([
            this._debugger().activeInstructionAddress(),
            this.assembly()
        ]).pipe(bufferTime(500), map(x => {
            const y = x || [[]];
            const z = y[y.length - 1] || [];
            return [z[0] || 'na', z[1] || null] as [QuadByte | 'na', Assembly | null];
        }), map(([activeInstructionAddress, assembly]) => {
            if (activeInstructionAddress === 'na' || assembly === null || !(!!assembly.sourceMap)) {
                return null;
            } else {
                const srcLine = assembly.sourceMap.getLineByAddress(activeInstructionAddress);
                return !!srcLine ? {
                    objectName: srcLine.objectName,
                    lineIndex: srcLine.lineIndex
                } : null;
            }
        }));
    }

    public assemblerMessages(): Observable<Array<ExtendedAsmMessage>> {
        return this._workspace.pipe(map(x => {
            if (!!x && !!x.latestBuild) {
                return x.latestBuild.messages;
            } else {
                return [];
            }
        }));
    }

    public async updateSettings(updatedSettings: AssemblySettings): Promise<void> {
        const workspace = await this._workspace.pipe(take(1)).toPromise();
        if (workspace === null) {
            throw new Error('No workspace is currently open');
        } else {
            const path = joinPath('/', FsList.WorkspacesDirectory, workspace.workspaceId, FsList.WorkspaceResourcesDirectory, 'assembly.json');
            const status = await this._yfs.updateFileContent(path, AssemblySettings.serialize(updatedSettings));
            if (status !== YfsStatus.OK) {
                throw new Error(`Failed to save updated assembly.json file; status = ${status}`);
            }
        }
    }

    public async updateSourceFile(filePath: string, updatedFileContent: string): Promise<void> {
        const workspace = await this._workspace.pipe(take(1)).toPromise();
        if (workspace === null) {
            throw new Error('No workspace is currently open');
        } else {
            // const path = joinPath('/', FsList.WorkspacesDirectory, workspace.workspaceId, FsList.WorkspaceResourcesDirectory, 'assembly.json');
            const status = await this._yfs.updateFileContent(filePath, updatedFileContent);
            if (status !== YfsStatus.OK) {
                throw new Error(`Failed to save updated file; status = ${status}`);
            }
        }
    }

    public async buildPreview(objectName: string, fileContent: string): Promise<Assembly | null> {
        const activeWorkspace = await this._workspaceManager().activeWorkspace().pipe(take(1)).toPromise();
        if (activeWorkspace === null) {
            throw new Error('No workspace is currently open');
        } else {
            const rsrcDir = await activeWorkspace.readDirectory(`/${FsList.WorkspaceResourcesDirectory}`, true);
            const buildOutput = await this.buildWorkspace(activeWorkspace.absolutePath, activeWorkspace.workspaceId, rsrcDir, { objectName: objectName, fileContent: fileContent });
            return buildOutput.latestBuild;
        }
    }

    public constructor(rootYfs: Yfs, workspaceManager: () => WorkspaceManagerService, alliumDebugger: () => Debugger) {
        this._yfs = rootYfs;
        this._workspaceManager = workspaceManager;
        this._debugger = alliumDebugger;
        
        combineLatest([
            this._workspaceManager().hasActiveWorkspace(),
            this._workspaceManager().activeWorkspaceUpdated()
        ]).pipe(debounceTime(500)).subscribe(() => {
            this.refresh().then(() => {});
        });
    }

    private async buildWorkspace(absoluteWsPath: string, workspaceId: string, rsrcDir: YfsOutput<Array<YfsAsset>>, ...overrideSources: Array<{ readonly objectName: string, readonly fileContent: string }>): Promise<WorkspaceBuildOutput> {
        if (!!rsrcDir.payload) {
            const settingsFile = this.tryGetFileAsset(rsrcDir.payload.find(p => !p.isDirectory && p.publicName.toLowerCase() === 'assembly.json'));
            if (!!settingsFile) {
                const settings = AssemblySettings.fromJson(settingsFile.content);
                const fileMap = new Array<{ readonly referenceName: string, readonly fileContent: string }>();
                settings.sourceImports.forEach(si => {
                    const override = overrideSources.find(os => os.objectName === si.referenceName);
                    if (!!override) {
                        fileMap.push({
                            referenceName: override.objectName,
                            fileContent: override.fileContent
                        });
                    } else {
                        const virtualRootPath = joinPath(absoluteWsPath, FsList.WorkspaceResourcesDirectory);
                        const sourceFile = this.tryGetFileAsset(rsrcDir.payload.find(r => !r.isDirectory && joinPath(r.containerPath, r.publicName).replace(virtualRootPath, '') === si.filePath));
                        if (!!sourceFile) {
                            fileMap.push({
                                referenceName: si.referenceName,
                                fileContent: sourceFile.content
                            });
                        } else {
                            throw new Error(`Failed to get file for source import "${si.filePath}"`);
                        }
                    }
                });

                const builtAssembly = AlmAssembler.build(fileMap, {
                    generateSourceMap: true,
                    treatOversizedInlineValuesAsWarnings: settings.treatOversizedInlineValuesAsWarnings,
                    oversizedInlineValueSizing: settings.oversizedInlineValueSizing,
                    entryPoint: settings.entryPoint || undefined
                });

                return {
                    workspaceId: workspaceId,
                    settings: settings,
                    fileMap: fileMap,
                    latestBuild: builtAssembly
                };
            } else {
                throw new Error('Failed to fetch workspace settings file');
            }
        } else {
            throw new Error('resource dir is null');
        }
    }

    private async refresh(): Promise<void> {
        const activeWorkspace = await this._workspaceManager().activeWorkspace().pipe(take(1)).toPromise();
        if (activeWorkspace === null) {
            this._workspace.next(null);
            this._unincludedSourceFiles.next([]);
        } else {
            const rsrcDir = await activeWorkspace.readDirectory(`/${FsList.WorkspaceResourcesDirectory}`, true);
            if (rsrcDir.status === YfsStatus.OK) {
                try {
                    const wsBuild = await this.buildWorkspace(activeWorkspace.absolutePath, activeWorkspace.workspaceId, rsrcDir);
                    this._workspace.next(wsBuild);
                } catch (ex) { }
                const unincludedSourceFiles = await this.getUnincludedSourceFiles();
                this._unincludedSourceFiles.next(unincludedSourceFiles);
            }
        }
    }

    private tryGetFileAsset(asset: YfsAsset | undefined): YfsFile | null {
        let file: YfsFile | null = null;
        if (!!asset && !asset.isDirectory) {
            file = asset as YfsFile;
        }

        return file;
    }

    private async mapBlocks(workspaceObj: {
        readonly workspaceId: string;
        readonly settings: AssemblySettings;
        readonly fileMap: FileMap;
        readonly latestBuild: Assembly | null;
    } | null): Promise<Array<{
        readonly name: string;
        readonly filePath: string;
        readonly isIncluded: boolean;
    }>> {
        const blocks = new Array<{
            readonly name: string;
            readonly filePath: string;
            readonly isIncluded: boolean;
        }>();

        if (workspaceObj !== null) {
            const workspace = await this._workspaceManager().activeWorkspace().pipe(take(1)).toPromise();
            const allAssets = await workspace!.readDirectory(`/${FsList.WorkspaceResourcesDirectory}`, true);
            if (allAssets.status === YfsStatus.OK) {
                allAssets.payload
                    .filter(p => !p.isDirectory && (p as YfsFile).extension === 'aq')
                    .map(p => this.tryGetFileAsset(p))
                    .forEach(srcFile => {
                        const fileBuild = AlmAssembler.build([{
                            referenceName: 'inline',
                            fileContent: srcFile!.content
                        }], {
                            generateSourceMap: true,
                            useMockForExternalAddresses: true
                        });

                        if (!!fileBuild.sourceMap) {
                            fileBuild.sourceMap.LINES.forEach(ln => {
                                const blockNameEntity = ln.entities.find(e => e.kind === 'language-construct' && e.constructDetails !== 'none' && e.constructDetails.kind === 'block-name');
                                if (!!blockNameEntity) {
                                    const fp = joinPath(srcFile!.containerPath, srcFile!.publicName);
                                    const rsrcDir = joinPath(workspace!.absolutePath, FsList.WorkspaceResourcesDirectory);
                                    blocks.push({
                                        name: blockNameEntity.text,
                                        filePath: fp,
                                        isIncluded: workspaceObj.settings.sourceImports.some(si => joinPath(rsrcDir, si.filePath) === fp)
                                    })
                                }
                            })
                        }
                    });
            }
        }

        return blocks;
    }

    private async getUnincludedSourceFiles(): Promise<Array<{
        readonly fileName: string;
        readonly filePath: string;
        readonly rawContent: string;
        readonly lines: Array<SourceLine>;
    }>> {
        const files = new Array<{
            readonly fileName: string;
            readonly filePath: string;
            readonly rawContent: string;
            readonly lines: Array<SourceLine>;
        }>();
        
        const workspaceObj = await this._workspace.pipe(take(1)).toPromise();
        const workspace = await this._workspaceManager().activeWorkspace().pipe(take(1)).toPromise();
        const allAssets = await workspace!.readDirectory(`/${FsList.WorkspaceResourcesDirectory}`, true);
        if (allAssets.status === YfsStatus.OK) {
            allAssets.payload
                .map(p => this.tryGetFileAsset(p))
                .forEach(srcFile => {
                    if (!!srcFile && srcFile.extension === 'aq' && (!(!!workspaceObj)
                        || !workspaceObj.settings.sourceImports.some(si => si.filePath === joinPath(srcFile.containerPath, srcFile.publicName)))) {
                        const fileBuild = AlmAssembler.build([{
                            referenceName: 'inline',
                            fileContent: srcFile.content
                        }], {
                            generateSourceMap: true,
                            useMockForExternalAddresses: true
                        });

                        if (!!fileBuild.sourceMap) {
                            files.push({
                                fileName: srcFile.publicName,
                                filePath: joinPath(srcFile.containerPath, srcFile.publicName),
                                rawContent: srcFile.content,
                                lines: fileBuild.sourceMap.LINES.map(ln => ln)
                            })
                        }
                    }
                });
        }

        return files;
    }
    
    private readonly _unincludedSourceFiles = new BehaviorSubject<Array<{
        readonly fileName: string;
        readonly filePath: string;
        readonly rawContent: string;
        readonly lines: Array<SourceLine>;
    }>>([]);
    private readonly _workspace = new BehaviorSubject<WorkspaceBuildOutput | null>(null);
    private readonly _debugger: () => Debugger;
    private readonly _workspaceManager: () => WorkspaceManagerService;
    private readonly _yfs: Yfs;
}

interface WorkspaceBuildOutput {
    readonly workspaceId: string;
    readonly settings: AssemblySettings;
    readonly fileMap: FileMap;
    readonly latestBuild: Assembly | null;
}