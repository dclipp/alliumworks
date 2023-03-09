import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonBarButton } from 'src/app/view-models/left-section/button-bar/button-bar-button';
import { WorkspaceBrowserSubcomponent } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent';
import { WorkspaceBrowserSubcomponentEvent } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent-event';
import { WorkspaceHistory } from 'src/app/data-models/workspace/workspace-history';
import { ButtonSets, ButtonKeys } from 'src/app/view-models/left-section/button-bar/button-sets';
import { WorkspaceBrowserSubcomponentMessage } from 'src/app/view-models/left-section/workspace-browser/workspace-browser-subcomponent-message';

@Component({
  selector: 'aq4w-workspace-browser',
  templateUrl: './workspace-browser.component.html',
  styleUrls: ['./workspace-browser.component.scss']
})
export class WorkspaceBrowserComponent implements OnInit {

  public view = {
    buttons: new Array<ButtonBarButton>(),
    selectionCount: 0,
    disabledButtonKeys: new Array<string>()
  }

  public on = {
    buttonClicked: (buttonKey: string) => {
      if (buttonKey === ButtonKeys.Discard || buttonKey === ButtonKeys.Commit) {
        if (!!this._offloadedButtonSet) {
          this.view.buttons = this._offloadedButtonSet;
          this._offloadedButtonSet = null;
        } else {
          this.view.buttons = new Array<ButtonBarButton>();
        }
      } else if (buttonKey === ButtonKeys.ShowWorkspaceHistories) {
        this.deletedWorkspacesList.clearSelections();
        this.historiesList.clearSelections();
        this.workspacesList.clearSelections();
        this.show.historyView = !this.show.historyView;
        if (this.show.historyView) {
          this.refreshButtons(ButtonSets.WorkspacesList.HistoryView.buttons, ButtonSets.WorkspacesList.HistoryView.defaultDisabledButtons);
        } else {
          this.refreshButtons(ButtonSets.WorkspacesList.Default);
        }
      }
      this.broadcastButtonClick(buttonKey);
    },
    workspaceSelected: (event: WorkspaceBrowserSubcomponentEvent<Array<WorkspaceHistory> | 'none'>) => {
      this.deletedWorkspacesList.clearSelections();
      this.historiesList.clearSelections();
      this.refreshButtons(event.buttons, event.disabledButtonKeys);
      if (event.hasData) {
        if (event.data === 'none') {
          this.view.selectionCount = 0;
        } else {
          this.view.selectionCount = event.data.length;
        }
        console.log(`selectionCount=${this.view.selectionCount}`)
      }
    },
    deletedWorkspaceSelected: (event: WorkspaceBrowserSubcomponentEvent<string>) => {
      this.workspacesList.clearSelections();
      this.historiesList.clearSelections();
      this.refreshButtons(event.buttons, event.disabledButtonKeys);
      if (event.hasData) {
        if (event.data === '') {
          this.view.selectionCount = 0;
        } else {
          this.view.selectionCount = 1;
        }
      }
    },
    historySelected: (event: WorkspaceBrowserSubcomponentEvent<WorkspaceHistory | 'none'>) => {
      this.deletedWorkspacesList.clearSelections();
      this.workspacesList.clearSelections();
      this.refreshButtons(event.buttons, event.disabledButtonKeys);
      if (event.hasData) {
        if (event.data === 'none') {
          this.view.selectionCount = 0;
        } else {
          this.view.selectionCount = 1;
        }
      }
    },
    backendStateChanged: (isBusy: boolean) => {
      if (isBusy && this._offloadedDisabledButtonKeys === null) {
        this.disableAllButtons();
      } else if (!isBusy) {
        if (!!this._offloadedDisabledButtonKeys) {
          this.view.disabledButtonKeys = this._offloadedDisabledButtonKeys.map(k => k);
          this._offloadedDisabledButtonKeys = null;
        } else {
          this.view.disabledButtonKeys = new Array<string>();
        }
      }
    },
    sendMessage: (message: WorkspaceBrowserSubcomponentMessage) => {
      const recipient = this.getMessageRecipient(message.to);
      if (!!recipient) {
        if (message.subject === 'new-from-historic') {
          this.show.historyView = false;
          this.refreshButtons(ButtonSets.WorkspacesList.Default);
        }
        recipient.pushMessage(message);
      }
    }
  }

  public show = {
    historyView: false
  }

  constructor() { }

  ngOnInit() {
  }

  private refreshButtons(buttons?: Array<ButtonBarButton>, disabledButtonKeys?: Array<string>): void {
    window.setTimeout(() => {
      if (!!buttons) {
        if (buttons.every(b => ButtonSets.PendingChange.some(c => c.key === b.key))) { // If pushing pending change buttons, save the current buttons for after
         this._offloadedButtonSet = JSON.parse(JSON.stringify(this.view.buttons));
        }
        this.view.buttons = buttons;
      }
      if (!!disabledButtonKeys) {
        this.view.disabledButtonKeys = disabledButtonKeys;
      }
    });
  }

  private broadcastButtonClick(buttonKey: string): void {
    this.deletedWorkspacesList.buttonClicked(buttonKey);
    this.workspacesList.buttonClicked(buttonKey);
    this.historiesList.buttonClicked(buttonKey);
  }

  private disableAllButtons(): void {
    this._offloadedDisabledButtonKeys = this.view.disabledButtonKeys.map(k => k);
    this.view.disabledButtonKeys = this.view.buttons.map(btn => btn.key);
  }

  private getMessageRecipient(subcomponentName: string): WorkspaceBrowserSubcomponent {
    if (this.deletedWorkspacesList.subcomponentName === subcomponentName) {
      return this.deletedWorkspacesList;
    } else if (this.historiesList.subcomponentName === subcomponentName) {
      return this.historiesList;
    } else if (this.workspacesList.subcomponentName === subcomponentName) {
      return this.workspacesList;
    } else {
      return null;
    }
  }

  private _offloadedDisabledButtonKeys: Array<string> = null;
  private _offloadedButtonSet: Array<ButtonBarButton> = null;

  @ViewChild('deletedWorkspacesList')
  deletedWorkspacesList: WorkspaceBrowserSubcomponent;

  @ViewChild('historiesList')
  historiesList: WorkspaceBrowserSubcomponent;

  @ViewChild('workspacesList')
  workspacesList: WorkspaceBrowserSubcomponent;
}
