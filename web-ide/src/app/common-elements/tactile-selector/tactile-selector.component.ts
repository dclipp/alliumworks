import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'aq4w-tactile-selector',
  templateUrl: './tactile-selector.component.html',
  styleUrls: ['./tactile-selector.component.scss']
})
export class TactileSelectorComponent implements OnInit {

  @Input('options')
  public set options(options: Array<{
    readonly label: string;
    readonly value: string;
    readonly tooltip?: string;
  }> | { opts: Array<{
    readonly label: string;
    readonly value: string;
    readonly tooltip?: string;
  }>, initial: string }) {
    if (Array.isArray(options)) {
      this.view.options = options;
    } else {
      this.view.options = options.opts;
      this.view.selectedValue = options.initial;
    }
  }

  @Input('control')
  public set control(control: [FormControl, string | undefined]) {
    this._fc = {
      formControl: control[0],
      valueFn: !!control[1] ? (v) => eval(control[1])(v) : undefined
    }
  }

  @Input('disabled')
  public set disabled(disabled: boolean) {
    this.view.isDisabled = disabled;
  }

  // @Input('currentSelection')
  // public set currentSelection(currentSelection: string) {
  //   this.view.selectedValue = currentSelection;
  // }

  @Output('selection')
  public readonly selection = new EventEmitter<string>();
  
  public view = {
    options: new Array<{
      readonly label: string;
      readonly value: string;
      readonly tooltip?: string;
    }>(),
    selectedValue: '',
    isDisabled: false
  }

  public on = {
    select: (value: string) => {
      if (!this.view.isDisabled && value !== this.view.selectedValue) {
        this.view.selectedValue = value;
        this.selection.emit(value);
        if (!!this._fc) {
          const fcValue = !!this._fc.valueFn ? this._fc.valueFn(value) : value;
          this._fc.formControl.setValue(fcValue);
          this._fc.formControl.markAsDirty();
        }
      }
    }
  }

  constructor() { }

  ngOnInit() {
  }

  private _fc?: {
    readonly formControl: FormControl;
    readonly valueFn?: (v: string) => any;
  } = undefined;

}
