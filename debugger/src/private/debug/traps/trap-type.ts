export enum TrapType {
    InstructionBreak,
    FlagRaised,
    FlagAcknowledged,
    RegisterRead,
    RegisterWrite,
    MemoryRead,
    MemoryWrite
}

export const ALL_TRAP_TYPES = [
    TrapType.InstructionBreak,
    TrapType.FlagRaised,
    TrapType.FlagAcknowledged,
    TrapType.RegisterRead,
    TrapType.RegisterWrite,
    TrapType.MemoryRead,
    TrapType.MemoryWrite
];