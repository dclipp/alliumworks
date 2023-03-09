import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { WorkspaceBrowserSubcomponent } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent';
import { WorkspaceBrowserSubcomponentEvent } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent-event';
import { ButtonSets, ButtonKeys } from 'src/app/view-models/left-section/button-bar/button-sets';
import { takeUntil } from 'rxjs/operators';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { WorkspaceViewModel } from 'src/app/view-models/workspace-browser/workspace';
import { ActiveSessionInfo } from 'src/app/data-models/work-session/active-session-info';
import { ModalService } from 'src/app/services/modal.service';
import { WorkspaceBrowserSubcomponentMessage } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent-message';
import { SessionService } from 'src/app/services/session.service';
import { AwArchiveApi } from '@alliumworks/platform';
import { FileUploadModalNamedTypes } from 'src/app/data-models/modal/file-upload-modal-named-types';

@Component({
  selector: 'aq4w-workspaces-list',
  templateUrl: './workspaces-list.component.html',
  styleUrls: ['./workspaces-list.component.scss']
})
export class WorkspacesListComponent extends Aq4wComponent implements OnInit, WorkspaceBrowserSubcomponent {

  @Output('onEvent')
  public readonly onEvent = new EventEmitter<WorkspaceBrowserSubcomponentEvent<Array<WorkspaceHistory> | 'none'>>();

  @Output('onBackendEvent')
  public readonly onBackendEvent = new EventEmitter<boolean>();
  
  @Output('sendMessage')
  public readonly sendMessage = new EventEmitter<WorkspaceBrowserSubcomponentMessage>();

  public view = {
    workspaces: new Array<WorkspaceViewModel>(),
    activeSessionInfo: { hasActive: false, workspaceId: undefined, workspaceVersion: undefined } as ActiveSessionInfo,
    loadingItems: new Array<string>(),
    newWorkspace: {
      id: '_NEW_',
      showRow: false,
      isEditing: false,
      title: ''
    }
  }

  public on = {
    rowClicked: (workspaceId: string, workspaceVersion: number, event: MouseEvent) => {
      const key = this.getItemKey(workspaceId, workspaceVersion);
      if (this.isItemSelected(key)) { // clear all selections
        this.selectNone();
        this.onEvent.emit({
          hasData: true,
          data: 'none',
          disabledButtonKeys: []
        })
      } else {
        this.updateSelectedItems(key, event.shiftKey);
        this.refreshViewModels();
        this.onEvent.emit({
          hasData: true,
          data: this.getHistoryObjectsFromSelectedItems(),
          disabledButtonKeys: this.getDisabledButtonKeysForSelectedItems(),
          buttons: ButtonSets.WorkspacesList.Default
        })
      }
    },
    inputKeypress: (event: KeyboardEvent) => {
      if (event.charCode === 13) { // Enter
        // this._sidebarService.buttonBarButtonClicked(SidebarButtonKeys.Commit);
      }
    }
  }

  public readonly subcomponentName = 'workspaces-list';

  public clearSelections(): void {
    this.selectNone();
  }

  public buttonClicked(buttonKey: string): void {
    if (buttonKey === ButtonKeys.DeleteSelected) {
      this.handleDeleteWorkspace();
    } else if (buttonKey === ButtonKeys.RenameSelected) {
      this.handleRenameWorkspace();
    } else if (buttonKey === ButtonKeys.Discard && this._editMode !== 'none') {
      this.handleDiscardPendingWorkspace();
    } else if (buttonKey === ButtonKeys.Commit && this._editMode !== 'none') {
      if (this._editMode === 'new') {
        this.handleCommitNewWorkspace();
      } else { // Rename existing
        this.handleCommitRename(this._editMode.workspaceId);
      }

      this._editMode = 'none';
      this._selectedItems = new Array<string>();
      this.refreshViewModels('none');
      this.onEvent.emit({
        hasData: true,
        data: 'none'
      })
    } else if (buttonKey === ButtonKeys.NewWorkspace) {
      this.handleCreateNewPendingWorkspace();
    } else if (buttonKey === ButtonKeys.OpenWorkspace) {
      this.handleOpenWorkspace();
    } else if (buttonKey === ButtonKeys.UploadWorkspace) {
      this.launchUploadWorkspaceModal();
    } else if (buttonKey === ButtonKeys.DownloadWorkspace) {
      this.handleDownloadWorkspace();
    }
  }
  
