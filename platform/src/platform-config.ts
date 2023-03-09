import { YfsConfig } from 'yfs';

export interface PlatformConfig {
    readonly ioCapacity?: number;
    readonly yfs?: YfsConfig;
};