import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { QuadByte, ByteSequenceCreator, DynamicByteSequence, ByteSequenceLength } from '@allium/types';
import { BehaviorSubject } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { PopperContent } from 'ngx-popper';

@Component({
  selector: 'aq4w-byte-sequence-editor',
  templateUrl: './byte-sequence-editor.component.html',
  styleUrls: ['./byte-sequence-editor.component.scss']
})
export class ByteSequenceEditorComponent implements OnInit {

  // @Input('visible')
  // public set visible(visible: boolean) {
  //   this.deferUntilReady(() => {
  //     this.show.editor = visible;
  //   })
  // }

  @Input('radix')
  public set radix(radix: 2 | 10 | 16) {
    this.deferUntilReady(() => {
      this.changeViewRadix(radix);
    });
  }

  @Input('value')
  public set value(value: DynamicByteSequence) {
    this.deferUntilReady(() => {
      this.changeViewValue(value);
    });
  }

  @Input('sequenceLength')
  public set sequenceLength(sequenceLength: any) {
    let parsedLength: ByteSequenceLength | 'invalid' = 'invalid';
    try {
      parsedLength = parseInt(`${sequenceLength}`) as ByteSequenceLength;
    } catch {
      parsedLength = 'invalid';
    }
    
    this._sequenceLength.next(parsedLength || 'invalid');
  }

  @Output('valueChanged')
  public readonly valueChanged = new EventEmitter<DynamicByteSequence>();

  // @Output('closed')
  // public readonly closed = new EventEmitter<boolean>();

  @Output('visibilityChanged')
  public readonly visibilityChanged = new EventEmitter<{ show: boolean, setValue?: (value: DynamicByteSequence) => void }>();

  public view = {
    base10Control: new FormControl(0, (abstractControl) => {
      const n = Number(abstractControl.value);
      if (Number.isInteger(n)) {
        if (this.currentSequenceLength !== 'invalid' && n > this.MAX_VALUE) {
          return {
            'message': `Must be less than or equal to ${this.MAX_VALUE}`
          }
        } else if (n < 0) {
          return {
            'message': 'Must be greater than or equal to zero'
          }
        } else {
          return null;
        }
      } else if (!Number.isNaN(n)) {
        return {
          'message': 'Must be an integer'
        }
      } else {
        return {
          'message': 'Invalid numeric value'
        }
      }
    }),
    base16Control: new FormControl(),
    base2Bits: new Array<0 | 1>(),
    base2BitGroups: new Array<Array<0 | 1>>(),
    errorMessage: ''
  }

  public show = {
    editor: false,
    base10: false,
    base16: false,
    base2: false,
    errorMessage: false
  }

  public on = {
    cancel: () => {
      this.visibilityChanged.emit({ show: false });
      // this.closed.emit(true);
      this.view.base10Control.setValue(ByteSequenceCreator.Unbox(this._vaNEWlue), { emitEvent: false });
      this.view.base16Control.setValue(this.getBase16String(this._vaNEWlue), { emitEvent: false });
      this.loadBitsView(this._vaNEWlue);
      this.view.errorMessage = '';
      this.show.errorMessage = false;
      this.show.editor = false;
      this.editorPopover.hide();
    },
    save: () => {
      this.trySaveValue();
    },
    flipBit: (bitIndex: number) => {
      this.view.base2Bits[bitIndex] = this.view.base2Bits[bitIndex] === 0 ? 1 : 0;
      const gi = this.getByteGroupIndex(bitIndex);
      this.view.base2BitGroups[gi.groupIndex][gi.bitIndexWithinGroup] = this.view.base2BitGroups[gi.groupIndex][gi.bitIndexWithinGroup] === 0 ? 1 : 0;
    },
    changeEditorRadix: () => {
      this.show.errorMessage = false;
      this.view.errorMessage = '';
      if (this.show.base2) {
        const numericValue = this.parseBitsView();
        this.view.base10Control.setValue(numericValue, { emitEvent: false });
        this.show.base2 = false;
        this.show.base10 = true;
      } else if (this.show.base10) {
        const numericValue = Number(this.view.base10Control.value);
        if (Number.isInteger(numericValue)) {
          this.view.base16Control.setValue(this.getBase16String(this.createSequenceFromNumeric(numericValue)), { emitEvent: false });
        } else {
          this.view.base16Control.setValue(this.getBase16String(this._vaNEWlue), { emitEvent: false });
        }
        this.show.base10 = false;
        this.show.base16 = true;
      } else if (this.show.base16) {
        const numericValue = parseInt(this.view.base16Control.value, 16);
        if (Number.isInteger(numericValue)) {
          this.loadBitsView(this.createSequenceFromNumeric(numericValue));
        } else {
          this.loadBitsView(this._vaNEWlue);
        }
        this.show.base16 = false;
        this.show.base2 = true;
      }
    },
    inputKeydown: (event: KeyboardEvent) => {
      if (event.keyCode === 13) { // return or enter
        this.on.save();
      }
    },
    toggle: () => {
      if (this.show.editor) {
        this.visibilityChanged.emit({
          show: false
        })
      } else {
        this.visibilityChanged.emit({
          show: true,
          setValue: (value) => {
            this.value = value;
            this.show.editor = true;
          }
        })
      }
      // this.deferUntilReady(() => {
      //   this.show.editor = !this.show.editor;
      //   this.visibilityChanged.emit(this.show.editor);
      // })
      // this.visible = true;
    }
  }

