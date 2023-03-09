import { Component, OnInit } from '@angular/core';
import { ToolGroup } from 'src/app/view-models/toolbar/tool-group';
import { ToolbarManagerService } from 'src/app/services/toolbar-manager.service';
import { ToolbarButton } from 'src/app/view-models/toolbar/toolbar-button';

@Component({
  selector: 'aq4w-contextual-toolbar',
  templateUrl: './contextual-toolbar.component.html',
  styleUrls: ['./contextual-toolbar.component.scss']
})
export class ContextualToolbarComponent implements OnInit {

  public view = {
    toolGroups: new Array<ToolGroup>(),
    buttonsWithActiveStatus: new Array<string>()
  }
  
  public on = {
    buttonClicked: (buttonKey: string) => {
      this._toolbarManagerService.buttonClicked(buttonKey);
    },
    // toggleSidebar: () => {
    //   this.mobileToggleSidebar.emit();
    // }
  }

  constructor(private _toolbarManagerService: ToolbarManagerService) { }

  ngOnInit() {
    this._toolbarManagerService.onButtonStateChanged().subscribe(state => {
      this.updateButtonViewModel(state.buttonKey, { disabled: !state.isEnabled });
    })

    this._toolbarManagerService.onToolGroupsChanged().subscribe(toolGroups => {
      this.view.toolGroups = toolGroups;
    })

    this._toolbarManagerService.buttonStatuses().subscribe(statuses => {
      this.view.buttonsWithActiveStatus = statuses.filter(x => x.isActive).map(x => x.buttonKey);
    })
  }

  private updateButtonViewModel(buttonKey: string, updates: Partial<ToolbarButton>): void {
    let indexOfGroup = -1;
    let indexOfButton = -1;
    for (let i = 0; i < this.view.toolGroups.length && indexOfGroup === -1 && indexOfButton === -1; i++) {
      indexOfButton = this.view.toolGroups[i].buttons.findIndex(b => b.buttonKey === buttonKey);
      if (indexOfButton > -1) {
        indexOfGroup = i;
        Object.keys(updates).forEach(k => {
          this.view.toolGroups[indexOfGroup].buttons[indexOfButton][k] = updates[k];
        })
      }
    }
  }

}
