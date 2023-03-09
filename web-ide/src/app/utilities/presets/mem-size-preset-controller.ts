import { Observable, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, take, skip, filter, skipUntil } from 'rxjs/operators';

type Scale = 'bytes' | 'kilobytes' | 'megabytes';

export class MemSizePresetController {
    // public startSlider(): void {
    //     console.log('startSlider')
    // }
    
    public finishSlider(scale: Scale, event: any): void {
        console.log('finishSlider');
        this.updateData(scale, Number(event.target.value));
    
        this.updateInput('bytes', this._data.bytes);
        this.updateInput('kilobytes', this._data.kilobytes);
        this.updateInput('megabytes', this._data.megabytes);

        this._statusChanges.next('dirty');
        this._isValid = this._data.bytes >= 0 && this._data.bytes <= 4294967295;
        this._valueChanges.next(this._data.bytes);
    }
    
    public updateCounts(scale: Scale, event: any): void {
        this.updateData(scale, Number(event.target.value));
    
        this.updateLabel('bytes', this._data.bytes);
        this.updateLabel('kilobytes', this._data.kilobytes);
        this.updateLabel('megabytes', this._data.megabytes);
    }

    public get dirty(): boolean {
        return this._statusChanges.getValue() === 'dirty';
    }

    public get valid(): boolean {
        return this._isValid;
    }

    public get currentValue(): number {
        return this._data.bytes;
    }

    public get valueChanges(): Observable<number> {
        return this._valueChanges.pipe(skipUntil(this._isReady.pipe(filter(x => x === true))), distinctUntilChanged());
    }

    public get statusChanges(): Observable<'dirty' | 'clean'> {
        return this._statusChanges.pipe(skipUntil(this._isReady.pipe(filter(x => x === true))), distinctUntilChanged());
    }

    public markAsDirty(): void {
        this._statusChanges.next('dirty');
    }

    public setValue(value: number): void {
        this._statusChanges.next('clean');
        this._isValid = value >= 0 && value <= 4294967295;
        this.whenReady(() => {
            this.updateUi();
        });
        this._valueChanges.next(value);
    }

    public enable(): void {
        if (this._isDisabled) {
            this._getScale('bytes').getElementsByTagName('input').item(0).removeAttribute('disabled');
            this._getScale('kilobytes').getElementsByTagName('input').item(0).removeAttribute('disabled');
            this._getScale('megabytes').getElementsByTagName('input').item(0).removeAttribute('disabled');
            this._isDisabled = false;
        }
    }
    
    public disable(): void {
        if (!this._isDisabled) {
            (this._getScale('bytes').getElementsByTagName('input').item(0) as any).addAttribute('disabled', 'disabled');
            (this._getScale('kilobytes').getElementsByTagName('input').item(0) as any).addAttribute('disabled', 'disabled');
            (this._getScale('megabytes').getElementsByTagName('input').item(0) as any).addAttribute('disabled', 'disabled');
            this._isDisabled = true;
        }
    }

    public get fineEditors(): {
        readonly [uom: string]: {
            readonly show: boolean,
            readonly value: number
        }
    } {
        return this._fineEditors;
    }

    public toggleFineEditor(uom: string, save?: boolean): void {
        let saveValue = -1;
        if (save === true) {
            saveValue = Number((this._getScale(`${uom}s` as Scale).getElementsByClassName('fine-editor').item(0) as any).value);
        }
        
        if (uom.startsWith('mega')) {
            this._fineEditors.megabyte.show = !this._fineEditors.megabyte.show;
            this._fineEditors.megabyte.value = this._data.megabytes;
            if (saveValue > -1) {
                saveValue *= 1000000;
            }
        } else if (uom.startsWith('kilo')) {
            this._fineEditors.kilobyte.show = !this._fineEditors.kilobyte.show;
            this._fineEditors.kilobyte.value = this._data.kilobytes;
            if (saveValue > -1) {
                saveValue *= 1000;
            }
        } else {
            this._fineEditors.byte.show = !this._fineEditors.byte.show;
            this._fineEditors.byte.value = this._data.bytes;
        }

        if (saveValue > -1) {
            this.finishSlider('bytes', {
                target: {
                    value: saveValue
                }
            })

            this.updateUi();
        }
    }

