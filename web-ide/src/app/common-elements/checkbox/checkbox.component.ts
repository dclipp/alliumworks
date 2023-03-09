import { Component, OnInit, Output, Input, EventEmitter, ContentChild, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'aq4w-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit, AfterViewInit {

  @Input('label')
  public set label(label: string) {
    this.view.label = label;
  }
  
  @Input('tooltip')
  public set tooltip(tooltip: string) {
    this.view.tooltip = tooltip;
  }

  @Input('labelPosition')
  public set labelPosition(labelPosition: 'left' | 'right' | 'top') {
    this.view.labelPosition = labelPosition;
  }

  @Input('control')
  public set control(control: FormControl) {
    if (!(!!this.view.formControl)) {
      this.view.checked = control.value === true;
    }

    this.view.formControl = control || null;
    this.setControlValue(this.view.checked, false);
  }

  @Input('disabled')
  public set disabled(disabled: boolean) {
    this.view.isDisabled = disabled;
  }

  @Input('checked')
  public set checked(checked: boolean) {
    this.view.checked = checked;
    this.setControlValue(checked, false);
  }

  @Output('changed')
  public readonly changed = new EventEmitter<boolean>();
  
  public view = {
    label: '',
    tooltip: '',
    checked: false,
    isDisabled: false,
    labelPosition: 'left' as 'left' | 'right' | 'top',
    formControl: null as FormControl | null,
    hasLabelContent: false
  }

  public on = {
    toggle: () => {
      if (!this.view.isDisabled) {
        this.view.checked = !this.view.checked;
        this.setControlValue(this.view.checked, true);
        this.changed.emit(this.view.checked);
      }
    }
  }
  
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.view.hasLabelContent = !!this.labelContent;
    });
  }

  private setControlValue(checked: boolean, emit: boolean): void {
    if (!!this.view.formControl) {
      this.view.formControl.setValue(checked, { emitEvent: emit });
    }
  }

  @ContentChild('label')
  labelContent: any;

}