  public pushMessage(message: WorkspaceBrowserSubcomponentMessage): void {
    if (message.subject === 'new-from-historic') {
      this.loadEditorForNewFromHistoric(message.body.workspaceId, message.body.version);
    }
  }

  constructor(private _sessionService: SessionService, private _modalService: ModalService) {
    super();
  }

  ngOnInit() {
    this.emitDefaultButtonSet();
    this._sessionService.platform.workspaceManager.activeWorkspace()
      .pipe(takeUntil(this.destroyed))
      .subscribe(activeWorkspace => {
        if (!!activeWorkspace && !!activeWorkspace.workspaceId) {
          this.view.activeSessionInfo = {
            workspaceId: activeWorkspace.workspaceId,
            workspaceVersion: 'ZTODOver',// activeWorkspace.version,
            hasActive: true
          }
        } else {
          this.view.activeSessionInfo = {
            workspaceId: '',
            hasActive: false
          }
        }
      })

    this._sessionService.platform.workspaceManager.workspaces().pipe(takeUntil(this.destroyed)).subscribe(workspaces => {
      console.log()
      this.view.workspaces = workspaces.map(x => new WorkspaceViewModel({
        id: x.workspaceId,
        title: x.title,
        version: 'ZTODO'
      }));
    })
  }

  private emitDefaultButtonSet(): void {
    this.onEvent.emit({
      buttons: ButtonSets.WorkspacesList.Default,
      hasData: false
    });
  }

  private getItemKey(workspaceId: string, workspaceVersion: number): string {
    return `${workspaceId}_${workspaceVersion}`;
  }

  private isItemSelected(key: string): boolean {
    return this._selectedItems.includes(key);
  }

  private updateSelectedItems(key: string, allowMulti: boolean): void {
    const index = this._selectedItems.findIndex(x => x === key);
    if (index > -1) {
      this._selectedItems.splice(index, 1);
    } else {
      if (allowMulti) {
        this._selectedItems.push(key);
      } else {
        this._selectedItems = [key];
      }
    }
  }

  private getHistoryObjectsFromSelectedItems(): Array<WorkspaceHistory> {
    return this._selectedItems.map(x => {
      const segments = x.split('_');
      return {
        workspaceId: segments[0],
        version: segments[1]
      }
    });
  }

  private getDisabledButtonKeysForSelectedItems(): Array<string> {
    const selectedItem = this.getSingleSelected();

    // If the selected item is loading, disable all single-item buttons for it
    if (!!selectedItem && this.view.loadingItems.includes(selectedItem.id)) {
      return [
        ButtonKeys.OpenWorkspace,
        ButtonKeys.DeleteSelected,
        ButtonKeys.RenameSelected,
        ButtonKeys.DownloadWorkspace];
    } else {
      return [];
    }
  }

  private refreshViewModels(editingId?: string): void {
    this.view.workspaces = this.view.workspaces.map(ws => {
      ws.isSelected = this._selectedItems.some(si => si.split('_')[0] === ws.id);
      if (!!editingId) {
        ws.isEditing = ws.id === editingId;
      }
      return ws;
    })
  }

  private selectNone(): void {
    this._selectedItems = new Array<string>();
    this.refreshViewModels();
  }

  private getSingleSelected(): WorkspaceViewModel {
    if (this._selectedItems.length === 1) {
      const segments = this._selectedItems[0].split('_');
      const workspaceId = segments[0];
      const version = segments[1];
      return this.view.workspaces.find(ws => ws.id === workspaceId && ws.version === version);
    } else {
      return null;
    }
  }

