import { Component, OnInit, ViewChild } from '@angular/core';
import { FileUploadModalInput } from 'src/app/data-models/modal/file-upload-modal-input';
import { FileUploadModalOutput } from 'src/app/data-models/modal/file-upload-modal-output';
import { ModalLauncher } from '../modal-launcher';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FileUploadModalNamedTypes } from 'src/app/data-models/modal/file-upload-modal-named-types';

@Component({
  selector: 'aq4w-file-upload-modal',
  templateUrl: './file-upload-modal.component.html',
  styleUrls: ['./file-upload-modal.component.scss']
})
export class FileUploadModalComponent implements OnInit, ModalLauncher<FileUploadModalInput, FileUploadModalOutput> {

  public view = {
    isOpen: false,
    title: '',
    description: '',
    acceptExtensions: '',
    allowMultiple: false,
    acceptArchiveFile: false,
    showInputField: false,
    inputFieldValue: '',
    inputFieldCaption: '',
    uploadFileData: undefined as UploadFileDataCollection | undefined,
    cannotProceed: false,
    step: 1,
    controlState: 'clear' as 'clear' | 'in-progress' | 'has-selections' | 'text-input',
    selections: new Array<{ readonly iconName: string, readonly filename: string }>(),
    uploadTypeOptions: new Array<{ label: string, value: string, tooltip: string }>(),
    uploadType: new FormControl('archive'),
    uploadTypeNotes: new Array<{ readonly uploadType: string, readonly paragraphs: Array<string> }>()
  }

  public on = {
    fileInput: () => {
      const files = this.fileInput.nativeElement.files;
      if (files.length > 0) {
        this.processFileUploadData();
      } else {
        console.log('cleared')
        this.view.controlState = 'clear';
        this.view.cannotProceed = true;
      }
    },
    fileInputClicked: () => {
      if (!(!!this.view.uploadFileData)) {
        this.view.controlState = 'in-progress';
        this.detectUploadDialogCancel();
        this.fileInput.nativeElement.click();
      }
      // const selections = new Array<{ readonly iconName: string, readonly filename: string }>();
      // const simnum = Number.isInteger(window['simsels'])?window['simsels']:25;
      // for (let index = 0; index < simnum; index++) {
      //   const ext = index > 0 && index % 4 === 0 ? '.json' : '.aq';
      //   const fnm = Math.random().toString().split('.')[1] + ext;
      //   selections.push({
      //     iconName: this.getSelectionIconName(fnm),
      //     filename: fnm
      //   })
        
      // }
      // this.view.selections = selections;
      // this.view.controlState = 'has-selections';
    },
    clearFileInput: () => {
      this.view.selections = new Array<{ readonly iconName: string, readonly filename: string }>();
      this.view.controlState = 'clear';
      this.fileInput.nativeElement.value = '';
      this.view.cannotProceed = true;
    },
    fileInputInputValueChanged: (title: string) => {
      this.view.inputFieldValue = title;
      this.view.cannotProceed = this.view.showInputField && !RegExp(/^[_a-zA-Z0-9]+$/).test(title);
    },
    clickedCancel: () => {
      this.progress(false);
    },
    clickedUpload: () => {
      this.progress(true);
    },
    click: (event: MouseEvent) => {
      // check if this should be considered a backdrop click
      let e = event.target as any;
      let isDialogTarget = false;
      while (!isDialogTarget && !!e && e.nodeName !== 'BODY') {
        if (e.classList.contains('file-upload-modal-dialog-content')) {
          isDialogTarget = true;
        } else {
          e = e.parentNode;
        }
      }

      if (!isDialogTarget) {
        this.progress(false);
      }
    }
  }

  constructor() { }

