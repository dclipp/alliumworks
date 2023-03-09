import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Byte, DeviceBundle, DeviceProfile, DeviceMetadata, ByteSequenceCreator } from '@allium/types';
import { map, filter, distinctUntilChanged, take } from 'rxjs/operators';
import { DeviceBrowserHomeModel } from '../view-models/device-browser/device-browser-home-model';
import { DeviceInfo } from '../view-models/device-manager/device-info';
import { DEVICE_DEFAULT_PREFERRED_DIMENSION } from '../view-models/task-bar/device-panel-descriptor';
import { SessionService } from './session.service';
import { ModalService } from './modal.service';
import { AlliumWorksDeviceMetadata, AlliumWorksDeviceReadme, DeviceInstallationDescriptor } from '@alliumworks/platform';
import * as objectHash from 'object-hash';

@Injectable({
  providedIn: 'root'
})
export class DeviceManagerService {
  private readonly _descriptors = new BehaviorSubject<Array<{
    readonly bundle: DeviceBundle,
    readonly descriptor: DeviceInstallationDescriptor
  }>>([]);

  public installDevice(deviceBundleId: string): Promise<boolean> {
    return new Promise((resolve) => {
      this._sessionService.platform.devices.getBundle(deviceBundleId).then(bundle => {
        if (!!bundle) {
          this._modalService.launchDeviceInstallationModal(
            bundle.metadata.humanReadableDeviceName,
            (decision) => {
              if (decision.affirmative) {
                const descriptor: DeviceInstallationDescriptor = {
                  portIndex: decision.portIndex!,
                  installationTitle: decision.installationName!,
                  clientToHostBufferSize: bundle.profile.clientToHostBufferSize,
                  hostToClientBufferSize: bundle.profile.hostToClientBufferSize
                };

                this._descriptors.pipe(take(1)).subscribe(descriptors => {
                  this._descriptors.next(descriptors.concat([{
                    bundle: bundle,
                    descriptor: descriptor
                  }]));
                })
                resolve(true);
              } else {
                resolve(false);
              }
            });
        } else {
          resolve(true);
        }
      })
    })
  }

  public async addFavorite(bundleId: string): Promise<boolean> {
      return false;
  }
  
  public async removeFavorite(bundleId: string): Promise<boolean> {
      return false;
  }

  public constructor(private _sessionService: SessionService, private _modalService: ModalService) {
    
  }
}