  private toggleLoadingIconForItem(id: string): void {
    const index = this.view.loadingItems.findIndex(x => x === id);
    if (index > -1) {
      this.view.loadingItems.splice(index, 1);
    } else {
      this.view.loadingItems.push(id);
    }
  }

  private getInputElement(id: string): HTMLInputElement {
    return document.getElementById(`workspace-browser-input-for-${id}`) as HTMLInputElement;
  }

  private loadEditorForNewFromHistoric(workspaceId: string, version: string): void {
    this._newFromHistory = {
      workspaceId: workspaceId,
      version: version
    };
    this.buttonClicked(ButtonKeys.NewWorkspace);
  }

  private handleCommitNewWorkspace(): void {
    this.view.newWorkspace.isEditing = false;
    const tempId = this.view.newWorkspace.id;
    this.toggleLoadingIconForItem(tempId);
    const newTitle = this.getInputElement(tempId).value;
    this.view.newWorkspace.title = newTitle;
    if (this.view.workspaces.some(ws => ws.id !== tempId && ws.title === newTitle)) {
      this.onBackendEvent.emit(false);
      this.toggleLoadingIconForItem(tempId);
      this.view.newWorkspace.showRow = false;
      this.onEvent.emit({
        hasData: false,
        disabledButtonKeys: this.getDisabledButtonKeysForSelectedItems()
      });
      this.showFailureModal('A workspace already exists with the provided name', 'Failed to create workspace');
    } else {
      if (!!this._newFromHistory) {
        this.onBackendEvent.emit(true);
        this._sessionService.platform.workspaceManager.cloneWorkspace(this._newFromHistory.workspaceId, newTitle).then(clonedId => {
          this.onBackendEvent.emit(false);
          this._newFromHistory = null;
          this.toggleLoadingIconForItem(tempId);
          this.view.newWorkspace.showRow = false;        

          this.onEvent.emit({
            hasData: false,
            disabledButtonKeys: this.getDisabledButtonKeysForSelectedItems()
          })
        }).catch(err => {
          this.onBackendEvent.emit(false);
          this._newFromHistory = null;
          this.toggleLoadingIconForItem(tempId);
          this.view.newWorkspace.showRow = false;
          this.onEvent.emit({
            hasData: false,
            disabledButtonKeys: this.getDisabledButtonKeysForSelectedItems()
          });
          this.showFailureModal(err || 'Failed to create workspace', 'Failed to create workspace');
        })
      } else {
        this.onBackendEvent.emit(true);
        this._sessionService.platform.workspaceManager.createWorkspace(newTitle).then(newWorkspaceId => {
          this.onBackendEvent.emit(false);
          this.toggleLoadingIconForItem(tempId);
          this.view.newWorkspace.showRow = false;
          this.onEvent.emit({
            hasData: true,
            data: [{
              workspaceId: newWorkspaceId,
              version: 'ztodo ver',
              latestTitle: newTitle
            }],
            disabledButtonKeys: this.getDisabledButtonKeysForSelectedItems()
          })
        }).catch(err => {
          this.onBackendEvent.emit(false);
          this.toggleLoadingIconForItem(tempId);
          this.view.newWorkspace.showRow = false;
          this.onEvent.emit({
            hasData: false,
            disabledButtonKeys: this.getDisabledButtonKeysForSelectedItems()
          });
          this.showFailureModal(err || 'Failed to create workspace', 'Failed to create workspace');
        })
      }
    }
  }

  private handleDeleteWorkspace(): void {
    const selectedItem = this.getSingleSelected();
    this._modalService.launchModal('Delete workspace', `Are you sure you want to delete workspace "${selectedItem.title}" and all of its contents?`, (affirmative) => {
      if (affirmative) {
        this.toggleLoadingIconForItem(selectedItem.id);
        this.selectNone();
        this.onEvent.emit({
          hasData: true,
          data: 'none'
        })
        this._sessionService.platform.workspaceManager.deleteWorkspace(selectedItem.id).then(() => {
          this.toggleLoadingIconForItem(selectedItem.id);
          //ZTODO remove if (!succeeded) {
          //   //todo
          //   console.error('Delete workspace failed')
          // }
        })
      }
    });
  }

