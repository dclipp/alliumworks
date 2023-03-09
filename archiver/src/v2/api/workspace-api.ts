import { ArchivedEntity } from '../models/archived-entity';
import { ArchivedFile } from '../models/archived-file';
import { ArchivedWorkspace } from '../models/archived-workspace';
import { Utils } from '../utils';

export interface WorkspaceApi {
    hasPendingInput(): boolean;
    beginArchiveInput(creator: string, producer: string, workspaceId: string, workspaceTitle: string): void;
    appendImportSequence(item: string): void;
    removeImportSequence(itemIndex: number): void;
    setImportSequence(items: Array<string>): void;
    addFile(file: ArchivedFile): void;
    removeFile(fileIndex: number): void;
    setFile(fileIndex: number, file: ArchivedFile): void;
    finishArchiveInput(): ArchivedEntity<ArchivedWorkspace>;
    cancelArchiveInput(): void;
    getWorkingValue(): ArchivedWorkspace;
    deserialize(serializedEntity: string): ArchivedWorkspace;
}

class _WorkspaceApi implements WorkspaceApi {
    public hasPendingInput(): boolean {
        return this._workingValue !== null;
    }

    public beginArchiveInput(creator: string, producer: string, workspaceId: string, workspaceTitle: string): void {
        this.assertDoesNotHaveWorkingValue();
        this._workingValue = {
            ws: {
                workspaceId: workspaceId,
                title: workspaceTitle,
                importSequence: new Array<string>(),
                files: new Array<ArchivedFile>()
            },
            creator: creator,
            producer: producer
        };
    }

    public appendImportSequence(item: string): void {
        this.assertHasWorkingValue();
        this._workingValue!.ws = {
            workspaceId: this._workingValue!.ws.workspaceId,
            title: this._workingValue!.ws.title,
            importSequence: this._workingValue!.ws.importSequence.concat(item),
            files: this._workingValue!.ws.files
        };
    }

    public removeImportSequence(itemIndex: number): void {
        this.assertHasWorkingValue();
        if (this._workingValue!.ws.importSequence.length > itemIndex) {
            const seq = this._workingValue!.ws.importSequence;
            seq.splice(itemIndex, 1);

            this._workingValue!.ws = {
                workspaceId: this._workingValue!.ws.workspaceId,
                title: this._workingValue!.ws.title,
                importSequence: seq,
                files: this._workingValue!.ws.files
            };
        } else {
            throw new Error('item index out of bounds');
        }
    }

    public setImportSequence(items: Array<string>): void {
        this.assertHasWorkingValue();
        this._workingValue!.ws = {
            workspaceId: this._workingValue!.ws.workspaceId,
            title: this._workingValue!.ws.title,
            importSequence: items,
            files: this._workingValue!.ws.files
        };
    }

    public addFile(file: ArchivedFile): void {
        this.assertHasWorkingValue();
        if (Utils.findIndexOfArchivedFile(this._workingValue!.ws.files, file) > -1) {
            throw new Error('file already exists in the workspace');
        } else {
            this._workingValue!.ws = {
                workspaceId: this._workingValue!.ws.workspaceId,
                title: this._workingValue!.ws.title,
                importSequence: this._workingValue!.ws.importSequence,
                files: this._workingValue!.ws.files.concat(file)
            };
        }
    }

    public removeFile(fileIndex: number): void {
        this.assertHasWorkingValue();
        if (this._workingValue!.ws.files.length > fileIndex) {
            const files = this._workingValue!.ws.files;
            files.splice(fileIndex, 1);
            this._workingValue!.ws = {
                workspaceId: this._workingValue!.ws.workspaceId,
                title: this._workingValue!.ws.title,
                importSequence: this._workingValue!.ws.importSequence,
                files: files
            };
        } else {
            throw new Error('file index out of bounds');
        }
    }

