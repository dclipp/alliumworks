import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { DeviceBrowserViewModel } from 'src/app/view-models/device-browser/device-browser-view-model';
import { SidebarButtonKeys } from 'src/app/view-models/sidebar/sidebar-button-bar-button';
import { DeviceBrowserSectionType } from 'src/app/view-models/device-browser/device-browser-section-type';
import { DeviceBrowserSelectionHelper } from 'src/app/view-models/device-browser/device-browser-selection-helper';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { ContentDescriptor } from 'src/app/view-models/content/content-descriptor';
import { ContentType } from 'src/app/view-models/content/content-type';
import { ButtonSets, ButtonKeys } from 'src/app/view-models/left-section/button-bar/button-sets';
import { ModalService } from 'src/app/services/modal.service';
import { AlliumWorksDeviceBundle, AlliumWorksDeviceReadme, DeviceBrowserHome, DeviceInstallationDescriptor, AlliumProto, ALLIUM_PROTO_SCHEMA_VERSION, DataUtils, SerializationFormat, FsList } from '@alliumworks/platform';
import { SessionService } from 'src/app/services/session.service';
import { DeviceManagerService } from 'src/app/services/device-manager.service';
import { TextService } from 'src/app/services/text.service';
import { FileUploadModalNamedTypes } from 'src/app/data-models/modal/file-upload-modal-named-types';
import { joinPath, YfsStatus } from 'yfs';

@Component({
  selector: 'aq4w-device-browser',
  templateUrl: './device-browser.component.html',
  styleUrls: ['./device-browser.component.scss']
})
export class DeviceBrowserComponent implements OnInit {

  @Input('isShowing')
  public set isShowing(isShowing: boolean) {
    if (!isShowing && this.view.isReady) {
      if (this.view.selectedType !== 'none' && this._selectionHelper.selectedId !== '') {
        this._restoreSelection = { type: this.view.selectedType as DeviceBrowserSectionType, id: this._selectionHelper.selectedId }
      }
      this.view.selectedDeviceBundleIds = [];
      this.view.selectedType = 'none';
      this._selectionHelper.clearSilently();
    } else if (isShowing && this.view.isReady && !!this._restoreSelection) {
      this._selectionHelper.rowClicked(this._restoreSelection.type, this._restoreSelection.id);
      this._restoreSelection = null;
    }
  }

  @Output('selectionsChanged')
  public readonly selectionsChanged = new EventEmitter<Array<string>>();
  
  public view = {
    selectedDeviceBundleIds: new Array<string>(),
    favoriteDevices: new Array<DeviceBrowserViewModel>(),
    importedDevices: new Array<DeviceBrowserViewModel>(),
    categories: new Array<{
      categoryName: string,
      devices: Array<DeviceBrowserViewModel>,
      iconName: string
    }>(),
    collapsedSections: new Array<string>(),
    selectedType: 'none',
    loadingBundleId: '',
    isReady: false,
    buttonBar: {
      buttons: ButtonSets.DevicesList.buttons,
      disabledButtonKeys: new Array<string>(),
    },
    categoryLocalizations: {} as { readonly [categoryName: string]: string }
  }

  public on = {
    rowClicked: (sectionType: DeviceBrowserSectionType, bundleId: string) => {
      this._selectionHelper.rowClicked(sectionType, bundleId);
    },
    toggleSection: (sectionKey: string) => {
      const index = this.view.collapsedSections.indexOf(sectionKey);
      if (index > -1) {
        this.view.collapsedSections.splice(index, 1);
      } else {
        this.view.collapsedSections.push(sectionKey);
      }
    },
    buttonBarBtnClicked: (buttonKey: string) => {
      if (buttonKey === SidebarButtonKeys.LoadDevice) {
        this._sessionService.platform.devices.getBundle(this._selectionHelper.selectedId).then(bundle => {
          this.handleDeviceInstall(bundle);
        });
      } else if (buttonKey === SidebarButtonKeys.FavoriteDevice) {
        this.view.loadingBundleId = this._selectionHelper.selectedId;
        const bundleId = this._selectionHelper.selectedId;
        if (this._showingRemoveFavoriteButton) {
          this._deviceManagerService.removeFavorite(bundleId).then(() => {
            this.view.loadingBundleId = '';
            this.view.favoriteDevices = this.view.favoriteDevices.filter(d => d.bundleId !== bundleId);
            this.refreshFavoritesButton(bundleId, false);
          });
        } else {
          const name = this.getDeviceNameFromBundleId(bundleId);
          this._deviceManagerService.addFavorite(bundleId).then(() => {
            this.view.loadingBundleId = '';
            this.view.favoriteDevices.push({
              bundleId: bundleId,
              name: name,
              isSelected: this._selectionHelper.selectedId === bundleId
            })
            this.refreshFavoritesButton(bundleId, true);
          })
        }
        // this.refreshFavoritesButton(bundleId, !this._showingRemoveFavoriteButton);
      } else if (buttonKey === SidebarButtonKeys.ImportDevice) {
        this.launchImportDeviceModal();
      }
    }
  }

