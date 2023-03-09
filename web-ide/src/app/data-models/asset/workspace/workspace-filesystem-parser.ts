import { WorkspaceFilesystemModel } from './workspace-filesystem-model';
import { WorkspaceResourceModel } from './workspace-resource-model';
import { AssemblySourceImport } from '@allium/asm';

type ParsedFs = {
    directories: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
        readonly parent?: string;
    }>;
    files: ReadonlyArray<{
        readonly id: string;
        readonly fullName: string;
        readonly containingDirectory?: string;
    }>;
}

export class WorkspaceFilesystemParser {
    public static parse(parsedWorkspaceDef: any, allResources: Array<WorkspaceResourceModel>): WorkspaceFilesystemModel {
        const parsedFs = parsedWorkspaceDef.filesystem as ParsedFs;

        const filesystem: WorkspaceFilesystemModel = {
            directories: [],
            files: []
        };

        parsedFs.directories.forEach(d => {
            filesystem.directories.push({
                id: d.id,
                name: d.name,
                parent: d.parent,
                path: WorkspaceFilesystemParser.buildDirectoryPath(d.id, parsedFs)
            })
        })

        parsedFs.files.forEach(f => {
            const filename = WorkspaceFilesystemParser.parseFilename(f.fullName);
            const containingDirectory = !!f.containingDirectory && f.containingDirectory !== '/' ? WorkspaceFilesystemParser.buildDirectoryPath(f.containingDirectory, parsedFs) : undefined;
            const P = !!containingDirectory ? `${containingDirectory}/${f.fullName}` : `/${f.fullName}`;
            filesystem.files.push({
                id: f.id,
                name: filename.name,
                normalizedExtension: filename.extension,
                fullName: f.fullName,
                containingDirectory: containingDirectory,
                content: allResources.find(r => r.filesystemRefId === f.id).content,
                path: !!containingDirectory ? `${containingDirectory}/${f.fullName}` : `/${f.fullName}`,
            })
        })

        return filesystem;
    }

    private static buildDirectoryPath(id: string, parsedFs: ParsedFs): string {
        const resource = parsedFs.directories.find(d => d.id === id);
        if (!!resource) {
            const workingPath = resource.name;
            if (!!resource.parent) {
                const parentPath = WorkspaceFilesystemParser.buildDirectoryPath(resource.parent, parsedFs);
                return `${parentPath}/${workingPath}`;
            } else {
                return `/${workingPath}`;
            }
        } else {
            throw new Error(`Directory not found: ${id}`);
        }
    }

    public static parseFilename(fullName: string): { name: string, extension: string } {
        const indexOfDot = fullName.lastIndexOf('.');
        if (indexOfDot > -1) {
            if (indexOfDot === 0) {
                return { name: '', extension: fullName.substring(1).toLowerCase() }
            } else {
                return { name: fullName.substring(0, indexOfDot), extension: fullName.substring(indexOfDot + 1).toLowerCase() }
            }
        } else {
            return { name: fullName, extension: '' }
        }
    }

    public static autoGenerateReferenceName(filename: string, sourceImports: Array<AssemblySourceImport>): string {
        let filenameWithoutExtension = filename.replace(/\.aq/g, '');
        let refName = '';
        for (let i = 0; i < filenameWithoutExtension.length; i++) {
            const char = filenameWithoutExtension.charAt(i);
            if (i === 0 && /^[_a-zA-Z]$/.test(char)) {
                refName += char;
            } else if (i !== 0 && /^[_a-zA-Z0-9]$/.test(char)) {
                refName += char;
            } else {
                refName += '_';
            }
        }

        let appendNumber = 0;
        let workingName = refName;
        while (sourceImports.some(si => si.referenceName === workingName)) {
            if (appendNumber === 0) {
                appendNumber++;
                workingName = `${workingName}${appendNumber}`;
            } else {
                const nextNum = appendNumber + 1;
                workingName = workingName.substring(0, workingName.lastIndexOf(appendNumber.toString())) + nextNum.toString();
                appendNumber = nextNum;
            }
        }

        return refName;
    }
}