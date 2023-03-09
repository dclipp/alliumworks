import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'aq4w-left-section',
  templateUrl: './left-section.component.html',
  styleUrls: ['./left-section.component.scss']
})
export class LeftSectionComponent extends Aq4wComponent implements OnInit {

  @Output('collapseToggled')
  public readonly collapseToggled = new EventEmitter<boolean>();

  public view = {
    isCollapsed: false,
    // activeBrowserType: SidebarBrowserType.Workspace,
    activeBrowserTypeKey: 'workspace',
    hasActiveSession: false
  }

  public on = {
    toggleCollapse: () => {
      this.view.isCollapsed = !this.view.isCollapsed;
      this.collapseToggled.emit(this.view.isCollapsed);
    },
    browserTypeChanged: (browserTypeKey: string) => {
      this.changeBrowserType(browserTypeKey);
      if (this.view.isCollapsed) {
        this.on.toggleCollapse();
      }
    },
    openUserPrefs: () => {
      //TODO
      // alert(window['awGetNavInfo']());
      document.getElementById('user-preferences-manager').classList.add('show');
    }
  }
  
  constructor(private _sessionService: SessionService) {
    super();
  }

  ngOnInit() {
    this._sessionService.platform.workspaceManager.hasActiveWorkspace().pipe(distinctUntilChanged(), takeUntil(this.destroyed)).subscribe((hasActiveWorkspace) => {
      this.view.hasActiveSession = hasActiveWorkspace;
    })
  }

  private changeBrowserType(browserTypeKey: string): void {
    // this.view.activeBrowserType = this.getSidebarBrowserTypeFromText(browserTypeKey);
    this.view.activeBrowserTypeKey = browserTypeKey;
    // this._sidebarService.clearSelections();
  }

}
