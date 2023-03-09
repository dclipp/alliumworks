import { QuadByte } from '@allium/types';

function hash(o: Array<QuadByte> | QuadByte): string {
    if (Array.isArray(o)) {
        return `${o.length}:${o.map(v => `${v.LENGTH}${v.toString({ radix: 2, padZeroes: true })}`).reduce((x, y) => x + ';' + y, '')}`;
    } else {
        return `${o.LENGTH}${o.toString({ radix: 2, padZeroes: true })}`;
    }
}

export interface MemoryExplorerModel {
    readonly writes: {
        readonly valueOf: () => ReadonlyArray<QuadByte>;
        readonly includes: (address: QuadByte) => boolean;
        readonly toggle: (address: QuadByte) => void;
    };

    readonly reads: {
        readonly valueOf: () => ReadonlyArray<QuadByte>;
        readonly includes: (address: QuadByte) => boolean;
        readonly toggle: (address: QuadByte) => void;
    };

    readonly bookmarks: {
        readonly valueOf: () => ReadonlyArray<QuadByte>;
        readonly includes: (address: QuadByte) => boolean;
        readonly toggle: (address: QuadByte) => void;
    };

    readonly emphasis: {
        readonly reads: {
            includes: (address: QuadByte) => boolean,
            insert: (address: QuadByte) => void,
            remove: (address: QuadByte) => void,
            empty: () => void
        },
        readonly writes: {
            includes: (address: QuadByte) => boolean,
            insert: (address: QuadByte) => void,
            remove: (address: QuadByte) => void,
            empty: () => void
        }
    }
}

class Model implements MemoryExplorerModel {
    public get writes(): {
        readonly valueOf: () => ReadonlyArray<QuadByte>;
        readonly includes: (address: QuadByte) => boolean;
        readonly toggle: (address: QuadByte) => void;
    } {
        return {
            valueOf: () => { return this._writes.map(a => a.clone()) },
            includes: (address) => { return this._writes.some(a => a.isEqualTo(address)) },
            toggle: (address) => {
                const index = this._writes.findIndex(a => a.isEqualTo(address));
                if (index > -1) {
                    this._writes.splice(index, 1);
                    this._pushModel();
                } else {
                    this._writes.push(address.clone());
                    this._pushModel();
                }
            }
        }
    }

    public get reads(): {
        readonly valueOf: () => ReadonlyArray<QuadByte>;
        readonly includes: (address: QuadByte) => boolean;
        readonly toggle: (address: QuadByte) => void;
    } {
        return {
            valueOf: () => { return this._reads.map(a => a.clone()) },
            includes: (address) => { return this._reads.some(a => a.isEqualTo(address)) },
            toggle: (address) => {
                const index = this._reads.findIndex(a => a.isEqualTo(address));
                if (index > -1) {
                    this._reads.splice(index, 1);
                    this._pushModel();
                } else {
                    this._reads.push(address.clone());
                    this._pushModel();
                }
            }
        }
    }

    public get bookmarks(): {
        readonly valueOf: () => ReadonlyArray<QuadByte>;
        readonly includes: (address: QuadByte) => boolean;
        readonly toggle: (address: QuadByte) => void;
    } {
        return {
            valueOf: () => { return this._bookmarks.map(a => a.clone()) },
            includes: (address) => { return this._bookmarks.some(a => a.isEqualTo(address)) },
            toggle: (address) => {
                const index = this._bookmarks.findIndex(a => a.isEqualTo(address));
                if (index > -1) {
                    this._bookmarks.splice(index, 1);
                    this._pushModel();
                } else {
                    this._bookmarks.push(address.clone());
                    this._pushModel();
                }
            }
        }
    }

    public get emphasis(): {
        readonly reads: {
            includes: (address: QuadByte) => boolean,
            insert: (address: QuadByte) => void,
            remove: (address: QuadByte) => void,
            empty: () => void
        },
        readonly writes: {
            includes: (address: QuadByte) => boolean,
            insert: (address: QuadByte) => void,
            remove: (address: QuadByte) => void,
            empty: () => void
        }
    } {
        return {
            reads: {
                includes: (address) => { return this._emphasisReads.some(a => a.isEqualTo(address)) },
                insert: (address) => { 
                    if (!this._emphasisReads.some(a => a.isEqualTo(address))) {
                        this._emphasisReads.push(address.clone());
                        this._pushModel();
                    }
                },
                remove: (address) => {
                    const index = this._emphasisReads.findIndex(a => a.isEqualTo(address));
                    if (index > -1) {
                        this._emphasisReads.splice(index, 1);
                        this._pushModel();
                    }
                },
                empty: () => {
                    while (this._emphasisReads.length > 0) {
                        this._emphasisReads.pop();
                    }
                    this._pushModel();
                }
            },
            writes: {
                includes: (address) => { return this._emphasisWrites.some(a => a.isEqualTo(address)) },
                insert: (address) => { 
                    if (!this._emphasisWrites.some(a => a.isEqualTo(address))) {
                        this._emphasisWrites.push(address.clone());
                        this._pushModel();
                    }
                },
                remove: (address) => {
                    const index = this._emphasisWrites.findIndex(a => a.isEqualTo(address));
                    if (index > -1) {
                        this._emphasisWrites.splice(index, 1);
                        this._pushModel();
                    }
                },
                empty: () => {
                    while (this._emphasisWrites.length > 0) {
                        this._emphasisWrites.pop();
                    }
                    this._pushModel();
                }
            }
        }
    }

