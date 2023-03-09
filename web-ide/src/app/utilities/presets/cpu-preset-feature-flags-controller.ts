import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';

export class CpuPresetFeatureFlagsController {
    public get dirty(): boolean {
        return this._formGroup.dirty;
    }

    public get flag0(): AbstractControl {
        return this._formGroup.controls['flag0'];
    }

    public get flag1(): AbstractControl {
        return this._formGroup.controls['flag1'];
    }

    public get flag2(): AbstractControl {
        return this._formGroup.controls['flag2'];
    }

    public get flag3(): AbstractControl {
        return this._formGroup.controls['flag3'];
    }

    public get flag4(): AbstractControl {
        return this._formGroup.controls['flag4'];
    }

    public get flag5(): AbstractControl {
        return this._formGroup.controls['flag5'];
    }

    public get flag6(): AbstractControl {
        return this._formGroup.controls['flag6'];
    }

    public get flag7(): AbstractControl {
        return this._formGroup.controls['flag7'];
    }

    public get valueChanges(): Observable<any> {
        return this._formControl.valueChanges;
    }

    public get value(): any {
        return this._formControl.value;
    }

    public setValue(value: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
        emitViewToModelChange?: boolean;
    }): void {
        this._formControl.setValue(value, options);
    }

    public reset(formState?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this._formControl.reset(formState, options);
        this._formGroup.reset(formState, options);
    }

    public markAsDirty(): void {
        this._formControl.markAsDirty();
        this._formGroup.markAsDirty();
    }

    public get valid(): boolean {
        return this._formControl.valid;
    }

    public enable(options?: {
        emitEvent?: boolean;
    }): void {
        this._formControl.enable(options);
        this._formGroup.enable(options);
    }

    public disable(options?: {
        emitEvent?: boolean;
    }): void {
        this._formControl.disable(options);
        this._formGroup.disable(options);
    }

    // private get formControl(): FormControl {
    //     return this._formControl;
    // }

    public constructor() {
        this._formControl = new FormControl(0, (abstractControl) => {
            const nv = Number(abstractControl.value);
            if (Number.isInteger(nv)) {
                if (nv < 0) { 
                    return {
                        'message': 'Feature flags must greater than or equal to 0'
                    }
                } else if (nv > 255) {
                    return {
                        'message': 'Feature flags must less than or equal to 255'
                    }
                } else {
                    return null;
                }
            } else {
                return {
                    'message': 'Feature flags must be an integer'
                }
            }
        });
        this._formGroup = new FormGroup({
            'flag0': new FormControl(false),
            'flag1': new FormControl(false),
            'flag2': new FormControl(false),
            'flag3': new FormControl(false),
            'flag4': new FormControl(false),
            'flag5': new FormControl(false),
            'flag6': new FormControl(false),
            'flag7': new FormControl(false)
        });
        this._formGroup.valueChanges.subscribe(() => {
            const numericValue = 
                ((this.flag0.value === true ? 1 : 0) << 7)
                + ((this.flag1.value === true ? 1 : 0) << 6)
                + ((this.flag2.value === true ? 1 : 0) << 5)
                + ((this.flag3.value === true ? 1 : 0) << 4)
                + ((this.flag4.value === true ? 1 : 0) << 3)
                + ((this.flag5.value === true ? 1 : 0) << 2)
                + ((this.flag6.value === true ? 1 : 0) << 1)
                + (this.flag7.value === true ? 1 : 0);
            if (numericValue !== this._currentNumericValue) {
                this._currentNumericValue = numericValue;
                this._formControl.setValue(numericValue);
            }
        })
        this._formControl.valueChanges.subscribe(value => {
            if (value !== this._currentNumericValue) {
                this._currentNumericValue = Number(value);
                if (Number.isInteger(value)) {
                    this.flag0.setValue(
                        ((this._currentNumericValue >> 7) & 1) === 1,
                        { emitEvent: false }
                    )
                    this.flag1.setValue(
                        ((this._currentNumericValue >> 6) & 1) === 1,
                        { emitEvent: false }
                    )
                    this.flag2.setValue(
                        ((this._currentNumericValue >> 5) & 1) === 1,
                        { emitEvent: false }
                    )
                    this.flag3.setValue(
                        ((this._currentNumericValue >> 4) & 1) === 1,
                        { emitEvent: false }
                    )
                    this.flag4.setValue(
                        ((this._currentNumericValue >> 3) & 1) === 1,
                        { emitEvent: false }
                    )
                    this.flag5.setValue(
                        ((this._currentNumericValue >> 2) & 1) === 1,
                        { emitEvent: false }
                    )
                    this.flag6.setValue(
                        ((this._currentNumericValue >> 1) & 1) === 1,
                        { emitEvent: false }
                    )
                    this.flag7.setValue(
                        (this._currentNumericValue & 1) === 1,
                        { emitEvent: false }
                    )
                }
            }
        })
    }

    private _currentNumericValue = 0;
    private readonly _formControl: FormControl;
    private readonly _formGroup: FormGroup;
}