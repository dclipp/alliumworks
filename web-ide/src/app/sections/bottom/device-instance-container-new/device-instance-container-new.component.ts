import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DevicePanelDescriptor } from 'src/app/view-models/task-bar/device-panel-descriptor';
import { Byte, ByteSequenceCreator, DeviceProfile, DynamicByteSequence, RealNumber } from '@allium/types';
import { debounceTime, distinctUntilChanged, map, take, takeUntil } from 'rxjs/operators';
import { DeviceManagerService } from 'src/app/services/device-manager.service';
import { PopperContent } from 'ngx-popper';
import { RadixHelper } from 'src/app/utilities/radix-helper';
import { ModalService } from 'src/app/services/modal.service';
import { SessionService } from 'src/app/services/session.service';
import { IoPortStatus } from '@allium/arch';
import { FormControl } from '@angular/forms';
import { AlliumWorksDeviceBundle } from '@alliumworks/platform';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { AgentService } from 'src/app/services/agent.service';
import { DeviceInstancePopupEvent } from 'src/app/view-models/task-bar/device-instance-popup-event';
import { SeparableWindowOwner } from 'src/app/view-models/task-bar/separable-window-owner';

declare const IO_HTML_INTERFACE: string;

@Component({
  selector: 'aq4w-device-instance-container-new',
  templateUrl: './device-instance-container-new.component.html',
  styleUrls: ['./device-instance-container-new.component.scss']
})
export class DeviceInstanceContainerNEWComponent extends SeparableWindowOwner implements OnInit, OnDestroy {

  @ViewChild('frameContainer')
  frameContainer: ElementRef;

  @ViewChild('iStatePopover')
  iStatePopover: PopperContent;

  // @ViewChild('iSendCommandPopover')
  // iSendCommandPopover: PopperContent;
  
  @Input('descriptor')
  public set descriptor(descriptor: DevicePanelDescriptor) {
    if (!!descriptor && !!descriptor.bundleId) {
      this._descriptor = descriptor;

      this._sessionService.platform.devices.getBundle(descriptor.bundleId).then(bundle => {
        if (!!bundle) {
          console.log(`dev dim = ${bundle.metadata.preferredWidth.amount}${bundle.metadata.preferredWidth.units} x ${bundle.metadata.preferredHeight.amount}${bundle.metadata.preferredHeight.units}`)
          let installationTitle = descriptor.installationTitle;
          if (!(!!installationTitle)) {
            const titleChannelNumeric = descriptor.portIndex.toString({ radix: 10, padZeroes: false });

            installationTitle = `${titleChannelNumeric}: ${bundle.metadata.humanReadableDeviceName}`;
          }
          this.initDevice(descriptor.portIndex, bundle, installationTitle);
        }
      })
    }
  }

  @Input('isInSeparateWindow')
  public set isInSeparateWindow(isInSeparateWindow: boolean) {
    this._displayInSeparateWindow.next(isInSeparateWindow);
  }
  
  @Output('popupEvent')
  public readonly popupEvent = new EventEmitter<DeviceInstancePopupEvent>();
  
  @Output('detached')
  public readonly detached = new EventEmitter<void>();

  public view = {
    profile: {
      primaryDeviceIdentifier: ByteSequenceCreator.QuadByte(0),
      secondaryDeviceIdentifier: ByteSequenceCreator.QuadByte(0),
      input: {
        bufferLength: -1,
      },
      output: {
        bufferLength: -1,
      },
      isLoaded: false
    },
    currentStatus: 'Null',
    transmissionRouteOpts: {
      opts: [
        {
          label: 'Machine',
          value: 'input',
          tooltip: 'Transmit a packet from the machine to this device'
        }, {
          label: 'Device',
          value: 'output',
          tooltip: 'Transmit a packet from this device to the machine'
        }],
      initial: 'input'
    },
    // transmissionPacket2: {
    //   input: {
    //     bytes: new Array<Byte>(),
    //     radix: 10 as 2 | 10 | 16,
    //     sequenceLength: 1,
    //   },
    //   output: {
    //     bytes: new Array<Byte>(),
    //     radix: 10 as 2 | 10 | 16,
    //     sequenceLength: 1,
    //   },
    //   outputForm: new FormControl()
    // },
    fromMachineToDevicePacket: new FormControl(),
    fromDeviceToMachinePacket: new FormControl(),
    selectedTransmissionDirection: 'input',
    transmissionPacket: {
      byte1: ByteSequenceCreator.Byte(0),
      byte2: ByteSequenceCreator.Byte(0),
      byte3: ByteSequenceCreator.Byte(0),
      byte4: ByteSequenceCreator.Byte(0),
      radix: 10 as 2 | 10 | 16,
      sequenceLength: 1,
      visibleByteNumbers: new Array<string>(),
      currentTransmissionOption: 'input'
    },
    transmissionError: false,
    attachedToPortIndex: null as Byte | null,
    attachedToPortIndexRadix: 10 as 2 | 10 | 16,
    sessionIsDefined: false,
    disableTransmissionControls: false,
    humanReadableName: '',
    bundleId: ''
  }

