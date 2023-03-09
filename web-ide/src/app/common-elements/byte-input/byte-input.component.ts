import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Byte, ByteSequenceCreator } from '@allium/types';
import { FormControl } from '@angular/forms';
import { Subscription, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { createUuid } from 'yfs';

@Component({
  selector: 'aq4w-byte-input',
  templateUrl: './byte-input.component.html',
  styleUrls: ['./byte-input.component.scss']
})
export class ByteInputComponent extends Aq4wComponent implements OnInit, AfterViewInit {

  @Input('maxSize')
  public set maxSize(maxSize: number) {
    this.view.maxSize = maxSize;
  }

  @Input('disabled')
  public set disabled(disabled: boolean) {
    this.view.disabled = disabled;
  }
  
  @Input('control')
  public set control(control: FormControl) {
    this._externalFormControl = control;

    if (!!this._externalFormControlValueSubscription) {
      this._externalFormControlValueSubscription.unsubscribe();
      this._externalFormControlValueSubscription = null;
    }

    this._externalFormControlValueSubscription = this._externalFormControl.valueChanges.subscribe(val => {
      this._formControl.setValue(val, { emitEvent: false });
      this.refreshTextValue(this.generateTextValue(val));
    });

    if (!!this._externalFormControlStatusSubscription) {
      this._externalFormControlStatusSubscription.unsubscribe();
      this._externalFormControlStatusSubscription = null;
    }
    
    this._externalFormControlStatusSubscription = this._externalFormControl.statusChanges.subscribe(status => {
      this.view.disabled = status === 'DISABLED';
    });
  }

  @Output('updated')
  public readonly updated = new EventEmitter<Array<Byte>>();

  public view = {
    radix: 10 as 10 | 16,
    textValue: '',
    disabled: false,
    maxSize: 1,
    textAreaHeight: null as number | null,
    chUnitSizeId: `chUnitSize_${createUuid()}`
  }

  public on = {
    keydown: (event: KeyboardEvent) => {
      console.log('b2e keydown: ' + event.key);

      if (event.ctrlKey || event.metaKey || event.shiftKey || event.key.startsWith('Arrow')) {
        return true;
      } else if (event.key === 'Backspace') {
        window.setTimeout(() => {
          this.refreshTextValue(this.formatTextValue(this.inputArea.nativeElement.value.replace(/[ ]/g, ''), this.view.radix));
          this.emit();
        }, 250);

        return true;

      } else {
        let rawUpdatedValue: string | null = null;
        const currentValueNoSpaces = this.view.textValue.replace(/[ ]/g, '');
        const selectionStart = this.inputArea.nativeElement.selectionStart;
        const selectionEnd = this.inputArea.nativeElement.selectionEnd;
        console.log(`b2e sel=${selectionStart}:${selectionEnd}`);
        if (selectionStart === selectionEnd) {
          if (selectionEnd === this.view.textValue.length) {
            console.log('b2e At end');
          }

          let insertText = '';
          if (this.view.radix === 10) {
            const base10pattern = RegExp(/^[0-9]$/);
            if (base10pattern.test(event.key)) {
              let isTooLarge = false;
              if (this.view.textValue.length === 2 || (this.view.textValue.length >= selectionStart - 3 && this.view.textValue.charAt(selectionStart - 3) === ' ')) {
                const valuePrefix = `${this.view.textValue.charAt(selectionStart - 2)}${this.view.textValue.charAt(selectionStart - 1)}`;
                console.log(`b2e valuePrefix=${valuePrefix}`)
                isTooLarge = Number.parseInt(`${valuePrefix}${event.key}`) > 255;
              }

              if (!isTooLarge) {
                if (currentValueNoSpaces.length > 0 && currentValueNoSpaces.length % 3 === 0) {
                  insertText += ' ';
                }

                insertText += event.key;
              }
            }
          } else if (this.view.radix === 16) {
            if (RegExp(/^[0-9a-f]$/i).test(event.key)) {
              if (currentValueNoSpaces.length > 0 && currentValueNoSpaces.length % 2 === 0) {
                insertText += ' ';
              }

              insertText += event.key;
            }
          }

          if (!!insertText) {
            if (selectionEnd === this.view.textValue.length) {
              rawUpdatedValue = (this.view.textValue + insertText).replace(/[ ]/g, '');
            } else {
              const before = selectionStart > 0
                ? this.view.textValue.substring(0, selectionStart)
                : '';
              const after = this.view.textValue.substring(selectionEnd);
              rawUpdatedValue = `${before}${insertText}${after}`.replace(/[ ]/g, '');
            }
          }
        } else {
          if (RegExp(/^[0-9]$/).test(event.key)) {
            const before = selectionStart > 0
              ? this.view.textValue.substring(0, selectionStart)
              : '';
            const after = selectionEnd < this.view.textValue.length
              ? this.view.textValue.substring(selectionEnd)
              : '';

            rawUpdatedValue = `${before}${event.key}${after}`.replace(/[ ]/g, '');
          }
        }

        if (rawUpdatedValue !== null) {
          this.refreshTextValue(this.formatTextValue(rawUpdatedValue, this.view.radix));
          this.emit();
        }
        return false;
      }
    },
    changeRadix: () => {
      if (this.view.radix === 10) {
        this.view.radix = 16;
        const rawValueNoSpaces = this.view.textValue.split(' ')
          .map(v => Number.parseInt(v).toString(16).padStart(2, '0'))
          .filter(x => x !== Number.NaN.toString())
          .reduce((x, y) => x + y, '');
        this.refreshTextValue(this.formatTextValue(rawValueNoSpaces, 16));
      } else {
        this.view.radix = 10;
        const rawValueNoSpaces = this.view.textValue.split(' ')
          .map(v => Number.parseInt(v, 16).toString(10).padStart(3, '0'))
          .filter(x => x !== Number.NaN.toString())
          .reduce((x, y) => x + y, '');
        this.refreshTextValue(this.formatTextValue(rawValueNoSpaces, 10));
      }
    }
  }

  constructor() {
    super();
  }

  ngOnInit() {
    this._formControl.valueChanges.pipe(takeUntil(this.destroyed), debounceTime(500)).subscribe(val => {
      if (!!this._externalFormControl) {
        this._externalFormControl.setValue(val);
      }
    });

    this.updated.pipe(takeUntil(this.destroyed)).subscribe(bytes => {
      this._formControl.setValue(bytes);
    });

    this._resizeHeight.next(ByteInputComponent._CHAR_HEIGHT);
  }

  ngAfterViewInit() {
    this._resizeHeight.pipe(takeUntil(this.destroyed), distinctUntilChanged(), debounceTime(550)).subscribe(resizeHeight => {
      this.view.textAreaHeight = resizeHeight;
    });
  }

  private formatTextValue(rawValueNoSpaces: string, radix: 10 | 16): string {
    const spaceMod = radix === 10 ? 3 : 2;
    let updatedValue = '';
    for (let i = 0; i < rawValueNoSpaces.length; i++) {
      const uvNoSpaces = updatedValue.replace(/[ ]/g, '');
      if (uvNoSpaces.length > 0 && uvNoSpaces.length % spaceMod === 0) {
        updatedValue += ' ';
      }
      updatedValue += rawValueNoSpaces.charAt(i);
    }
    return updatedValue;
  }

  private refreshTextValue(value: string): void {
    this.view.textValue = value;

    //Math.floor((50*14)/210) * 17
    const textWidth = value.length * ByteInputComponent._FONT_SIZE;
    const lineCount = Math.ceil(textWidth / ByteInputComponent._CONTROL_WIDTH) * ByteInputComponent._CHAR_HEIGHT;
    // this.view.textAreaHeight = Math.max(ByteInputComponent._CHAR_HEIGHT, lineCount);
    this._resizeHeight.next(Math.max(ByteInputComponent._CHAR_HEIGHT, lineCount));
  }

  private emit(): void {
    const bytes = this.view.textValue.split(' ').map(t => {
      const numericValue = Number.parseInt(t, this.view.radix);
      if (Number.isInteger(numericValue)) {
        return ByteSequenceCreator.Byte(numericValue);
      } else {
        return null;
      }
    }).filter(n => n !== null);
    this.updated.emit(bytes);
  }

  private generateTextValue(bytes: Array<Byte>): string {
    return this.formatTextValue(bytes.map(b => b.toString({ radix: this.view.radix, padZeroes: true })).reduce((x, y) => x + y, ''), this.view.radix);
  }

  @ViewChild('inputArea')
  inputArea: { readonly nativeElement: HTMLTextAreaElement };

  private _externalFormControl: FormControl | null = null;
  private _externalFormControlStatusSubscription: Subscription | null = null;
  private _externalFormControlValueSubscription: Subscription | null = null;
  private readonly _formControl = new FormControl();
  private readonly _resizeHeight = new BehaviorSubject<number>(-1);

  private static readonly _CHARS_PER_LINE = 15;
  private static readonly _FONT_SIZE = 14;
  private static readonly _CHAR_HEIGHT = 17;
  private static readonly _CONTROL_WIDTH = 210;
}
