import { SourceEntityKind, LanguageConstructKind } from '@allium/asm';

export interface CodeEditorToken {
    // text: string;
    // kind: string;
    // id: string;
    // underline: 'error' | 'warning' | 'none ';
    // viewIdentifier: string;
    hasFailures: boolean;
    // startPosition: number;
    // endPosition: number;

    text: string;
    kind: SourceEntityKind | LanguageConstructKind;
    left: number;
    top: number;
    start: number;
    end: number;
    underline: 'error' | 'warning' | 'none';
    entityId: string;
    lineIndex: number;
    persistentIdentifier: string;
}