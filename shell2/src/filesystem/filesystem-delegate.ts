import { FileType } from './file-type';

export interface FilesystemDelegate {
    emitFile(type: FileType, format: string, content: string): void;
    requestFile(type: FileType, acceptFormats: Array<string>, promptMessage: string, onReceived: (content: string) => void, onDeclined?: () => void): void;
}