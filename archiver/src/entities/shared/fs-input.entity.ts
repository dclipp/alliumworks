import { DeltaEntity } from './delta.entity';

export type FsInputEntity = {
    readonly name?: string;
    readonly containerPath?: string;
    readonly isDirectory?: true;
    readonly isDeleted?: boolean;
    readonly delta?: DeltaEntity;
    readonly isLoaded?: boolean;
    readonly isSymlink?: false;
} | {
    readonly name?: string;
    readonly containerPath?: string;
    readonly isDirectory?: true;
    readonly isDeleted?: boolean;
    readonly delta?: DeltaEntity;
    readonly isLoaded?: boolean;
    readonly isSymlink?: true;
    readonly targetPath?: string;
} | {
    readonly containerPath?: string;
    readonly isDirectory?: false;
    readonly isDeleted?: boolean;
    readonly delta?: DeltaEntity;
    readonly title?: string;
    readonly extension?: string;
    readonly content?: string;
}