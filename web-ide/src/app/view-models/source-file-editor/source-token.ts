import { SourceEntityKind } from '@allium/asm';

export interface SourceToken {
    readonly id: string;
    readonly text: string;
    readonly kind: SourceEntityKind;
    readonly groupAttr: string;
    readonly constructKindAttr: string;
}