  constructor() { }

  ngOnInit() {
    this._sequenceLength.pipe(filter(x => x !== 'invalid'), distinctUntilChanged()).subscribe(() => {
      for (let i = 0; i < this._deferTasks.length; i++) {
        this._deferTasks[i]();
      }
      this._deferTasks = new Array<() => void>();
      
      this.view.base10Control.statusChanges.subscribe(() => {
        if (this.show.editor && this.show.base10) {
          this.show.errorMessage = !this.view.base10Control.valid;
        }
      })
  
      this.view.base16Control.statusChanges.subscribe(() => {
        if (this.show.editor && this.show.base16) {
          this.show.errorMessage = !this.view.base16Control.valid;
        }
      })
    })
  }

  private changeViewRadix(radix: 2 | 10 | 16): void {
    if (!this.show.editor) {
      this._radix = radix;
      this.show.base10 = radix === 10;
      this.show.base16 = radix === 16;
      this.show.base2 = radix === 2;
    }
  }

  private changeViewValue(value: DynamicByteSequence): void {
    if (!this.show.editor) {
      this._vaNEWlue = value;
      this.view.base10Control.setValue(ByteSequenceCreator.Unbox(value), { emitEvent: false });
      this.view.base16Control.setValue(this.getBase16String(value), { emitEvent: false });
      this.loadBitsView(value);
    }
  }

  private trySaveValue(): void {
    if (this.show.base2) {
      this.view.errorMessage = '';
      const numericValue = this.parseBitsView();
      this._vaNEWlue = this.createSequenceFromNumeric(numericValue);
      this.valueChanged.emit(this._vaNEWlue);
      this.view.base10Control.setValue(ByteSequenceCreator.Unbox(this._vaNEWlue), { emitEvent: false });
      this.view.base16Control.setValue(this.getBase16String(this._vaNEWlue), { emitEvent: false });
      this.loadBitsView(this._vaNEWlue);
      this.view.errorMessage = '';
      this.show.errorMessage = false;
    } else if (this.show.base10) {
      if (this.view.base10Control.valid) {
        this.view.errorMessage = '';
        this._vaNEWlue = this.createSequenceFromNumeric(this.view.base10Control.value);
        this.valueChanged.emit(this._vaNEWlue);
        this.view.base10Control.setValue(ByteSequenceCreator.Unbox(this._vaNEWlue), { emitEvent: false });
        this.view.base16Control.setValue(this.getBase16String(this._vaNEWlue), { emitEvent: false });
        this.loadBitsView(this._vaNEWlue);
        this.view.errorMessage = '';
        this.show.errorMessage = false;
      } else {
        this.view.errorMessage = this.view.base10Control.getError('message');
      }
    } else if (this.show.base16) {
      if (this.view.base16Control.valid) {
        this.view.errorMessage = '';
        const numericValue = parseInt(this.view.base16Control.value, 16);
        this._vaNEWlue = this.createSequenceFromNumeric(numericValue);
        this.valueChanged.emit(this._vaNEWlue);
        this.view.base10Control.setValue(ByteSequenceCreator.Unbox(this._vaNEWlue), { emitEvent: false });
        this.view.base16Control.setValue(this.getBase16String(this._vaNEWlue), { emitEvent: false });
        this.loadBitsView(this._vaNEWlue);
        this.view.errorMessage = '';
        this.show.errorMessage = false;
      } else {
        this.view.errorMessage = this.view.base16Control.getError('message');
      }
    }

    if (!this.show.errorMessage) {
      this.show.editor = false;
    }
  }

