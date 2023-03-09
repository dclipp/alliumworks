import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { createPanelDescriptor } from 'src/app/view-models/task-bar/panel-descriptor';
import { DeviceManagerService } from 'src/app/services/device-manager.service';
import { ByteSequenceCreator } from '@allium/types';
import { DevicePanelDescriptor, createDevicePanelDescriptor } from 'src/app/view-models/task-bar/device-panel-descriptor';
import { PanelContainerComponent } from '../panel-container/panel-container.component';
import { SessionService } from 'src/app/services/session.service';
import * as objectHash from 'object-hash';
import { DeviceInstancePopupEvent } from 'src/app/view-models/task-bar/device-instance-popup-event';
import { SeparableWindowOwner } from 'src/app/view-models/task-bar/separable-window-owner';

@Component({
  selector: 'aq4w-task-bar',
  templateUrl: './task-bar.component.html',
  styleUrls: ['./task-bar.component.scss']
})
export class TaskBarComponent implements OnInit, AfterViewInit, OnDestroy {
  // private readonly _expansionTriggers = new BehaviorSubject<Array<{ key: string, expand: boolean }>>([]);

  public view = {
    registerExplorerDescriptor: createPanelDescriptor({ title: 'Register Explorer', titleIcon:'(c)abacus2', key:'register-explorer' }),
    memoryExplorerDescriptor: createPanelDescriptor({ title: 'Memory Explorer', titleIcon:'(fa)fas.microchip', key:'memory-explorer' }),
    floatingPlaceholders: new Array<string>(),
    expandedPlaceholders: new Array<string>(),
    emphasizeKeys: new Array<string>(),
    deviceDescriptors: new Array<DevicePanelDescriptor>(),
    // customTitles: new Map<string, string>(),
    deviceTitles: {},
    devicePopupKeys: {} as { [key: string]: boolean | undefined },
    shellOpen: false
  }

  public on = {
    panelFloatingChanged: (key: string, isFloating: boolean) => {
      if (isFloating) {
        this.view.floatingPlaceholders.push(key);
      } else {
        this.view.floatingPlaceholders = this.view.floatingPlaceholders.filter(k => k !== key);
      }
      this._cd.detectChanges();
    },
    panelExpandedChanged: (key: string, isExpanded: boolean) => {
      if (isExpanded) {
        this.view.expandedPlaceholders.push(key);
      } else {
        this.view.expandedPlaceholders = this.view.expandedPlaceholders.filter(k => k !== key);
      }
      this._cd.detectChanges();
    },
    panelIsInSeparateWindowChanged: (key: string) => {
      if (this.view.devicePopupKeys[key] === undefined) {
        this.view.devicePopupKeys[key] = true;
        const panelContainer = this.panelContainers.find(c => c.api.descriptorKey === key);
        if (!!panelContainer) {
          panelContainer.api.setViewState(false);
        }
      } else {
        delete this.view.devicePopupKeys[key];
      }
      this._cd.detectChanges();
    },
    placeholderClicked: (key: string) => {
      if (this.view.devicePopupKeys[key] === undefined) {
        const isExpanded = this.view.expandedPlaceholders.includes(key);
        if (isExpanded) {
          this.view.expandedPlaceholders = this.view.expandedPlaceholders.filter(k => k !== key);
        } else {
          this.view.expandedPlaceholders.push(key);
        }
        this.view.emphasizeKeys = this.view.emphasizeKeys.filter(k => k !== key);
        // this.view.triggerExpansionObservables.registerExplorer.next(!isExpanded);
        const panelContainer = this.panelContainers.find(c => c.api.descriptorKey === key);
        if (!!panelContainer) {
          panelContainer.api.setViewState(!isExpanded);
        }

        this.panelContainers.forEach(pc => pc.api.setForegroundPanel(key));
        this._cd.detectChanges();
      } else {
        const owner = this.separableWindowOwners.find(swo => swo.separableWindowOwnerKey === key);
        if (!!owner) {
          owner.focusSeparateWindow();
        }
        //TODO focus separate
      }
    },
    placeholderRightClicked: (key: string) => {
      const isInSeparateWindow = this.view.devicePopupKeys[key] !== undefined;
      if (isInSeparateWindow) {
        const owner = this.separableWindowOwners.find(swo => swo.separableWindowOwnerKey === key);
        if (!!owner) {
          owner.moveToMainWindow();
        }
        // if (this.view.devicePopupKeys[key] !== undefined) {
        //   delete this.view.devicePopupKeys[key];
        // }
      } else {
        const isExpanded = this.view.expandedPlaceholders.includes(key);
        const isFloating = this.view.floatingPlaceholders.includes(key);
        if (isExpanded && isFloating) {
          // console.log(`rightclick`);
          const panelContainer = this.panelContainers.find(c => c.api.descriptorKey === key);
          if (!!panelContainer) {
            panelContainer.api.recenterInWindow();
          }
          // panelElement.style.left = `${window.innerWidth / 2}px`;
          // panelElement.style.top = `${window.innerHeight / 2}px`;
        }
      }
      return false;
      // this.view.emphasizeKeys = this.view.emphasizeKeys.filter(k => k !== key);
      // // this.view.triggerExpansionObservables.registerExplorer.next(!isExpanded);
      // this.updateExpansionObservable(key, !isExpanded);
      // this._cd.detectChanges();
    },
    applyEmphasis: (key: string, emphasize: boolean) => {
      if (emphasize) {
        // if (!this.view.expandedPlaceholders.includes(key))
        this.view.emphasizeKeys.push(key);
      } else {
        this.view.emphasizeKeys = this.view.emphasizeKeys.filter(k => k !== key);
      }
    },
    toggleShell: () => {
      this.view.shellOpen = !this.view.shellOpen;
      const appBase = document.getElementById('aq4w-app-base');
      if (this.view.shellOpen) {
        appBase.classList.add('show-shell');
      } else {
        appBase.classList.remove('show-shell');
      }
    },
    deviceInstancePopupEvent: (event: DeviceInstancePopupEvent) => {
      // if (this.view.devicePopupKeys[event.key] !== undefined) {
        const extractedKey = event.key.substring(event.key.indexOf(';') + 1);
        if (event.type === 'focusLost') {
          this.view.devicePopupKeys[extractedKey] = false;
        } else if (event.type === 'focusGained') {
          this.view.devicePopupKeys[extractedKey] = true;
        } else if (event.type === 'movedToMainWindow') {
          if (this.view.devicePopupKeys[extractedKey] !== undefined) {
            delete this.view.devicePopupKeys[extractedKey];
            const panelContainer = this.panelContainers.find(c => c.api.descriptorKey === extractedKey);
            if (!!panelContainer) {
              panelContainer.api.setViewState(true);
            }
          }
        }
      // }
    },
    deviceDetached: (descriptorKey: string) => {
      const index = this.view.deviceDescriptors.findIndex(dd => dd.key === descriptorKey);
      if (index > -1) {
        this.view.deviceDescriptors.splice(index, 1);
      }
    }
  }

