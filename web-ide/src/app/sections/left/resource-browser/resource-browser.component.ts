import { Component, OnInit } from '@angular/core';
import { bufferTime, debounceTime, distinctUntilChanged, filter, map, switchMapTo, take } from 'rxjs/operators';
import { ModalService } from 'src/app/services/modal.service';
import { SessionService } from 'src/app/services/session.service';
import { ButtonKeys, ButtonSets } from 'src/app/view-models/left-section/button-bar/button-sets';
import { ResourceBr2owserViewModel } from 'src/app/view-models/left-section/resource-browser/resource-browser-view-model';
import { handleDeleteResource } from './handlers/delete-resource-handler';
import { HandlerContext } from './handler-context';
import { handleRenameResource } from './handlers/rename-resource-handler';
import { handleNewFile } from './handlers/new-file-handler';
import { handleNewFolder } from './handlers/new-folder-handler';
import { commitNewResource } from './handlers/commit-new-resource-handler';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { commitRenameResource } from './handlers/commit-rename-handler';
import { cancelPendingResource } from './handlers/cancel-pending-resource-handler';
import { joinPath, Yfs, YfsAsset, YfsFile, YfsStatus } from 'yfs';
import { FsList } from '@alliumworks/platform';
import { ChoiceListModalOption } from 'src/app/data-models/modal/choice-list-modal-option';
import { ContentDescriptor } from 'src/app/view-models/content/content-descriptor';
import { ContentType } from 'src/app/view-models/content/content-type';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { ToolbarToolGroups } from 'src/app/view-models/toolbar/toolbar-tool-groups';
import { AssemblySettings } from '@allium/asm';
import { handleMoveResource } from './handlers/move-resource-handler';

@Component({
  selector: 'aq4w-resource-browser',
  templateUrl: './resource-browser.component.html',
  styleUrls: ['./resource-browser.component.scss']
})
export class ResourceBrowserComponent implements OnInit {

  public view = {
    resources: new Array<ResourceBr2owserViewModel>(),
    selectedPaths: new Array<string>(),
    visiblePaths: new Array<string>(),
    expandedPaths: new Array<string>(),
    unmappedFilePaths: new Array<string>(),
    // editingAfterPath: '',
    edit: {
      parentPath: '',
      isEditing: false
    },
    isLoading: false,
    isInitialized: false,
    workspaceTitle: '',
    buttons: ButtonSets.ResourcesList.buttons,
    disabledButtonKeys: new Array<string>(),
    drag: {
      path: '',
      left: 0,
      top: 0,
      name: '',
      iconName: ''
    },
    activeDropZoneIndex: -1,
    draggingIndex: -1
  }

