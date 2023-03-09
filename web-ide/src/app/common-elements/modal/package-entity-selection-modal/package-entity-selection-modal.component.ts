import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PackageEntitySelectionModalInput } from 'src/app/data-models/modal/package-entity-selection-modal-input';
import { PackageEntitySelectionModalOutput } from 'src/app/data-models/modal/package-entity-selection-modal-output';

@Component({
  selector: 'aq4w-package-entity-selection-modal',
  templateUrl: './package-entity-selection-modal.component.html',
  styleUrls: ['./package-entity-selection-modal.component.scss']
})
export class PackageEntitySelectionModalComponent implements OnInit {

  public view = {
    isOpen: false,
    title: '',
    body: '',
    options: new Array<{
      readonly key: string;
      readonly title: string;
    }>(),
    selections: new Array<string>(),
    allowMulti: false,
    requiredInputValidator: null as ((s: string) => string | true) | null,
    inputForms: new FormGroup({}, (c) => {
      if (typeof c.value === 'object') {
        const validationErrors = {};
        Object.keys(c.value).forEach(k => {
          const ctrl = c.get(k);
          if (ctrl.enabled && !!this.view && !!this.view.requiredInputValidator) {
            const validity = this.view.requiredInputValidator(ctrl.value || '');
            if (validity === true) {
              validationErrors[k] = null;
            } else {
              validationErrors[k] = validity;
            }
          } else {
            validationErrors[k] = null;
          }
        });
        if (Object.keys(validationErrors).some(k => validationErrors[k] !== null)) {
          return validationErrors;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }),
    inputLabel: ''
  }

  public on = {
    clickedNo: () => {
      this.closeModal(false);
    },
    clickedYes: () => {
      this.closeModal(true);
    },
    backdropClicked: () => {
      this.closeModal(false);
    },
    selectionClicked: (key: string) => {
      const selIndex = this.view.selections.indexOf(key);
      const inputFormChanges = new Array<{
        readonly formKey: string;
        readonly enable: boolean;
      }>();
      
      if (selIndex > -1) {
        this.view.selections.splice(selIndex, 1);
        // this.view.inputForms.controls[key].disable({ emitEvent: false });
        inputFormChanges.push({ formKey: key, enable: false });
      } else if (this.view.allowMulti) {
        this.view.selections.push(key);
        // this.view.inputForms.controls[key].enable({ emitEvent: false });
        inputFormChanges.push({ formKey: key, enable: true });
      } else {
        if (this.view.selections.length === 1) {
          // this.view.inputForms.controls[this.view.selections[0]].disable({ emitEvent: false });
          inputFormChanges.push({ formKey: this.view.selections[0], enable: false });
        }
        this.view.selections = [key];
        // this.view.inputForms.controls[key].enable({ emitEvent: false });
        inputFormChanges.push({ formKey: key, enable: true });
      }

      if (!!this.view.requiredInputValidator) {
        inputFormChanges.forEach(ifc => {
          if (ifc.enable) {
            this.view.inputForms.controls[ifc.formKey].enable({ emitEvent: false });
          } else {
            this.view.inputForms.controls[ifc.formKey].disable({ emitEvent: false });
          }
        })
      }
    },
    optInputClicked: (event: MouseEvent) => {
      event.stopImmediatePropagation();
    }
  }

  public launch(data: PackageEntitySelectionModalInput, decision: (output: PackageEntitySelectionModalOutput) => void): void {
    this.view.title = data.title;
    this.view.body = data.body;
    this.view.options = data.entityDescriptions;
    this.view.allowMulti = data.allowMultipleSelections;
    this.view.requiredInputValidator = data.requiredInputValidator || null;
    this.view.inputLabel = data.inputLabel || '';
    if (!!this.view.requiredInputValidator) {
      this.view.options.forEach(o => {
        const fc = new FormControl();
        fc.disable({ emitEvent: false });
        this.view.inputForms.addControl(o.key, fc);
      })

      // this.view.inputForms.
    }
    
    this._decision = (output) => {
      decision(output);
    }
    this.view.isOpen = true;
  }

  constructor() { }

  ngOnInit() {
  }

  private closeModal(yes: boolean): void {
    this.view.isOpen = false;
    let inputValuesOutput: { [key: string]: string } | undefined = undefined;
    if (yes && !!this.view.requiredInputValidator) {
      inputValuesOutput = {};
      this.view.selections.forEach(s => inputValuesOutput[s] = this.view.inputForms.controls[s].value);
    }
    this._decision({ affirmative: yes, selectedKeys: yes ? this.view.selections : undefined, inputValues: inputValuesOutput });

    this.view.title = '';
    this.view.body = '';
    this.view.options = [];
    this.view.selections = [];
    this.view.allowMulti = false;
    Object.keys(this.view.inputForms.controls).forEach(k => this.view.inputForms.removeControl(k));
    this.view.requiredInputValidator = null;
    this.view.inputLabel = '';
    this.view.isOpen = false;
    this._decision = undefined;
  }

  private _decision: ((output: PackageEntitySelectionModalOutput) => void) | undefined = undefined;

}
