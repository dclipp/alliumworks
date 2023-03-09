import { WorkspaceFilesystemParser } from './workspace-filesystem-parser';

export interface WorkspaceFilesystemModel {
    readonly directories: Array<{
        readonly id: string;
        readonly name: string;
        readonly parent?: string;
        readonly path: string;
    }>;
    readonly files: Array<{
        readonly id: string;
        readonly name: string;
        readonly normalizedExtension: string;
        readonly fullName: string;
        readonly containingDirectory?: string;
        readonly content: string;
        readonly path: string;
    }>;
}

export function updateFilesystemModel(model: WorkspaceFilesystemModel, change: {
    readonly type: 'file' | 'directory';
    readonly id: string;
    readonly mutation: 'modify-content' | 'rename' | 'move' | 'delete';
    readonly param?: string;
}): WorkspaceFilesystemModel {
    if (change.type === 'file') {
        if (change.mutation === 'modify-content') {
            return {
                directories: model.directories,
                files: model.files.map(f => {
                    if (f.id === change.id) {
                        return {
                            id: f.id,
                            name: f.name,
                            normalizedExtension: f.normalizedExtension,
                            fullName: f.fullName,
                            containingDirectory: f.containingDirectory,
                            content: change.param || '',
                            path: f.path
                        }
                    } else {
                        return f;
                    }
                })
            }
        } else if (change.mutation === 'rename') {
            return {
                directories: model.directories,
                files: model.files.map(f => {
                    if (f.id === change.id) {
                        const nameIndex = f.path.lastIndexOf(f.fullName);
                        const filename = WorkspaceFilesystemParser.parseFilename(change.param);
                        return {
                            id: f.id,
                            name: filename.name,
                            normalizedExtension: filename.extension,
                            fullName: change.param,
                            containingDirectory: f.containingDirectory,
                            content: f.content,
                            path: f.path.substring(0, nameIndex) + change.param
                        }
                    } else {
                        return f;
                    }
                })
            }
        } else if (change.mutation === 'move') {
//TODO
        } else if (change.mutation === 'delete') {
            return {
                directories: model.directories,
                files: model.files.filter(f => f.id !== change.param)
            }
        }   
    } else {
//TODO
    }
}