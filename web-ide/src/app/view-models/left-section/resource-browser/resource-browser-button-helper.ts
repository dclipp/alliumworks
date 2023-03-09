import { ButtonSets, ButtonKeys } from '../button-bar/button-sets';

export class ResourceBrowserButtonHelper {
    public check(): void {
        const hasBackendOp = this._getHasBackendOp();
        const selectedIds = this._getSelectedIds();
        const disabledButtonKeys = ButtonSets.ResourcesList.defaultDisabledButtons;
        if (hasBackendOp) { // disable all
            ButtonSets.ResourcesList.buttons.map(btn => btn.key).forEach(btnKey => this.addKey(btnKey, disabledButtonKeys));
        } else if (this.isAssemblySettingsFileSelected(selectedIds)) { // disable delete and rename
            this.addKey(ButtonKeys.DeleteSelected, disabledButtonKeys);
            this.addKey(ButtonKeys.RenameSelected, disabledButtonKeys);
        } else {
            this.removeKey(ButtonKeys.DeleteSelected, disabledButtonKeys);
            this.removeKey(ButtonKeys.RenameSelected, disabledButtonKeys);
            ButtonSets.ResourcesList.buttons.map(btn => btn.key).forEach(btnKey => this.removeKey(btnKey, disabledButtonKeys));
            // let defaultDisabledButtons = ButtonSets.ResourcesList.defaultDisabledButtons;
            // if (!!this._newResourceViewModel) {
            //   defaultDisabledButtons = defaultDisabledButtons.concat(ButtonSets.ResourcesList.buttons.map(btn => btn.key));
            //   this._allButtonsDisabled = true;
            // } else {
            //   this._allButtonsDisabled = false;
            // }
            // this.view.disabledButtonKeys = defaultDisabledButtons;
        }

        const diff = this.diffDisabledKeys(disabledButtonKeys);
        if (diff.length > 0) {
            const indexesToRemove = diff.filter(d => d.index !== 'add').map(d => d.index as number);
            for (let i = indexesToRemove.length - 1; i >= 0; i--) {
                this._disabledButtonKeys.splice(indexesToRemove[i], 1);
            }
            diff.filter(d => d.index === 'add').forEach(d => {
                this._disabledButtonKeys.push(d.value);
            })
            this._pushDisabledButtonKeys(this._disabledButtonKeys);
        }
    }

    public settingsFileIdChanged(settingsFileId: string): void {
        this._assemblySettingsFileId = settingsFileId;
    }

    private isAssemblySettingsFileSelected(selectedIds: Array<string>): boolean {
        return selectedIds.includes(this._assemblySettingsFileId);
    }

    private diffDisabledKeys(disabledButtons: Array<string>): Array<{ index: number | 'add', value?: string }> {
        const diff = new Array<{ index: number | 'add', value?: string }>();
        disabledButtons.forEach(key => {
            if (!this._disabledButtonKeys.includes(key)) {
                diff.push({ index: 'add', value: key });
            }
        })
        this._disabledButtonKeys.forEach((key, index) => {
            if (!disabledButtons.includes(key)) {
                diff.push({ index: index });
            }
        })
        return diff;
    }

    private addKey(key: string, list: Array<string>): void {
        if (!list.includes(key)) {
            list.push(key);
        }
    }

    private removeKey(key: string, list: Array<string>): void {
        const index = list.indexOf(key);
        if (index > -1) {
            list.splice(index, 1);
        }
    }

    private _assemblySettingsFileId = '?';
    private readonly _disabledButtonKeys = new Array<string>();
    private readonly _getHasBackendOp: () => boolean;
    private readonly _getSelectedIds: () => Array<string>;
    private readonly _pushDisabledButtonKeys: (keys: Array<string>) => void;

    public constructor(pushDisabledButtonKeys: (keys: Array<string>) => void, getSelectedIds: () => Array<string>, getHasBackendOp: () => boolean) {
        this._pushDisabledButtonKeys = pushDisabledButtonKeys;
        this._getSelectedIds = getSelectedIds;
        this._getHasBackendOp = getHasBackendOp;
    }
}