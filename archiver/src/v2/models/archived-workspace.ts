import { ArchivedFile } from './archived-file';

export interface ArchivedWorkspace {
    readonly workspaceId: string;
    readonly title: string;
    readonly importSequence: Array<string>;
    readonly files: Array<ArchivedFile>;
}