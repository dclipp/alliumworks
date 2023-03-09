export interface FileUploadModalInput {
    readonly title: string;
    readonly description: string;
    readonly acceptExtensions: Array<string> | ((uploadType: string) => Array<string>);
    readonly finishUpload: () => { readonly [key: string]: any };
    readonly processFiles: (fileData: Array<'error' | {
        readonly filename: string;
        readonly fileContent: string;
    }>) => {
        readonly canProceed: boolean,
        readonly inputFieldValue?: string
    };
    readonly inputFieldCaption?: string;
    readonly allowMultipleFiles?: boolean | ((uploadType: string) => boolean);
    readonly acceptArchiveFile?: boolean;
    readonly acceptSourceUpload?: boolean | { readonly tooltip: string };
    readonly uploadTypeNotes?: Array<{ readonly uploadType: string, readonly paragraphs: Array<string> }>;
}