  constructor(private _deviceManagerService: DeviceManagerService, private _contentManagerService: ContentManagerService, private _modalService: ModalService, private _sessionService: SessionService,
    private _textService: TextService) { }

  ngOnInit() {
    this._sessionService.platform.devices.getBrowserHome().then(models => {
      this.refreshView(models);
    })

    this._textService.deviceCategoryStrings().subscribe(deviceCategoryStrings => {
      this.view.categoryLocalizations = deviceCategoryStrings;
    })

    if (!DeviceBrowserComponent._performedExistingCheck) {
      this.detectExistingBundles();
    }

    window['TESTMANYdevices'] = (json?: string) => {
      this.TESTMANYdevices()
    }

    // window.setTimeout(() => {
    //   const d: DeviceInstallationDescriptor = {
    //     input: ByteSequenceCreator.Byte(0),
    //     output: ByteSequenceCreator.Byte(0),
    //     installationTitle: 'PreInstalledDevice'
    //   }
    //   this.handleDeviceImport(atob(TESTBUNDLEB64)).then(success => {
    //     if (success) {
    //       // this.refreshView(model);
    //       this._sessionService.platform.devices.install('xtt-02', d, {
    //         primaryDeviceIdentifier: ByteSequenceCreator.QuadByte(0),
    //         secondaryDeviceIdentifier: ByteSequenceCreator.QuadByte(102),
    //         input: {
    //           supported: true,
    //           preferredBufferLength: 16
    //         },
    //         output: {
    //           supported: true,
    //           preferredBufferLength: 16
    //         },
    //         syncInterval: 400
    //       }, {} as any/*todo*/).then((success) => {
    //         if (success) {

    //         } else {
    //           this._modalService.launchModal(
    //             'Install device failed',
    //             '^Unable to install device.^',
    //             () => { }, { yes: 'OK', no: '', hideNoButton: true },
    //             true)
    //         }
    //       });
    //     } else {
    //       // this.launchDeviceImportFailureModal();
    //     }
    //   })
    // }, 1500);
  }

  private emitSelections(): void {
    this.selectionsChanged.emit(this._selectionHelper.selectedId !== '' ? [`device_${this._selectionHelper.selectedId}`] : []);
  }

  private mapDeviceInfoToBrowserViewModel(di: { bundleId: string, name: string }): DeviceBrowserViewModel {
    return {
      bundleId: di.bundleId,
      name: di.name,
      isSelected: false
    }
  }

