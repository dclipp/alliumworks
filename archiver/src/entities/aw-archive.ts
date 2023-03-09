import { AwArchiveMetadata } from './aw-archive-metadata';
import { DeviceEntity } from './devices/device.entity';
import { ComputerSpecEntity } from './specs/computer-spec.entity';
import { StringEntity } from './strings/string.entity';
import { WorkspaceEntity } from './workspaces/workspace.entity';

export interface AwArchive {
    readonly workspaces: Array<WorkspaceEntity>;
    readonly devices: Array<DeviceEntity>;
    // readonly assemblies: Array<>;
    readonly specs: Array<ComputerSpecEntity>;
    readonly strings: Array<StringEntity>;
    // readonly other: Array<>;

    readonly metadata: AwArchiveMetadata;
}