  private handleRenameWorkspace(): void {
    const selectedItem = this.getSingleSelected();
    this._editMode = { workspaceId: selectedItem.id };
    this.refreshViewModels(selectedItem.id);
    this.onEvent.emit({
      hasData: false,
      buttons: ButtonSets.PendingChange
    })
    window.setTimeout(() => {
      this.getInputElement(selectedItem.id).focus();
    }, 250);
  }

  private handleDiscardPendingWorkspace(): void {
    this._editMode = 'none';
      this.view.newWorkspace.isEditing = false;
      this.view.newWorkspace.showRow = false;
      this.view.newWorkspace.title = '';
      this.refreshViewModels('none');
  }

  private handleCommitRename(editingId: string): void {
    this.toggleLoadingIconForItem(editingId);
    const newTitle = this.getInputElement(editingId).value;
    this._sessionService.platform.workspaceManager.renameWorkspace(editingId, newTitle).then(() => {
      this.toggleLoadingIconForItem(editingId);

      this.onEvent.emit({
        hasData: false,
        disabledButtonKeys: this.getDisabledButtonKeysForSelectedItems()
      })
    })
  }

  private handleCreateNewPendingWorkspace(): void {
    this._editMode = 'new';
    this.view.newWorkspace.isEditing = true;
    this.view.newWorkspace.title = '';
    this.view.newWorkspace.showRow = true;
    window.setTimeout(() => {
      this.getInputElement(this.view.newWorkspace.id).focus();
    }, 250);
    this.selectNone();
    this.onEvent.emit({
      hasData: true,
      data: 'none',
      buttons: ButtonSets.PendingChange
    })
  }

  private handleOpenWorkspace(): void {
    const selectedWorkspace = this.getSingleSelected();
    if (this.view.activeSessionInfo.hasActive) {
      if (this.view.activeSessionInfo.workspaceId === selectedWorkspace.id && this.view.activeSessionInfo.workspaceVersion === selectedWorkspace.version) {
        this.toggleLoadingIconForItem(selectedWorkspace.id);
        this._sessionService.platform.workspaceManager.openWorkspace(selectedWorkspace.id).then(() => {
          this.toggleLoadingIconForItem(selectedWorkspace.id);
        }).catch(() => {
          this.showFailureModal('^Unable to download the scratch workspace.^^Please verify that you are connected to the internet and try again.^');
        })
      } else {
        //TODO modal
      }
    } else {
      this.toggleLoadingIconForItem(selectedWorkspace.id);
      this._sessionService.platform.workspaceManager.openWorkspace(selectedWorkspace.id).then(() => {
        this.toggleLoadingIconForItem(selectedWorkspace.id);
      }).catch(() => {
        this.showFailureModal('^Unable to begin work session.^^Please verify that you are connected to the internet and try again.^');
      })
    }
  }

  // private handleUploadWorkspace(fromArchive: boolean, data: { readonly files: Array<{ readonly filename: string; readonly fileContent: string; }>, readonly workspaceNames: string } | 'error'): void {
  private handleUploadWorkspace(fromArchive: boolean, data: Array<{ readonly files: Array<{ readonly filename: string; readonly fileContent: string; }>, readonly workspaceName: string }> | 'error'): void {
    const tempId = this.view.newWorkspace.id;
    this.toggleLoadingIconForItem(tempId);
    const messageGenericFailure = '^Unable to import workspace.^^Please verify that all files are valid.^';
    const failureTitle = 'Import workspace failed';

    if (!!data && data !== 'error') {
      // TODO !!
      // if (fromArchive) {
      //   this.uploadWorkspacesFromArchive(data.map(d => {
      //     return {
      //       files: JSON.parse(d.files[0].fileContent) as Array<Models.SerializedWorkspaceFile>,
      //       importTitle: d.workspaceName
      //     }
      //   }));
      // } else {
      //   this.uploadWorkspaceDirectly(data);
      // }
    } else {
      this.showFailureModal(messageGenericFailure, failureTitle);
    }
  }