  private refreshFavoritesButton(bundleId: string, forceIsFavorite?: boolean): void {
    let changeRequired = false;
    let isFavorite = false;
    let force = false;
    if (forceIsFavorite === undefined) {
      isFavorite = this.view.favoriteDevices.some(d => d.bundleId === bundleId);
    } else {
      isFavorite = forceIsFavorite === true;
      force = true;
    }
    const props = {
      iconName: '',
      tooltip: ''
    };
    if (isFavorite && (force || !this._showingRemoveFavoriteButton)) {
      changeRequired = true;
      props.iconName = '(fa)far.heart';
      props.tooltip = 'Remove from favorites';
      // const favoritesBtnIndex = this.view.buttonBar.buttons.findIndex(btn => btn.key === ButtonKeys.FavoriteDevice);
      // this.view.buttonBar.buttons[favoritesBtnIndex] = {
      //   iconName: 'heart-empty',//this.view.buttonBar.buttons[favoritesBtnIndex].iconName,
      //   key: this.view.buttonBar.buttons[favoritesBtnIndex].key,
      //   selectionRequirement: this.view.buttonBar.buttons[favoritesBtnIndex].selectionRequirement,
      //   additionalClass: this.view.buttonBar.buttons[favoritesBtnIndex].additionalClass,
      //   tooltip: 'Remove from favorites'// this.view.buttonBar.buttons[favoritesBtnIndex].tooltip
      // };
      // this._sidebarService.setDynamicState(SidebarButtonKeys.FavoriteDevice, 'favorited');//TODO
      this._showingRemoveFavoriteButton = true;
    } else if (!isFavorite && (force || this._showingRemoveFavoriteButton)) {
      changeRequired = true;
      props.iconName = '(fa)fas.heart';
      props.tooltip = 'Make favorite';
      // const favoritesBtnIndex = this.view.buttonBar.buttons.findIndex(btn => btn.key === ButtonKeys.FavoriteDevice);
      // this.view.buttonBar.buttons[favoritesBtnIndex] = {
      //   iconName: 'heart',//this.view.buttonBar.buttons[favoritesBtnIndex].iconName,
      //   key: this.view.buttonBar.buttons[favoritesBtnIndex].key,
      //   selectionRequirement: this.view.buttonBar.buttons[favoritesBtnIndex].selectionRequirement,
      //   additionalClass: this.view.buttonBar.buttons[favoritesBtnIndex].additionalClass,
      //   tooltip: 'Make favorite'//this.view.buttonBar.buttons[favoritesBtnIndex].tooltip
      // };
      // this._sidebarService.setDynamicState(SidebarButtonKeys.FavoriteDevice, 'not-favorited');//TODO
      this._showingRemoveFavoriteButton = false;
    }

    if (changeRequired) {
      if (force) {
        this.view.buttonBar.buttons = this.view.buttonBar.buttons.map(btn => {
          if (btn.key === ButtonKeys.FavoriteDevice) {
            return {
              iconName: props.iconName,
              key: btn.key,
              selectionRequirement: btn.selectionRequirement,
              additionalClass: btn.additionalClass,
              tooltip: props.tooltip
            }
          } else {
            return {
              iconName: btn.iconName,
              key: btn.key,
              selectionRequirement: btn.selectionRequirement,
              additionalClass: btn.additionalClass,
              tooltip: btn.tooltip
            }
          }
        })
      } else {
        const favoritesBtnIndex = this.view.buttonBar.buttons.findIndex(btn => btn.key === ButtonKeys.FavoriteDevice);
        this.view.buttonBar.buttons[favoritesBtnIndex] = {
          iconName: props.iconName,
          key: this.view.buttonBar.buttons[favoritesBtnIndex].key,
          selectionRequirement: this.view.buttonBar.buttons[favoritesBtnIndex].selectionRequirement,
          additionalClass: this.view.buttonBar.buttons[favoritesBtnIndex].additionalClass,
          tooltip: props.tooltip
        };
      }
    }
  }

  private getDeviceNameFromBundleId(id: string): string {
    const info = this._allInfoModels.find(x => x.bundleId == id);
    return !!info ? info.name : '';
  }