  public launch(data: FileUploadModalInput, decision: (output: FileUploadModalOutput) => void): void {
    this._processFiles = data.processFiles;
    this._finishUpload = data.finishUpload;

    if (Array.isArray(data.acceptExtensions)) {
      const joinedExtensions = data.acceptExtensions.map(x => `.${x}`).join(',');
      this._directUploadExtensions2 = () => {
        return joinedExtensions;
      }
    } else {
      const extensionsFn = data.acceptExtensions as (uploadType: string) => Array<string>;
      this._directUploadExtensions2 = (uploadType) => {
        return extensionsFn(uploadType).map(x => `.${x}`).join(',');
      }
    }

    if (data.acceptArchiveFile === true) {
      this._uploadTypeSubscription = this.view.uploadType.valueChanges.subscribe(ut => {
        if (ut === FileUploadModalNamedTypes.archive) {
          this.view.acceptExtensions = '.json';
          this.view.allowMultiple = false;
        } else {
          this.view.acceptExtensions = this._directUploadExtensions2(ut);
          this.view.allowMultiple = this._directUploadAllowMultiple(ut);
        }
      });
      this.view.acceptArchiveFile = true;
      this.view.acceptExtensions = '.json';
    } else {
      this.view.acceptExtensions = this._directUploadExtensions2('');
    }

    const uploadTypeOptions = getDefaultUploadOptionValues();
    if (data.acceptSourceUpload === true) {
      uploadTypeOptions.push({
        label: 'From Source',
        value: FileUploadModalNamedTypes.source,
        tooltip: ''
      })
    } else if (!!data.acceptSourceUpload && typeof data.acceptSourceUpload === 'object') {
      uploadTypeOptions.push({
        label: 'From Source',
        value: FileUploadModalNamedTypes.source,
        tooltip: data.acceptSourceUpload.tooltip
      })
    }
    this.view.uploadTypeOptions = uploadTypeOptions;

    if (!!data.uploadTypeNotes) {
      this.view.uploadTypeNotes = data.uploadTypeNotes;
    }

    if (data.allowMultipleFiles === true || data.allowMultipleFiles === undefined) {
      this._directUploadAllowMultiple = () => {
        return true;
      };
    } else if (data.allowMultipleFiles === false) {
      this._directUploadAllowMultiple = () => {
        return false;
      };
    } else {
      const allowMultipleFn = data.allowMultipleFiles;
      this._directUploadAllowMultiple = allowMultipleFn;
    }

    this.view.title = data.title;
    this.view.description = data.description;
    this.view.allowMultiple = this._directUploadAllowMultiple(this.view.uploadType.value);
    this.view.showInputField = !!data.inputFieldCaption;
    this.view.inputFieldValue = '';
    this.view.inputFieldCaption = data.inputFieldCaption || '';
    this.view.uploadFileData = undefined;
    this.view.cannotProceed = true;
    
    this._decision = (output) => {
      decision(output);
    }
    this.view.isOpen = true;
  }


  ngOnInit() {
  }

  private cleanUpModal(): void {
    this.view.title = '';
    this.view.description = '';
    this.view.acceptExtensions = '';
    this.view.allowMultiple = false;
    this.view.acceptArchiveFile = false;
    this.view.showInputField = false;
    this.view.inputFieldValue = '';
    this.view.inputFieldCaption = '';
    this.view.uploadFileData = undefined;
    this.view.cannotProceed = false;
    this.view.step = 1;
    this.view.controlState = 'clear';
    this.view.uploadType.setValue(FileUploadModalNamedTypes.archive, { emitEvent: false });
    this.view.uploadTypeOptions = getDefaultUploadOptionValues();
    this.view.uploadTypeNotes = new Array<{ readonly uploadType: string, readonly paragraphs: Array<string> }>();
    this.view.isOpen = false;
    this._decision = undefined;
    this._processFiles = undefined;
    this._finishUpload = undefined;
    this._directUploadExtensions2 = undefined;
    this._directUploadAllowMultiple = undefined;
    if (!!this._uploadTypeSubscription) {
      this._uploadTypeSubscription.unsubscribe();
      this._uploadTypeSubscription = undefined;
    }
  }

  private commitUpload(): void {
    const o = { files: this.view.uploadFileData };
    const additionalData = this._finishUpload();
    Object.keys(additionalData).forEach(k => {
      o[k] = additionalData[k];
    })

    this.view.isOpen = false;
    const output: FileUploadModalOutput = {
      affirmative: true,
      files: !!o.files && o.files !== 'error' ? o.files : 'error',
      textFormValue: this.view.showInputField ? this.view.inputFieldValue : undefined,
      fromArchive: this.view.uploadType.value === FileUploadModalNamedTypes.archive,
      uploadType: this.view.uploadType.value
    }

    this._decision(output);
    this.cleanUpModal();
  }

