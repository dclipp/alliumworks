export class ResourceBrowserSelectionHelper {
    public itemClicked(resourcePath: string, shiftKey: boolean, isFolder: boolean): boolean {
        const index = this._selectedItems.findIndex(x => x === resourcePath);
        if (index > -1) { // de-select
            if (!isFolder) {
                this._selectedItems.splice(index, 1);
                this.emit();
            }
        } else {
            if (shiftKey) { // Add to selected items
                this._selectedItems.push(resourcePath);
                this.emit();
            } else { // De-select all and add single
                while (this._selectedItems.length > 0) {
                    this._selectedItems.pop();
                }
                this._selectedItems.push(resourcePath);
                this.emit();
            }
        }

        return index === -1;
    }

    public get SINGLE_SELECTED_PATH(): string {
        return this._selectedItems.length === 1 ? this._selectedItems[0] : null;
    }

    private emit(): void {
        this._selectionsChanged(this._selectedItems.map(s => s));
    }

    public constructor(selectionsChanged: (selectedItems: Array<string>) => void) {
        this._selectionsChanged = selectionsChanged;
    }

    private readonly _selectionsChanged: (selectedItems: Array<string>) => void;
    private readonly _selectedItems = new Array<string>();
}