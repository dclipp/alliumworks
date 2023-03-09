export class FontSizeHelper {

    public changeFontSize(increase: boolean): void {
        const index = this._FONT_SIZE_MAP.findIndex(x => x === this._currentFontSize);
        let currentFontSize = this._currentFontSize;
        let canIncrease = this._canIncrease;
        let canDecrease = this._canDecrease;
        if (increase && this._canIncrease) {
            currentFontSize = this._FONT_SIZE_MAP[index + 1];
            canIncrease = index < this._FONT_SIZE_MAP.length - 2;
            canDecrease = true;
        } else if (!increase && this._canDecrease) {
            currentFontSize = this._FONT_SIZE_MAP[index - 1];
            canDecrease = index > 1;
            canIncrease = true;
        }

        if (canIncrease !== this._canIncrease) {
            this._canIncrease = canIncrease;
            this._changeIncreaseToolbarButtonState(canIncrease);
        }
        if (canDecrease !== this._canDecrease) {
            this._canDecrease = canDecrease;
            this._changeDecreaseToolbarButtonState(canDecrease);
        }
        if (currentFontSize !== this._currentFontSize) {
            this._currentFontSize = currentFontSize;
            this._changeViewFontSize(this._currentFontSize);
        }
    }

    public constructor(changeIncreaseToolbarButtonState: (enabled: boolean) => void, changeDecreaseToolbarButtonState: (enabled: boolean) => void,
        changeViewFontSize: (fontSize: number) => void) {
        this._changeIncreaseToolbarButtonState = changeIncreaseToolbarButtonState;
        this._changeDecreaseToolbarButtonState = changeDecreaseToolbarButtonState;
        this._changeViewFontSize = changeViewFontSize;
    }

    private _canIncrease = true;
    private _canDecrease = true;
    private _currentFontSize = FontSizeHelper.DEFAULT_SIZE;
    private readonly _changeIncreaseToolbarButtonState: (enabled: boolean) => void;
    private readonly _changeDecreaseToolbarButtonState: (enabled: boolean) => void;
    private readonly _changeViewFontSize: (fontSize: number) => void;
    private readonly _FONT_SIZE_MAP = [6, 8, 11, 13, 16, 18, 21, 24, 28, 32];

    public static readonly DEFAULT_SIZE = 13;
}