import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { ContentReference } from 'src/app/view-models/content/content-reference';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ContentDescriptor } from 'src/app/view-models/content/content-descriptor';
import { ContentType } from 'src/app/view-models/content/content-type';
import { ModalService } from 'src/app/services/modal.service';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { INSTRUCTION_BYTE_COUNT } from '@allium/types';
import { CpuPresetFeatureFlagsController } from 'src/app/utilities/presets/cpu-preset-feature-flags-controller';
import { SessionService } from 'src/app/services/session.service';
import { MemSizePresetController } from 'src/app/utilities/presets/mem-size-preset-controller';
import { ToolbarManagerService } from 'src/app/services/toolbar-manager.service';
import { ToolbarToolGroups } from 'src/app/view-models/toolbar/toolbar-tool-groups';
import { ToolbarButtonKeys } from 'src/app/view-models/toolbar/toolbar-button-keys';
import { ComputerSpec, ComputerSpecOption } from '@alliumworks/platform';

@Component({
  selector: 'aq4w-computer-presets-manager',
  templateUrl: './computer-presets-manager.component.html',
  styleUrls: ['./computer-presets-manager.component.scss']
})
export class ComputerPresetsManagerComponent extends Aq4wComponent implements OnInit, AfterViewInit {

  @Input('content')
  public set content(content: ContentReference) {
    // this._componentContentKey = content.contentKey;
    // const contentText: string = content.data.text;
    // this._initialContent = contentText;
    // this.view.control.setValue(contentText, { emitEvent: false });
  }
  
