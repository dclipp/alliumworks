import { ModalOutput } from './modal-output';

export interface FileUploadModalOutput extends ModalOutput {
    readonly files?: Array<{ readonly filename: string; readonly fileContent: string; }> | 'error';
    readonly textFormValue?: string;
    readonly fromArchive?: boolean;
    readonly uploadType?: string;
}