  constructor(private _cd: ChangeDetectorRef, private _deviceManagerService: DeviceManagerService, private _sessionService: SessionService) { }

  ngOnInit() {
    this._sessionService.platform.devices.deviceInstalled().subscribe(device => {
      if (!!device) {
        this.view.deviceDescriptors.push(createDevicePanelDescriptor({
          titleIcon: '(c)lightbulb2',//TODO bundle.panel.titleIcon,
          key: `${ByteSequenceCreator.Byte(device.portIndex).toString({ radix: 16, padZeroes: true })}.${device.bundleId}`,
          portIndex: ByteSequenceCreator.Byte(device.portIndex),
          bundleId: device.bundleId,
          preferredWidthAmount: device.metadata.preferredWidth.amount,
          preferredWidthUnits: device.metadata.preferredWidth.units,
          preferredHeightAmount: device.metadata.preferredHeight.amount,
          preferredHeightUnits: device.metadata.preferredHeight.units,
          installationTitle: device.installationTitle
        }));
      }
    })
  }

  ngAfterViewInit(): void {
    window['ForceDevTitles'] = () => {
      this.view.deviceTitles = this.getDeviceInstallationTitles(this.view.deviceDescriptors);
    }
    this._sessionService.platform.machine.sessionIsDefined().subscribe(isDefined => {
      this._isSessionDefined = isDefined;
    })

    this._checkDeviceTitlesHandle = window.setInterval(() => {
      const deviceTitles = this.getDeviceInstallationTitles(this.view.deviceDescriptors);
      if (objectHash.MD5(this.view.deviceTitles) !== objectHash.MD5(deviceTitles)) {
        this.view.deviceTitles = deviceTitles;
        this._cd.detectChanges();
        
        window.setTimeout(() => {
          const overflowLevel = this.computeTaskBarOverflowLevel();
          if (overflowLevel === 1) {
            if (!document.body.classList.contains('task-bar-overflow-level-1')) {
              document.body.classList.add('task-bar-overflow-level-1');
            }
          } else if (overflowLevel === 2) {
            if (!document.body.classList.contains('task-bar-overflow-level-2')) {
              document.body.classList.add('task-bar-overflow-level-2');
            }
          } else {
            document.body.classList.remove('task-bar-overflow-level-1', 'task-bar-overflow-level-2');
          }
        }, 750);
      }
    }, 5000);
    
    this._sessionService.platform.devices.deviceInstalled().subscribe(device => {
      // this.updateExpansionObservable(device.instanceId, false);
      // this.view.triggerExpansionObservables[device.instanceId] = this._expansionTriggers.pipe(map(x => x.some(y => y.key === device.instanceId && y.expand)));
      // this.view.deviceDescriptors.push(createDevicePanelDescriptor({
      //   titleIcon: '(c)lightbulb2',//TODO bundle.panel.titleIcon,
      //   key: device.instanceId,
      //   inputChannel: device.inputChannel,
      //   outputChannel: device.outputChannel,
      //   bundleId: device.bundleId,
      //   preferredWidthAmount: device.metadata.preferredWidth.amount,
      //   preferredWidthUnits: device.metadata.preferredWidth.units,
      //   preferredHeightAmount: device.metadata.preferredHeight.amount,
      //   preferredHeightUnits: device.metadata.preferredHeight.units,
      //   installationTitle: device.installationTitle
      // }));
      // this.view.customTitles.set(device.instanceId, this.getDeviceCustomTitle(device.deviceInfo.name, DeviceState.Null));
    })

    // window['testdeviceinit'] = () => {
    //   this._deviceManagerService.addDevice(ByteSequenceCreator.Byte(0), { html: atob(DEVMGRSVC_TESTDATA.NEWDATA_HTML1), scripts: [{
    //     name: 'script.js',
    //     sourceCode: atob(DEVMGRSVC_TESTDATA.NEWDATA_SCRIPT1)
    //   }], panel: { title: 'TestTitle', titleIcon: 'document' }, profile: {
    //     receivingPacketSize: 1,
    //     receivingBufferSize: 16,
    //     transmissionBufferSize: 16,
    //     transmissionPacketSize: 1,
    //     deviceIdentifier: 2389
    //   } });
    // }
  }

