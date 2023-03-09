import { Injectable } from '@angular/core';
import { ModalType } from '../common-elements/modal/modal-type';
import { ModalOutput } from '../data-models/modal/modal-output';
import { DeviceInstallationModalOutput } from '../data-models/modal/device-installation-modal-output';
import { FileUploadModalOutput } from '../data-models/modal/file-upload-modal-output';
import { FileUploadModalInput } from '../data-models/modal/file-upload-modal-input';
import { RegularModalOutput } from '../data-models/modal/regular-modal-output';
import { ChoiceListModalOutput } from '../data-models/modal/choice-list-modal-output';
import { ChoiceListModalOption } from '../data-models/modal/choice-list-modal-option';
import { PackageEntitySelectionModalInput } from '../data-models/modal/package-entity-selection-modal-input';
import { PackageEntitySelectionModalOutput } from '../data-models/modal/package-entity-selection-modal-output';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  public launchDeviceInstallationModal(deviceName: string, then: (decision: DeviceInstallationModalOutput) => void): void {
    this._dispatch<DeviceInstallationModalOutput>('device-installation', { humanReadableDeviceName: deviceName }, (output) => {
      if (output.affirmative) {
        then({
          affirmative: true,
          installationName: output.installationName,
          portIndex: output.portIndex
        });
      } else {
        then({
          affirmative: false
        });
      }
    })
    this.getModalElement().classList.add('show-modal');
  }

  public launchFileUploadModal(input: FileUploadModalInput, then: (decision: FileUploadModalOutput) => void): void {
    this._dispatch<FileUploadModalOutput>('file-uploader', input, (output) => {
      if (output.affirmative) {
        then(output);
      } else {
        then({
          affirmative: false
        });
      }
    })
    this.getModalElement().classList.add('show-modal');
  }

  public launchPackageEntitySelectionModal(input: PackageEntitySelectionModalInput, then: (decision: PackageEntitySelectionModalOutput) => void): void {
    this._dispatch<PackageEntitySelectionModalOutput>('package-entity-selection', input, (output) => {
      if (output.affirmative) {
        then(output);
      } else {
        then({
          affirmative: false
        });
      }
    })
    this.getModalElement().classList.add('show-modal');
  }

  public launchModal(title: string, body: string, then: (affirmative: boolean, formValues?: { readonly [formName: string]: string }) => void, buttons?: { yes: string, no: string, hideNoButton?: boolean }, bodyIsTemplate?: boolean): void {
    this._dispatch<RegularModalOutput>('regular', {
      title: title,
      body: body,
      hideNoButton: !!buttons && buttons.hideNoButton === true,
      yesButtonCaption: !!buttons ? buttons.yes : undefined,
      noButtonCaption: !!buttons ? buttons.no : undefined,
      bodyIsTemplate: bodyIsTemplate === true ? true : undefined
    }, (output) => {
      then(output.affirmative, output.formValues);
    })
    this.getModalElement().classList.add('show-modal');
  }

  public launchChoiceListModal(title: string, body: string, choices: Array<ChoiceListModalOption>, then: (affirmative: boolean, choice?: string) => void, cancelButtonCaption?: string): void {
    this._dispatch<ChoiceListModalOutput>('choice-list', {
      title: title,
      body: body,
      choices: choices,
      cancelButtonCaption: cancelButtonCaption
    }, (output) => {
      then(output.affirmative, output.choice);
    })
    this.getModalElement().classList.add('show-modal');
  }

  constructor() {
    window['_aq4w_modal_registration'] = (dispatcher: <T extends ModalOutput>(modalType: ModalType, input: any, pushDecision: (output: T) => void) => void) => {
      this.setDispatcher(dispatcher);
      delete window['_aq4w_modal_registration'];
    };
  }

  private getModalElement(): HTMLElement {
    return document.getElementById('aq4w-modal');
  }

  private setDispatcher(dispatcher: <T extends ModalOutput>(modalType: ModalType, input: any, pushDecision: (output: T) => void) => void): void {
    if (this._dispatch === undefined) {
      this._dispatch = dispatcher;
    }
  }
  private _dispatch: (<T extends ModalOutput>(modalType: ModalType, input: any, pushDecision: (output: T) => void) => void) | undefined = undefined;
}