  public on = {
    changeTransmissionPacketRadix: () => {
      this.view.transmissionPacket.radix = RadixHelper.getNextRadix(this.view.transmissionPacket.radix);
    },
    transmissionRouteOptionChanged: (selection: string) => {
      console.log(`selectedTransmissionDirection=${selection}`)
      this.view.selectedTransmissionDirection = selection;
      this.view.transmissionPacket.currentTransmissionOption = selection;
      this.view.transmissionError = false;
      this.view.disableTransmissionControls = !this.view.sessionIsDefined && this.view.transmissionPacket.currentTransmissionOption === 'output';
      this.updateVisibleByteNumbers();
    },
    transmit: (direction: 'input' | 'output') => {
      if (direction === 'input') {
        this._sessionService.platform.devices.write(this._portIndex, this.view.fromMachineToDevicePacket.value);
        if (!!this._hookOnDataReceived) {
          this._hookOnDataReceived();
        }
      } else if (direction === 'output') {
        this._sessionService.platform.devices.testWriteToMachine(this._portIndex, this.view.fromDeviceToMachinePacket.value);
        // if (!!this._hookOnDataReceived) {
        //   this._hookOnDataReceived();
        // }
      }
      // if (this.view.transmissionPacket.currentTransmissionOption === 'input') {
      //   let seq: DynamicByteSequence;
      //   // if (this.view.profile.inputBytesPerPacket === 4) {
      //   //   seq = ByteSequenceCreator.QuadByte([
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte1),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte2),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte3),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte4)
      //   //   ]);
      //   // } else if (this.view.profile.inputBytesPerPacket === 3) {
      //   //   seq = ByteSequenceCreator.QuadByte([
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte1),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte2),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte3)
      //   //   ]);
      //   // } else if (this.view.profile.inputBytesPerPacket === 2) {
      //   //   seq = ByteSequenceCreator.QuadByte([
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte1),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte2)
      //   //   ]);
      //   // } else {
      //   //   seq = this.view.transmissionPacket.byte1.clone();
      //   // }
      //   // this.view.transmissionError = !this._sessionService.devkit.machineService.devices.transmitPacketAsMachine(this._descriptor.attachedToPort, seq);
      // } else {
      //   let seq: DynamicByteSequence;
      //   // if (this.view.profile.outputBytesPerPacket === 4) {
      //   //   seq = ByteSequenceCreator.QuadByte([
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte1),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte2),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte3),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte4)
      //   //   ]);
      //   // } else if (this.view.profile.outputBytesPerPacket === 3) {
      //   //   seq = ByteSequenceCreator.QuadByte([
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte1),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte2),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte3)
      //   //   ]);
      //   // } else if (this.view.profile.outputBytesPerPacket === 2) {
      //   //   seq = ByteSequenceCreator.QuadByte([
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte1),
      //   //     ByteSequenceCreator.Unbox(this.view.transmissionPacket.byte2)
      //   //   ]);
      //   // } else {
      //   //   seq = this.view.transmissionPacket.byte1.clone();
      //   // }
      //   // this.view.transmissionError = !this._sessionService.devkit.machineService.devices.transmitPacketAsDevice(this._descriptor.attachedToPort, seq);
      // }
    },
    seqEditorVisibilityChanged: (byteNum: string, event: { show: boolean, setValue?: (value: DynamicByteSequence) => void }) => {
      // if (event.show && !!event.setValue) {
      //   event.setValue(this.view.transmissionPacket[`byte${byteNum}`]);
      // }
    },
    seqEditorValueChanged: (byteNum: string, value: DynamicByteSequence) => {
      // this.view.transmissionPacket[`byte${byteNum}`] = value.clone() as Byte;
    },
    changeChannelRadix: () => {
      this.view.attachedToPortIndexRadix = RadixHelper.getNextRadix(this.view.attachedToPortIndexRadix);
    },
    beginDetach: () => {
      this._modalService.launchModal(
        'Detach Device',
        `^Are you sure you want to detach '<strong>${this._descriptor.installationTitle}</strong>' from <strong>port ${this._descriptor.portIndex.toString({ radix: 10 })}</strong>?^`,
        (affirmative) => {
          if (affirmative) {
            try {
              this.getIoClientPublicInterface().beginDetach().then(showConfirmationPrompt => {
                if (showConfirmationPrompt) {
                  this._modalService.launchModal(
                    'Detach Device',
                    'Do you want to save ',//TODO!!! yes,no,cancel???
                    (confirmationAffirmative) => {
                      if (confirmationAffirmative) {
                        this.getIoClientPublicInterface().finishDetachSavePersistent().then(persistentData => {
                          if (!!persistentData) {
                            //TODO!!! save
                          }

                          this._sessionService.platform.io.freePort(ByteSequenceCreator.Unbox(this._descriptor.portIndex));
                          this.detached.emit();
                        });
                      } else {
                        this._sessionService.platform.io.freePort(ByteSequenceCreator.Unbox(this._descriptor.portIndex));
                        this.detached.emit();
                      }
                    }
                  )
                } else {
                  this._sessionService.platform.io.freePort(ByteSequenceCreator.Unbox(this._descriptor.portIndex));
                  this.detached.emit();
                }
              });
            } catch (ex) { }
          }
        },
        {
          yes: 'Detach',
          no: 'Cancel'
        },
        true)
    }
  }

  public get separableWindowOwnerKey(): string {
    return !!this._descriptor ? this._descriptor.key : '';
  }

  public moveToMainWindow(): void {
    if (!!this._separateWindow) {
      this._separateWindow.close();
      this._displayInSeparateWindow.next(false);
      this.popupEvent.emit({
        type: 'movedToMainWindow',
        key: this._descriptor.key
      });
    }
  }

  public focusSeparateWindow(): void {
    if (!!this._separateWindow) {
      this._separateWindow.focus();
    }
  }

  constructor(private _sessionService: SessionService, private _deviceManagerService: DeviceManagerService, private _modalService: ModalService, private _agentService: AgentService) {
    super();
    this._frameId = `di_frame_${Math.random().toString().substring(3)}`;
    this._sessionService.platform.machine.sessionIsDefined().pipe(takeUntil(this.destroyed)).subscribe(sessionIsDefined => {
      this.view.sessionIsDefined = sessionIsDefined;
      this.view.disableTransmissionControls = !sessionIsDefined && this.view.transmissionPacket.currentTransmissionOption === 'output';
    })
  }

  ngOnInit() {
    // window['DVLGTake1'] = (channel, cb) => {
    //   this._sessionService.devkit.machineService.devices.logListen(ByteSequenceCreator.Byte(channel)).pipe(take(1)).subscribe(e => {
    //     cb(e)
    //   })
    // }
    window['DVGETSTATE'] = (channel) => {
      const s = this._sessionService.platform.devices.getStatus(ByteSequenceCreator.Byte(channel));
      if (!!s) {
        console.log(JSON.stringify(s, null, 2));
      } else {
        console.log('(null)')
      }
    }
    
    window['TSTDEVLOG'] = [];

    this.view.fromDeviceToMachinePacket.valueChanges.subscribe(vc=> {
      console.log('outputpackets Changed:');
      vc.forEach(b => console.log(b.toString()))
    })

    window['TSTXMPI'] = () => {
      this.view.fromDeviceToMachinePacket.setValue([]);
    }

    this._sessionService.platform.machine.currentMachineState()
      .pipe(takeUntil(this.destroyed), map(x => x.isComputerPoweredOn), distinctUntilChanged())
      .subscribe(isComputerPoweredOn => {
        if (!!this._emitComputerStateEvent) {
          this._emitComputerStateEvent(isComputerPoweredOn);
        }
      })

    this._agentService.windowResized().pipe(debounceTime(1000), takeUntil(this.destroyed))
      .subscribe((windowSize) => {
        if (!!this._emitPresentationAreaEvent) {
          this._emitPresentationAreaEvent({
            widthPx: windowSize.w,
            heightPx: windowSize.h
          });
        }
      })

    this._displayInSeparateWindow.pipe(distinctUntilChanged(), takeUntil(this.destroyed))
      .subscribe((displayInSeparateWindow) => {
        const hasSeparateWindow = !!this._popupName;
        if (displayInSeparateWindow !== hasSeparateWindow) {
          if (displayInSeparateWindow) { // in panel --> separate window
            const cpi = this.getIoClientPublicInterface();
            cpi.saveSessionData().then(data => {
              this._deviceSessionData = data;
              this._popupFwdEvtType = `_devinstance_fwd_evt__${this._descriptor.portIndex.toString({ radix: 10, padZeroes: true })}`;
              window[this._popupFwdEvtType] = (event: Event) => {
                this._handleContentDocEvent(event);
              }
              this._popupName = this.launchDevicePopup();
              if (!!this._emitMovedToSeparateWindowEvent) {
                this._emitMovedToSeparateWindowEvent();
              }

              this.waitForSeparateWindowContentDoc(() => {
                this.getIoClientPublicInterface().restoreSessionData(this._deviceSessionData).then(success => {
                  if (!success) {
                    this.launchFailureModal('Alert', 'Failed to restore session data');
                  }
                });
              });
            });
          } else { // separate window --> in panel
            const cpi = this.getIoClientPublicInterface();
            cpi.saveSessionData().then(data => {
              this._deviceSessionData = data;
              this._popupName = '';
              if (!!this._popupGainedFocusSubscription) {
                this._popupGainedFocusSubscription.unsubscribe();
                this._popupGainedFocusSubscription = null;
              }
              if (!!this._popupLostFocusSubscription) {
                this._popupLostFocusSubscription.unsubscribe();
                this._popupLostFocusSubscription = null;
              }
              if (!!this._popupFwdEvtType && !!window[this._popupFwdEvtType]) {
                delete window[this._popupFwdEvtType];
              }
              this._popupFwdEvtType = null;
              if (!!this._emitMovedToMainWindowEvent) {
                this._emitMovedToMainWindowEvent();
              }
              if (!!this._separateWindow) {
                this._separateWindow = null;
              }

              const nextCpi = this.getIoClientPublicInterface();
              nextCpi.restoreSessionData(this._deviceSessionData).then(success => {
                if (!success) {
                  this.launchFailureModal('Alert', 'Failed to restore session data');
                }
              });
            });
          }
        }
      })
  }

  ngOnDestroy() {
    if (!!this._popupGainedFocusSubscription) {
      this._popupGainedFocusSubscription.unsubscribe();
      this._popupGainedFocusSubscription = null;
    }
    if (!!this._popupLostFocusSubscription) {
      this._popupLostFocusSubscription.unsubscribe();
      this._popupLostFocusSubscription = null;
    }

    if (!!this._emitDeviceRemovedEvent) {
      this._emitDeviceRemovedEvent();
    }

    if (!!this._popupFwdEvtType && !!window[this._popupFwdEvtType]) {
      delete window[this._popupFwdEvtType];
    }
  }
  
  private get frameElement(): HTMLIFrameElement {
    return document.getElementById(this._frameId) as HTMLIFrameElement;
  }

  // private generateSrcDoc(bundle: DeviceBundle): string {
  //   const styleElements = `<style>${bundle.stylesheet}</style>`;
  //   const scriptElements = `<script>${bundle.script}</script>`;
  //   const linkScript = '<script>function $emitHooks() { document.dispatchEvent(new CustomEvent(\'init-device\', { detail: $deviceHooks }))}</script>';
  //   const body = `<div id="ide-link" onclick="$emitHooks()"></div>${bundle.html}`;
  //   const page = `<html><head>${styleElements}\n${scriptElements}${linkScript}</head><body>${body}</body></html>`;
  //   return page;
  // }
  private generateSrcDocNEW(bundle: AlliumWorksDeviceBundle, portIndex: number): void {//string {
    const styleElements = `<style>${atob(bundle.stylesheet)}</style>`;
    const clientInterfaceScript = `${IO_HTML_INTERFACE}\nvar _IO_INTERFACE = _iod_create_html_interface(${portIndex})\n`;
    const clientPublicInterfaceScript = `var $IOPI_HANDLE_RESTORE_SESSION = null;\nvar $IOPI_HANDLE_INIT_INSTANCE = null;\nvar $IOPI_CHECK_PENDING_DATA_STATE = null;\nvar $IOPI_HANDLE_PRE_DETACH_SAVE = null;\nvar $IOPI_GET_SESSION_DATA = null;\n`;
    const bundleScript = atob(bundle.script).replace('var _IO_INTERFACE;', '');
    const scriptElements = `<script>${clientInterfaceScript}${clientPublicInterfaceScript}${bundleScript}</script>`;
    const body = atob(bundle.html);
    const page = `<html><head>${this._POPUP_PLACEHOLDER}${styleElements}\n${scriptElements}</head><body>${body}</body></html>`;

    this._blobName = `_deviceinstance_${this._descriptor.portIndex.toString({ radix: 10, padZeroes: true })}_${this._descriptor.key}`;
    this._srcDoc = page;
    this._srcDocBlob = new File([page], this._blobName, { type: 'text/html' });
    this._srcDocUrl = URL.createObjectURL(this._srcDocBlob);

    // return page;
  }

  private initDevice(portIndexByte: Byte, bundle: AlliumWorksDeviceBundle, installationTitle?: string): void {
    this.updateProfileModel(bundle.profile);
    this.view.attachedToPortIndex = portIndexByte;
    this.view.humanReadableName = bundle.metadata.humanReadableDeviceName;
    this.view.bundleId = bundle.bundleId;

    const inputBytes = new Array<Byte>();
    if (bundle.profile.hostToClientBufferSize > 0) {
      for (let i = 0; i < bundle.profile.hostToClientBufferSize; i++) {
        inputBytes.push(ByteSequenceCreator.Byte(0));
      }
    }
    this.view.fromMachineToDevicePacket.setValue(inputBytes);

    const outputBytes = new Array<Byte>();
    if (bundle.profile.clientToHostBufferSize > 0) {
      for (let i = 0; i < bundle.profile.clientToHostBufferSize; i++) {
        outputBytes.push(ByteSequenceCreator.Byte(0));
      }
    }
    this.view.fromDeviceToMachinePacket.setValue(outputBytes);

    this._visibleByteNumberHelper.get = (isInput) => {
      let bpp = 0;
      if (isInput) {
        bpp = bundle.profile.hostToClientBufferSize;
      } else {
        bpp = bundle.profile.clientToHostBufferSize;
      }

      const arr = new Array<string>();
      for (let i = 1; i <= bpp; i++) {
        arr.push(bpp.toString());
      }
      return arr;
    }
    this.updateVisibleByteNumbers();

    const frame = document.createElement('iframe');
    frame.id = this._frameId;
    frame.classList.add('device-frame');
    frame.sandbox.add('allow-same-origin', 'allow-scripts');
    // frame.srcdoc = this.generateSrcDoc(bundle);
    const portIndex = ByteSequenceCreator.Unbox(portIndexByte);
    // this._sessionService.platform.io.usePort(
    //   portIndex,
    //   bundle.profile.clientToHostBufferSize,
    //   bundle.profile.hostToClientBufferSize
    // );
    this.generateSrcDocNEW(bundle, portIndex);
    frame.src = this._srcDocUrl;
    this.frameContainer.nativeElement.appendChild(frame);
    // this.tryLink(inputChannel, outputChannel, bundle, 0, installationTitle);
    this.tryLink2(portIndex, bundle, 0, installationTitle);
  }

  // private tryLink(inputChannel: Byte | null, outputChannel: Byte | null, bundle: DeviceBundle, attempt: number, installationTitle?: string): void {
  //   const cd = this.frameElement.contentDocument;
  //   const link = !!cd ? cd.getElementById('ide-link') : undefined;
  //   // if (!!this._detached) {
  //   //   this._detached.next();
  //   //   this._detached = new Subject<void>();
  //   // }

  //   if (!!cd && !!link) {
  //     cd.addEventListener('init-device', (event) => {
  //       console.log(`received init-device`);
  //       // this._sessionService.platform.devices.install(bundle.bundleId, {
  //       //   input: inputChannel,
  //       //   output: outputChannel,
  //       //   installationTitle: installationTitle
  //       // }, bundle.profile, event['detail']);

  //       // let hookOnAttachedOrDetached: ((delegate: IoDelegate | false) => void) | undefined = undefined;
  //       this._hookOnDataReceived = () => {
  //         event['detail'].onDataReceived();
  //       }
  //       // const hookOnInstalled(byteSequenceCreator: typeof ByteSequenceCreator, realNumber: typeof RealNumber, deviceLog: { write(entry: string): void }, reSync: (state: IoSyncStateInput) => void): void;
  //       // const hookOnOutOfSync(): void;
  //       // const hookSync(then: (state: IoSyncStateInput) => void): void;

  //       // onInstalled(byteSequenceCreator: typeof ByteSequenceCreator, realNumber: typeof RealNumber, deviceLog: { write(entry: string): void }, reSync: (state: IoSyncStateInput) => void): void;
  //       this._sessionService.platform.devices.provideHooks(outputChannel || inputChannel, {
  //         onAttachedOrDetached: event['detail'].onAttachedOrDetached,
  //         onDataReceived: event['detail'].onDataReceived,
  //         onInstalled: (byteSequenceCreator, realNumber, deviceLog, reSync) => {
  //           this._hookReSync = (state) => {
  //             return reSync(state);
  //           };

  //           return event['detail'].onInstalled(byteSequenceCreator, realNumber, deviceLog, reSync);
  //         },
  //         onOutOfSync: event['detail'].onOutOfSync,
  //         sync: event['detail'].sync
  //       });

        
  //       // this._sessionService.platform.devices.provideHooks(outputChannel || inputChannel, event['detail']);
  //       this._outputChannel = !!outputChannel ? outputChannel.clone() : null;
  //       this._inputChannel = !!inputChannel ? inputChannel.clone() : null;
  //     })
  //     link.click();
  //   } else if (attempt < this._MAX_ATTEMPT_COUNT) {
  //     window.setTimeout(() => {
  //       this.tryLink(inputChannel, outputChannel, bundle, attempt + 1, installationTitle);
  //     }, 300);
  //   }
  // }

  private tryLink2(portIndex: number, bundle: AlliumWorksDeviceBundle, attempt: number, installationTitle?: string): void {
    const cd = this.frameElement.contentDocument;
    const link = !!cd ? cd.getElementById('$device-ready-ind') : undefined;

    if (!!cd && !!link) {
      const portStatus = this._sessionService.platform.io.getPortStatus(portIndex);
      let portStatusText = '';
      switch (portStatus) {
        case IoPortStatus.Null:
          portStatusText = 'Null';
          break;
        case IoPortStatus.Reserved:
          portStatusText = 'Reserved';
          break;
        case IoPortStatus.FullDuplex:
          portStatusText = 'Full Duplex';
          break;
        case IoPortStatus.ClientWritable:
          portStatusText = 'Client Writable';
          break;
        case IoPortStatus.HostWritable:
          portStatusText = 'Host Writable';
          break;
      }
      this.view.currentStatus = portStatusText;

      this._handleContentDocEvent = (event) => {
        const eventDetail = (event as any).detail;
        let responseText = '';

        if (eventDetail.ioEventType === 'clientbuffersize') {
          try {
            responseText = this._sessionService.platform.io.getPort(portIndex).getClientBufferSize().toString();
          } catch (ex) { }
        } else if (eventDetail.ioEventType === 'clientreadablelength') {
          try {
            responseText = this._sessionService.platform.io.getPort(portIndex).getClientReadableLength().toString();
          } catch (ex) { }
        } else if (eventDetail.ioEventType === 'clientwritablelength') {
          try {
            responseText = this._sessionService.platform.io.getPort(portIndex).getClientWritableLength().toString();
          } catch (ex) { }
        } else if (eventDetail.ioEventType === 'flushasclient') {
          try {
            this._sessionService.platform.io.getPort(portIndex).flushAsClient();
            responseText = 'true';
          } catch (ex) {
            responseText = 'false';
          }
        } else if (eventDetail.ioEventType === 'clearasclient') {
          try {
            this._sessionService.platform.io.getPort(portIndex).clearAsClient();
            responseText = 'true';
          } catch (ex) {
            responseText = 'false';
          }
        } else if (eventDetail.ioEventType === 'readasclient') {
          try {
            responseText = this._sessionService.platform.io.getPort(portIndex).readAsClient().toString({ radix: 10, padZeroes: false });
          } catch (ex) { }
        } else if (eventDetail.ioEventType === 'writeasclient') {
          try {
            const ok = this._sessionService.platform.io.getPort(portIndex).writeAsClient(ByteSequenceCreator.Byte(Number.parseInt(eventDetail.value, 10)));
            responseText = ok ? 'true' : 'false';
          } catch (ex) {
            responseText = 'false';
          }
        } else if (eventDetail.ioEventType === 'writetolog') {
          try {
            this._sessionService.platform.io.getPort(portIndex).writeToLog(eventDetail.message);
            responseText = 'true';
          } catch (ex) { }
        } else if (eventDetail.ioEventType === 'writesessiondata') {
          try {
            if (eventDetail.sessionData !== undefined && eventDetail.sessionData !== null && typeof eventDetail.sessionData === 'string') {
              this._deviceSessionData = eventDetail.sessionData;
              responseText = 'true';
            } else {
              responseText = 'false';
            }
          } catch (ex) {
            responseText = 'false';
          }
        } else if (eventDetail.ioEventType === 'getportstatus') {
          try {
            const ps = this._sessionService.platform.io.getPortStatus(portIndex);
            switch (ps) {
              case IoPortStatus.Null:
                responseText = 'Null';
                break;
              case IoPortStatus.Reserved:
                responseText = 'Reserved';
                break;
              case IoPortStatus.FullDuplex:
                responseText = 'FullDuplex';
                break;
              case IoPortStatus.ClientWritable:
                responseText = 'ClientWritable';
                break;
              case IoPortStatus.HostWritable:
                responseText = 'HostWritable';
                break;
              default:
                responseText = 'Null';
            }
          } catch (ex) { }
        }
    
        const responseEvt = new CustomEvent('iodi_h2c', {
          detail: {
            eventId: eventDetail.eventId,
            ioEventType: eventDetail.ioEventType,
            ioPortIndex: eventDetail.ioPortIndex,
            responseText: responseText
          }
        });
        cd.dispatchEvent(responseEvt);
      };
      cd.addEventListener('iodi_c2h', (event) => {
        this._handleContentDocEvent(event);
      });

      this._emitComputerStateEvent = (isPoweredOn) => {
        const listenerEvt = new CustomEvent('iodi_lnr', {
          detail: {
            listenerEventType: 'computerstatechanged',
            ioPortIndex: portIndex,
            callbackData: isPoweredOn
          }
        });
        cd.dispatchEvent(listenerEvt);
      }
      this._emitDeviceRemovedEvent = () => {
        const listenerEvt = new CustomEvent('iodi_lnr', {
          detail: {
            listenerEventType: 'deviceremoved',
            ioPortIndex: portIndex,
            callbackData: null
          }
        });
        cd.dispatchEvent(listenerEvt);
      }
      this._emitPresentationAreaEvent = (area) => {
        const listenerEvt = new CustomEvent('iodi_lnr', {
          detail: {
            listenerEventType: 'presentationareachanged',
            ioPortIndex: portIndex,
            callbackData: area
          }
        });
        cd.dispatchEvent(listenerEvt);
      }
      this._emitMovedToSeparateWindowEvent = () => {
        const listenerEvt = new CustomEvent('iodi_lnr', {
          detail: {
            listenerEventType: 'movedtoseparatewindow',
            ioPortIndex: portIndex,
            callbackData: null
          }
        });
        cd.dispatchEvent(listenerEvt);
      }
      this._emitMovedToMainWindowEvent = () => {
        const listenerEvt = new CustomEvent('iodi_lnr', {
          detail: {
            listenerEventType: 'movedtomainwindow',
            ioPortIndex: portIndex,
            callbackData: null
          }
        });
        cd.dispatchEvent(listenerEvt);
      }

      window.setTimeout(() => {
        this.emitInitialListenerEvents();
      }, 750);

      //TODO restorePersistentData !!!
    } else if (attempt < this._MAX_ATTEMPT_COUNT) {
      window.setTimeout(() => {
        this.tryLink2(portIndex, bundle, attempt + 1, installationTitle);
      }, 300);
    }
  }

  private updateVisibleByteNumbers(): void {
    this.view.transmissionPacket.visibleByteNumbers = this._visibleByteNumberHelper.get(this.view.transmissionPacket.currentTransmissionOption === 'input');
  }

  private updateProfileModel(profile: DeviceProfile): void {
    this.view.profile.primaryDeviceIdentifier = ByteSequenceCreator.QuadByte(ByteSequenceCreator.Unbox(profile.primaryDeviceIdentifier)),
    this.view.profile.secondaryDeviceIdentifier = ByteSequenceCreator.QuadByte(ByteSequenceCreator.Unbox(profile.secondaryDeviceIdentifier)),
    this.view.profile.input.bufferLength = profile.hostToClientBufferSize > 0 ? profile.hostToClientBufferSize : -1;
    this.view.profile.output.bufferLength = profile.clientToHostBufferSize > 0 ? profile.clientToHostBufferSize : -1;
    this.view.profile.isLoaded = true;
  }

  private emitInitialListenerEvents(): void {
    combineLatest([
      this._sessionService.platform.machine.currentMachineState().pipe(take(1)),
      this._agentService.windowResized().pipe(take(1))
    ]).pipe(take(1)).subscribe(([currentMachineState, windowSize]) => {
      this._emitComputerStateEvent(currentMachineState.isComputerPoweredOn);
      this._emitPresentationAreaEvent({
        widthPx: windowSize.w,
        heightPx: windowSize.h
      });

      this.getIoClientPublicInterface().restoreSessionData(this._deviceSessionData).then(success => {
        if (!success) {
          this.launchFailureModal('Alert', 'Failed to restore session data');
        }
      });
    })
  }

  private launchDevicePopup(): string {
    const popupName = `dev__${this._descriptor.portIndex.toString({ radix: 10, padZeroes: true })}_;${this._descriptor.key}`;
    const portIndexNumeric = ByteSequenceCreator.Unbox(this._descriptor.portIndex);

    const psFocusGainedListener = 'window.addEventListener(\'focus\', function (event) {'
      + 'const gainedEvent = new CustomEvent(\'' + AgentService.CSTEVT_POPUP_FOCUS_GAINED + '\', {'
      + ' detail: {'
      + '  popupKey: \'' + popupName + '\''
      + ' }'
      + '});'
      + 'window.opener.dispatchEvent(gainedEvent);'
    + '});\n';
    const psFocusLostListener = 'window.addEventListener(\'blur\', function (event) {'
      + 'const lostEvent = new CustomEvent(\'' + AgentService.CSTEVT_POPUP_FOCUS_LOST + '\', {'
      + ' detail: {'
      + '  popupKey: \'' + popupName + '\''
      + ' }'
      + '});'
      + 'window.opener.dispatchEvent(lostEvent);'
    + '});\n';
    const psWindowResizeListener = 'window.addEventListener(\'resize\', function (event) {'
      + 'const listenerEvt = new CustomEvent(\'iodi_lnr\', {'
      + '  detail: {'
      + '    listenerEventType: \'presentationareachanged\','
      + '    ioPortIndex: ' + portIndexNumeric.toString() + ','
      + '    callbackData: {'
      + '      widthPx: window.innerWidth,'
      + '      heightPx: window.innerHeight'
      + '    }'
      + '  }'
      + '});'
      + 'document.dispatchEvent(listenerEvt);'
    + '});\n';
    // const psInterfaceEventForwarder = 'window.setTimeout(function () {'
    //   + 'window.forwarderName = \'' + this._popupFwdEvtType + '\';'
    //   + 'document.getElementById(\'docframe\').contentDocument.addEventListener(\'iodi_c2h\', function (event) {'
    //   + 'window.opener[window.forwarderName](event);'
    //   + 'document.body.innerHTML += \'FORWARDED EVENT\''
    //   + '});\n'
    // + '}, 750)\n';
    const psInterfaceEventForwarder = 'window.forwarderName = \'' + this._popupFwdEvtType + '\';'
      + 'document.addEventListener(\'iodi_c2h\', function (event) {'
      + 'window.opener[window.forwarderName](event);'
      + '});\n';
    const psInitialMovedEmitter = 'window.setTimeout(function () {'
    + '  const listenerEvt = new CustomEvent(\'iodi_lnr\', {'
    + '    detail: {'
    + '      listenerEventType: \'movedtoseparatewindow\','
    + '      ioPortIndex: ' + portIndexNumeric.toString() + ','
    + '      callbackData: null'
    + '    }'
    + '  });'
    + '  document.dispatchEvent(listenerEvt);'
    + '}, 1000);\n'
    const popupScript = `${psFocusGainedListener} ${psFocusLostListener} ${psInterfaceEventForwarder} ${psWindowResizeListener} ${psInitialMovedEmitter}`;
    const popupHead = `<title>[Device] ${this._descriptor.installationTitle} | Port ${portIndexNumeric} | AlliumWorks</title><script>${popupScript}</script>`;
    const popupDocBody = `<h1>TEST Popup</h1>uid=${popupName}`;
    const popupDocHtml = this._srcDoc.replace(this._POPUP_PLACEHOLDER, popupHead).replace('<body>', '<body>' + popupDocBody)
    // const popupDocHtml = `<html><head>${popupHead}</head><body><h1>TEST Popup</h1>uid=${popupName}<iframe srcdoc="${this._srcDoc}" sandbox="allow-same-origin allow-scripts" id="docframe"></iframe></body></html>`;
    // const popupDocHtml = `<html><head>${popupHead}</head><body><h1>TEST Popup</h1>uid=${popupName}<iframe src="${this._srcDocUrl}" sandbox="allow-same-origin allow-scripts" id="docframe"></iframe></body></html>`;
    //TODO!!!
    const blob = new File([popupDocHtml], popupName, { type: 'text/html' });
    const pdUrl = URL.createObjectURL(blob);

    this._separateWindow = window.open(pdUrl, popupName, 'menubar=no,location=no,status=no');

    this._popupGainedFocusSubscription = this._agentService.popupGainedFocus().subscribe(popupKey => {
      if (popupKey === popupName) {
        this.popupEvent.emit({
          type: 'focusGained',
          key: popupName
        });
      }
    });

    this._popupLostFocusSubscription = this._agentService.popupLostFocus().subscribe(popupKey => {
      if (popupKey === popupName) {
        this.popupEvent.emit({
          type: 'focusLost',
          key: popupName
        });
      }
    });

    return popupName;
  }

  private getIoClientPublicInterface(): {
    restoreSessionData(data: string): Promise<boolean>;
    restorePersistentData(data: string): Promise<boolean>;
    beginDetach(): Promise<boolean>;
    finishDetachSavePersistent(): Promise<string | null>;
    saveSessionData(): Promise<string | null>;
  } {
    if (!!this._separateWindow) {
      return this._separateWindow['_IO_INTERFACE'].publicInterface;
    } else {
      const cw = this.frameElement.contentWindow;
      return cw['_IO_INTERFACE'].publicInterface;
    }
  }
  
  private waitForSeparateWindowContentDoc(then: (contentDoc: Document, ioInterface: any) => void): void {
    let attemptCount = 0;
    const checkSwReady = () => {
      const swDoc = !!this._separateWindow
        ? this._separateWindow.document
        : null;
      const indicator = !!swDoc
        ? swDoc.getElementById('$device-ready-ind')
        : null;
      const ioi = !!indicator
        ? this._separateWindow.window['_IO_INTERFACE']
        : null;
      if (!!ioi) {
        then(swDoc, ioi);
      } else if (attemptCount >= this._MAX_ATTEMPT_COUNT) {
        throw new Error('failed to get separate window content doc');
      } else {
        window.setTimeout(() => {
          checkSwReady();
        }, 450);
      }
    }

    checkSwReady();
  }

  private launchFailureModal(title: string, body: string): void {
    this._modalService.launchModal(title, body, () => {}, { yes: 'OK', no: '', hideNoButton: true });
  }

  private _srcDoc: string | null = null;
  private _srcDocBlob: File | null = null;
  private _srcDocUrl: string | null = null;
  private _blobName: string | null = null;
  private _handleContentDocEvent: ((event: Event) => void) | null = null;
  private _separateWindow: Window | null = null;
  private _deviceSessionData: string = '';

  private _emitComputerStateEvent: ((isPoweredOn: boolean) => void) | undefined = undefined;
  private _emitDeviceRemovedEvent: (() => void) | undefined = undefined;
  private _emitPresentationAreaEvent: ((area: {
    readonly widthPx: number;
    readonly heightPx: number;
  }) => void) | undefined = undefined;
  private _emitMovedToSeparateWindowEvent: (() => void) | undefined = undefined;
  private _emitMovedToMainWindowEvent: (() => void) | undefined = undefined;
  private _popupName = '';
  private _popupGainedFocusSubscription: Subscription | null = null;
  private _popupLostFocusSubscription: Subscription | null = null;
  private _popupFwdEvtType: string | null = null;
  private readonly _displayInSeparateWindow = new BehaviorSubject<boolean>(false);

  private _hookOnDataReceived: (() => void) | undefined = undefined;
  private _portIndex: Byte | null = null;
  private readonly _visibleByteNumberHelper: {
    get: (isInput: boolean) => Array<string>
  } = {
    get: () => []
  }
  private readonly _frameId: string;
  private _descriptor: DevicePanelDescriptor = null;
  private _MAX_ATTEMPT_COUNT = 10;

  private readonly _POPUP_PLACEHOLDER = '<!-- PopupPlaceholder -->';
}