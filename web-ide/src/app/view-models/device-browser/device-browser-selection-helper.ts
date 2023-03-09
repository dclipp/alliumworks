import { DeviceBrowserSectionType } from './device-browser-section-type';

export class DeviceBrowserSelectionHelper {
    public rowClicked(sectionType: DeviceBrowserSectionType, id: string): void {
        const indexOfType = this._selectionsByType.findIndex(x => x.type === sectionType && x.selectedIds.includes(id));
        if (indexOfType > -1) { // Device is already selected under the same section --> deselect
            this._selectionsByType[indexOfType].selectedIds = this._selectionsByType[indexOfType].selectedIds.filter(x => x !== id);
            this._selectedId = '';
            this._selectionsByType = this._selectionsByType.map(x => {
                return {
                    type: x.type,
                    selectedIds: []
                }
            })
            this._onSectionTypeChanged('none');
            this._onSelectionChanged('');
        } else {
            const indexOfSelectedType = this._selectionsByType.findIndex(x => x.selectedIds.includes(id));
            if (indexOfType > -1) { // Device is selected under a different section --> change the section type only
                this._selectionsByType[indexOfSelectedType].selectedIds = this._selectionsByType[indexOfSelectedType].selectedIds.filter(x => x !== id);
                this.select(sectionType, id);
                this._onSectionTypeChanged(sectionType);
            } else { // Device is not selected anywhere --> select it
                this.select(sectionType, id);
                this._onSectionTypeChanged(sectionType);
                this._onSelectionChanged(id);
            }
        }
    }

    public clearSilently(): void {
        this._selectedId = '';
        this._selectionsByType = this._selectionsByType.map(x => {
            return {
                type: x.type,
                selectedIds: []
            }
        })
    }

    public get selectedId(): string {
        return this._selectedId;
    }

    public constructor(onSelectionChanged: (id: string) => void, onSectionTypeChanged: (type: DeviceBrowserSectionType | 'none') => void) {
        this._onSelectionChanged = onSelectionChanged;
        this._onSectionTypeChanged = onSectionTypeChanged;
    }

    private select(type: DeviceBrowserSectionType, id: string): void {
        this._selectionsByType = this._selectionsByType.map(x => {
            return {
                type: x.type,
                selectedIds: x.type === type ? [id] : []
            }
        })
        this._selectedId = id;
    }

    private _selectedId = '';
    private _selectionsByType: Array<{ type: DeviceBrowserSectionType, selectedIds: Array<string> }> = [{
        type: 'favorites',
        selectedIds: []
    }, {
        type: 'category',
        selectedIds: []
    }];
    private readonly _onSelectionChanged: (id: string) => void;
    private readonly _onSectionTypeChanged: (type: DeviceBrowserSectionType | 'none') => void;
}