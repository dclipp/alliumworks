import { AssemblySourceImport } from '@allium/asm';
import { SourceImportModel } from './source-import-model';
import { ValidationErrors } from '@angular/forms';
import { TreeSelectMember } from '../tree-select/tree-select-member';

export class SourceMapModel {
    public get models(): Array<SourceImportModel> {
        return this._models;
    }

    public get dirty(): boolean {
        return this._models.some(m => m.isModified) || (this._hash !== this._initialHash);
    }

    public get errors(): null | ValidationErrors {
        const o = {};
        this._models.forEach(m => {
            const e = m.errors;
            if (e.length > 0) {
                e.forEach((err, idx) => {
                    o[`m${m.referenceName}_e${idx}`] = err;
                })
            }
        });
        return Object.keys(o).length > 0 ? o : null;
    }

    public get valid(): boolean {
        return this.models.every(m => !m.invalid);
    }

    public get fsMap(): Array<TreeSelectMember> {
        return this._fsMap;
    }

    public addNew(): void {
        this._models.push(new SourceImportModel({
            referenceName: '',
            filePath: ''
        }, () => { this.modelChanged() }, true))
    }

    public cancelNew(): void {
        const i = this._models.findIndex(m => m.isPendingNew);
        this._models.splice(i, 1);
    }

    public saveNew(): void {
        const i = this._models.findIndex(m => m.isPendingNew);
        this._models[i].commitNew();
    }

    public deleteNew(uniqueKey: string): void {
        const i = this._models.findIndex(m => m.uniqueKey === uniqueKey);
        if (i > -1) {
            this._models.splice(i, 1);
            this.modelChanged();
        }
    }

    public constructor(sourceImports?: Array<AssemblySourceImport>, onStatusChanged?: (isDirty: boolean) => void) {
        this._onStatusChanged = onStatusChanged || undefined;
        if (!!sourceImports) {
            let hash = '';
            sourceImports.forEach((si, i) => {
                this._models.push(new SourceImportModel(si, () => { this.modelChanged() }));
                hash += `${i}_${si.filePath}:${si.referenceName}`;
            });
            this._initialHash = btoa(hash);
            this._fsMap = this.buildFsMap(sourceImports);
        } else {
            this._initialHash = '';
            this._fsMap = new Array<TreeSelectMember>();
        }
        this._hash = this._initialHash;
    }

    private modelChanged(): void {
        this._hash = btoa(this._models
            .map((si, i) => `${i}_${si.filePath}:${si.referenceName}:${si.isDeleted}`)
            .reduce((x, y) => x + y, ''));
        if (!!this._onStatusChanged) {
            this._onStatusChanged(this.dirty);
        }
    }

    private buildFsMap(sourceImports: Array<AssemblySourceImport>): Array<TreeSelectMember> {
        type PathInfo = {
            pathname: string;
            fullpathWithoutName: string;
            id: number;
            isFolder: boolean;
        };
        const getCompletePath = (pi: PathInfo) => {
            return (pi.fullpathWithoutName === '/' ? '/' : (pi.fullpathWithoutName + '/')) + pi.pathname
        }
        const allPaths = new Array<PathInfo>();
        let nextId = 1;
        const pFns = sourceImports.map((si, index) => {
            return si.filePath.split('/').map((p, pi, pa) => {
                if (pi === 0) {
                    const fn: (existingPaths: Array<PathInfo>, insertPath: (pi: PathInfo) => void) => number = (existingPaths, insertPath) => {
                        if (!existingPaths.some(ep => ep.pathname === '/')) {
                            insertPath({
                                pathname: '/',
                                fullpathWithoutName: '',
                                id: nextId,
                                isFolder: true
                            });
                            nextId++;
                        }
                        return 0;
                    }
                    return fn;
                } else {
                    const workingPathRoot = pa.slice(0, pi).reduce((x, y) => !!x ? (x === '/' ? `/${y}` : `${x}/${y}`) : y, '/');
                    const fn: (existingPaths: Array<PathInfo>, insertPath: (pi: PathInfo) => void) => number = (existingPaths, insertPath) => {
                        const eIdx = existingPaths.findIndex(ep => workingPathRoot === '/' ? (ep.pathname === '/') : (getCompletePath(ep) === workingPathRoot));
                        if (eIdx > -1) {
                            const length = existingPaths.length;
                            const completePath = `${workingPathRoot}/${p}`;
                            if (!existingPaths.some(ep => `${ep.fullpathWithoutName}/${ep.pathname}` === completePath)) {
                                insertPath({
                                    pathname: p,
                                    fullpathWithoutName: `${workingPathRoot}`,
                                    id: nextId,
                                    isFolder: pi !== pa.length - 1
                                });
                                nextId++;
                                return length;
                            } else {
                                return -1;
                            }
                        } else {
                            throw new Error('ERROR');//TODO???
                        }
                    }
                    return fn;
                }
            })
        }).reduce((x, y) => x.concat(y), []);

        pFns.forEach(fn => fn(allPaths, (pi) => { allPaths.push(pi) }));
        const idSeed = Math.random().toString().substring(14);
        const aff = allPaths.filter(ap => ap.pathname !== '/').map((ap, api, apa) => {
            return {
                name: ap.pathname,
                isContainer: ap.isFolder,
                id: `${idSeed}${ap.id}`,
                parent: ap.fullpathWithoutName === '/' ? undefined : `${idSeed}${apa.find(x => getCompletePath(x) === ap.fullpathWithoutName).id}`
            }
        })
        return aff;
    }

    private _hash = '';
    private readonly _onStatusChanged: undefined | ((isDirty: boolean) => void);
    private readonly _initialHash: string;
    private readonly _fsMap: Array<TreeSelectMember>;
    private readonly _models = new Array<SourceImportModel>();
}