    public setFile(fileIndex: number, file: ArchivedFile): void {
        this.assertHasWorkingValue();
        const existingIndex = Utils.findIndexOfArchivedFile(this._workingValue!.ws.files, file);
        if (existingIndex > -1 && existingIndex !== fileIndex) {
            throw new Error('file already exists in the workspace');
        } else if (this._workingValue!.ws.files.length <= fileIndex) {
            throw new Error('file index out of bounds');
        } else {
            const files = this._workingValue!.ws.files;
            files[fileIndex] = file;
            this._workingValue!.ws = {
                workspaceId: this._workingValue!.ws.workspaceId,
                title: this._workingValue!.ws.title,
                importSequence: this._workingValue!.ws.importSequence,
                files: files
            };
        }
    }

    public finishArchiveInput(): ArchivedEntity<ArchivedWorkspace> {
        this.assertHasWorkingValue();
        const archive = {
            schemaVersion: _WorkspaceApi._SCHEMA_VERSION,
            creator: this._workingValue!.creator,
            producer: this._workingValue!.producer,
            timestamp: Date.now(),
            payloadType: _WorkspaceApi._WS_PAYLOAD_TYPE,
            payload: this._workingValue!.ws
        };
        this._workingValue = null;
        return archive;
    }

    public cancelArchiveInput(): void {
        this.assertHasWorkingValue();
        this._workingValue = null;
    }

    public getWorkingValue(): ArchivedWorkspace {
        this.assertHasWorkingValue();
        return JSON.parse(JSON.stringify(this._workingValue!.ws));
    }

    public deserialize(serializedEntity: string): ArchivedWorkspace {
        const entity = Utils.deserializeEntity(serializedEntity);
        if (entity.payloadType === _WorkspaceApi._WS_PAYLOAD_TYPE) {
            const p: Partial<ArchivedWorkspace> | undefined = entity.payload;
            if (!!p) {
                let workspaceId = '';
                let title = '';
                const importSequence = new Array<string>();
                const files = new Array<ArchivedFile>();

                if (!!p.workspaceId) {
                    workspaceId = p.workspaceId;
                } else {
                    throw new Error('invalid workspace id');
                }

                if (!!p.title) {
                    title = p.title;
                } else {
                    throw new Error('invalid workspace title');
                }

                if (!!p.importSequence) {
                    if (Array.isArray(p.importSequence)) {
                        p.importSequence.forEach((s, si) => {
                            if (typeof s === 'string') {
                                importSequence.push(s);
                            } else {
                                throw new Error(`invalid workspace import sequence: item ${si} is not a string`);
                            }
                        });
                    } else {
                        throw new Error('invalid workspace import sequence: not an array');
                    }
                }

                if (!!p.files) {
                    if (Array.isArray(p.files)) {
                        p.files.forEach((f, fi) => {
                            if (Utils.isArchivedFile(f)) {
                                files.push(f);
                            } else {
                                throw new Error(`invalid workspace file: ${fi}`);
                            }
                        });
                    } else {
                        throw new Error('invalid workspace files list: not an array');
                    }
                }

                return {
                    workspaceId: workspaceId,
                    title: title,
                    importSequence: importSequence,
                    files: files
                };
            } else {
                throw new Error('missing payload');
            }
        } else {
            throw new Error('payload is not an archived workspace');
        }
    }

    private assertHasWorkingValue(): void {
        if (this._workingValue === null) {
            throw new Error('no pending input');
        }
    }

    private assertDoesNotHaveWorkingValue(): void {
        if (this._workingValue !== null) {
            throw new Error('already has pending input');
        }
    }

    private _workingValue: {
        ws: ArchivedWorkspace;
        readonly creator: string;
        readonly producer: string;
    } | null;

    private static readonly _SCHEMA_VERSION = 1;
    private static readonly _WS_PAYLOAD_TYPE = 'ws';

    public constructor() {
        this._workingValue = null;
    }
}

export function initWorkspaceApi(): WorkspaceApi {
    return new _WorkspaceApi();
}