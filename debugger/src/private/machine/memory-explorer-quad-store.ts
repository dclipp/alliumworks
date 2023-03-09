import { QuadByte } from '@allium/types';
import { MemoryExplorerQuadCollection } from './memory-explorer-quad-collection';

export class MemoryExplorerQuadStore {
    public includes(address: QuadByte): boolean {
        return this._data.some(d => d.isEqualTo(address));
    }

    public add(address: QuadByte): void {
        const index = this.getIndex(address);
        if (index < 0) {
            this._data.push(address.clone());
        }
    }

    public remove(address: QuadByte): void {
        const index = this.getIndex(address);
        if (index > -1) {
            this._data.splice(index, 1);
        }
    }

    public addOrRemove(address: QuadByte): 'added' | 'removed' {
        const index = this.getIndex(address);
        if (index > -1) {
            this._data.splice(index, 1);
            return 'removed';
        } else {
            this._data.push(address.clone());
            return 'added';
        }
    }

    public get collection(): MemoryExplorerQuadCollection {
        return new MemoryExplorerQuadCollection(this._data);
    }

    private getIndex(address: QuadByte): number {
        return this._data.findIndex(d => d.isEqualTo(address));
    }

    private readonly _data = new Array<QuadByte>();
}