  private launchImportDeviceModal() {
    this._modalService.launchFileUploadModal({
      title: 'Import device',
      description: 'Select a device bundle JSON file',
      acceptExtensions: (uploadType) => {
        if (uploadType === FileUploadModalNamedTypes.source) {
          return ['html', 'css', 'js', 'json'];
        } else { // direct --> bundle
          return ['json'];
        }
      },
      acceptArchiveFile: true,
      acceptSourceUpload: true,
      uploadTypeNotes: [{
        uploadType: FileUploadModalNamedTypes.archive,
        paragraphs: ['archive todo', 'source todo']
      }, {
        uploadType: FileUploadModalNamedTypes.source,
        paragraphs: ['Directly upload the source files for a device']
      }],
      allowMultipleFiles: (uploadType) => {
        return uploadType === FileUploadModalNamedTypes.source;
      },
      processFiles: (fileData) => {
        return { canProceed: true }//TODO
      },
      finishUpload: () => {
        return {
          //TODOworkspaceName: this._uploadWorkspaceTitle
        }
      }
    }, (decision) => {
      if (decision.affirmative) {
        window.setTimeout(() => {
          if (decision.files === 'error') {
            this.launchDeviceImportFailureModal();
          } else {
            let handleJson: string | null = null;
            let getJsonFailureDescription = '';
            let forwardModal = false;

            if (decision.fromArchive === true) {
              const awArchiveFile = decision.files.find(f => f.filename.toLowerCase().endsWith('.json'));
              if (!!awArchiveFile) {
                forwardModal = true;
                const ar = AlliumProto.AlliumArchive.decode(DataUtils.stringToUint8Array(awArchiveFile.fileContent));
                // const ar = AwArchiveApi.deserialize(awArchiveFile.fileContent);
                this._modalService.launchPackageEntitySelectionModal({
                  title: 'Import device',
                  body: 'Choose bundles to import',
                  allowMultipleSelections: true,
                  entityDescriptions: ar.devices.filter(d => !!d.awBundle && !!d.awBundle.bundleId).map(d => {
                    return {
                      title: !!d.awBundle.metadata ? d.awBundle.metadata.humanReadableDeviceName || d.awBundle.bundleId : d.awBundle.bundleId,
                      key: d.awBundle.bundleId
                    }
                  })
                }, (pesDecision) => {
                  if (pesDecision.affirmative) {
                    console.log(`selectedKeys=${pesDecision.selectedKeys || []}`)
                    this.finishDeviceImport(awArchiveFile.fileContent, '', pesDecision.selectedKeys);
                  }
                })
              } else {
                getJsonFailureDescription = 'No package file found in upload';
              }
            } else if (decision.uploadType === FileUploadModalNamedTypes.source) { // raw device source files
              const htmlFile = decision.files.find(f => f.filename.toLowerCase().endsWith('.html'));
              const cssFile = decision.files.find(f => f.filename.toLowerCase().endsWith('.css'));
              const jsFile = decision.files.find(f => f.filename.toLowerCase().endsWith('.js'));
              const manifestFile = decision.files.find(f => f.filename.toLowerCase().endsWith('.json'));

              if (!!htmlFile && !!jsFile && !!manifestFile) {
                const manifest = JSON.parse(manifestFile.fileContent);

                const deserializedBundle: DeserializedBundleFile = {
                  bundleId: manifest.bundleId,
                  profile: {
                    primaryDeviceIdentifier: manifest.profile.primaryDeviceIdentifier,
                    secondaryDeviceIdentifier: manifest.profile.secondaryDeviceIdentifier,
                    clientToHostBufferSize: manifest.profile.clientToHostBufferSize === undefined
                      ? 0
                      : manifest.profile.clientToHostBufferSize,
                    hostToClientBufferSize: manifest.profile.hostToClientBufferSize === undefined
                      ? 0
                      : manifest.profile.hostToClientBufferSize
                  },
                  metadata: {
                    developerId: manifest.metadata.developerId,
                    deviceCategory: manifest.metadata.categoryKey,
                    humanReadableDeviceName: manifest.metadata.humanReadableDeviceName,
                    preferredWidth: manifest.metadata.preferredWidth,
                    preferredHeight: manifest.metadata.preferredHeight
                  },
                  html: htmlFile.fileContent,
                  script: jsFile.fileContent,
                  stylesheet: !!cssFile ? cssFile.fileContent : undefined,
                  readme: manifest.readme
                };

                handleJson = JSON.stringify(deserializedBundle);
/*
                const encodedBundle = DataUtils.encodeSerializationFile(AlliumProto.AlliumArchive.encode({
                  schemaVersion: ALLIUM_PROTO_SCHEMA_VERSION,
                  creator: 'wide1000',//TODO???
                  producer: 'wide1000_producer',//TODO???
                  timestamp: Date.now(),
                  devices: [
                    {
                      baseBundle: undefined,
                      awBundle: {
                        bundleId: deserializedBundle.bundleId,
                        profile: {
                          primaryDeviceIdentifier: this.convertDeserializedNumericStringToNumber(deserializedBundle.profile.primaryDeviceIdentifier),
                          secondaryDeviceIdentifier: this.convertDeserializedNumericStringToNumber(deserializedBundle.profile.secondaryDeviceIdentifier),
                          clientToHostBufferSize: deserializedBundle.profile.clientToHostBufferSize,
                          hostToClientBufferSize: deserializedBundle.profile.hostToClientBufferSize
                        },
                        metadata: {
                          developerId: deserializedBundle.metadata.developerId,
                          categoryKey: deserializedBundle.metadata.deviceCategory,
                          humanReadableDeviceName: deserializedBundle.metadata.humanReadableDeviceName,
                          preferredHeight: this.convertDeserializedSizePrefToProtoSizePref(deserializedBundle.metadata.preferredHeight),
                          preferredWidth: this.convertDeserializedSizePrefToProtoSizePref(deserializedBundle.metadata.preferredWidth)
                        },
                        html: deserializedBundle.html,
                        script: deserializedBundle.script,
                        stylesheet: deserializedBundle.stylesheet || '',
                        readme: !!deserializedBundle.readme
                          ? {
                            descriptionParagraphs: deserializedBundle.readme.descriptionParagraphs,
                            sections: deserializedBundle.readme.sections,
                            embeddedResources: !!deserializedBundle.readme.embeddedResources && deserializedBundle.readme.embeddedResources.length > 0
                              ? deserializedBundle.readme.embeddedResources.map(er => {
                                return {
                                  name: er.name,
                                  blob: DataUtils.stringToUint8Array(er.blob)
                                }
                              })
                              : []
                          }
                          : undefined
                      }
                    }]
                }), 'base64');*/
                handleJson = '';//encodedBundle;
                // const tmpArchive: AwArchive = {
                //   workspaces: [],
                //   devices: [{
                //     bundleId: deserializedBundle.bundleId,
                //     profile: deserializedBundle.profile,
                //     metadata: deserializedBundle.metadata,
                //     html: deserializedBundle.html,
                //     script: deserializedBundle.script,
                //     stylesheet: deserializedBundle.stylesheet,
                //     readme: deserializedBundle.readme
                //   }],
                //   specs: [],
                //   strings: [],
                //   metadata: {
                //     timestamp: Date.now(),
                //     formatVersion: 0,
                //     creator: 'tmp'
                //   }
                // };
                // handleJson = AwArchiveApi.serialize(tmpArchive);
              } else {
                getJsonFailureDescription = 'A device source upload must include an HTML file, a JavaScript file, and a manifest (.json) file';
              }
            } else { // direct --> bundle
              const bundleJsonFile = decision.files.find(f => f.filename.toLowerCase().endsWith('.json'));
              if (!!bundleJsonFile) {
                handleJson = bundleJsonFile.fileContent;
              }
            }

            if (!forwardModal) {
              this.finishDeviceImport(handleJson, getJsonFailureDescription);
            }
          }
        }, 200)
      }
    })
  }

