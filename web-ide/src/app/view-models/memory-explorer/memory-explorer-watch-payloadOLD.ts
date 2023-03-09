import { QuadByte } from '@allium/types';

function hashOLD(o: Array<QuadByte> | QuadByte): string {
    if (Array.isArray(o)) {
        return `${o.length}:${o.map(v => `${v.LENGTH}${v.toString({ radix: 2, padZeroes: true })}`).reduce((x, y) => x + ';' + y, '')}`;
    } else {
        return `${o.LENGTH}${o.toString({ radix: 2, padZeroes: true })}`;
    }
}

function notifyOLD(subscriptions: Array<[string, (payload: MemoryExplorerWatchPayloadOLD) => void]>, payload: MemoryExplorerWatchPayloadOLD): void {
    window.setTimeout(() => {
        subscriptions.forEach(s => {
            s[1](payload);
        })
    });
}

export class MemoryExplorerWatchPayloadOLD {
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
                    notifyOLD(this._subscriptions, this);
                } else {
                    this._writes.push(address.clone());
                    notifyOLD(this._subscriptions, this);
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
                    notifyOLD(this._subscriptions, this);
                } else {
                    this._reads.push(address.clone());
                    notifyOLD(this._subscriptions, this);
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
                        notifyOLD(this._subscriptions, this);
                    }
                },
                remove: (address) => {
                    const index = this._emphasisReads.findIndex(a => a.isEqualTo(address));
                    if (index > -1) {
                        this._emphasisReads.splice(index, 1);
                        notifyOLD(this._subscriptions, this);
                    }
                },
                empty: () => {
                    while (this._emphasisReads.length > 0) {
                        this._emphasisReads.pop();
                    }
                    notifyOLD(this._subscriptions, this);
                }
            },
            writes: {
                includes: (address) => { return this._emphasisWrites.some(a => a.isEqualTo(address)) },
                insert: (address) => { 
                    if (!this._emphasisWrites.some(a => a.isEqualTo(address))) {
                        this._emphasisWrites.push(address.clone());
                        notifyOLD(this._subscriptions, this);
                    }
                },
                remove: (address) => {
                    const index = this._emphasisWrites.findIndex(a => a.isEqualTo(address));
                    if (index > -1) {
                        this._emphasisWrites.splice(index, 1);
                        notifyOLD(this._subscriptions, this);
                    }
                },
                empty: () => {
                    while (this._emphasisWrites.length > 0) {
                        this._emphasisWrites.pop();
                    }
                    notifyOLD(this._subscriptions, this);
                }
            }
        }
    }

    public merge(With: MemoryExplorerWatchPayloadOLD): void {
        if (hashOLD(this._writes) !== hashOLD(With._writes)) {
            for (let i = 0; i < Math.max(this._writes.length, With._writes.length); i++) {
                if (i < this._writes.length && i < With._writes.length) {
                    if (hashOLD(this._writes[i]) !== hashOLD(With._writes[i])) {
                        this._writes[i] = With._writes[i].clone();
                    }
                } else if (i < this._writes.length) { // Not in With --> Remove from this
                    this._writes.splice(i, 1);
                } else if (i < With._writes.length) { // Not in this --> Add to this
                    this._writes.push(With._writes[i].clone());
                }
            }
        }

        if (hashOLD(this._reads) !== hashOLD(With._reads)) {
            for (let i = 0; i < Math.max(this._reads.length, With._reads.length); i++) {
                if (i < this._reads.length && i < With._reads.length) {
                    if (hashOLD(this._reads[i]) !== hashOLD(With._reads[i])) {
                        this._reads[i] = With._reads[i].clone();
                    }
                } else if (i < this._reads.length) { // Not in With --> Remove from this
                    this._reads.splice(i, 1);
                } else if (i < With._reads.length) { // Not in this --> Add to this
                    this._reads.push(With._reads[i].clone());
                }
            }
        }

        if (hashOLD(this._emphasisWrites) !== hashOLD(With._emphasisWrites)) {
            for (let i = 0; i < Math.max(this._emphasisWrites.length, With._emphasisWrites.length); i++) {
                if (i < this._emphasisWrites.length && i < With._emphasisWrites.length) {
                    if (hashOLD(this._emphasisWrites[i]) !== hashOLD(With._emphasisWrites[i])) {
                        this._emphasisWrites[i] = With._emphasisWrites[i].clone();
                    }
                } else if (i < this._emphasisWrites.length) { // Not in With --> Remove from this
                    this._emphasisWrites.splice(i, 1);
                } else if (i < With._emphasisWrites.length) { // Not in this --> Add to this
                    this._emphasisWrites.push(With._emphasisWrites[i].clone());
                }
            }
        }

        if (hashOLD(this._emphasisReads) !== hashOLD(With._emphasisReads)) {
            for (let i = 0; i < Math.max(this._emphasisReads.length, With._emphasisReads.length); i++) {
                if (i < this._emphasisReads.length && i < With._emphasisReads.length) {
                    if (hashOLD(this._emphasisReads[i]) !== hashOLD(With._emphasisReads[i])) {
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

    public subscribe(cb: (payload: MemoryExplorerWatchPayloadOLD) => void): () => void {
        const handle = Math.random().toString().split('.')[1];
        this._subscriptions.push([handle, cb]);

        const unsubscribeFn = () => {
            const index = this._subscriptions.findIndex(s => s[0] === handle);
            if (index > -1) {
                this._subscriptions.splice(index, 1);
            }
        }
        return unsubscribeFn;
    }

    public constructor(copyFrom?: MemoryExplorerWatchPayloadOLD) {
        this._subscriptions = new Array<[string, (payload: MemoryExplorerWatchPayloadOLD) => void]>();
        this._writes = new Array<QuadByte>();
        this._reads = new Array<QuadByte>();
        this._emphasisWrites = new Array<QuadByte>();
        this._emphasisReads = new Array<QuadByte>();
        if (!!copyFrom) {
            copyFrom._writes.forEach(a => this._writes.push(a.clone()));
            copyFrom._reads.forEach(a => this._reads.push(a.clone()));
            copyFrom._emphasisWrites.forEach(a => this._emphasisWrites.push(a.clone()));
            copyFrom._emphasisReads.forEach(a => this._emphasisReads.push(a.clone()));
        }
    }

    private readonly _subscriptions: Array<[string, (payload: MemoryExplorerWatchPayloadOLD) => void]>;
    private readonly _writes: Array<QuadByte>;
    private readonly _reads: Array<QuadByte>;
    private readonly _emphasisWrites: Array<QuadByte>;
    private readonly _emphasisReads: Array<QuadByte>;
}