  ngOnDestroy(): void {
    this.cleanupDeviceContextWindowObjects();
    if (this._checkDeviceTitlesHandle > -1) {
      window.clearInterval(this._checkDeviceTitlesHandle);
    }
  }

  // private updateExpansionObservable(key: string, expand: boolean): void {
  //   const current = this._expansionTriggers.getValue();
  //   const index = current.findIndex(x => x.key === key);
  //   if (index > -1) {
  //     current[index] = { key: key, expand: expand };
  //   } else {
  //     current.push({ key: key, expand: expand });
  //   }
  //   this._expansionTriggers.next(current);
  // }

  private dispatchDeviceDestroy(shadowRoot: ShadowRoot, cause: 'instruction' | 'device deleted by user' | 'session ended'): void {
    const ideInterface = shadowRoot.getElementById('ide-interface');
    const attachEvent = new CustomEvent('device_detached', { detail: { cause: cause } });
    ideInterface.dispatchEvent(attachEvent);
  }

  private cleanupDeviceContextWindowObjects(): void {
    window['deviceContext'] = undefined;
    window['_deviceContextObjects'] = undefined;
  }

  // private getDeviceCustomTitle(descriptorTitle: string, state: DeviceState): string {
  //   let stateText = 'Null';
  //   switch (state) {
  //     case DeviceState.Busy:
  //       stateText = 'Busy';
  //       break;
  //     case DeviceState.Ready:
  //       stateText = 'Ready';
  //       break;
  //     case DeviceState.Unavailable:
  //       stateText = 'Unavailable';
  //       break;
  //   }

  //   return `${descriptorTitle} (${stateText})`;
  // }

  private getDeviceInstallationTitles(installedDevices: Array<DevicePanelDescriptor>): { readonly [key: string]: string } {
    const statuses = this._sessionService.platform.devices.getStatuses();

    const titles: { [key: string]: string } = {};
    
    installedDevices.forEach(ind => {
      const installationKey = `${ind.portIndex.toString({ radix: 16, padZeroes: true })}.${ind.bundleId}`;
      const status = statuses.find(s => s.installationKey === installationKey);
      if (!!status) {
        titles[ind.key] = status.installationTitle;
      } else {
        titles[ind.key] = 'unknown'; // TODO ??
      }
    });

    return titles;
  }

  private computeTaskBarOverflowLevel(): 0 | 1 | 2 {
    let level: 0 | 1 | 2 = 0;
    const tbContainers = document.getElementsByClassName('task-bar-container');
    const container = tbContainers.length > 0 ? tbContainers.item(0) : null;
    if (!!container) {
      if (container.clientHeight !== container.scrollHeight) {
        level = 1;// TODO
      }
    }

    return level;
  }

  @ViewChildren(PanelContainerComponent)
  public panelContainers: QueryList<PanelContainerComponent>;
  
  @ViewChildren('swo')
  public separableWindowOwners: QueryList<SeparableWindowOwner>;

  private _checkDeviceTitlesHandle = -1;
  private _isSessionDefined = false;
  private readonly _instantiatedDeviceKeys = new Array<string>();
}
