import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { WorkspaceBrowserSubcomponent } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent';
import { WorkspaceHistory } from 'src/app/data-models/workspace/workspace-history';
import { WorkspaceBrowserSubcomponentEvent } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent-event';
import { WorkspaceHistoryViewModel } from 'src/app/view-models/left-section/workspace-browser/workspace-history-view-model';
import { ButtonSets, ButtonKeys } from 'src/app/view-models/left-section/button-bar/button-sets';
import { ModalService } from 'src/app/services/modal.service';
import { WorkspaceBrowserSubcomponentMessage } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent-message';
import { SessionService } from 'src/app/services/session.service';
import { AgentService } from 'src/app/services/agent.service';
import { combineLatest } from 'rxjs';
import { debounceTime, switchMapTo } from 'rxjs/operators';

@Component({
  selector: 'aq4w-histories-list',
  templateUrl: './histories-list.component.html',
  styleUrls: ['./histories-list.component.scss']
})
export class HistoriesListComponent implements OnInit, WorkspaceBrowserSubcomponent {

  @Output('onEvent')
  public readonly onEvent = new EventEmitter<WorkspaceBrowserSubcomponentEvent<WorkspaceHistory | 'none'>>();
  
  @Output('onBackendEvent')
  public readonly onBackendEvent = new EventEmitter<boolean>();

  @Output('sendMessage')
  public readonly sendMessage = new EventEmitter<WorkspaceBrowserSubcomponentMessage>();

  public view = {
    histories: new Array<WorkspaceHistoryViewModel>(),
    selectedHistoryKey: '',
    // show: false,
    collapsedRecords: new Array<string>()
  }

  public on = {
    historyClicked: (key: string) => {
      if (key === this.view.selectedHistoryKey) { // Select none
        this.view.selectedHistoryKey = '';
        this.onEvent.emit({
          hasData: true,
          data: 'none',
          buttons: ButtonSets.WorkspacesList.HistoryView.buttons,
          disabledButtonKeys: ButtonSets.WorkspacesList.HistoryView.defaultDisabledButtons
        })
      } else {
        this.view.selectedHistoryKey = key;
        this.onEvent.emit({
          hasData: true,
          data: this.getWorkspaceHistoryFromKey(key),
          buttons: ButtonSets.WorkspacesList.HistoryView.buttons,
          disabledButtonKeys: this.getDisabledButtonKeys()
        })
      }
    },
    titleClicked: (workspaceId: string) => {
      const index = this.view.collapsedRecords.indexOf(workspaceId);
      if (index > -1) {
        this.view.collapsedRecords.splice(index, 1);
      } else {
        this.view.collapsedRecords.push(workspaceId);
      }
    }
  }

  public readonly subcomponentName = 'histories-list';

