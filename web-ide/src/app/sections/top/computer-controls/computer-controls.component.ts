import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { ContentType } from 'src/app/view-models/content/content-type';
import { ToolbarToolGroups } from 'src/app/view-models/toolbar/toolbar-tool-groups';
import { ModalService } from 'src/app/services/modal.service';
import { take } from 'rxjs/operators';
import { ContentDescriptor } from 'src/app/view-models/content/content-descriptor';
import { SessionService } from 'src/app/services/session.service';
import { ComputerSpec, ComputerSpecOption } from '@alliumworks/platform';

@Component({
  selector: 'aq4w-computer-controls',
  templateUrl: './computer-controls.component.html',
  styleUrls: ['./computer-controls.component.scss']
})
export class ComputerControlsComponent implements OnInit {

  public view = {
    isProgramLoaded: false,
    programSize: 0,
    memorySize: 0,
    computerPresets: new Array<ComputerSpecOption>(),
    selectedPreset: new FormControl(),
    isComputerPresetsManagerOpen: false,
    managePresetOptionKey: ComputerSpec.Defaults.Options.ManageSpecs().value,
    isWorkspaceLoaded: false,
    isComputerRunning: false,
    breakpointsDisabled: false
  }

  public on = {
    powerClicked: () => {
      if (this.view.isProgramLoaded) {
        this._modalService.launchModal('Shut down', 'Are you sure you want to shutdown the computer?', (affirmative) => {
          if (affirmative) {
            this._sessionService.platform.machine.computerControls.powerOff();
          }
        }, { yes: 'Yes', no: 'No' })
      } else {
        this._sessionService.platform.machine.computerControls.powerOn(this.getSelectedPreset());
        this._sessionService.platform.assembler.assembly().pipe(take(1)).toPromise().then(assembly => {
          if (!!assembly) {
            this._sessionService.platform.machine.loadProgram(assembly.compilation.programBytes.map(b => b), true, assembly.sourceMap);
          }
        })
      }
    },
    runClicked: () => {
      this._sessionService.platform.machine.computerControls.run();
    },
    cycleInstructionClicked: () => {
      this._sessionService.platform.machine.computerControls.cyclePipeline();
    },
    stepPipelineClicked: () => {
      this._sessionService.platform.machine.computerControls.advancePipeline();
    },
    stopClicked: () => {
      this._sessionService.platform.machine.computerControls.pause();
    },
    toggleBreakpointsClicked: () => {
      this._sessionService.platform.machine.toggleBreakpoints();
    }
  }

  constructor(private _contentManagerService: ContentManagerService, private _modalService: ModalService, private _sessionService: SessionService) { }

  ngOnInit() {
    this._sessionService.platform.userData.computerSpecs().subscribe(presets => {
      this._allPresets = presets;
      this.buildComputerPresetOptions(presets);
      const defaultPreset = presets.find(p => p.isDefault);
      if (!!defaultPreset) {
        this._previousSelectedPreset = defaultPreset.key;
        this.view.selectedPreset.setValue(defaultPreset.key, { emitEvent: false });
      } else if (presets.length > 0) {
        this._previousSelectedPreset = presets[0].key;
        this.view.selectedPreset.setValue(presets[0].key, { emitEvent: false });
      }

      this.view.selectedPreset.valueChanges.subscribe(value => {
        if (value === ComputerSpec.Defaults.Options.ManageSpecs().value) {
          this.view.isComputerPresetsManagerOpen = true;
          this.view.selectedPreset.setValue(this._previousSelectedPreset, { emitEvent: false });
          this._contentManagerService.content().pipe(take(1)).subscribe(allContent => {
            if (allContent.filter(ac => ContentDescriptor.decodeKey(ac.contentKey).type === ContentType.ComputerPresets).length === 0) {
              this._contentManagerService.addContent('0', ContentType.ComputerPresets, 'Computer Presets', '(fa)fas.server', [ToolbarToolGroups.GroupNames.FILE_OPTIONS], true);
            }
          })
        } else {
          this._previousSelectedPreset = value;
        }
      });

      this._contentManagerService.content().subscribe(content => {
        if (this.view.isComputerPresetsManagerOpen && !content.some(c => c.type === ContentType.ComputerPresets)) {
          this.view.isComputerPresetsManagerOpen = false;
        }
      })

      this._sessionService.platform.workspaceManager.activeWorkspace().subscribe(activeWorkspace => {
        this.view.isWorkspaceLoaded = !!activeWorkspace;
      })

      this._sessionService.platform.machine.currentMachineState().subscribe(state => {
        this.view.breakpointsDisabled = !state.breakpointsEnabled;
        this.view.isComputerRunning = state.isComputerRunning;
        console.log(`isComputerRunning=${state.isComputerRunning}`)
        if (state.isProgramLoaded) {
          this.view.isProgramLoaded = true;
          this.view.memorySize = state.computerMemorySize;
          this.view.programSize = state.programSize;
          // this.view.selectedPreset.disable({ emitEvent: false });
        } else {
          this.view.isProgramLoaded = false;
          this.view.memorySize = 0;
          this.view.programSize = 0;
          this.view.selectedPreset.enable({ emitEvent: false });
        }
      })

      this._sessionService.platform.machine.machineBecameIdle().subscribe(() => {
        console.log('machineBecameIdle')// TODO
        // this.view.isComputerRunning = false;
      })
    })
  }

  private buildComputerPresetOptions(customComputerPresets: Array<ComputerSpec>): void {
    this.view.computerPresets = customComputerPresets.map(p => p.getOption()).concat([ComputerSpec.Defaults.Options.ManageSpecs()]);
  }

  private getSelectedPreset(): ComputerSpec {
    const selectedPresetValue: string = this.view.selectedPreset.value;
    return this._allPresets.find(p => p.key === selectedPresetValue);
  }

  private _previousSelectedPreset = ComputerSpec.Defaults.Fields.DefaultKey();
  private _allPresets = new Array<ComputerSpec>();

}