  // TODO !!
  // private uploadWorkspacesFromArchive(data: Array<{ readonly files: Array<Models.SerializedWorkspaceFile>, readonly importTitle: string }>): void {
  //   const tempId = this.view.newWorkspace.id;
  //   this.toggleLoadingIconForItem(tempId);
  //   const messageGenericFailure = '^Unable to import workspace.^^Please verify that all files are valid.^';
  //   const failureTitle = 'Import workspace failed';

  //   // TODO !!
  //   // this._sessionService.devkit.workspaceManagerService.importWorkspaces(data).then(success => {
  //   //   if (!success) {
  //   //     this.showFailureModal(messageGenericFailure, failureTitle);
  //   //   }
  //   // })
  // }

  private uploadWorkspaceDirectly(items: Array<{ readonly files: Array<{ readonly filename: string; readonly fileContent: string; }>, readonly workspaceName: string }>): void {
    const tempId = this.view.newWorkspace.id;
    this.toggleLoadingIconForItem(tempId);
    const messageGenericFailure = '^Unable to import workspace.^^Please verify that all files are valid.^';
    const messageNoSettingsFile = '^Could not find assembly settings.^^If uploading multiple files, please ensure that you are including the assembly.json file.^';
    const failureTitle = 'Import workspace failed';

    Promise.all(items.map(data => {
      let p: Promise<boolean | string[]>;
      if (data.files.some(f => f.filename.toLowerCase().endsWith('.json'))) {
        const jsonFiles = data.files.filter(f => f.filename.toLowerCase().endsWith('.json'));
        const settingsJsonFile = jsonFiles.find(f => !!f.fileContent && f.fileContent.includes('assemblyName'));
        if (!!settingsJsonFile) {
          // TODO !!
          // p = this._sessionService.devkit.workspaceManagerService.importWorkspaces([
          //   {
          //     importTitle: data.workspaceName,
          //     files: data.files.map(f => {
          //       return {
          //         name: f.filename,
          //         content: f.fileContent,
          //         containerPath: '/'
          //       }
          //     })
          //   }
          // ]);
        } else {
          p = Promise.resolve([messageNoSettingsFile, failureTitle]);
        }
      } else {
        p = Promise.resolve([messageNoSettingsFile, failureTitle]);
        // this.showFailureModal(messageNoSettingsFile, failureTitle);
      }

      return p;
    })).then(results => {
      this.onBackendEvent.emit(false);
      this.toggleLoadingIconForItem(tempId);
      this.view.newWorkspace.showRow = false;
      if (!results.every(r => r === true)) {
        this.showFailureModal(messageGenericFailure, failureTitle);
      }

      this.onEvent.emit({
        hasData: false,
        disabledButtonKeys: this.getDisabledButtonKeysForSelectedItems()
      })
    })
  }

