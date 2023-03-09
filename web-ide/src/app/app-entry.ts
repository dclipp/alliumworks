import { Shell, FileType } from '@alliumworks/shell';
import { initializePlatform, Platform, StringEntity } from '@alliumworks/platform';
import { YfsAssetInput, YfsGlobalScopeAccessor } from 'yfs';
import { LocalStorageKeys } from './utilities/local-storage-keys';

export class AppEntry {
    public static get sessionDataJson(): Array<{ readonly key: string, readonly content: string }> | undefined {
        return AppEntry._sessionDataJson;
    }

    public static get shell(): Shell {
        return AppEntry._shell;
    }

    public static get isPlaygroundOnly(): boolean {
        return AppEntry._playgroundOnly;
    }

    public static get alliumWorksPlatform(): Platform {
        return AppEntry._platform;
    }

    public static loadEnv(envJson: string): void {
        if (!!envJson && envJson.length > 0) {
            const data = JSON.parse(envJson);

            AppEntry._playgroundOnly = data.playground_only === true;

            const sessionDataArray: Array<StringEntity> = data['sessionData'] || [];

            if (sessionDataArray.length > 0) {
                AppEntry._sessionDataJson = sessionDataArray.filter(x => !!x.name && !!x.value).map(x => {
                    return {
                        key: x.name,
                        content: x.value
                    }
                })
            }
        }
    }

    public static initializeAlliumWorks(envJson?: string, userAuth?: string): Promise<void> {
        return new Promise((resolve) => {
            if (AppEntry._platform === undefined) {
                // remoteOpts: {
                //     mapRoute: (containerPath, dirName) => {
                //         return Promise.resolve({
                //             endpointName: 'TESTTODO',
                //             targetDirectoryName: 'TESTTODO',
                //             scopeDetail: 'TESTTODO'
                //         });
                //     },
                //     endpoints: {
                //         'TESTTODO': (route) => {
                //             return Promise.reject();
                //         }
                //     }
                // }
                // const serializedData = {
                //     workspaces: undefined as string | undefined
                // };

                // if (!!envJson) {
                //     const env = JSON.parse(envJson) as {
                //         readonly workspaces?: Array<{
                //             readonly metadata: Workspace;
                //             readonly resources: Array<YfsAssetInput>;
                //         }>;
                //     };

                //     if (!!env.workspaces && !(!!userAuth)) {
                //         serializedData.workspaces = JSON.stringify(env.workspaces);
                //     }
                // }

                let savedAssets: Array<YfsAssetInput> | undefined = undefined;
                try {
                    const fsJson = localStorage.getItem(LocalStorageKeys.FilesystemData);
                    if (!!fsJson) {
                        savedAssets = JSON.parse(fsJson).assets;
                    }
                } catch (ex) { }

                // TODO
                initializePlatform(savedAssets, {
                    yfs: {
                        debugMode: {
                            instanceName: 'primary'
                        }
                    }
                }, AppEntry.getYfsGlobalScopeAccessor()).then(platform => {
                    AppEntry._platform = platform;
                    AppEntry._shell = Shell(platform, {
                        emitFile: (type, format, content) => {
                            AppEntry.handleFileReceipt(type, format, content);
                        },
                        requestFile: (type, acceptFormats, promptMessage, onReceived, onDeclined) => {
                            // TODO
                        }
                    });
                    resolve();
                })
            } else {
                resolve();
            }
        })
    }

    private static handleFileReceipt(type: FileType, format: string, content: string): void {
        //TODO
        console.log(`File emitted from devkit: ${type}, format=${format}`);
        
        if (type === FileType.WorkspaceArchive) { // Workspaces export
            AppEntry.saveExportedWorkspacesFile(content, format);
        }
    }

    private static saveExportedWorkspacesFile(content: string, format: string): void {
        if (content === null) {
            // error
        } else {
            if (format === 'plaintext') {
                console.log('TODO: export plaintext');
            } else if (format === 'wrv') {
                const name = `workspaces_${Date.now()}.wrv`;
                const blob = new File([content], name, { type: 'application/binary' });
                const downloadUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.id = `dl_${Math.random().toString().split('.')[1]}`;
                downloadLink.href = downloadUrl;
                downloadLink.download = name;

                document.body.appendChild(downloadLink);
                window.setTimeout(() => {
                    const el = document.getElementById(downloadLink.id);
                    el.click();
                    el.remove();
                    URL.revokeObjectURL(downloadUrl);
                }, 250);
            }
        }
    }

    private static getYfsGlobalScopeAccessor(): YfsGlobalScopeAccessor {
        const globalName = '__aw_yfs_g';
        if (window[globalName] === undefined) {
            window[globalName] = {};
        }

        return {
            globalName: globalName,
            getUniqueObject: (key) => {
                const o = window[globalName][key];
                if (o === undefined) {
                    throw new Error(`undefined global object: ${key}`);
                } else {
                    return o;
                }
            },
            uniqueObjectIsDefined: (key) => {
                return window[globalName][key] !== undefined;
            },
            defineUniqueObject: (key, value) => {
                window[globalName][key] = value;
            }
        }
    }

    private static _platform: Platform | undefined = undefined;
    private static _playgroundOnly: boolean = false;
    private static _shell: Shell | undefined = undefined;
    private static _sessionDataJson: Array<{ readonly key: string, readonly content: string }> | undefined = undefined;
}