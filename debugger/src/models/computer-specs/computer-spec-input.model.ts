export interface ComputerSpecInput {
    readonly name: string;
    readonly computerMemorySize: number;
    readonly computerCpuSpeed: number;
    readonly cpuModelId: number;
    readonly cpuFeatureFlags1: number;
    readonly cpuFeatureFlags2: number;
    readonly cpuSerialNumber: string;
    readonly cpuBatchMarket: number;
    readonly cpuISA: number;

    readonly oversizedInlineValueSizing: string;
    readonly treatOversizedInlineValuesAsWarnings: boolean;

    readonly isDefault: boolean;
}