  private launchUploadWorkspaceModal(): void {
    const currentWorkspaceNames = this.view.workspaces.map(ws => ws.title);
    let launchForwardModal: (() => void) | null = null;

    this._modalService.launchFileUploadModal({
        title: 'Upload workspace',
        description: 'Select an archive file or multiple source files and an assembly.json file',
        acceptExtensions: (uploadType) => {
          if (uploadType === FileUploadModalNamedTypes.source) {
            return ['aq', 'json'];
          } else { // archive
            return ['json'];
          }
        },
        acceptArchiveFile: true,
        acceptSourceUpload: true,
        uploadTypeNotes: [{
          uploadType: FileUploadModalNamedTypes.archive,
          paragraphs: ['Upload an AlliumWorks archive file and select workspaces from the contents of the archive']
        }, {
          uploadType: FileUploadModalNamedTypes.source,
          paragraphs: ['Directly upload Allium source files (*.aq) and an assembly.json file']
        }],
        allowMultipleFiles: (uploadType) => {
          return uploadType === FileUploadModalNamedTypes.source;
        },
        processFiles: (fileData) => {
          return { canProceed: true }
        },
        finishUpload: () => {
          return {}
        }
      },
      (output) => {
        if (output.affirmative && !!output.files && output.files !== 'error') {
          if (output.fromArchive === true) {
            launchForwardModal = () => {
              const archiveFile = (output.files as any).find(f => f.filename.toLowerCase().endsWith('.json'));
              if (!!archiveFile) {
                const ar: {
                  readonly workspaces: Array<string>;
                } = JSON.parse(archiveFile.fileContent);
              const deserializedWorkspaces = ar.workspaces.map(ws => this._sessionService.platform.archiver.workspace.deserialize(ws));
                this._modalService.launchPackageEntitySelectionModal({
                  title: 'Upload workspace',
                  body: 'Choose workspaces to import',
                  allowMultipleSelections: true,
                  inputLabel: 'Imported Workspace Title',
                  requiredInputValidator: (s) => {
                    if (currentWorkspaceNames.includes(s)) {
                      return 'Workspace name is already in use';
                    } else if (!(!!s)) {
                      return 'Import workspace name is required';
                    } else {
                      return true;
                    }
                  },
                  entityDescriptions: deserializedWorkspaces.map(ws => {
                    return {
                      key: ws.workspaceId,
                      title: ws.title
                    }
                  })
                }, (pesDecision) => {
                  if (pesDecision.affirmative) {
                    console.log(`IMPWKSP=${pesDecision.inputValues}`)
                    const includeWorkspaces = Object.keys(pesDecision.inputValues).map(k => {
                      return {
                        workspaceId: k,
                        importTitle: pesDecision.inputValues[k]
                      }
                    });
                    this._sessionService.platform.workspaceManager.importWorkspaces(archiveFile.fileContent, ...includeWorkspaces).then(() => {

                    }).catch((err) => {
                      console.error(`IMPORT failed: ${err.message}`)
                    })
                  }
                })
              }
            }
          } else {

          }

          let checkFileModalClosedItr = 0;
          const checkFileModalClosed = () => {
              checkFileModalClosedItr++;
              if (document.getElementsByClassName('file-upload-modal open').length === 0) {
                if (launchForwardModal !== null) {
                  launchForwardModal();
                }
              } else if (checkFileModalClosedItr <= 15) {
                window.setTimeout(() => checkFileModalClosed(), 200);
              } else {
                throw new Error('File modal was not closed within the expected time frame');
              }
          }

          checkFileModalClosed();
        }
      }
    )
  }

  private showFailureModal(message: string, title?: string): void {
    this._modalService.launchModal(title || 'Server error', message, () => {}, { yes: 'OK', no: 'Cancel', hideNoButton: true })
  }

  private handleDownloadWorkspace(): void {
    const workspaceIds = this._selectedItems.map(si => {
      const segments = si.split('_');
      return segments[0];
    });

    this._sessionService.platform.workspaceManager.exportWorkspaces(...workspaceIds).then(serializedWorkspaces => {
      window['tstEXPORTs'] = serializedWorkspaces;
      const name = `workspaces_${Date.now()}.json`;
      const blob = new File([serializedWorkspaces], name, { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.id = `dl_${Math.random().toString().split('.')[1]}`;
      downloadLink.href = downloadUrl;
      downloadLink.download = name;

      document.body.appendChild(downloadLink);
      window.setTimeout(() => {
        const el = document.getElementById(downloadLink.id);
        el.click();
        el.remove();
        URL.revokeObjectURL(downloadUrl);
      }, 250);
    }).catch(err => {
      // error
      this.showFailureModal('Failed to download workspace: ' + err.message, 'Download workspace');
    });
  }

  private _uploadWorkspaceTitle = '';
  private _newFromHistory: WorkspaceHistory = null;
  private _editMode: 'none' | 'new' | { workspaceId: string } = 'none';
  private _selectedItems = new Array<string>();
}

export interface WorkspaceHistory {
  readonly workspaceId: string;
  readonly version: string;
  readonly latestTitle?: string;
}