  private finishDeviceImport(encodedData: string, failureDescription: string, includeBundleIds?: Array<string>): void {
    if (!!encodedData) {
      const serializationFormat: SerializationFormat = encodedData.startsWith(DataUtils.binarySerializationFormatIndicator())
        ? 'binary'
        : 'base64';
      this.handleDeviceImport(encodedData, serializationFormat, includeBundleIds).then(success => {
        if (success) {
          this._sessionService.platform.devices.getBrowserHome().then(model => {
            this.refreshView(model);
          })
        } else {
          this.launchDeviceImportFailureModal();
        }
      })
    } else {
      this.launchDeviceImportFailureModal(failureDescription);
    }
  }

  private handleDeviceInstall(bundle: AlliumWorksDeviceBundle): void {
    this._modalService.launchDeviceInstallationModal(
      bundle.metadata.humanReadableDeviceName,
      (decision) => {
        if (decision.affirmative) {
          if (!(!!decision.portIndex)) {
            throw new Error('portIndex not defined');
          } else {
            const descriptor: DeviceInstallationDescriptor = {
              portIndex: decision.portIndex,
              installationTitle: decision.installationName,
              clientToHostBufferSize: bundle.profile.clientToHostBufferSize,
              hostToClientBufferSize: bundle.profile.hostToClientBufferSize
            };

            this._sessionService.platform.devices.install(this._selectionHelper.selectedId, descriptor, bundle.profile).then((success) => {
              if (success) {

              } else {
                this._modalService.launchModal(
                  'Install device failed',
                  '^Unable to install device.^',
                  () => { }, { yes: 'OK', no: '', hideNoButton: true },
                  true)
              }
            });
          }
        }
      });
  }