    public setReady(initialByteCount: number, getScale: (scale: Scale) => HTMLElement): void {
        this._data.bytes = initialByteCount;
        this._data.kilobytes = initialByteCount / 1000;
        this._data.megabytes = initialByteCount / 1000000;
        this._getScale = getScale;
        this._fineEditors.byte = {
            show: false,
            value: this._data.bytes
        };
        this._fineEditors.kilobyte = {
            show: false,
            value: this._data.kilobytes
        };
        this._fineEditors.megabyte = {
            show: false,
            value: this._data.megabytes
        };
        this._statusChanges.next('clean');
        this._isValid = true;
        this._isDisabled = false;

        this.valueChanges.subscribe(() => {
            this._fineEditors.byte.value = this._data.bytes;
            this._fineEditors.kilobyte.value = this._data.kilobytes;
            this._fineEditors.megabyte.value = this._data.megabytes;
        })

        this.updateLabel('bytes', this._data.bytes);
        this.updateLabel('kilobytes', this._data.kilobytes);
        this.updateLabel('megabytes', this._data.megabytes);
        this._isReady.next(true);
    }

    private constructor() {
        this._data = {
            bytes: 0,
            kilobytes: 0,
            megabytes: 0
        };
        this._valueChanges = new BehaviorSubject<number>(0);
        this._statusChanges = new BehaviorSubject<'dirty' | 'clean'>('clean');
        this._isReady = new BehaviorSubject<boolean>(false);
        this._fineEditors = {
            byte: {
                show: false,
                value: this._data.bytes
            },
            kilobyte: {
                show: false,
                value: this._data.kilobytes
            },
            megabyte: {
                show: false,
                value: this._data.megabytes
            }
        }
        this._isValid = true;
        this._isDisabled = false;
    }

    private updateLabel(scale: Scale, value: number): void {
        let s = value.toString();
        if (s.includes('.')) {
            s = `~${Math.round(value)}`;
        }
        if (s === '~0') {
            s = "&lt; 1";
        }
        this._getScale(scale).getElementsByClassName('mem-size-value-label').item(0).innerHTML = s;
    }
    
    private updateInput(scale: Scale, value: number): void {
        const element = this._getScale(scale).getElementsByTagName('input').item(0);
        const roundedValue = Math.round(value);
        element.value = roundedValue.toString();
    }

    private updateData(scale: Scale, value: number): void {
        if (scale === 'bytes') {
            this._data.bytes = value;
            this._data.kilobytes = this._data.bytes / 1000;
            this._data.megabytes = this._data.bytes / 1000000;
        } else if (scale === 'kilobytes') {
            this._data.bytes = value * 1000;
            this._data.kilobytes = this._data.bytes / 1000;
            this._data.megabytes = this._data.bytes / 1000000;
        } else if (scale === 'megabytes') {
            this._data.bytes = value * 1000000;
            this._data.kilobytes = this._data.bytes / 1000;
            this._data.megabytes = this._data.bytes / 1000000;
        }
    }

    private updateUi(): void {
        this.updateLabel('bytes', this._data.bytes);
        this.updateLabel('kilobytes', this._data.kilobytes);
        this.updateLabel('megabytes', this._data.megabytes);
        this.updateInput('bytes', this._data.bytes);
        this.updateInput('kilobytes', this._data.kilobytes);
        this.updateInput('megabytes', this._data.megabytes);
    }

    private whenReady(fn: () => void): void {
        this._isReady.pipe(filter(x => x === true), take(1)).subscribe(() => {
            fn();
        })
    }

    private _isDisabled: boolean;
    private _isValid: boolean;
    private _getScale: (scale: Scale) => HTMLElement;
    private readonly _fineEditors: {
        byte: {
            show: boolean,
            value: number
        },
        kilobyte: {
            show: boolean,
            value: number
        },
        megabyte: {
            show: boolean,
            value: number
        }
    };
    private readonly _isReady: BehaviorSubject<boolean>;
    private readonly _statusChanges: BehaviorSubject<'dirty' | 'clean'>;
    private readonly _valueChanges: BehaviorSubject<number>;
    private readonly _data: {
        bytes: number,
        kilobytes: number,
        megabytes: number
    }

    public static Create(): MemSizePresetController {
        return new MemSizePresetController();
    }
}