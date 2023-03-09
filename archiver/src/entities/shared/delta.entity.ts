import { DeltaTypeEntity } from './delta-type.entity';

export interface DeltaEntity {
    readonly oldPath?: string;
    readonly newPath?: string;
    readonly type?: DeltaTypeEntity;
    readonly timestamp?: number;
    readonly detail?: string;
    readonly meta?: string;
}