import { MemoryExplorerQuadStore } from './memory-explorer-quad-store';
import { MemoryExplorerQuadCollection } from './memory-explorer-quad-collection';
import { QuadByte } from '@allium/types';

export class MemoryExplorerDataHelper {

    public toggleWriteWatch(address: QuadByte): void {
        if (this._writeWatches.addOrRemove(address) === 'removed') {
            this._writeIcons.remove(address);
            this._writeIconsStatic.remove(address);
        }

        this.emitQuadChanges();
    }

    public toggleReadWatch(address: QuadByte): void {
        if (this._readWatches.addOrRemove(address) === 'removed') {
            this._readIcons.remove(address);
            this._readIconsStatic.remove(address);
        }

        this.emitQuadChanges();
    }

    private emitQuadChanges(): void {
        const changes: {
            writeWatches?: MemoryExplorerQuadCollection,
            readWatches?: MemoryExplorerQuadCollection,
            editingAddresses?: MemoryExplorerQuadCollection,
            writeIcons?: MemoryExplorerQuadCollection,
            readIcons?: MemoryExplorerQuadCollection,
            writeIconsStatic?: MemoryExplorerQuadCollection,
            readIconsStatic?: MemoryExplorerQuadCollection
        } = {};
        
        let anyChanged = false;
        Object.keys(this._hash).forEach(k => {
            const quadStore = this[`_${k}`] as MemoryExplorerQuadStore;
            const calculatedHash = quadStore.collection.hash();
            if (this._hash[k] !== calculatedHash) {
                changes[k] = quadStore.collection;
                this._hash[k] = calculatedHash;
                anyChanged = true;
            }
        })

        if (anyChanged) {
            this._quadsChanged(changes);
        }
    }

    public constructor(quadsChanged: (changes: {
        writeWatches?: MemoryExplorerQuadCollection,
        readWatches?: MemoryExplorerQuadCollection,
        editingAddresses?: MemoryExplorerQuadCollection,
        writeIcons?: MemoryExplorerQuadCollection,
        readIcons?: MemoryExplorerQuadCollection,
        writeIconsStatic?: MemoryExplorerQuadCollection,
        readIconsStatic?: MemoryExplorerQuadCollection
    }) => void) {
        this._quadsChanged = quadsChanged;
    }
    
    private _hash: {
        writeWatches: string,
        readWatches: string,
        editingAddresses: string,
        writeIcons: string,
        readIcons: string,
        writeIconsStatic: string,
        readIconsStatic: string
    } = {
        writeWatches: '',
        readWatches: '',
        editingAddresses: '',
        writeIcons: '',
        readIcons: '',
        writeIconsStatic: '',
        readIconsStatic: ''
    };

    private readonly _quadsChanged: (changes: {
        writeWatches?: MemoryExplorerQuadCollection,
        readWatches?: MemoryExplorerQuadCollection,
        editingAddresses?: MemoryExplorerQuadCollection,
        writeIcons?: MemoryExplorerQuadCollection,
        readIcons?: MemoryExplorerQuadCollection,
        writeIconsStatic?: MemoryExplorerQuadCollection,
        readIconsStatic?: MemoryExplorerQuadCollection
    }) => void;

    private readonly _writeWatches = new MemoryExplorerQuadStore();
    private readonly _readWatches = new MemoryExplorerQuadStore();
    private readonly _editingAddresses = new MemoryExplorerQuadStore();
    private readonly _writeIcons = new MemoryExplorerQuadStore();
    private readonly _readIcons = new MemoryExplorerQuadStore();
    private readonly _writeIconsStatic = new MemoryExplorerQuadStore();
    private readonly _readIconsStatic = new MemoryExplorerQuadStore();
}