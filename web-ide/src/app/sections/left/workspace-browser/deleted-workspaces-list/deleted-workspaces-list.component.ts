import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { WorkspaceBrowserSubcomponent } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent';
import { WorkspaceBrowserSubcomponentEvent } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent-event';
import { DeletedWorkspace } from 'src/app/data-models/workspace/deleted-workspace';
import { ButtonKeys, ButtonSets } from 'src/app/view-models/left-section/button-bar/button-sets';
import { WorkspaceBrowserSubcomponentMessage } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent-message';
import { SessionService } from 'src/app/services/session.service';
import { combineLatest } from 'rxjs';
import { debounceTime, switchMapTo } from 'rxjs/operators';

@Component({
  selector: 'aq4w-deleted-workspaces-list',
  templateUrl: './deleted-workspaces-list.component.html',
  styleUrls: ['./deleted-workspaces-list.component.scss']
})
export class DeletedWorkspacesListComponent implements OnInit, WorkspaceBrowserSubcomponent {

  @Output('onEvent')
  public readonly onEvent = new EventEmitter<WorkspaceBrowserSubcomponentEvent<string>>();

  @Output('onBackendEvent')
  public readonly onBackendEvent = new EventEmitter<boolean>();

  @Output('sendMessage')
  public readonly sendMessage = new EventEmitter<WorkspaceBrowserSubcomponentMessage>();

  public view = {
    deletedWorkspaces: new Array<DeletedWorkspace>(),
    selectedDeletedWorkspaceId: '',
    isCollapsed: false,
    loadingIds: new Array<string>()
  }

  public on = {
    rowClicked: (deletedWorkspaceId: string, event: MouseEvent) => {
      if (this.view.selectedDeletedWorkspaceId === deletedWorkspaceId) { // select none
        this.clearSelectionsAndEmit(true);
      } else {
        this.onEvent.emit({
          hasData: true,
          data: deletedWorkspaceId,
          buttons: ButtonSets.WorkspacesList.HistoryView.buttons,
          disabledButtonKeys: [
            ButtonKeys.Workspace_RestoreHistoricVersion,
            ButtonKeys.Workspace_NewFromHistoricVersion
          ]
        })
        this.view.selectedDeletedWorkspaceId = deletedWorkspaceId;
      }
    },
    toggleList: () => {
      this.view.isCollapsed = !this.view.isCollapsed;
    }
  }

  public readonly subcomponentName = 'deleted-workspaces-list';

  public clearSelections(): void {
    this.view.selectedDeletedWorkspaceId = ''
  }

  public buttonClicked(buttonKey: string): void {
    if (buttonKey === ButtonKeys.ShowWorkspaceHistories) {
      // if (this.view.show) {
        // this.view.show = false;
        // this.view.deletedWorkspaces = [];
        // this.view.selectedDeletedWorkspaceId = '';
        // this.onEvent.emit({
        //   hasData: true,
        //   data: ''
        // })
      // } else {
        // this._sessionService.devkit.workspaceManagerService.getDeletedWorkspaces().then(deletedWorkspaces => {
        //   this.view.deletedWorkspaces = deletedWorkspaces;
        // })
        // this.view.show = true;
      // }
      this._sessionService.platform.workspaceManager.histories().then(histories => {
        this.view.deletedWorkspaces = histories.filter(h => h.isDeleted).map(h => {
          return {
            title: h.versions.sort((a, b) => b.timestamp - a.timestamp)[0].title,
            workspaceId: h.workspaceId
          }
        })
      })
    } else if (buttonKey === ButtonKeys.CollapseHistorySections) {
      this.view.isCollapsed = true;
    } else if (buttonKey === ButtonKeys.Workspace_RestoreDeleted) {
      const workspaceId = this.view.selectedDeletedWorkspaceId;
      this.view.loadingIds.push(workspaceId);
      this.clearSelectionsAndEmit(true);
      this.onBackendEvent.emit(true);
      // window.setTimeout(() => {this.onBackendEvent.emit(false);this.view.loadingIds = this.view.loadingIds.filter(x => x !== this.view.selectedDeletedWorkspaceId)}, 6000)
      this._sessionService.platform.workspaceManager.restoreWorkspace(workspaceId).then(() => {
        this.onBackendEvent.emit(false);
        this.view.loadingIds = this.view.loadingIds.filter(x => x !== workspaceId);
        this.view.deletedWorkspaces = this.view.deletedWorkspaces.filter(ws => ws.workspaceId !== workspaceId);
      })
    }
  }

  public pushMessage(message: WorkspaceBrowserSubcomponentMessage): void {

  }
  
  constructor(private _sessionService: SessionService) { }

  ngOnInit() {
    // combineLatest([
    //   this._sessionService.platform.workspaceManager.workspaces(),
    //   this._sessionService.platform.workspaceManager.activeWorkspaceUpdated()
    // ]).pipe(debounceTime(350), switchMapTo(this._sessionService.platform.workspaceManager.histories())).subscribe(histories => {
    //   this.view.deletedWorkspaces = histories.filter(h => h.isDeleted).map(h => {
    //     return {
    //       title: h.versions.sort((a, b) => b.timestamp - a.timestamp)[0].title,
    //       workspaceId: h.workspaceId
    //     }
    //   })
    // })
  }

  private clearSelectionsAndEmit(emitDisabledButtonKeys: boolean): void {
    this.onEvent.emit({
      hasData: true,
      data: '',
      buttons: ButtonSets.WorkspacesList.HistoryView.buttons,
      disabledButtonKeys: emitDisabledButtonKeys ? ButtonSets.WorkspacesList.HistoryView.defaultDisabledButtons : undefined
    })
    this.view.selectedDeletedWorkspaceId = '';
  }
}