  public on = {
    resourceClicked: (event: MouseEvent, fullPath: string) => {
      if (!this.view.isLoading && !this.view.edit.isEditing) {
        let t = event.target as any;
        let stop = false;
        let isCaret = false;
        while (!stop && !!t) {
          if (t.nodeName === 'LI') {
            stop = true;
          } else if (t.className.includes('caret-icon')) {
            stop = true;
            isCaret = true;
          } else {
            t = t.parentElement;
          }
        }

        if (isCaret) {
          this.toggleResourceExpansion(fullPath);
        } else {
          this.toggleResource(fullPath, event.shiftKey);
        }
      }
    },
    buttonBarButtonClicked: (buttonKey: string) => {
      // console.log(`buttonClicked=${buttonKey}`)
      if (buttonKey === ButtonKeys.CloseWorkspace) {
        this._sessionService.platform.workspaceManager.closeWorkspace().then(() => {

        });
        // this.handleCloseWorkspace();//ZTODO
      } else if (buttonKey === ButtonKeys.CloseWorkspaceDiscardChanges) {
        //TODO confirmModal?
        this._sessionService.platform.workspaceManager.closeWorkspace(true).then(() => {
        });
        // this.handleCloseWorkspace();//ZTODO
      } else if (buttonKey === ButtonKeys.NewFile) {
        if (!this.view.edit.isEditing) {
          handleNewFile(this.getHandlerContext(), this.view.selectedPaths, this.view.resources, (isEditing, resourceIndex) => {
            if (resourceIndex === undefined) {
              this.view.edit.isEditing = isEditing;
            } else {
              this.view.resources[resourceIndex].isEditing = isEditing;
            }
          }, (path) => {
            this.view.edit.parentPath = path;
          }, () => {
            return this.view.edit.parentPath;
          },
          (r) => {
            this.view.resources.push(r);
          }).then(result => {

          })
        }
      } else if (buttonKey === ButtonKeys.NewFolder) {
        if (!this.view.edit.isEditing) {
          handleNewFolder(this.getHandlerContext(), this.view.selectedPaths, this.view.resources, (isEditing, resourceIndex) => {
            if (resourceIndex === undefined) {
              this.view.edit.isEditing = isEditing;
            } else {
              this.view.resources[resourceIndex].isEditing = isEditing;
            }
          }, (path) => {
            this.view.edit.parentPath = path;
          }, () => {
            return this.view.edit.parentPath;
          },
          (r) => {
            this.view.resources.push(r);
          }).then(result => {

          })
        }
      } else if (buttonKey === ButtonKeys.Discard) {
        this.cancelPendingResource(!!this.view.edit.parentPath);
      } else if (buttonKey === ButtonKeys.Commit) {
        if (this.view.edit.isEditing) {
          if (!!this.view.edit.parentPath) {
            this.commitNewResource();
          } else {
            this._inputFieldValue.pipe(take(1)).subscribe(value => {
              commitRenameResource(this.getHandlerContext(), this.view.resources, value, (resourceIndex, isPending) => {
                this.view.resources[resourceIndex].isPending = isPending;
              }, (resourceIndex, pendingName) => {
                this.view.resources[resourceIndex].pendingName = pendingName;
              }, (isNew) => {
                this.cancelPendingResource(isNew);
              }, (resourceIndex, isEditing) => {
                this.view.resources[resourceIndex].isEditing = isEditing;
              }).then(result => {
                if (result.success) {
                  this.view.edit.isEditing = result.isEditing;
                  this.view.buttons = result.buttons;
                  this._inputFieldValue.next(undefined);

                  const contentKey = ContentDescriptor.encodeKey(result.oldPath, ContentType.File);
                  const newContentKey = ContentDescriptor.encodeKey(joinPath(this.virtualRootPath, result.newName), ContentType.File);
                  this._contentManagerService.updateDescriptorLabel(contentKey, newContentKey, result.newName).then(() => {});
                }
              })
            });
          }
        }
      } else if (buttonKey === ButtonKeys.RenameSelected) {
        if (!this.view.edit.isEditing) {
          handleRenameResource(this.getHandlerContext(), this.view.selectedPaths, this.view.resources, (isEditing, resourceIndex) => {
            if (resourceIndex === undefined) {
              this.view.edit.isEditing = isEditing;
            } else {
              this.view.resources[resourceIndex].isEditing = isEditing;
            }
          }).then(result => {
            if (result.success) {
              this.view.buttons = result.updatedButtons;
            }
          });
        }
      } else if (buttonKey === ButtonKeys.DeleteSelected) {
        handleDeleteResource(this.getHandlerContext(), this.view.selectedPaths).then(result => {
          if (result.success) {
            this.view.selectedPaths = result.updatedSelectedPaths;
          }
        });
      } else if (buttonKey === ButtonKeys.ExportPortableSession) {
        //NTODO this._sessionService.serializeSession().then(json => {
        //   const name = `session_${Date.now()}.json`;
        //   const blob = new File([json], name, { type: 'text/json' });
        //   const downloadUrl = URL.createObjectURL(blob);
        //   const downloadLink = document.createElement('a');
        //   downloadLink.id = `dl_${Math.random().toString().split('.')[1]}`;
        //   downloadLink.href = downloadUrl;
        //   downloadLink.download = name;

        //   document.body.appendChild(downloadLink);
        //   window.setTimeout(() => {
        //     const el = document.getElementById(downloadLink.id);
        //     el.click();
        //     el.remove();
        //     URL.revokeObjectURL(downloadUrl);
        //   }, 250);
        // });
      } else if (buttonKey === ButtonKeys.DownloadCompiledAssembly) {
        this._modalService.launchChoiceListModal('Download compiled assembly', 'Select a serialization format for the compilation file', this._compiledAsmDownloadOptions, (affirmative, choice) => {
          if (affirmative) {
            this._sessionService.platform.assembler.assembly().pipe(take(1)).subscribe(assembly => {
              this._sessionService.platform.workspaceManager.activeWorkspace().pipe(take(1)).subscribe(activeWorkspace => {
                const format = choice as 'binary' | 'base10' | 'base16';
                const content = assembly.compilation.toFileContent(format);
                let dlFileName = `${activeWorkspace.title}_build_${Date.now()}`;
                let mimeType = '';
                if (format === 'binary') {
                  mimeType = 'application/octet-stream';
                  dlFileName += '.bin';
                } else {
                  mimeType = 'text/json';
                  dlFileName += '.txt';
                }
                const blob = new File([content], dlFileName, { type: mimeType });
                const downloadUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.id = `dl_${Math.random().toString().split('.')[1]}`;
                downloadLink.href = downloadUrl;
                downloadLink.download = dlFileName;

                document.body.appendChild(downloadLink);
                window.setTimeout(() => {
                  const el = document.getElementById(downloadLink.id);
                  el.click();
                  el.remove();
                  URL.revokeObjectURL(downloadUrl);
                }, 250);
              });
            });
          }
        })
      } else if (buttonKey === ButtonKeys.DownloadSourceMap) {
        this._sessionService.platform.assembler.assembly().pipe(take(1)).subscribe(assembly => {
          this._sessionService.platform.workspaceManager.activeWorkspace().pipe(take(1)).subscribe(activeWorkspace => {
            if (!!assembly.sourceMap) {
              const content = assembly.sourceMap.toFileContent()
              const dlFileName = `${activeWorkspace.title}_${Date.now()}.sourcemap`;
              const blob = new File([content], dlFileName, { type: 'text/plain' });
              const downloadUrl = URL.createObjectURL(blob);
              const downloadLink = document.createElement('a');
              downloadLink.id = `dl_${Math.random().toString().split('.')[1]}`;
              downloadLink.href = downloadUrl;
              downloadLink.download = dlFileName;

              document.body.appendChild(downloadLink);
              window.setTimeout(() => {
                const el = document.getElementById(downloadLink.id);
                el.click();
                el.remove();
                URL.revokeObjectURL(downloadUrl);
              }, 250);
            }
          });
        });
      }
    },
    nameInput: (event: any/*InputEvent*/) => {
      this._inputFieldValue.next((event.target as any).value);
    },
    nameKeyPress: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'Return') {
        this.commitNewResource();
      }
    },
    resourceDragStart: (event: DragEvent, index: number) => {
      this.view.draggingIndex = index;
      // const resource = this.view.resources[index];
      // this.view.drag.path = resource.fullPath;
      // this.view.drag.name = resource.name;
      // this.view.drag.iconName = resource.iconName;
    },
    resourceDragging: (event: DragEvent) => {
      // // console.log('dragging');
      // this.view.drag.left = event.x - 20;
      // this.view.drag.top = event.y - 20;
    },
    resourceDragEnd: (event: DragEvent, index: number) => {
      window.setTimeout(() => {
        console.log(`dropevt=viewidx=${index===this.view.draggingIndex}`);
        const dropZoneIndex = this._bufferedDropZoneIndex;
        this.view.draggingIndex = -1;
        this.view.activeDropZoneIndex = -1;
        this._bufferedDropZoneIndex = -1;
        console.log(`dropZoneIndex=${dropZoneIndex}`);
        if (dropZoneIndex > -1 && dropZoneIndex !== index) {
          const fromRsrc = this.view.resources[index];
          const toRsrc = this.view.resources[dropZoneIndex];
          let toName = toRsrc.isFile
            ? toRsrc.containerPath.replace(this.virtualRootPath, '')
            : toRsrc.fullPath.replace(this.virtualRootPath, '');
          if (toName === '') {
            toName = '/';
          }

          this._modalService.launchModal(
            'Move resource',
            `Are you sure you want to move ${fromRsrc.fullPath.replace(this.virtualRootPath, '')} to ${toName}?`,
            (affirmative) => {
              if (affirmative) {
                let newContainerPath = '';
                if (toRsrc.isFile) {
                  newContainerPath = toRsrc.containerPath;
                } else {
                  newContainerPath = toRsrc.fullPath;
                }

                handleMoveResource(
                  this.getHandlerContext(),
                  this.view.resources,
                  newContainerPath,
                  index,
                  (resourceIndex, isPending) => {
                    this.view.resources[resourceIndex].isPending = isPending;
                  }, (resourceIndex, isEditing) => {
                    this.view.resources[resourceIndex].isEditing = isEditing;
                  }).then(result => {
                    if (result.success) {
                      // this.view.edit.isEditing = result.isEditing;
                      // this.view.buttons = result.buttons;
                    }
                  })
              }
            },
            { yes: 'Yes', no: 'No' }
          )
        }
      }, this._DZ_BUFFER_TIME + 100);
      // console.log('drag end');
      // this.view.drag.path = '';
      // this.view.drag.name = '';
      // this.view.drag.iconName = '';
      // this.view.drag.left = 0;
      // this.view.drag.top = 0;

      // const listItems = document.getElementsByClassName('resources-list-li');
      // let foundIndex = -1;
      // for (let i = 0; i < listItems.length && foundIndex === -1; i++) {
      //   const listItem = listItems.item(i);
      //   const rect = listItem.getBoundingClientRect() as DOMRect;
      //   if ((rect.x <= event.x && ((rect.x + rect.width) >= event.x))
      //     && (rect.y <= event.y && ((rect.y + rect.height) >= event.y))) {
      //     foundIndex = i;
      //   }
      // }

      // this.tryDragMove(index, foundIndex);
    },
    resourceDragOver: (event: DragEvent, index: number) => {
      if (index !== this.view.draggingIndex) {
        this.view.activeDropZoneIndex = index;
        this._dropZoneIndex.next({
          index: index,
          timestamp: Date.now()
        });
      }
    },
    resourceDragLeave: (event: DragEvent, index: number) => {
      this.view.activeDropZoneIndex = -1;
      this._dropZoneIndex.next({
        index: -1,
        timestamp: Date.now()
      });
    },
    resourceDrop: (event: DragEvent, index: number) => {
      // console.log(`dropevt=viewidx=${index===this.view.draggingIndex}`);
      // this.view.draggingIndex = -1;
      // this.view.activeDropZoneIndices = [];
      // // this._modalService.launchModal(
      // //   'Move resource',
      // //   `Are you sure you want to move ${} to ${}?`,
      // //   (affirmative) => {
      // //     if (affirmative) {
            
      // //     }
      // //   },
      // //   { yes: 'Yes', no: 'No' }
      // // )
    },
    unmappedAlertClicked: (event: MouseEvent, fullPath: string) => {
      //TODO should this be used?
      event.stopImmediatePropagation();
    //   const modalBody = 'TODOThis file is not mapped and will not be included in the compilation';
    //   this._modalService.launchModal('Map source file', modalBody, (affirmative) => {
    //     if (affirmative) {
    //     }
    //   }, { yes: 'Map', no: 'Cancel' }, true);
    //   console.log(`unmappedAlertClicked: ${fullPath}`)
    }
  }

  constructor(private _sessionService: SessionService, private _modalService: ModalService, private _contentManagerService: ContentManagerService) { }

  ngOnInit() {
    combineLatest([
      this._sessionService.platform.workspaceManager.activeWorkspace(),
      this._refreshActiveWorkspace.pipe(distinctUntilChanged()
    )])
    .pipe(debounceTime(350), switchMapTo(this._sessionService.platform.workspaceManager.activeWorkspace()))
    .subscribe(activeWorkspace => {
      if (activeWorkspace === null) {
        this.view.selectedPaths = [];
        this.view.resources = [];
        this.view.visiblePaths = [];
        this.view.workspaceTitle = '';
      } else {
        activeWorkspace.readDirectory(joinPath('/', FsList.WorkspaceResourcesDirectory)).then(assets => {
          if (assets.status === YfsStatus.OK) {
            this.view.expandedPaths = [joinPath(activeWorkspace.absolutePath, FsList.WorkspaceResourcesDirectory)];
            // this.view.expandedPaths = assets.payload.filter(a => a.containerPath === '/').map(a => joinPath('/', a.publicName));
            this.view.resources = assets.payload.map(a => this.mapAssetToViewModel(a));
            this.recomputeVisibilities(this.view.resources, this.view.expandedPaths);
            
            const settingsRsrc = assets.payload.find(p => !p.isDirectory && p.publicName.toLowerCase() === 'assembly.json');
            if (!!settingsRsrc) {
              const sourceImports = AssemblySettings.fromJson((settingsRsrc as YfsFile).content).sourceImports;
              this.view.unmappedFilePaths = this.view.resources
                .filter(r => r.isSourceFile && !sourceImports.some(si => joinPath(this.virtualRootPath, si.filePath) === r.fullPath))
                .map(r => r.fullPath);
            } else {
              this.view.unmappedFilePaths = [];
            }
          }
          this.view.isLoading = false;
          this.view.workspaceTitle = activeWorkspace.title;
        })
      }

      this._workspaceDir = activeWorkspace;
      window['TSTGetrsrc2'] = () => {
        return JSON.parse(JSON.stringify(this.view.resources))
      }
    })

    this._sessionService.platform.workspaceManager.activeWorkspaceUpdated().subscribe(() => {
      this._refreshActiveWorkspace.next(Math.random());
    })

    this._dropZoneIndex.pipe(bufferTime(this._DZ_BUFFER_TIME), map(x => x.filter(y => y.timestamp > 0))).subscribe(events => {
      // if latest index = -1 and no event with a non-negative index occurred within 250ms, use -1
      // else, use latest index
      if (events.length > 0) {
        const latest = events[events.length - 1];
        if (latest.index === -1) {
          const nonNegativeEvent = events.find(e => e.index > -1 && latest.timestamp - e.timestamp <= 250);
          if (!!nonNegativeEvent) {
            this._bufferedDropZoneIndex = nonNegativeEvent.index;
          } else {
            this._bufferedDropZoneIndex = -1;
          }
        } else {
          this._bufferedDropZoneIndex = latest.index;
        }
      }
    })
  }

  private toggleResourceExpansion(fullPath: string): boolean {
    const expandedPaths = JSON.parse(JSON.stringify(this.view.expandedPaths)) as Array<string>;
    const epIndex = expandedPaths.findIndex(p => p === fullPath);
    let expanded = false;
    if (epIndex > -1) { // expanded --> collapsed
      expandedPaths.splice(epIndex, 1);
    } else { // collapsed --> expanded
      expandedPaths.push(fullPath);
      expanded = true;
    }

    this.view.expandedPaths = expandedPaths;
    this.refreshIcon(fullPath, expanded);
    // this.bh_notifyExpandedPathsChanged();
    setTimeout(() => {
      this.recomputeVisibilities(this.view.resources, expandedPaths);
    }, 300);

    return expanded;
  }

  // private getIconNameForResource(name: string, isFolder: boolean, isCollapsed: boolean): string {
  private getIconNameForResource(info: {
    readonly name: string,
    readonly isFolder: true,
    readonly isCollapsed: boolean
  } | {
    readonly title: string,
    readonly extension: string,
    readonly isFolder?: false,
    readonly name?: string,
    readonly isCollapsed?: boolean
  }): string {
    if (info.isFolder === true) {
      return info.isCollapsed
        ? '(fa)folder+data-additional-class:align-middle'
        : '(fa)far.folder-open+data-additional-class:align-middle';
    } else {
      return info.extension === 'aq'
        ? '(c)sourcefile'
        : info.title === 'assembly' && info.extension === 'json'
        ? '(c)settings2'
        : '(fa)file-alt';
    }
  }

  private getHandlerContext(): HandlerContext {
    return {
      modalService: () => {
        return this._modalService;
      },
      dir: () => {
        return this._workspaceDir;
      },
      setIsLoading: (isLoading) => {
        window.setTimeout(() => {
          this.view.isLoading = isLoading;
        });
      },
      addEscapeKeyListener: () => {
        window.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            this._escapedKeyPressed.next(Date.now());
          }
        });
      },
      removeEscapeKeyListener: () => {
        window.removeEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            this._escapedKeyPressed.next(Date.now());
          }
        });
      },
      setButtons: (buttons) => {
        window.setTimeout(() => this.view.buttons = buttons);
      },
      getIconNameForResource: (name, isFolder, isCollapsed, extension) => {
        return this.getIconNameForResource({
          name: name,
          title: name,
          extension: extension,
          isFolder: isFolder as any,
          isCollapsed: isCollapsed
        });
      },
      virtualRootPath: () => {
        return this.virtualRootPath;
      }
    }
  }

  private cancelPendingResource(isNew: boolean): void {
    cancelPendingResource(this.getHandlerContext(), isNew, this.view.resources, (isEditing, resourceIndex) => {
      if (resourceIndex === undefined) {
        this.view.edit.isEditing = isEditing;
      } else {
        this.view.resources[resourceIndex].isEditing = isEditing;
      }
    }, (resourceIndex, isPending) => {
      this.view.resources[resourceIndex].isPending = isPending;
    }, (resourceIndex, pendingName) => {
      this.view.resources[resourceIndex].pendingName = pendingName;
    }, (path) => {
      this.view.edit.parentPath = path;
    }).then(result => {
      this.view.buttons = result.buttons;
      if (result.spliceResourceIndex > -1) {
        this.view.resources.splice(result.spliceResourceIndex, 1);
      }
    });
  }

  private commitNewResource(): void {
    this._inputFieldValue.pipe(take(1)).subscribe(value => {
      commitNewResource(this.getHandlerContext(), this.view.resources, value, (resourceIndex, isPending) => {
        this.view.resources[resourceIndex].isPending = isPending;
      }, (resourceIndex, pendingName) => {
        this.view.resources[resourceIndex].pendingName = pendingName;
      }, (isNew) => {
        this.cancelPendingResource(isNew);
      }).then(result => {
        if (result.success) {
          let creatorFn: Promise<YfsStatus> = Promise.resolve(YfsStatus.UnexpectedError);
          const containerPath = joinPath(result.parentPath || '/', FsList.WorkspaceResourcesDirectory);
          if (result.isDirectory) {
            creatorFn = this._workspaceDir.createDirectory(containerPath, result.name);
          } else {
            creatorFn = this._workspaceDir.createFile(containerPath, result.name, result.extension!);
          }
          creatorFn.then(status => {
            this.view.isLoading = result.isLoading;
            this.view.edit.isEditing = result.isEditing;
            this.view.edit.parentPath = result.parentPath;
            this.view.buttons = result.buttons;
            this._inputFieldValue.next(undefined);
          })
        }
      })
    });
  }

  private get virtualRootPath(): string {
    const virtualRoot = !!this._workspaceDir
      ? joinPath(this._workspaceDir.absolutePath, FsList.WorkspaceResourcesDirectory)
      : '/';

    return virtualRoot;
  }

  private isAssetCollapsed(fullPath: string): boolean {
    return !this.view.expandedPaths.includes(fullPath);
  }

  private mapAssetToViewModel(asset: YfsAsset): ResourceBr2owserViewModel {
    const fullPath = joinPath(asset.containerPath, asset.publicName);

    if (asset.isDirectory) {
      return {
        containerPath: asset.containerPath,
        name: asset.publicName,
        fullPath: fullPath,
        isFile: false,
        isSourceFile: false,
        depthFromTop: fullPath.replace(this.virtualRootPath, '/').split('/').map(p => p.trim()).filter(p => !!p).length - 1,
        iconName: this.getIconNameForResource({ name: asset.publicName, isFolder: true, isCollapsed: this.isAssetCollapsed(fullPath) }),
        isEditing: undefined,
        isPending: undefined,
        pendingName: undefined,
        displayNameOverride: undefined
      }
    } else {
      const file = asset as YfsFile;
      const isSettingsFile = file.title === 'assembly' && file.extension === 'json';

      return {
        containerPath: asset.containerPath,
        name: asset.publicName,
        fullPath: fullPath,
        isFile: true,
        isSourceFile: file.extension === 'aq',
        depthFromTop: fullPath.replace(this.virtualRootPath, '/').split('/').map(p => p.trim()).filter(p => !!p).length - 1,
        iconName: this.getIconNameForResource({ title: file.title, extension: file.extension }),
        isEditing: undefined,
        isPending: undefined,
        pendingName: undefined,
        displayNameOverride: isSettingsFile
          ? 'Assembly Settings'
          : undefined
      }
    }
  }

  private isPathVisible(containerPath: string, expandedPaths: Array<string>): boolean {
    return containerPath === this.virtualRootPath || expandedPaths.includes(containerPath);
    // if (containerPath === '/') {
    //   return true;
    // } else {
    //   const parts = containerPath.split('/').filter(p => !!p);
    //   let isAncestorCollapsed = false;
    //   for (let i = parts.length - 1; i > -1 && !isAncestorCollapsed; i--) {
    //     const ancestorPath = parts.slice(0, i + 1).join('/');
    //     if (!!ancestorPath) {
    //       isAncestorCollapsed = !expandedPaths.includes(`/${ancestorPath}`);
    //     }
    //   }
    //   return !isAncestorCollapsed;
    // }
  }

  private recomputeVisibilities(resources: ReadonlyArray<ResourceBr2owserViewModel>, expandedPaths: Array<string>): void {
    const visiblePaths = new Array<string>();
    resources.forEach(r => {
      if (r.containerPath === this.virtualRootPath) {
        visiblePaths.push(r.fullPath);
      } else {
        if (this.isPathVisible(r.containerPath, expandedPaths)) {
          visiblePaths.push(r.fullPath);
        }
      }
    });
    this.view.visiblePaths = visiblePaths;
  }

  private toggleResource(fullPath: string, multiSelect: boolean): void {
    if (multiSelect) {
      const index = this.view.selectedPaths.findIndex(p => p === fullPath);
      if (index > -1) { // selected --> unselected
        this.view.selectedPaths.splice(index, 1);
      } else { // unselected --> selected
        this.view.selectedPaths.push(fullPath);
      }
    } else {
      const index = this.view.selectedPaths.findIndex(p => p === fullPath);
      if (index > -1) {
        if (this.view.selectedPaths.length > 1) { // multiselected --> fullPath selected only
          this.view.selectedPaths = [fullPath];
        } else { // selected --> unselected
          this.view.selectedPaths.splice(index, 1);
        }
      } else { // unselected --> selected
        this.view.selectedPaths = [fullPath];
        const resource = this.view.resources.find(r => r.fullPath === fullPath);
        if (resource.isFile) {
          this.activateContent(fullPath, this.view.resources.find(r => r.fullPath === fullPath))
        } else {
          const epIndex = this.view.expandedPaths.indexOf(fullPath);
          if (epIndex > -1) {
            this.view.expandedPaths.splice(epIndex, 1);
          } else {
            this.view.expandedPaths.push(fullPath);
          }
          this.recomputeVisibilities(this.view.resources, this.view.expandedPaths);
        }
      }
    }

    this.refreshIcon(fullPath, this.view.expandedPaths.includes(fullPath));
    // this._selectedPaths.next(this.view.selectedPaths);
  }

  private getToolGroupNames(resource: ResourceBr2owserViewModel): Array<string> {
    const groupNames: Array<string> = [ToolbarToolGroups.GroupNames.FILE_OPTIONS];

    if (resource.name.toLowerCase() === 'assembly.json') {
      groupNames[0] = ToolbarToolGroups.GroupNames.ASM_SETTINGS_OPTIONS;
    } else {
      groupNames.push(ToolbarToolGroups.GroupNames.FONT_SIZE);
    }

    if (resource.name.toLowerCase().endsWith('.aq')) {
      groupNames.push(ToolbarToolGroups.GroupNames.SOURCE_CODE_OPTIONS);
    }
    return groupNames;
  }

  private activateContent(filePath: string, resource: ResourceBr2owserViewModel) {
    const p = filePath;// joinPath(FsList.WorkspaceResourcesDirectory, filePath.replace(this.virtualRootPath, ''));
    const contentKey = ContentDescriptor.encodeKey(p, ContentType.File);
    if (!this._contentManagerService.renamedContentExists(contentKey)) {
      if (this._contentManagerService.contentExists(contentKey)) {
        this._contentManagerService.changeActiveContent(contentKey);
      } else {
        this._contentManagerService.addContent(p, ContentType.File, resource.name, resource.iconName, this.getToolGroupNames(resource), true);
      }
    }
  }

  private refreshIcon(fullPath: string, isExpanded: boolean): void {
    const resourceIndex = this.view.resources.findIndex(r => r.fullPath === fullPath);
    if (resourceIndex > -1 && !this.view.resources[resourceIndex].isFile) {
      this.view.resources[resourceIndex].iconName = this.getIconNameForResource({
        name: this.view.resources[resourceIndex].name,
        isFolder: true,
        isCollapsed: !isExpanded
      });
    }
  }

  private _workspaceDir: Yfs | null = null;
  private _bufferedDropZoneIndex = -1;
  private readonly _dropZoneIndex = new BehaviorSubject<{ readonly index: number, readonly timestamp: number }>({ index: -1, timestamp: 0 });
  private readonly _refreshActiveWorkspace = new BehaviorSubject<number>(-1);
  private readonly _escapedKeyPressed = new BehaviorSubject<number>(-1);
  private readonly _inputFieldValue = new BehaviorSubject<string | undefined>(undefined);

  private readonly _DZ_BUFFER_TIME = 450;
  private readonly _compiledAsmDownloadOptions: Array<ChoiceListModalOption> = [
    {
      caption: 'Binary',
      value: 'binary',
      description: 'Each byte is serialized to its actual value in the range of [0, 255]'
    }, {
      caption: 'Plain Text, Base 10',
      value: 'base10',
      description: 'Bytes are expressed in base-10 as sequences of ASCII printable numeric characters \'0\' through \'9\''
    }, {
      caption: 'Plain Text, Base 16',
      value: 'base16',
      description: 'Bytes are expressed in base-16 as sequences of ASCII printable characters \'0\' through \'9\' and \'a\' through \'f\''
    }
  ];
}
