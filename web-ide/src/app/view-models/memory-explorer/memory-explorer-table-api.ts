import { QuadByte } from '@allium/types';

export interface MemoryExplorerTableApi {
    readonly api: {
        emphasizeRead(address: QuadByte): void;
        emphasizeWrite(address: QuadByte): void;
        clearReadEmphasis(address: QuadByte | 'all'): void;
        clearWriteEmphasis(address: QuadByte | 'all'): void;
    }
}