import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, ValidationErrors, AbstractControl } from '@angular/forms';
import { SessionService } from 'src/app/services/session.service';
import { ByteSequenceCreator } from '@allium/types';
import { BehaviorSubject } from 'rxjs';
import { ModalLauncher } from '../modal-launcher';
import { DeviceInstallationModalInput } from 'src/app/data-models/modal/device-installation-modal-input';
import { DeviceInstallationModalOutput } from 'src/app/data-models/modal/device-installation-modal-output';

const _RANGE_COUNT = 32;
@Component({
  selector: 'aq4w-device-installation-modal',
  templateUrl: './device-installation-modal.component.html',
  styleUrls: ['./device-installation-modal.component.scss']
})
export class DeviceInstallationModalComponent implements OnInit, ModalLauncher<DeviceInstallationModalInput, DeviceInstallationModalOutput> {

  public view = {
    isOpen: false,
    portIndex: {
      ranges: new Array<boolean>(_RANGE_COUNT),
      form: new FormControl(undefined, control => { return this.validateChannelForm(control) })
    },
    installName: new FormControl(),
    allValid: false,
    humanReadableDeviceName: ''
  }

  public on = {
    backdropClicked: () => {
      this.closeModal(false);
    },
    clickedCancel: () => {
      this.closeModal(false);
    },
    clickedInstall: () => {
      this.closeModal(true);
    }
  }

  public launch(data: DeviceInstallationModalInput, decision: (output: DeviceInstallationModalOutput) => void): void {
    this.view.humanReadableDeviceName = data.humanReadableDeviceName;
    this.view.installName.setValue(data.humanReadableDeviceName, { emitEvent: false });
    this._decision = (output) => {
      decision(output);
    }
    this.view.isOpen = true;
  }

  constructor(private cd: ChangeDetectorRef, private _sessionService: SessionService) { }

  ngOnInit() {
    window['LaunchDIM'] = () => {
      this.launch({ humanReadableDeviceName: 'simple-console'}, (output) => {
        console.log('decision:'+JSON.stringify(output))
      });
      this.cd.detectChanges();//todo remove??
    }

    this._sessionService.platform.devices.onLogSetAvailable().subscribe(logSets => {
      const channelsInUse = new Array<number>();
      logSets.forEach(ls => {
        channelsInUse.push(ByteSequenceCreator.Unbox(ls.portIndex));
      });

      this._channelsInUse.next(channelsInUse);
    })

    this._sessionService.platform.devices.onLogSetUnavailable().subscribe(logSets => {
      this._channelsInUse.next(this._channelsInUse.getValue().filter(c => !logSets.some(ls => {
        return ls.portIndex.isEqualTo(c);
      })));
    })

    this.view.portIndex.form.statusChanges.subscribe(() => {
      if (!!this.view.portIndex.form.errors && !!this.view.portIndex.form.errors['error']) {
        this.view.portIndex.form.setValue(this.view.portIndex.form.value, { emitEvent: false });
      }

      this.view.allValid = this.view.portIndex.form.valid;
    })
  }

  private closeModal(affirmative: boolean): void {
    this.view.isOpen = false;
    const output: DeviceInstallationModalOutput = affirmative
      ? {
        affirmative: true,
        installationName: this.view.installName.value,
        portIndex: ByteSequenceCreator.Byte(Number(this.view.portIndex.form.value))
      }
      : { affirmative: false }

    this._decision(output);

    this.view.humanReadableDeviceName = '';
    this.view.allValid = false;
    this.view.portIndex.form.setValue(undefined, { emitEvent: false });
    this.view.installName.setValue(undefined, { emitEvent: false });
    this.view.isOpen = false;
    this._decision = undefined;
  }

  private validateChannelForm(control: AbstractControl): ValidationErrors | null {
    const cn = RegExp(/^[\-0-9\.]+$/).test(`${control.value}`) ? Number(control.value) : Number.NaN;
    if (Number.isInteger(cn)) {
      if (this._channelsInUse.getValue().some(c => c === cn)) {
        return {
          'error': `Port ${cn} is already in use by another device`
        };
      } else if (cn < 0 || cn > 255) {
        return {
          'error': 'Port must be between 0 and 255'
        };
      } else {
        return null;
      }
    } else if (Number.isNaN(cn)) {
      return null;
    } else {
      return {
        'error': 'Port must be an integer'
      };
    }
  }

  private _decision: ((output: DeviceInstallationModalOutput) => void) | undefined = undefined;
  private readonly _channelsInUse = new BehaviorSubject<Array<number>>([]);
}
