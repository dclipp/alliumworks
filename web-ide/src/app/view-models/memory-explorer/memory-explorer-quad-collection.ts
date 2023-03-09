import { QuadByte, ByteSequenceCreator } from '@allium/types';

export class MemoryExplorerQuadCollection {
    public includes(address: QuadByte): boolean {
        return this._data.some(d => d.isEqualTo(address));
    }

    public hash(): string {
        if (this._data.length === 0) {
            return '';
        } else {
            return this._data
                .map((d, i) => `${i}.${ByteSequenceCreator.Unbox(d)}`)
                .reduce((x, y) => !!x ? `${x}_${y}` : y, '');
        }
    }

    public constructor(data?: Array<QuadByte>) {
        if (!!data) {
            data.forEach(d => this._data.push(d.clone()));
        }
    }

    private readonly _data = new Array<QuadByte>();
}