  private refreshView(models: DeviceBrowserHome): void {
    this.view.isReady = true;
    this.view.categories = models.categoryDetails.sort((a, b) => a.order < b.order ? -1 : a.order > b.order ? 1 : 0).map(cd => {
      return {
        categoryName: cd.name,
        devices: !!models.topDevicesByCategory[cd.name] ? models.topDevicesByCategory[cd.name].map(d => this.mapDeviceInfoToBrowserViewModel(d)) : [],
        iconName: cd.iconName
      };
    })

    this.view.favoriteDevices = models.favorites.map(d => this.mapDeviceInfoToBrowserViewModel(d));

    const allInfoModels = new Array<{ bundleId: string, name: string }>();
    models.favorites.forEach(f => {
      allInfoModels.push(f);
    })

    this.view.importedDevices = models.importedDevices.map(d => this.mapDeviceInfoToBrowserViewModel(d));
    models.importedDevices.forEach(i => {
      allInfoModels.push(i);
    })

    Object.keys(models.topDevicesByCategory).forEach(k => {
      models.topDevicesByCategory[k].forEach(d => {
        if (!allInfoModels.some(x => x.bundleId === d.bundleId)) {
          allInfoModels.push(d);
        }
      })
    })
    this._allInfoModels = allInfoModels;
  }