  public view = {
    selectedPreset: new FormControl(),
    presetName: new FormControl(undefined, (abstractControl) => {
      if (abstractControl.pristine || (!!abstractControl.value && !!abstractControl.value.trim())) {
        return null;
      } else {
        return {
          'message': 'Preset name is required'
        }
      }
    }),
    // memorySize: new MemSizePresetController(),
    memorySize: MemSizePresetController.Create(),
    cpuSpeed: new FormControl(undefined, (abstractControl) => {
      const n = Number(abstractControl.value);
      if (Number.isNaN(n)) {
        return {
          'message': 'Invalid numeric value'
        }
      } else {
        if (n > 4294967.295) {
          return {
            'message': 'CPU speed must be less than or equal to 4294967.295 MHz'
          }
        } else if (n < 1) {
          return {
            'message': `CPU speed must be greater than or equal to ${ComputerSpec.Defaults.Fields.DefaultCpuSpeed()}`
          }
        }
        
        if (!Number.isInteger(n)) {
          const nStr = n.toString();
          const whole = nStr.includes('.') ? nStr.split('.')[0] : nStr.split(',')[0];
          const fixed = n.toFixed(3).replace(whole, '');
          if (nStr.replace(whole, '').length > fixed.length) {
            return {
              'message': 'CPU speed must have fewer than 4 fractional digits'
            }
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
    }),
    cpuModelId: new FormControl(undefined, (abstractControl) => {
      const n = Number(abstractControl.value);
      if (Number.isInteger(n)) {
        if (n > ComputerSpec.Defaults.Constraints.MaxModelNumeric()) {
          return {
            'message': `Model identifier must be less than or equal to ${ComputerSpec.Defaults.Constraints.MaxModelNumeric()}`
          }
        } else if (n < 0) {
          return {
            'message': 'Model identifier must be greater than or equal to 0'
          }
        } else {
          return null;
        }
      } else if (!Number.isNaN(n)) {
        return {
          'message': 'Model identifier must be an integer'
        }
      } else {
        return {
          'message': 'Invalid numeric value'
        }
      }
    }),
    cpuFeatureFlags1: new CpuPresetFeatureFlagsController(),
    cpuFeatureFlags2: new CpuPresetFeatureFlagsController(),
    cpuSerialNumber: new FormControl(ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER, (abstractControl) => this.validateCpuSerialNumber(abstractControl)),
    cpuBatchMarket: new FormControl(),
    cpuISA: new FormControl(),
    isDefault: new FormControl(),
    instructionByteCount: INSTRUCTION_BYTE_COUNT,
    presetOptions: new Array<ComputerSpecOption>(),
    isNewPreset: false,
    isDirty: false,
    serialNumberView: {
      isSet: false,
      format: 'val' as 'val' | 'num'
    },
    memorySizeView: {
      bytes: {
        min: 0,
        max: 0
      },
      kilobytes: {
        min: 0,
        max: 0
      },
      megabytes: {
        min: 0,
        max: 0
      }
    },
    isReadOnlyMode: false
  }

  public show = {
    editor: false
  }

  public on = {
    savePreset: () => {
      if (this.view.isNewPreset) {
        this.view.presetName.markAsDirty();
        this.view.memorySize.markAsDirty();
        this.view.cpuSpeed.markAsDirty();
        this.view.cpuModelId.markAsDirty();
        this.view.cpuFeatureFlags1.markAsDirty();
        this.view.cpuFeatureFlags2.markAsDirty();
        this.view.cpuSerialNumber.markAsDirty();
        this.view.cpuBatchMarket.markAsDirty();
        this.view.cpuISA.markAsDirty();
        this.view.isDefault.markAsDirty();
      }
      if (this.view.presetName.valid && this.view.memorySize.valid && this.view.cpuSpeed.valid && this.view.cpuSerialNumber.valid && this.view.cpuModelId.valid && this.view.cpuFeatureFlags1.valid && this.view.cpuFeatureFlags2.valid) {
        let platformFn: () => Promise<ComputerSpec>;
        
        if (this.view.isNewPreset) {
          platformFn = () => this._sessionService.platform.userData.createComputerSpec({
            name: String(this.view.presetName.value),
            computerMemorySize: this.view.memorySize.dirty ? this.view.memorySize.currentValue : undefined,
            computerCpuSpeed: this.view.cpuSpeed.dirty ? Number(this.view.cpuSpeed.value) : undefined,
            cpuModelId: this.view.cpuModelId.dirty ? Number.parseInt(this.view.cpuModelId.value) : undefined,
            cpuFeatureFlags1: this.view.cpuFeatureFlags1.dirty ? Number.parseInt(this.view.cpuFeatureFlags1.value) : undefined,
            cpuFeatureFlags2: this.view.cpuFeatureFlags2.dirty ? Number.parseInt(this.view.cpuFeatureFlags2.value) : undefined,
            cpuSerialNumber: this.view.cpuSerialNumber.dirty ? String(this.view.cpuSerialNumber.value) : undefined,
            cpuBatchMarket: this.view.cpuBatchMarket.dirty ? Number(this.view.cpuBatchMarket.value) : undefined,
            cpuISA: this.view.cpuISA.dirty ? Number(this.view.cpuISA.value) : undefined,
            isDefault: this.view.isDefault.dirty ? this.view.isDefault.value === true : undefined
          })
        } else {
          platformFn = () => this._sessionService.platform.userData.updateComputerSpec(this.currentSpecName, {
            name: this.view.presetName.dirty ? String(this.view.presetName.value) : undefined,
            computerMemorySize: this.view.memorySize.dirty ? this.view.memorySize.currentValue : undefined,
            computerCpuSpeed: this.view.cpuSpeed.dirty ? Number(this.view.cpuSpeed.value) : undefined,
            cpuModelId: this.view.cpuModelId.dirty ? Number.parseInt(this.view.cpuModelId.value) : undefined,
            cpuFeatureFlags1: this.view.cpuFeatureFlags1.dirty ? Number.parseInt(this.view.cpuFeatureFlags1.value) : undefined,
            cpuFeatureFlags2: this.view.cpuFeatureFlags2.dirty ? Number.parseInt(this.view.cpuFeatureFlags2.value) : undefined,
            cpuSerialNumber: this.view.cpuSerialNumber.dirty ? String(this.view.cpuSerialNumber.value) : undefined,
            cpuBatchMarket: this.view.cpuBatchMarket.dirty ? Number(this.view.cpuBatchMarket.value) : undefined,
            cpuISA: this.view.cpuISA.dirty ? Number(this.view.cpuISA.value) : undefined,
            isDefault: this.view.isDefault.dirty ? this.view.isDefault.value === true : undefined
          })
        }
        platformFn().then(spec => {
            this._isDirty.next(false);
            const spIndex = this._savedSpecs.findIndex(x => x.key === this._currentPresetKey);
            if (spIndex === -1) {
              this.view.isNewPreset = false;  
            }
            this._currentPresetKey = spec.key;
            // this._userDataService.getSavedComputerPresets().then(presets => {
            //   this._savedSpecs = presets;
            //   this._currentPresetKey = result.preset.key;
            //   this._lastSelectedPresetKey = result.preset.key;
            //   this.buildPresetOptions();
            //   this.view.selectedPreset.setValue(result.preset.key);
            // });
        }).catch(err => {
          //todo
            console.error(`failed: ${err.message}`)
        })
      }
    },
    deletePreset: () => {
      this._modalService.launchModal(
        'Delete preset',
        'Are you sure you want to delete the current preset?',
        (affirmative) => {
          if (affirmative) {
            this.deleteCurrentPreset();
          }
        },
        { yes: 'Yes', no: 'No' });
    },
    toggleSerialNumberNotSet: () => {
      if (!this.view.isReadOnlyMode) {
        if (this.view.cpuSerialNumber.value === ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER) {
          this.view.cpuSerialNumber.setValue('');
        } else {
          this.view.cpuSerialNumber.setValue(ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER);
        }
      }
    },
    changeSerialNumberFormat: (format: 'val' | 'num') => {
      if (this.view.cpuSerialNumber.valid) {
        const decodedSn = ComputerSpec.CpuSerialNumberHelper.encodeSerialNumber(this.view.cpuSerialNumber.value, this.view.serialNumberView.format);
        this.view.serialNumberView.format = format;
        this.view.cpuSerialNumber.setValue(
          ComputerSpec.CpuSerialNumberHelper.decodeSerialNumber(decodedSn, this.view.serialNumberView.format),
          { emitEvent: false }
        );
      } else {
        // this.view.serialNumberView.format = format;
        // this.view.cpuSerialNumber.setValue('');
      }
    },
    randomSerialNumber: () => {
      if (!this.view.isReadOnlyMode) {
        if (this.view.serialNumberView.isSet) {
          let rand = ComputerSpec.CpuSerialNumberHelper.randomSerialNumber();
          if (this.view.serialNumberView.format === 'num') {
            rand = ComputerSpec.CpuSerialNumberHelper.decodeSerialNumber(ComputerSpec.CpuSerialNumberHelper.encodeSerialNumber(rand, 'val'), 'num');
          }

          this.view.cpuSerialNumber.setValue(rand);
        }
        // if (this.view.cpuSerialNumber.value === ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER) {
        //   this.view.cpuSerialNumber.setValue('');
        //   this.view.serialNumberView.isSet = true;
        // } else {
        //   this.view.cpuSerialNumber.setValue(ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER);
        //   this.view.serialNumberView.isSet = false;
        // }
      }
    },
    // memSizeCommitted: () => {
    //   window.setTimeout(() => {
    //     this.updateMemSizeView();
    //   }, 150);
    // }
  }

  constructor(private _contentManagerService: ContentManagerService, private _modalService: ModalService,
    private _sessionService: SessionService, private _toolbarManagerService: ToolbarManagerService) {
    super();
  }

  ngOnInit() {
    this._contentManagerService.onActiveContentChanged().pipe(takeUntil(this.destroyed)).subscribe(activeContentKey => {
      if (activeContentKey === this._componentContentKey) {
        this.initialize();
      } else if (!!activeContentKey) {
        this._instanceDestroyed.next(new Date().valueOf());
        this._instanceDestroyed = new Subject<number>();
      }
    })

    this._sessionService.platform.machine.sessionIsDefined().pipe(takeUntil(this.destroyed)).subscribe(sessionIsDefined => {
      this.changeFormState(!sessionIsDefined);
    })
    
    this._sessionService.platform.machine.currentMachineState().pipe(takeUntil(this.destroyed)).subscribe(currentMachineState => {
      this.view.isReadOnlyMode = currentMachineState.isComputerPoweredOn;
    })

    this._toolbarManagerService.onButtonClicked().pipe(takeUntil(this.destroyed)).subscribe(buttonKey => {
      const descriptor = this._contentManagerService.getActiveContentDescriptor();
      if (!!descriptor && descriptor.contentKey === this._componentContentKey) {
        if (buttonKey === ToolbarButtonKeys.SaveFile) {
          this.on.savePreset();
        } else if (buttonKey === ToolbarButtonKeys.RevertFile) {
          console.log(`RevertFile`)
          this._modalService.launchModal(
            'Undo changes',
            'Are you sure you want to undo the changes you\'ve made to the current spec?',
            (affirmative) => {
              if (affirmative) {
                this.loadEditorForms(this._currentPresetKey);
                // this.view.selectedPreset.valueChanges.pipe(take(1)).subscribe(value => {
                //   this._isDirty.next(false);
                //   this.loadEditorForms(this._currentPresetKey);
                // });
              }
            },
            { yes: 'Yes', no: 'Cancel' });
        }
      }
    })
  }

  ngAfterViewInit(): void {
    this.whenViewReady(() => {
      this.view.memorySize.statusChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((status) => {
        if (status === 'dirty') {
          this._isDirty.next(true);
        }
      })
    }, 0);
  }

  private initialize(): void {
    this._sessionService.platform.userData.computerSpecs().pipe(takeUntil(this.destroyed)).subscribe(specs => {
      this._savedSpecs = specs;
      const defaultPreset = specs.find(p => p.isDefault);
      this._currentPresetKey = defaultPreset.key;
      this._lastSelectedPresetKey = defaultPreset.key;
      this.buildPresetOptions();
      const defaultOnly = this.view.presetOptions.length === 1 && this.view.presetOptions[0].value === ComputerSpec.Defaults.Fields.DefaultKey();
      if (defaultOnly) {
        this.view.selectedPreset.setValue(defaultPreset.key, { emitEvent: false });
      } else {
        this._lastSelectedPresetKey = defaultPreset.key;
        this.view.selectedPreset.setValue(defaultPreset.key, { emitEvent: false });
      }

      this.view.selectedPreset.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe(value => {
        if (this._isDirty.getValue()) {
          this._modalService.launchModal(
            'Unsaved changes',
            'There are unsaved changes to the current spec.',
            (affirmative) => {
              if (affirmative) {
                this._isDirty.next(false);
                this.view.selectedPreset.setValue(value);
              } else {
                this.view.selectedPreset.setValue(this._lastSelectedPresetKey, { emitEvent: false });
              }
            },
            { yes: 'Discard changes', no: 'Review' });
        } else {
          this._lastSelectedPresetKey = value;
          this._currentPresetKey = value;
          this.view.isNewPreset = ComputerSpec.Defaults.Options.NewSpec().value === value;
          this.loadEditorForms(value);
        }
      })

      this.view.cpuSpeed.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((value) => {
        this._isDirty.next(true);
      })

      this.view.cpuModelId.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((value) => {
        this._isDirty.next(true);
      })

      this.view.cpuFeatureFlags1.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((value) => {
        this._isDirty.next(true);
      })

      this.view.cpuFeatureFlags2.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((value) => {
        this._isDirty.next(true);
      })

      this.view.cpuSerialNumber.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((value) => {
        this._isDirty.next(true);
        this.view.cpuSerialNumber.markAsDirty();
        console.log(`cpuSerialNumber dirty=${this.view.cpuSerialNumber.dirty}`)
        this.view.serialNumberView.isSet = value !== ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER;
      })

      this.view.cpuBatchMarket.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((value) => {
        this._isDirty.next(true);
      })

      this.view.cpuISA.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((value) => {
        this._isDirty.next(true);
      })

      this.view.presetName.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe(() => {
        this._isDirty.next(true);
      })

      this.view.isDefault.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe((value) => {
        this._isDirty.next(true);
      })

      this._isDirty.pipe(takeUntil(this._instanceDestroyed), distinctUntilChanged()).subscribe(isDirty => {
        this._contentManagerService.changeContentStatus(this._componentContentKey, isDirty);
        this.view.isDirty = isDirty;
        
        this._toolbarManagerService.setButtonStatesForGroup(ToolbarToolGroups.GroupNames.FILE_OPTIONS, isDirty);
      })

      if (!!defaultPreset) {
        this.loadEditorForms(defaultPreset.key);
      }
    })
  }

  private loadEditorForms(presetKey: string): void {
    this._isDirty.next(false);
    this.view.presetName.reset(undefined, { emitEvent: false });
    this.view.memorySize.setValue(ComputerSpec.Defaults.Fields.DefaultMemSize());
    this.view.cpuSpeed.reset(undefined, { emitEvent: false });
    this.view.cpuModelId.reset(undefined, { emitEvent: false });
    this.view.cpuFeatureFlags1.reset(undefined, { emitEvent: false });
    this.view.cpuFeatureFlags2.reset(undefined, { emitEvent: false });
    this.view.cpuSerialNumber.reset(undefined, { emitEvent: false });
    this.view.cpuBatchMarket.reset(undefined, { emitEvent: false });
    this.view.cpuISA.reset(undefined, { emitEvent: false });
    this.view.isDefault.reset(undefined, { emitEvent: false });

    if (presetKey === ComputerSpec.Defaults.Options.NewSpec().value) { // new
      this.view.presetName.setValue('', { emitEvent: false });
      this.initMemoryValue(ComputerSpec.Defaults.Fields.DefaultMemSize());
      // this.view.memorySize.setValue(ComputerPresetDefaults.Fields.DefaultMemSize());
      this.view.cpuSpeed.setValue(ComputerSpec.Defaults.Fields.DefaultCpuSpeed(), { emitEvent: false });
      this.view.cpuModelId.setValue(ComputerSpec.Defaults.Fields.DefaultModelIdentifier(), { emitEvent: false });
      this.view.cpuFeatureFlags1.setValue(0, { emitEvent: false });
      this.view.cpuFeatureFlags2.setValue(0, { emitEvent: false });
      this.view.cpuSerialNumber.setValue(ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER, { emitEvent: false });
      this.view.cpuBatchMarket.setValue(ComputerSpec.Defaults.Fields.DefaultProductionMarket(), { emitEvent: false });
      this.view.cpuISA.setValue(ComputerSpec.Defaults.Fields.DefaultIsa(), { emitEvent: false });
      this.view.isDefault.setValue(false, { emitEvent: false });
      this.view.isDefault.enable({ emitEvent: false });
      this.view.serialNumberView.isSet = false;
    } else {
      const preset = this._savedSpecs.find(p => p.key === presetKey);
      this.view.presetName.setValue(preset.name, { emitEvent: false });
      this.initMemoryValue(preset.computerMemorySize);
      // this.view.memorySize.setValue(preset.computerMemorySize);
      this.view.cpuSpeed.setValue(preset.computerCpuSpeed, { emitEvent: false });
      this.view.cpuModelId.setValue(preset.cpuModelId.toString(), { emitEvent: false });
      this.view.cpuFeatureFlags1.setValue(preset.cpuFeatureFlags1, { emitEvent: false });
      this.view.cpuFeatureFlags2.setValue(preset.cpuFeatureFlags2, { emitEvent: false });
      this.view.cpuSerialNumber.setValue(preset.cpuSerialNumber, { emitEvent: false });
      this.view.cpuBatchMarket.setValue(preset.cpuBatchMarket, { emitEvent: false });
      this.view.cpuISA.setValue(preset.cpuISA, { emitEvent: false });
      this.view.isDefault.setValue(preset.isDefault, { emitEvent: false });
      if (this.view.presetOptions.filter(x => x.value !== ComputerSpec.Defaults.Options.NewSpec().value).length < 2) {
        this.view.isDefault.disable({ emitEvent: false });
      } else {
        this.view.isDefault.enable({ emitEvent: false });
      }

      this.view.serialNumberView.isSet = preset.cpuSerialNumber !== 'Not set';
    }

    this.show.editor = true;
  }

  private buildPresetOptions(): void {
    this.view.presetOptions = this._savedSpecs.map(p => p.getOption()).concat([ComputerSpec.Defaults.Options.NewSpec()]);
  }

  private deleteCurrentPreset(): void {
    this._sessionService.platform.userData.deleteComputerSpec(this.currentSpecName).then(() => {
      this._isDirty.next(false);
    }).catch((err) => {
    })
  }

  private validateCpuSerialNumber(abstractControl: AbstractControl): ValidationErrors | null {
    // return null;//TODO
    const value = String(abstractControl.value);
    // if (this.view.serialNumberView.format === 'val') {
      if (value === ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER) {
        return null;
      } else {
        try {
          ComputerSpec.CpuSerialNumberHelper.encodeSerialNumber(value, this.view.serialNumberView.format);
          return null;
        } catch (err) {
          return {
            'message': err
          }
        }
      }
    // } else {
    //   return null;//TODO
    // }
    // const n = Number(abstractControl.value);
    // if (Number.isInteger(n)) {
    //   if (n >= INSTRUCTION_BYTE_COUNT) {
    //     return null;
    //   } else {
    //     return {
    //       'message': `Memory size must be greater than or equal to the length of an instruction (${INSTRUCTION_BYTE_COUNT} bytes)`
    //     }
    //   }
    // } else if (!Number.isNaN(n)) {
    //   return {
    //     'message': 'Memory size must be an integer'
    //   }
    // } else {
    //   return {
    //     'message': 'Invalid numeric value'
    //   }
    // }
  }

  private changeFormState(enable: boolean): void {
    if (enable) {
      this.view.cpuBatchMarket.enable({ emitEvent: false });
      this.view.cpuISA.enable({ emitEvent: false });
      this.view.cpuFeatureFlags1.enable({ emitEvent: false });
      this.view.cpuFeatureFlags2.enable({ emitEvent: false });
      this.view.cpuModelId.enable({ emitEvent: false });
      this.view.cpuSerialNumber.enable({ emitEvent: false });
      this.view.cpuSpeed.enable({ emitEvent: false });
      this.view.isDefault.enable({ emitEvent: false });
      this.view.memorySize.enable();
      this.view.presetName.enable({ emitEvent: false });
    } else {
      this.view.cpuBatchMarket.disable({ emitEvent: false });
      this.view.cpuISA.disable({ emitEvent: false });
      this.view.cpuFeatureFlags1.disable({ emitEvent: false });
      this.view.cpuFeatureFlags2.disable({ emitEvent: false });
      this.view.cpuModelId.disable({ emitEvent: false });
      this.view.cpuSerialNumber.disable({ emitEvent: false });
      this.view.cpuSpeed.disable({ emitEvent: false });
      this.view.isDefault.disable({ emitEvent: false });
      this.view.memorySize.disable();
      this.view.presetName.disable({ emitEvent: false });
    }
  }

  private initMemoryValue(value: number): void {
    this.whenViewReady(() => {
      this.view.memorySize.setReady(value, (scale) => {
        if (scale === 'megabytes') {
          return this.memSizeSliderMegabytes.nativeElement;
        } else if (scale === 'kilobytes') {
          return this.memSizeSliderKilobytes.nativeElement;
        } else {
          return this.memSizeSliderBytes.nativeElement;
        }
      });
    }, 0);
  }
  // private updateMemSizeView(): void {
  //   const byteCount = this.view.memorySize.currentValue;
  //   const kilobyteCount = Math.round(Number.parseFloat(this.view.memorySize.kilobyteCount));
  //   const megabyteCount = Math.round(Number.parseFloat(this.view.memorySize.megabyteCount));
  //   const memorySizeView: {
  //     bytes: {
  //       min: number,
  //       max: number
  //     },
  //     kilobytes: {
  //       min: number,
  //       max: number
  //     },
  //     megabytes: {
  //       min: number,
  //       max: number
  //     }
  //   } = {
  //     bytes: {
  //       min: Math.max(0, byteCount - 512),
  //       max: byteCount + 512
  //     },
  //     kilobytes: {
  //       min: Math.max(0, kilobyteCount - 1024),
  //       max: kilobyteCount + 1024
  //     },
  //     megabytes: {
  //       min: 0,//Math.max(0, megabyteCount - 512),
  //       max: 4295//megabyteCount + 512
  //     }
  //   }

  //   this.view.memorySizeView = memorySizeView;
  // }

  private whenViewReady(then: () => void, attempts: number): void {
    window.setTimeout(() => {
      if (!!this.memSizeSliderBytes && !!this.memSizeSliderBytes.nativeElement
        && !!this.memSizeSliderKilobytes && !!this.memSizeSliderKilobytes.nativeElement
        && !!this.memSizeSliderMegabytes && !!this.memSizeSliderMegabytes.nativeElement) {
        then();
      } else if (attempts < this._MAX_READY_ATTEMPTS) {
        this.whenViewReady(then, attempts + 1);
      }
    }, attempts > 0 ? 200 : 0);
  }

  private get currentSpecName(): string {
    const spec = this._savedSpecs.find(ss => ss.key === this._currentPresetKey);
    return !!spec ? spec.name : '';
  }

  @ViewChild('memSizeSliderBytes')
  memSizeSliderBytes: { readonly nativeElement: HTMLElement };

  @ViewChild('memSizeSliderKilobytes')
  memSizeSliderKilobytes: { readonly nativeElement: HTMLElement };

  @ViewChild('memSizeSliderMegabytes')
  memSizeSliderMegabytes: { readonly nativeElement: HTMLElement };

  private _instanceDestroyed = new Subject<number>();
  private _currentPresetKey = '';
  private _lastSelectedPresetKey = '';
  private _savedSpecs = new Array<ComputerSpec>();
  private readonly _componentContentKey = ContentDescriptor.encodeKey('0', ContentType.ComputerPresets);
  private readonly _isDirty = new BehaviorSubject<boolean>(false);
  private readonly _MAX_READY_ATTEMPTS = 15;
  // private readonly _DEFAULT_MEM_SIZE = 2048;
  // private readonly _DEFAULT_CPU_SPEED = 1;
  // private readonly _DEFAULT_BATCH_MARKET = 0;
  // private readonly _DEFAULT_ISA = 0;
  // private readonly _MAX_CPU_MODEL_NUMERIC = Math.pow(2, 16) - 1;
  // private readonly _DEFAULT_CPU_MODEL = '0'.repeat(this._MAX_CPU_MODEL_NUMERIC);

}
