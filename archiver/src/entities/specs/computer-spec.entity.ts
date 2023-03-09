export interface ComputerSpecEntity {
    readonly name: string;
    readonly computerMemorySize: number;
    readonly computerCpuSpeed: number;
    readonly cpuModelId: number;
    readonly cpuFeatureFlags1: number;
    readonly cpuFeatureFlags2: number;
    readonly cpuSerialNumber: string;
    readonly cpuBatchMarket: number;
    readonly cpuInstructionSetArchitecture: number;
    readonly oversizedInlineValueSizing: string;
    readonly treatOversizedInlineValuesAsWarnings: boolean;
    readonly isDefault: boolean;
    readonly key: string;
}