  private loadBitsView(value: DynamicByteSequence): void {
    const bitString = value.toString({ radix: 2, padZeroes: true });
    const base2Bits = new Array<0|1>();
    for (let i = bitString.length - 1; i > -1; i--) {
      base2Bits.push(bitString.charAt(i) === '0' ? 0 : 1);
    }
    this.view.base2Bits = base2Bits;

    const base2BitGroups = new Array<Array<0|1>>();
    let group = new Array<0|1>();
    base2Bits.forEach(b => {
      group.push(b);
      if (group.length === 8) {
        base2BitGroups.push(group);
        group = new Array<0|1>();
      }
    })
    this.view.base2BitGroups = base2BitGroups;
  }

  private parseBitsView(): number {
    return parseInt(this.view.base2BitGroups.map(g => g.map(b => b.toString())).reduce((x, y) => y + x, ''), 2);
    // return parseInt(this.view.base2Bits.map(b => b.toString()).reduce((x, y) => y + x, ''), 2);
  }

  private getBase16String(value: DynamicByteSequence): string {
    return value.toString({ radix: 16, padZeroes: true });
  }

  private createSequenceFromNumeric(numeric: number): DynamicByteSequence {
    if (this.currentSequenceLength === 1) {
      return ByteSequenceCreator.Byte(numeric);
    } else if (this.currentSequenceLength === 2) {
      return ByteSequenceCreator.DoubleByte(numeric);
    } else if (this.currentSequenceLength === 3) {
      return ByteSequenceCreator.TriByte(numeric);
    } else if (this.currentSequenceLength === 4) {
      return ByteSequenceCreator.QuadByte(numeric);
    } else {
      throw new Error('Invalid byte sequence length');
    }
  }

  private get MAX_VALUE(): number {
    if (this.currentSequenceLength === 1) {
      Math.pow(2, 8) - 1;
    } else if (this.currentSequenceLength === 2) {
      Math.pow(2, 16) - 1;
    } else if (this.currentSequenceLength === 3) {
      Math.pow(2, 24) - 1;
    } else if (this.currentSequenceLength === 4) {
      return Math.pow(2, 32) - 1;
    } else {
      throw new Error('Invalid byte sequence length');
    }
  }

  private deferUntilReady(task: () => void): void {
    if (this.currentSequenceLength === 'invalid') {
      this._deferTasks.push(task);
    } else {
      task();
    }
  }
  
  private get currentSequenceLength(): ByteSequenceLength | 'invalid' {
    return !!this._sequenceLength ? this._sequenceLength.getValue() : 'invalid';
  }

  private getByteGroupIndex(bitIndex: number): { readonly bitIndexWithinGroup: number, readonly groupIndex: number } {
    let groupIndex = 0;
    let bitIndexWithinGroup = bitIndex;
    if (bitIndex > 23) {
      groupIndex = 3;
      bitIndexWithinGroup -= 24;
    } else if (bitIndex > 15) {
      groupIndex = 2;
      bitIndexWithinGroup -= 16;
    } else if (bitIndex > 7) {
      groupIndex = 1;
      bitIndexWithinGroup -= 8;
    }

    return {
      bitIndexWithinGroup: bitIndexWithinGroup,
      groupIndex: groupIndex
    }
  }

  private _vaNEWlue: DynamicByteSequence = null;
  private _radix: 2 | 10 | 16 = 10;
  private _deferTasks = new Array<() => void>();
  private readonly _sequenceLength = new BehaviorSubject<ByteSequenceLength | 'invalid'>('invalid');

  @ViewChild('editorPopover')
  editorPopover: PopperContent;
}

