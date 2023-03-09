import { AssemblySourceImport } from '@allium/asm';

export class SourceImportModel implements AssemblySourceImport {
    public get isModified(): boolean {
        return this._isModified;
    }

    public get isDeleted(): boolean {
        return this._isDeleted;
    }

    public get isRenamed(): boolean {
        return this._isRenamed;
    }

    public get autoRenameReferences(): boolean {
        return this._autoRenameReferences;
    }

    // public get isDuplicateFileReference(): boolean {
    //     return this._isDuplicateFileReference;
    // }

    public get referenceName(): string {
        return this._referenceName;
    }

    public get filePath(): string {
        return this._filePath;
    }

    public get isPendingNew(): boolean {
        return this._status === 'new-pending';
    }

    public get isCommittedNew(): boolean {
        return this._status === 'new-committed';
    }

    public get errors(): Array<string> {
        const messages = new Array<string>();

        if (!(!!this.filePath)) {
            messages.push('File path is required');
        }

        if (!(!!this.referenceName)) {
            messages.push('Reference name is required');
        } else if (!RegExp(/^[_a-zA-Z][_a-zA-Z0-9]{0,}$/).test(this.referenceName)) {
            messages.push('Reference name contains invalid character(s)');
        }

        return messages;
    }

    public get invalid(): boolean {
        return this.errors.length > 0;
    }

    public readonly uniqueKey: string;

    public rename(newName: string): void {
        this._isModified = true;
        if (!this._isRenamed) {
            this._autoRenameReferences = true;
        }
        this._isRenamed = true;
        this._referenceName = newName;
        this._notifyMap();
    }

    public changePath(newPath: string): void {
        this._isModified = true;
        this._filePath = newPath;
        this._notifyMap();
        // this._isDuplicateFileReference = TODO
    }

    public delete(): void {
        this._isModified = true;
        this._isDeleted = true;
        this._autoRenameReferences = false;
        this._notifyMap();
    }

    public undoChanges(): void {
        this._isModified = false;
        this._isDeleted = false;
        this._isRenamed = false;
        this._autoRenameReferences = false;
        // this._isDuplicateFileReference = false;
        this._referenceName = this._original.referenceName;
        this._filePath = this._original.filePath;
        this._notifyMap();
    }

    public toggleAutoRenameRefs(): void {
        if (!this.isDeleted && this.isRenamed) {
            this._autoRenameReferences = !this._autoRenameReferences;
            this._notifyMap();
        }
    }

    public commitNew(): void {
        if (this.isPendingNew) {
            if (this.errors.length === 0) {
                this._status = 'new-committed';
            } else {
                this._isModified = true;
            }
        }
    }

    public constructor(sourceImport: AssemblySourceImport, notifyMap: () => void, isNew?: boolean) {
        this._original = {
            referenceName: sourceImport.referenceName,
            filePath: sourceImport.filePath
        }
        this._notifyMap = notifyMap;
        this._referenceName = this._original.referenceName;
        this._filePath = this._original.filePath;
        this.uniqueKey = `${Date.now()}${Math.random().toString().substring(3)}`;
        this._status = isNew === true ? 'new-pending' : 'existing';
    }

    private _status: 'existing' | 'new-pending' | 'new-committed' = 'existing';
    private _isModified = false;
    private _isDeleted = false;
    private _isRenamed = false;
    private _autoRenameReferences = false;
    // private _isDuplicateFileReference = false;
    private _referenceName = '';
    private _filePath = '';
    private readonly _notifyMap: () => void;
    private readonly _original: AssemblySourceImport;
}