  public clearSelections(): void {
    this.view.selectedHistoryKey = ''
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
        // this._sessionService.devkit.workspaceManagerService.getDeletedWorkspacesForProfile().then(deletedWorkspaces => {
        //   this.view.deletedWorkspaces = deletedWorkspaces;
        // })
        // this.view.show = true;
      // }
    } else if (buttonKey === ButtonKeys.Workspace_RestoreHistoricVersion) {
      this.handleRestoreRequest();
    } else if (buttonKey === ButtonKeys.Workspace_NewFromHistoricVersion) {
      this.handleNewFromHistoricVersionRequest();
    } else if (buttonKey === ButtonKeys.CollapseHistorySections) {
      this.view.collapsedRecords = this.view.histories.map(h => h.workspaceId);
    } else if (buttonKey === ButtonKeys.Workspace_RestoreDeleted) {
      
    } else if (buttonKey === ButtonKeys.Workspace_PurgeHistoricVersion) {
      this.handlePurgeRequest();
    }
  }

  public pushMessage(message: WorkspaceBrowserSubcomponentMessage): void {

  }

  constructor(private _modalService: ModalService, private _sessionService: SessionService, private _agentService: AgentService) { }

  ngOnInit() {
    //ZTODOthis._sessionService.devkit.workspaceManagerService.workspaceHistories().subscribe((workspaceHistories) => {
    //   this._workspaceHistories = workspaceHistories;
    //   this.view.histories = this.getViewModelsFromHistories(this._workspaceHistories)
    // })
    // this.view.histories = this.getViewModelsFromHistories(this._workspaceHistories)
    combineLatest([
      this._sessionService.platform.workspaceManager.workspaces(),
      this._sessionService.platform.workspaceManager.activeWorkspaceUpdated()
    ]).pipe(debounceTime(350), switchMapTo(this._sessionService.platform.workspaceManager.histories())).subscribe(histories => {
      this.view.histories = histories.filter(h => !h.isDeleted).map(h => {
        h.versions.forEach(v => {
          this._workspaceHistories.push({
            workspaceId: h.workspaceId,
            version: v.timestamp.toString(),
            latestTitle: v.title
          })
        });

        return {
          workspaceTitle: h.versions.sort((a, b) => b.timestamp - a.timestamp)[0].title,
          workspaceId: h.workspaceId,
          versions: h.versions.map(v => {
            return {
              key: `${h.workspaceId}_${v.timestamp}`,
              version: v.timestamp.toString()
            }
          })
        }
      })
    })
  }

  private getViewModelsFromHistories(workspaceHistories: Array<WorkspaceHistory>): Array<WorkspaceHistoryViewModel> {
    const groups = new Array<WorkspaceHistoryViewModel>();
    
    workspaceHistories.forEach(wh => {
      const index = groups.findIndex(g => g.workspaceId === wh.workspaceId);
      if (index > -1) {
        groups[index].versions.push({
          key: `${wh.workspaceId}_${wh.version}`,
          version: this._agentService.toPreferredDateTimeFormat(this.getDateFromCaioVersionString(wh.version).valueOf())
        });
      } else {
        groups.push({
          workspaceTitle: wh.latestTitle,
          workspaceId: wh.workspaceId,
          versions: [{
            key: `${wh.workspaceId}_${wh.version}`,
            version: this._agentService.toPreferredDateTimeFormat(this.getDateFromCaioVersionString(wh.version).valueOf())
          }]
        })
      }
    })

    return groups;
  }

  private getWorkspaceHistoryFromKey(key: string): WorkspaceHistory {
    const segments = key.split('_');
    return this._workspaceHistories.find(wh => wh.workspaceId === segments[0] && wh.version === segments[1]);
  }

  private getIndexOfVersionInViewModel(key: string): number {
    const history = this.getWorkspaceHistoryFromKey(key);
    const vm = this.view.histories.find(h => h.workspaceId === history.workspaceId);
    return !!vm ? vm.versions.findIndex(v => v.key === key) : -1;
  }

  private getDisabledButtonKeys(): Array<string> {
    if (!!this.view.selectedHistoryKey && this.getIndexOfVersionInViewModel(this.view.selectedHistoryKey) === 0) {
      return [ButtonKeys.Workspace_RestoreHistoricVersion, ButtonKeys.Workspace_RestoreDeleted];
    } else {
      return [ButtonKeys.Workspace_RestoreDeleted];
    }
  }

  private handleRestoreRequest(): void {
    const workspaceHistory = this.getWorkspaceHistoryFromKey(this.view.selectedHistoryKey);
    this._modalService.launchModal(
      'Restore workspace version',
      `Are you sure you want to restore the "${this.getDateFromCaioVersionString(workspaceHistory.version).toLocaleString()}" version of this workspace? All newer versions will be deleted.`,
      (affirmative) => {
        if (affirmative) {
          this._sessionService.platform.workspaceManager.restoreWorkspace(workspaceHistory.workspaceId, Number.parseInt(workspaceHistory.version))
            .then(() => {})
            .catch(() => {
              this._modalService.launchModal('Restore failed', 'TODO', () => {}, { yes: 'OK', no: '', hideNoButton: true });
          })
        }
      },
      { yes: 'Yes', no: 'No' })
  }

  private handleNewFromHistoricVersionRequest(): void {
    const workspaceHistory = this.getWorkspaceHistoryFromKey(this.view.selectedHistoryKey);
    this.sendMessage.emit({
      to: 'workspaces-list',
      subject: 'new-from-historic',
      body: {
        workspaceId: workspaceHistory.workspaceId,
        version: workspaceHistory.version
      }
    })
    // this._modalService.launchModal(
    //   'Restore workspace version',
    //   `Are you sure you want to restore the "${new Date(workspaceHistory.version).toLocaleString()}" version of this workspace? All newer versions will be deleted.`,
    //   (affirmative) => {
    //     // this._sessionService.devkit.workspaceManagerService.
    //   },
    //   { yes: 'Yes', no: 'No' })
  }

  private handlePurgeRequest(): void {
    const workspaceHistory = this.getWorkspaceHistoryFromKey(this.view.selectedHistoryKey);
    this._modalService.launchModal(
      'Purge deleted workspace',
      `^Are you sure you want to purge the workspace "${workspaceHistory.latestTitle}" and all of its history?^^This action cannot be undone.^`,
      (affirmative) => {
        if (affirmative) {
          this._sessionService.platform.workspaceManager.purgeWorkspace(workspaceHistory.workspaceId)
            .then(() => {})
            .catch(err => {
              this._modalService.launchModal('Purge failed', err, () => {}, { yes: 'OK', no: '', hideNoButton: true });
            });
        }
      },
      { yes: 'Yes', no: 'Cancel' },
      true)
  }

  private getDateFromCaioVersionString(vs: string): Date {
    return new Date(Number.parseInt(vs.split('.')[1]));
  }

  private _workspaceHistories = new Array<WorkspaceHistory>();

}
