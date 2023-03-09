import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ModalLauncher } from './modal-launcher';
import { DeviceInstallationModalInput } from 'src/app/data-models/modal/device-installation-modal-input';
import { DeviceInstallationModalOutput } from 'src/app/data-models/modal/device-installation-modal-output';
import { ModalOutput } from 'src/app/data-models/modal/modal-output';
import { ModalType } from './modal-type';
import { FileUploadModalInput } from 'src/app/data-models/modal/file-upload-modal-input';
import { FileUploadModalOutput } from 'src/app/data-models/modal/file-upload-modal-output';
import { RegularModalInput } from 'src/app/data-models/modal/regular-modal-input';
import { ChoiceListModalInput } from 'src/app/data-models/modal/choice-list-modal-input';
import { ChoiceListModalOutput } from 'src/app/data-models/modal/choice-list-modal-output';
import { PackageEntitySelectionModalInput } from 'src/app/data-models/modal/package-entity-selection-modal-input';
import { PackageEntitySelectionModalOutput } from 'src/app/data-models/modal/package-entity-selection-modal-output';

@Component({
  selector: 'aq4w-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements AfterViewInit {

  constructor() { }

  ngAfterViewInit(): void {
    if (!!window['_aq4w_modal_registration']) {
      window['_aq4w_modal_registration'](((modalType: ModalType, input: any, pushDecision: (output: ModalOutput) => void) => { this.dispatch(modalType, input, pushDecision) }));
    }
  }
  
  private hideModal(): void {
    console.log('this.hideModal();')
    const modalElement = document.getElementById('aq4w-modal');
    modalElement.classList.remove('show-modal');
  }

  private dispatch(modalType: ModalType, input: any, pushDecision: (output: ModalOutput) => void): void {
    if (modalType === 'device-installation') {
      this.deviceInstallationModal.launch(input, (decision) => {
        pushDecision(decision);
        this.hideModal();
      })
    } else if (modalType === 'file-uploader') {
      this.fileUploadModal.launch(input, (decision) => {
        pushDecision(decision);
        this.hideModal();
      })
    } else if (modalType === 'regular') {
      this.regularModal.launch(input, (decision) => {
        pushDecision(decision);
        this.hideModal();
      })
    } else if (modalType === 'choice-list') {
      this.choiceListModal.launch(input, (decision) => {
        pushDecision(decision);
        this.hideModal();
      })
    } else if (modalType === 'package-entity-selection') {
      this.packageEntitySelectionModal.launch(input, (decision) => {
        pushDecision(decision);
        this.hideModal();
      })
    }
  }

  @ViewChild('deviceInstallationModal')
  deviceInstallationModal: ModalLauncher<DeviceInstallationModalInput, DeviceInstallationModalOutput>;

  @ViewChild('fileUploadModal')
  fileUploadModal: ModalLauncher<FileUploadModalInput, FileUploadModalOutput>;

  @ViewChild('regularModal')
  regularModal: ModalLauncher<RegularModalInput, ModalOutput>;
  
  @ViewChild('choiceListModal')
  choiceListModal: ModalLauncher<ChoiceListModalInput, ChoiceListModalOutput>;

  @ViewChild('packageEntitySelectionModal')
  packageEntitySelectionModal: ModalLauncher<PackageEntitySelectionModalInput, PackageEntitySelectionModalOutput>;
}