  private progress(affirmative: boolean): void {
    const step = this.view.step;

    if (affirmative) {
      if (step === 1) {
        if (this.view.showInputField) {
          this.view.controlState = 'text-input';
          this.view.step = 2;
        } else {
          this.commitUpload();
        }
      } else if (step === 2 && !!this.view.uploadFileData) {
        this.commitUpload();
      }
    } else {
      this._decision({ affirmative: false });
      this.cleanUpModal();
    }
  }

  private processFileUploadData(): void {
    const files = this.fileInput.nativeElement.files;
    if (files.length > 0) {
      const promises = new Array<Promise<{ readonly filename: string; readonly fileContent: string; } | 'error'>>();
      for (let i = 0; i < files.length; i++) {
        const p = new Promise<{ readonly filename: string; readonly fileContent: string; } | 'error'>((resolve) => {
          (files.item(i) as File & { text(): Promise<string> }).text().then(text => {
            resolve({
              filename: files.item(i).name,
              fileContent: text
            })
          }).catch(() => {
            resolve('error');
          })
        })
        promises.push(p);
      }
      Promise.all(promises).then(fileData => {
        const additionalData = fileData.some(fd => fd === 'error') ? 'error' : fileData as Array<{ readonly filename: string; readonly fileContent: string; }>;
        this.view.uploadFileData = additionalData;

        if (additionalData === 'error') {
          this.view.cannotProceed = true;
          this.view.controlState = 'clear';
        } else {
          this.view.selections = additionalData.map(ad => {
            return {
              iconName: this.getSelectionIconName(ad.filename),
              filename: ad.filename
            }
          })
          this.view.controlState = 'has-selections';
          this.view.uploadFileData = additionalData;
          const processedResult = this._processFiles(fileData);
          if (this.view.showInputField) {
            this.view.inputFieldValue = processedResult.inputFieldValue;
          }
          this.view.cannotProceed = files.length < 1 || !processedResult.canProceed;
        }
      })
    }
  }

  private getSelectionIconName(filename: string): string {
    const fnl = filename.toLowerCase();
    if (fnl.endsWith('.aq')) {
      return '(c)sourcefile';
    } else {
      return '(fa)file-alt';
    }
  }

  private detectUploadDialogCancel(): void {
    const removeListener = () => {
      window.removeEventListener('focus', () => {
        window.setTimeout(() => {
          if (!(!!this.view.uploadFileData) && this.view.controlState === 'in-progress') {
            this.view.controlState = 'clear';
          }

          removeListener();
        }, 400)
      })
    }

    window.addEventListener('focus', () => {
      window.setTimeout(() => {
        if (!(!!this.view.uploadFileData) && this.view.controlState === 'in-progress') {
          this.view.controlState = 'clear';
        }

        removeListener();
      }, 400)
    });
  }

  // private finishFileUpload(): void {
  //   if (!!this.view.uploadFileData) {
  //     let o = {
  //       files: this.view.uploadFileData
  //     };
  //     const additionalData = this._finishUpload();
  //     Object.keys(additionalData).forEach(k => {
  //       o[k] = additionalData[k];
  //     })
  //     this._pushDecision(true, o);
  //     this.clearData();
  //   }
  // }

  @ViewChild('fileInput')
  fileInput: { readonly nativeElement: HTMLInputElement };

  @ViewChild('uploadControl')
  uploadControl: { readonly nativeElement: HTMLElement };

  private _uploadTypeSubscription: Subscription | undefined = undefined;
  private _directUploadAllowMultiple: ((value: string) => boolean) | undefined = undefined;
  private _directUploadExtensions2: ((value: string) => string) | undefined = undefined;
  // private _directUploadExtensions = '';
  private _finishUpload: (() => { readonly [key: string]: any }) | undefined = undefined;
  private _processFiles: ((fileData: Array<'error' | {
    readonly filename: string;
    readonly fileContent: string;
  }>) => {
    readonly canProceed: boolean,
    readonly inputFieldValue?: string
  }) | undefined = undefined;
  private _decision: ((output: FileUploadModalOutput) => void) | undefined = undefined;

}

type UploadFileDataCollection = Array<{ readonly filename: string; readonly fileContent: string; }> | 'error';

const getDefaultUploadOptionValues = () => {
  return [
    {
      label: 'From Archive',
      value: FileUploadModalNamedTypes.archive,
      tooltip: 'archivetodo'
    }
  ];
}