    public merge(With: Model): void {
        if (hash(this._writes) !== hash(With._writes)) {
            for (let i = 0; i < Math.max(this._writes.length, With._writes.length); i++) {
                if (i < this._writes.length && i < With._writes.length) {
                    if (hash(this._writes[i]) !== hash(With._writes[i])) {
                        this._writes[i] = With._writes[i].clone();
                    }
                } else if (i < this._writes.length) { // Not in With --> Remove from this
                    this._writes.splice(i, 1);
                } else if (i < With._writes.length) { // Not in this --> Add to this
                    this._writes.push(With._writes[i].clone());
                }
            }
        }

        if (hash(this._reads) !== hash(With._reads)) {
            for (let i = 0; i < Math.max(this._reads.length, With._reads.length); i++) {
                if (i < this._reads.length && i < With._reads.length) {
                    if (hash(this._reads[i]) !== hash(With._reads[i])) {
                        this._reads[i] = With._reads[i].clone();
                    }
                } else if (i < this._reads.length) { // Not in With --> Remove from this
                    this._reads.splice(i, 1);
                } else if (i < With._reads.length) { // Not in this --> Add to this
                    this._reads.push(With._reads[i].clone());
                }
            }
        }

        if (hash(this._bookmarks) !== hash(With._bookmarks)) {
            for (let i = 0; i < Math.max(this._bookmarks.length, With._bookmarks.length); i++) {
                if (i < this._bookmarks.length && i < With._bookmarks.length) {
                    if (hash(this._bookmarks[i]) !== hash(With._bookmarks[i])) {
                        this._bookmarks[i] = With._bookmarks[i].clone();
                    }
                } else if (i < this._bookmarks.length) { // Not in With --> Remove from this
                    this._bookmarks.splice(i, 1);
                } else if (i < With._bookmarks.length) { // Not in this --> Add to this
                    this._bookmarks.push(With._bookmarks[i].clone());
                }
            }
        }

        if (hash(this._emphasisWrites) !== hash(With._emphasisWrites)) {
            for (let i = 0; i < Math.max(this._emphasisWrites.length, With._emphasisWrites.length); i++) {
                if (i < this._emphasisWrites.length && i < With._emphasisWrites.length) {
                    if (hash(this._emphasisWrites[i]) !== hash(With._emphasisWrites[i])) {
                        this._emphasisWrites[i] = With._emphasisWrites[i].clone();
                    }
                } else if (i < this._emphasisWrites.length) { // Not in With --> Remove from this
                    this._emphasisWrites.splice(i, 1);
                } else if (i < With._emphasisWrites.length) { // Not in this --> Add to this
                    this._emphasisWrites.push(With._emphasisWrites[i].clone());
                }
            }
        }

        if (hash(this._emphasisReads) !== hash(With._emphasisReads)) {
            for (let i = 0; i < Math.max(this._emphasisReads.length, With._emphasisReads.length); i++) {
                if (i < this._emphasisReads.length && i < With._emphasisReads.length) {
                    if (hash(this._emphasisReads[i]) !== hash(With._emphasisReads[i])) {
                        this._emphasisReads[i] = With._emphasisReads[i].clone();
                    }
                } else if (i < this._emphasisReads.length) { // Not in With --> Remove from this
                    this._emphasisReads.splice(i, 1);
                } else if (i < With._emphasisReads.length) { // Not in this --> Add to this
                    this._emphasisReads.push(With._emphasisReads[i].clone());
                }
            }
        }
    }

    public constructor(pushModel: (model: MemoryExplorerModel) => void) {
        this._pushModel = () => { pushModel(this); }
        this._writes = new Array<QuadByte>();
        this._reads = new Array<QuadByte>();
        this._bookmarks = new Array<QuadByte>();
        this._emphasisWrites = new Array<QuadByte>();
        this._emphasisReads = new Array<QuadByte>();
    }

    private readonly _pushModel: () => void;
    private readonly _writes: Array<QuadByte>;
    private readonly _reads: Array<QuadByte>;
    private readonly _bookmarks: Array<QuadByte>;
    private readonly _emphasisWrites: Array<QuadByte>;
    private readonly _emphasisReads: Array<QuadByte>;
}


export function createMemoryExplorerModel(pushModel: (model: MemoryExplorerModel) => void): MemoryExplorerModel {
    return new Model(pushModel);
}

export function emptyMemoryExplorerModel(): MemoryExplorerModel {
    return {
        writes: {
            valueOf: () => [],
            includes: (address: QuadByte) => false,
            toggle: (address: QuadByte) => { }
        },
        
        reads: {
            valueOf: () => [],
            includes: (address: QuadByte) => false,
            toggle: (address: QuadByte) => { }
        },
        
        bookmarks: {
            valueOf: () => [],
            includes: (address: QuadByte) => false,
            toggle: (address: QuadByte) => { }
        },

        emphasis: {
            reads: {
                includes: (address: QuadByte) => false,
                insert: (address: QuadByte) => { },
                remove: (address: QuadByte) => { },
                empty: () => { }
            },
            writes: {
                includes: (address: QuadByte) => false,
                insert: (address: QuadByte) => { },
                remove: (address: QuadByte) => { },
                empty: () => { }
            }
        }
    }
}