import { FsInputEntity } from '../shared/fs-input.entity'

export interface WorkspaceEntity {
    readonly workspaceId?: string;
    readonly title?: string;
    readonly resources?: Array<FsInputEntity>;
}