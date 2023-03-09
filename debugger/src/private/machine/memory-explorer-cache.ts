import { QuadByte, Byte } from '@allium/types';

export class MemoryExplorerCache {
    public readFromOffset(offset: QuadByte, takeCount: number): Promise<Array<Byte>> {
        return new Promise((resolve) => {
            const tasks = new Array<Promise<Byte>>();
            for (let i = 0; i < takeCount; i++) {
                const address = offset.computeSum(i);
                tasks.push(this.iterateReadFromOffset(address));
            }
            Promise.all(tasks).then(bytes => {
                resolve(bytes);
            })
        })
    }

    public invalidate(addresses: Array<QuadByte>): void {
        addresses.forEach(a => {
            const indexInCache = this.findIndexInCache(a);
            if (indexInCache > -1) {
                this._cachedValues.splice(indexInCache, 1);
            }
        })
    }

    public invalidateAll(): void {
        while (this._cachedValues.length > 0) {
            this._cachedValues.pop();
        }
    }

    public readValueAtAddress(address: QuadByte): Promise<Byte> {
        return new Promise((resolve) => {
            const indexInCache = this.findIndexInCache(address);
            if (indexInCache > -1) {
                resolve(this._cachedValues[indexInCache].value);
            } else {
                this._getMemoryValueFromSession(address).then(b => {
                    if (this._cachedValues.length < this._MAX_CACHE_SIZE) {
                        this._cachedValues.push({
                            address: address.clone(),
                            value: b.clone()
                        });
                    }
                    resolve(b);
                })
            }
        })
    }

    // public refresh(): Promise<boolean> {
    //     return new Promise((resolve) => {
    //         try {
    //             if (this._cachedValues.length === 0) {
    //                 for (let i = 0; i < 5; i++) {
    //                     this._cachedValues.push({
    //                         address: ByteSequenceCreator.QuadByte(i),
    //                         value: ByteSequenceCreator.Byte(0)
    //                     })
    //                 }
    //             }

    //             const promises = this._cachedValues.map((cv, cvi) => new Promise<[number, Byte]>((resolveMem) => {
    //                 return this._getMemoryValueFromSession(cv.address).then(value => {
    //                     resolveMem([cvi, value]);
    //                 })
    //             }));
    //             Promise.all(promises).then((mem) => {
    //                 mem.forEach(m => {
    //                     this._cachedValues[m[0]].value = m[1];
    //                 })

    //                 resolve(true);
    //             })
    //         } catch (ex) {
    //             resolve(false);
    //         }
    //     })
    // }

    private findIndexInCache(address: QuadByte): number {
        return this._cachedValues.findIndex(cv => cv.address.isEqualTo(address));
    }

    private iterateReadFromOffset(address: QuadByte): Promise<Byte> {
        return new Promise((resolve) => {
            const indexInCache = this.findIndexInCache(address);
            if (indexInCache > -1) {
                resolve(this._cachedValues[indexInCache].value);
            } else {
                this._getMemoryValueFromSession(address).then(b => {
                    if (this._cachedValues.length < this._MAX_CACHE_SIZE) {
                        this._cachedValues.push({
                            address: address.clone(),
                            value: b.clone()
                        });
                    }
                    resolve(b);
                })
            }
        })
    }

    public constructor(getMemoryValueFromSession: (address: QuadByte) => Promise<Byte>) {
        this._getMemoryValueFromSession = getMemoryValueFromSession;
    }

    private _getMemoryValueFromSession: (address: QuadByte) => Promise<Byte>;
    private readonly _cachedValues = new Array<{ address: QuadByte, value: Byte }>();
    private readonly _MAX_CACHE_SIZE = 4096;
}