  private handleDeviceImport(encodedData: string, serializationFormat: SerializationFormat, includeBundleIds?: Array<string>): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this._sessionService.platform.devices.importDeviceBundles(encodedData, serializationFormat, includeBundleIds).then((importedDevices) => {
          if (importedDevices.length > 0) {
            console.log(`${importedDevices[0].bundleId} :: preferredHeight: ${JSON.stringify(importedDevices[0].metadata.preferredHeight)}`)
            console.log(`${importedDevices[0].bundleId} :: preferredWidth: ${JSON.stringify(importedDevices[0].metadata.preferredWidth)}`)
            resolve(true);
          } else {
            resolve(false);
          }
        }).catch(err => {
          resolve(false);
        })
      } catch (e) {
        resolve(false);
      }
    });
  }

  private launchDeviceImportFailureModal(detailMessage?: string): void {
    const useDetailMessage = detailMessage || 'Please verify that all files are valid.';
    this._modalService.launchModal(
      'Import device failed',
      `^Unable to import device.^^${useDetailMessage}^`,
      () => {}, { yes: 'OK', no: '', hideNoButton: true },
      true)
  }

  private convertDeserializedSizePrefToProtoSizePref(preferredSize?: string | number | {
    readonly amount: number;
    readonly units: 'rel' | 'px';
  }): AlliumProto.AlliumWorksDeviceSizePreference | undefined {
    if (preferredSize === undefined) {
      return undefined;
    } else {
      if (typeof preferredSize === 'number') {
        return {
          amount: preferredSize,
          units: AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
        };
      } else if (typeof preferredSize === 'string') {
        const amountMatch = preferredSize.match(/^[ \t]{0,}([0-9]+)[ \t]{0,}/i);
        const unitMatch = preferredSize.match(/[ \t]{0,}(px|rel)[ \t]{0,}/i);

        if (!!amountMatch) {
          return {
            amount: Number.parseInt(amountMatch[1]),
            units: !!unitMatch
              ? unitMatch[1].toLowerCase() === 'px'
              ? AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Px
              : AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
              : AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
          };
        } else {
          throw new Error(`missing or invalid amount: ${preferredSize}`);
        }
      } else {
        return {
            amount: preferredSize.amount,
            units: preferredSize.units === 'px'
              ? AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Px
              : AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
          };
      }
    }
  }

  private convertDeserializedNumericStringToNumber(value: string): number {
    let n: number;
    if (/^[ \t]{0,}0x/i.test(value)) {
      n = Number.parseInt(value, 16);
    } else {
      n = Number.parseInt(value, 10);
    }

    if (Number.isInteger(n)) {
      return n;
    } else {
      throw new Error(`invalid numeric: ${value}`);
    }
  }

  private async detectExistingBundles(): Promise<void> {
    const existingImports = new Array<DeviceBrowserViewModel>();

    try {
      const deviceImportsDir = await this._sessionService.platform.yfs.readDirectory(joinPath(`/${FsList.DevicesDirectory}`, FsList.ImportedDevicesDirectory))
      if (deviceImportsDir.status === YfsStatus.OK) {
        const bundleDirs = deviceImportsDir.payload.filter(a => a.isDirectory);
        for (let i = 0; i < bundleDirs.length; i++) {
          const bundleId = bundleDirs[i].publicName;
          const bundle = await this._sessionService.platform.devices.getBundle(bundleId);
          if (!!bundle && !this.view.importedDevices.some(d => d.bundleId === bundle.bundleId)) {
            existingImports.push({
              bundleId: bundle.bundleId,
              name: bundle.metadata.humanReadableDeviceName,
              isSelected: false
            });
          }
        }
        
        window.setTimeout(() => {
          this.view.importedDevices = existingImports;
          existingImports.forEach(ei => {
            this._allInfoModels.push({
              bundleId: ei.bundleId,
              name: ei.name
            });
          })
        });
      }
    } catch (ex) {
      
    } finally {
      DeviceBrowserComponent._performedExistingCheck = true;
    }
  }

  private TESTMANYdevices(json?:string): void {
    if (!!json) {
      const arr = JSON.parse(json);
      window.setTimeout(() => {
        arr.forEach(x => this.view.importedDevices.push(x))

      })
    } else {
      const tstdv = new Array<DeviceBrowserViewModel>();
      for (let i = 0; i < 100; i++) {
        tstdv.push({
          bundleId: `tstdevicemany_${i}`,
          name: `ManyDev ${i + 1}`,
          isSelected: false
        })
      }
      window.setTimeout(() => {
        tstdv.forEach(x=>this.view.importedDevices.push(x))

      })
    }
  }

  private _restoreSelection: { type: DeviceBrowserSectionType, id: string } = null;
  private _showingRemoveFavoriteButton = false;
  private _allInfoModels = new Array<{ bundleId: string, name: string }>();
  private readonly _selectionHelper = new DeviceBrowserSelectionHelper(
    (id) => {
      if (id === '') {
        this.view.selectedDeviceBundleIds = [];
      } else {
        this.view.selectedDeviceBundleIds = [id];
        const contentKey = ContentDescriptor.encodeKey(id.toString(), ContentType.Device);
        if (this._contentManagerService.contentExists(contentKey)) {
          this._contentManagerService.changeActiveContent(contentKey);
        } else {
          this._contentManagerService.addContent(id.toString(), ContentType.Device, this.getDeviceNameFromBundleId(id), '(c)lightbulb2', [], true);
        }
      }
      this.refreshFavoritesButton(id);
      this.emitSelections();
    },
    (type) => {
      this.view.selectedType = type;
    });

  private static _performedExistingCheck = false;
}

interface DeserializedBundleFile {
    readonly bundleId: string;
    readonly profile: {
      readonly primaryDeviceIdentifier: string;
      readonly secondaryDeviceIdentifier: string;
      readonly clientToHostBufferSize: number;
      readonly hostToClientBufferSize: number;
    };
    readonly metadata: {
      readonly developerId: string;
      readonly deviceCategory: string;
      readonly humanReadableDeviceName: string;
      readonly preferredWidth?: string | number;
      readonly preferredHeight?: string | number;
    };
    readonly html: string;
    readonly script: string;
    readonly stylesheet?: string;
    readonly readme?: AlliumWorksDeviceReadme;
}
