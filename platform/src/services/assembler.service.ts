import { Assembly, AssemblySettings, ExtendedAsmMessage, FileMap, SourceLine } from '@allium/asm';
import { Observable } from 'rxjs';

export interface AssemblerService {
    // sources(): Observable<Array<{
    //     readonly filePath: string;
    //     readonly model: ObjectSource;
    // }>>;
    sourceObjects(): Observable<Array<{
        readonly filePath: string;
        readonly referenceName?: string;
        readonly rawContent: string;
        readonly lines: Array<SourceLine>;
        readonly isIncludedInAssembly: boolean;
    }>>;

    settings(): Observable<AssemblySettings | null>;
    assembly(): Observable<Assembly | null>;
    fileMap(): Observable<FileMap | null>;
    blocks(): Observable<Array<{
        readonly name: string;
        readonly filePath: string;
        readonly isIncluded: boolean;
    }>>;
    activeInstruction(): Observable<{
        readonly objectName: string;
        readonly lineIndex: number;
    } | null>;
    assemblerMessages(): Observable<Array<ExtendedAsmMessage>>;

    updateSettings(updatedSettings: AssemblySettings): Promise<void>;
    updateSourceFile(filePath: string, updatedFileContent: string): Promise<void>;

    buildPreview(objectName: string, fileContent: string): Promise<Assembly | null>;
}