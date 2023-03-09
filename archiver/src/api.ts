import { AwArchive } from './entities/aw-archive';
import { AwArchiveMetadata } from './entities/aw-archive-metadata';
import { DeviceEntity } from './entities/devices/device.entity';
import { ComputerSpecEntity } from './entities/specs/computer-spec.entity';
import { StringEncodingEntity } from './entities/strings/string-encoding.entity';
import { StringEntity } from './entities/strings/string.entity';
import { WorkspaceEntity } from './entities/workspaces/workspace.entity';

export interface AwArchiveApi { }

export class AwArchiveApi implements AwArchiveApi {
    public static createWorkspaceEntity(ar: AwArchive, workspace: WorkspaceEntity): AwArchive {
        if (ar.workspaces.some(w => w.workspaceId === workspace.workspaceId)) {
            throw new Error('A workspace with the provided workspaceId is already present');
        } else {
            const o = JSON.parse(JSON.stringify(ar));
            o.workspaces.push(workspace);
            return o as AwArchive;
        }
    }

    public static updateWorkspaceEntity(ar: AwArchive, workspaceId: string, updates: Partial<WorkspaceEntity>): AwArchive {
        throw new Error('Not Implemented');
    }

    public static deleteWorkspaceEntity(ar: AwArchive, workspaceId: string): AwArchive {
        const index = ar.workspaces.findIndex(d => d.workspaceId === workspaceId);
        if (index > -1) {
            const o = JSON.parse(JSON.stringify(ar));
            o.workspaces.splice(index, 1);
            return o as AwArchive;
        } else {
            throw new Error('No workspace with the provided workspaceId is present');
        }
    }

    public static createDeviceEntity(ar: AwArchive, device: DeviceEntity): AwArchive {
        if (ar.devices.some(d => d.bundleId === device.bundleId)) {
            throw new Error('A device with the provided bundleId is already present');
        } else {
            const o = JSON.parse(JSON.stringify(ar));
            o.devices.push(device);
            return o as AwArchive;
        }
    }

    public static updateDeviceEntity(ar: AwArchive, bundleId: string, updates: Partial<DeviceEntity>): AwArchive {
        const index = ar.devices.findIndex(d => d.bundleId === bundleId);
        if (index > -1) {
            const o = JSON.parse(JSON.stringify(ar));
            Object.keys(updates).forEach(k => {
                o.devices[index][k] = (updates as any)[k];    
            })
            return o as AwArchive;
        } else {
            throw new Error('No device with the provided bundleId is present');
        }
    }

    public static deleteDeviceEntity(ar: AwArchive, bundleId: string): AwArchive {
        const index = ar.devices.findIndex(d => d.bundleId === bundleId);
        if (index > -1) {
            const o = JSON.parse(JSON.stringify(ar));
            o.devices.splice(index, 1);
            return o as AwArchive;
        } else {
            throw new Error('No device with the provided bundleId is present');
        }
    }


    public static createSpecEntity(ar: AwArchive, spec: ComputerSpecEntity): AwArchive {
        if (ar.specs.some(s => s.name === spec.name)) {
            throw new Error('A spec with the provided name is already present');
        } else {
            const o = JSON.parse(JSON.stringify(ar));
            o.specs.push(spec);
            return o as AwArchive;
        }
    }

    public static updateSpecEntity(ar: AwArchive, specName: string, updates: Partial<ComputerSpecEntity>): AwArchive {
        const index = ar.specs.findIndex(s => s.name === specName);
        if (index > -1) {
            const o = JSON.parse(JSON.stringify(ar));
            Object.keys(updates).forEach(k => {
                o.specs[index][k] = (updates as any)[k];    
            })
            return o as AwArchive;
        } else {
            throw new Error('No spec with the provided name is present');
        }
    }

    public static deleteSpecEntity(ar: AwArchive, specName: string): AwArchive {
        const index = ar.specs.findIndex(s => s.name === specName);
        if (index > -1) {
            const o = JSON.parse(JSON.stringify(ar));
            o.specs.splice(index, 1);
            return o as AwArchive;
        } else {
            throw new Error('No spec with the provided name is present');
        }
    }


    public static createStringEntity(ar: AwArchive, stringName: string, value: string, encoding: StringEncodingEntity): AwArchive {
        if (ar.strings.some(s => s.name === stringName)) {
            throw new Error('A string with the provided name is already present');
        } else {
            const o = JSON.parse(JSON.stringify(ar));
            o.strings.push({
                name: stringName,
                value: value,
                encoding: encoding
            });
            return o as AwArchive;
        }
    }

    public static updateStringEntity(ar: AwArchive, stringName: string, updates: Partial<StringEntity>): AwArchive {
        const index = ar.strings.findIndex(s => s.name === stringName);
        if (index > -1) {
            const o = JSON.parse(JSON.stringify(ar));
            Object.keys(updates).forEach(k => {
                o.strings[index][k] = (updates as any)[k];    
            })
            return o as AwArchive;
        } else {
            throw new Error('No string with the provided name is present');
        }
    }

    public static deleteStringEntity(ar: AwArchive, stringName: string): AwArchive {
        const index = ar.strings.findIndex(s => s.name === stringName);
        if (index > -1) {
            const o = JSON.parse(JSON.stringify(ar));
            o.strings.splice(index, 1);
            return o as AwArchive;
        } else {
            throw new Error('No string with the provided name is present');
        }
    }


    public static publish(ar: AwArchive, metadata: AwArchiveMetadata): AwArchive {
        return {
            workspaces: ar.workspaces,
            devices: ar.devices,
            specs: ar.specs,
            strings: ar.strings,
            metadata: metadata
        };
    }

    public static serialize(ar: AwArchive): string {
        return JSON.stringify(ar);
    }

    public static deserialize(src: string): AwArchive {
        return JSON.parse(src) as AwArchive;
    }
}