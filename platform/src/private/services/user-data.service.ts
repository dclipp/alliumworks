import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { joinPath, Yfs, YfsFile, YfsStatus } from 'yfs';
import { FsList } from '../../fs-list';
import { ComputerSpec, ComputerSpecInput, ComputerSpecCreateInput } from '@alliumworks/debugger';
import { UserDataService } from '../../services/user-data.service';

export class CUserDataService implements UserDataService {
    public computerSpecs(): Observable<Array<ComputerSpec>> {
        return this._specs.pipe(filter(x => x !== null), map(x => {
            const arr = x as Array<ComputerSpec>;
            if (arr.length === 0) {
                return [ComputerSpec.createDefault()];
            } else {
                return arr;
            }
        }));
    }

    public async updateComputerSpec(specName: string, updates: Partial<ComputerSpecInput>): Promise<ComputerSpec> {
        const currentSpecs = await this.computerSpecs().pipe(take(1)).toPromise();
        const index = currentSpecs.findIndex(s => s.name === specName);
        if (index > -1) {
            const updatedSpec = currentSpecs[index].update(updates);
            const oldPath = joinPath(FsList.ComputerConfigsDirectory, specName + '.json');
            // if (currentSpecs.some(s => s.name === specName && s.key === ComputerSpec.Defaults.Fields.DefaultKey())) {
                // return await this.createComputerSpec(updatedSpec);
            // } else {
                const updateStatus = await this._yfs.updateFileContent(oldPath, JSON.stringify(updatedSpec));
                if (updateStatus === YfsStatus.OK) {
                    if (updatedSpec.name !== specName) {
                        const renameStatus = await this._yfs.renameAsset(oldPath, updatedSpec.name + '.json');
                        if (renameStatus !== YfsStatus.OK) {
                            throw new Error(`failed to rename spec file; status = ${renameStatus}`);
                        }
                    }
                    
                    return updatedSpec;
                } else {
                    throw new Error(`failed to update spec file; status = ${updateStatus}`);
                }
            // }
        } else {
            throw new Error(`no spec found with name '${specName}'`);
        }
    }

    public async deleteComputerSpec(specName: string): Promise<void> {
        const specPath = joinPath('/' + FsList.ComputerConfigsDirectory, specName + '.json');
        const exists = await this._yfs.assetExists(specPath);
        if (exists.payload === true) {
            const deleteStatus = await this._yfs.deleteAsset(specPath);
            if (deleteStatus !== YfsStatus.OK) {
                throw new Error(`failed to delete spec file; status = ${deleteStatus}`);
            }
        } else {
            throw new Error(`no spec found with name '${specName}'`);
        }
    }

    public async createComputerSpec(spec: ComputerSpecCreateInput): Promise<ComputerSpec> {
        const currentSpecs = await this.computerSpecs().pipe(take(1)).toPromise();
        const index = currentSpecs.findIndex(s => s.name === spec.name);
        if (index > -1) {
            throw new Error(`a spec already exists with name '${spec.name}'`);
        } else {
            const createStatus = await this._yfs.createFile(joinPath('/', FsList.ComputerConfigsDirectory), spec.name, 'json', JSON.stringify(spec));
            if (createStatus === YfsStatus.OK) {
                return ComputerSpec.create(
                    spec.name,
                    spec.computerMemorySize === undefined ? ComputerSpec.Defaults.Fields.DefaultMemSize() : spec.computerMemorySize,
                    spec.computerCpuSpeed === undefined ? ComputerSpec.Defaults.Fields.DefaultCpuSpeed() : spec.computerCpuSpeed,
                    spec.cpuModelId === undefined ? ComputerSpec.Defaults.Fields.DefaultModelIdentifierNumeric() : spec.cpuModelId,
                    spec.cpuFeatureFlags1 === undefined ? 0 : spec.cpuFeatureFlags1,
                    spec.cpuFeatureFlags2 === undefined ? 0 : spec.cpuFeatureFlags2,
                    spec.cpuSerialNumber === undefined ? ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER : spec.cpuSerialNumber,
                    spec.cpuBatchMarket === undefined ? ComputerSpec.Defaults.Fields.DefaultProductionMarket() : spec.cpuBatchMarket,
                    spec.cpuISA === undefined ? ComputerSpec.Defaults.Fields.DefaultIsa() : spec.cpuISA,
                    spec.oversizedInlineValueSizing === undefined
                        ? ComputerSpec.Defaults.Fields.DefaultOversizeValueSizing()
                        : spec.oversizedInlineValueSizing,
                    spec.treatOversizedInlineValuesAsWarnings === true,
                    spec.isDefault === undefined ? false : spec.isDefault);
            } else {
                throw new Error(`failed to create spec file; status = ${createStatus}`);
            }
        }
    }

    public constructor(rootYfs: Yfs) {
        this._yfs = rootYfs;
        
        this._specsDirChanged.pipe(debounceTime(450), distinctUntilChanged()).subscribe(() => {
            this._yfs.readDirectory(joinPath('/', FsList.ComputerConfigsDirectory)).then(specsDir => {
                if (specsDir.status === YfsStatus.OK) {
                    const files = specsDir.payload.filter(p => !p.isDirectory).map(p => p as YfsFile);
                    const models = files.map(f => {
                        const o = JSON.parse(f.content);
                        return ComputerSpec.create(
                            o.name,
                            o.computerMemorySize,
                            o.computerCpuSpeed,
                            o.cpuModelId,
                            o.cpuFeatureFlags1,
                            o.cpuFeatureFlags2,
                            o.cpuSerialNumber,
                            o.cpuBatchMarket,
                            o.cpuISA,
                            o.oversizedInlineValueSizing,
                            o.treatOversizedInlineValuesAsWarnings,
                            o.isDefault);
                    })

                    this._specs.next(models);
                } else {
                    throw new Error(`failed to get spec files; status = ${specsDir.status}`);
                }
            })
        });

        this._yfs.watchAsset(joinPath('/', FsList.ComputerConfigsDirectory), () => {
            this._specsDirChanged.next(Math.random());
        });


        // setTimeout(() => {
        //     this._specsDirChanged.next(Math.random());
        // }, 500);
    }

    private readonly _specsDirChanged = new BehaviorSubject<number>(-1);
    private readonly _specs = new BehaviorSubject<Array<ComputerSpec> | null>(null);
    private readonly _yfs: Yfs;
}