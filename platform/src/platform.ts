import { joinPath, load, Yfs, YfsAssetInput, YfsGlobalScopeAccessor, YfsStatus } from 'yfs';
import { YfsConfig } from 'yfs/dist/interfaces/config/yfs-config';
import { FsList } from './fs-list';
import { PlatformConfig } from './platform-config';
import { CAssemblerService } from './private/services/assembler.service';
import { CDevicesService } from './private/services/devices/devices.service';
import { CUserDataService } from './private/services/user-data.service';
import { CWorkspaceManagerService } from './private/services/workspace-manager.service';
import { AssemblerService } from './services/assembler.service';
import { DevicesService } from './services/devices.service';
import { UserDataService } from './services/user-data.service';
import { WorkspaceManagerService } from './services/workspace-manager.service';
import { createDebugger, Debugger } from '@alliumworks/debugger';
import { ArchiverApi, initArchiverApi } from '@alliumworks/archiver';
import { createIoBus, IoBus } from '@allium/arch';

export interface Platform {
    readonly workspaceManager: WorkspaceManagerService;
    readonly assembler: AssemblerService;
    readonly devices: DevicesService;
    readonly machine: Debugger;
    readonly userData: UserDataService;
    readonly archiver: ArchiverApi;
    readonly io: IoBus;

    serializeFileSystem(): Promise<string>;

    readonly yfs: Yfs;
}

async function requireDirectory(yfs: Yfs, containerPath: string, name: string): Promise<void> {
    let status = YfsStatus.OK;
    const exists = await yfs.assetExists(joinPath(containerPath, name));
    if (exists.status === YfsStatus.OK) {
        if (!exists.payload) {
            status = await yfs.createDirectory(containerPath, name);
        }
    } else {
        status = exists.status;
    }

    if (status !== YfsStatus.OK) {
        throw new Error(`requireDirectory failed; status = ${status}`);
    }
}

async function initializeYfs(assets?: Array<YfsAssetInput>, config?: YfsConfig, globalScopeAccessor?: YfsGlobalScopeAccessor): Promise<Yfs> {
    const yfs = load(undefined, config, globalScopeAccessor);

    if (!!assets && assets.length > 0) {
        const transaction = await yfs.createTransaction();
        try {
            const importStatus = await transaction.importAssets(...assets);
            if (importStatus === YfsStatus.OK) {
                await transaction.commit();
            } else {
                throw new Error(`failed to importAssets; status = ${importStatus}`);
            }
        } catch (e) {
            if (!transaction.isDisposed()) {
                transaction.cancel();
            }

            throw e;
        }
    }

    await requireDirectory(yfs, '/', FsList.WorkspacesDirectory);
    await requireDirectory(yfs, '/', FsList.DevicesDirectory);
    await requireDirectory(yfs, '/', FsList.ComputerConfigsDirectory);
    await requireDirectory(yfs, '/', FsList.DevicesDirectory);
    await requireDirectory(yfs, joinPath(`/${FsList.DevicesDirectory}`), FsList.ImportedDevicesDirectory);

    return yfs;
}

export async function initializePlatform(savedAssets?: Array<YfsAssetInput>, config?: PlatformConfig, globalYfsScopeAccessor?: YfsGlobalScopeAccessor): Promise<Platform> {
    const assets = new Array<YfsAssetInput>();
    if (!!savedAssets && savedAssets.length > 0) {
        savedAssets.forEach(sa => assets.push(sa));
    }

    const yfs = await initializeYfs(assets, !!config ? config.yfs : undefined, globalYfsScopeAccessor);

    const archiverApi = initArchiverApi();

    const ioBus = createIoBus();

    const wmService = new CWorkspaceManagerService(yfs, archiverApi);

    const machineService = createDebugger(() => {
        return ioBus;
    }, !!config ? config.ioCapacity : undefined);

    const asmService = new CAssemblerService(yfs, () => {
        return wmService;
    }, () => {
        return machineService;
    });

    const devicesService = new CDevicesService(yfs, () => {
        return machineService;
    });
    
    const userDataService = new CUserDataService(yfs);
    return {
        workspaceManager: wmService,
        assembler: asmService,
        devices: devicesService,
        machine: machineService,
        userData: userDataService,
        serializeFileSystem: () => {
            return new Promise((resolve, reject) => {
                yfs.serializeAssets().then(s => {
                    resolve(s);
                }).catch(err => {
                    reject(err);
                })
            });
        },
        yfs: yfs,
        archiver: archiverApi,
        io: ioBus
    }
}