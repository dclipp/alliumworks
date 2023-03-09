import { Component, OnInit } from '@angular/core';
import { TabBarTab } from 'src/app/view-models/tab-bar/tab-bar-tab';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { takeUntil } from 'rxjs/operators';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'aq4w-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent extends Aq4wComponent implements OnInit {

  public view = {
    tabs: new Array<TabBarTab>(),
    activeTabKey: '',
    dirtyTabs: new Array<string>(),
    activeTabIcon: ''
  }

  public on = {
    tabClicked: (tabKey: string) => {
      this._contentManagerService.changeActiveContent(tabKey);
    },
    closeClicked: (tabKey: string, event: MouseEvent) => {
      event.stopPropagation();
      if (this.view.dirtyTabs.includes(tabKey)) {
        this._modalService.launchModal(
          'Unsaved changes',
          'There are unsaved changes which will be lost if you close this tab. How do you want to proceed?',
          (affirmative) => {
            if (affirmative) {
              this._contentManagerService.changeContentStatus(tabKey, false);
              this._contentManagerService.removeContent(tabKey);
            }
          },
          { yes: 'Discard changes and close tab', no: 'Keep tab open' });
      } else {
        this._contentManagerService.removeContent(tabKey);
      }
    },
    optionChanged: () => {
      const key = this.tabSelector.value;
      this.on.tabClicked(key);
      // this.view.activeTabKey = document.getElementById('aq4w-tab-selector')['value'];
      // this.view.activeTabIcon = !!this.view.activeTabKey ? this.view.tabs.find(t => t.key === this.view.activeTabKey).iconName : '';
    }
  }
  
  constructor(private _contentManagerService: ContentManagerService, private _modalService: ModalService) {
    super();
  }

  ngOnInit() {
    this._contentManagerService.onActiveContentChanged().pipe(takeUntil(this.destroyed)).subscribe(contentKey => {
      window.setTimeout(() => {
        this.view.activeTabKey = contentKey;
        this.view.activeTabIcon = !!contentKey ? this.view.tabs.find(t => t.key === contentKey).iconName : '';
        this.tabSelector.value = contentKey;
      });
    })

    this._contentManagerService.content().pipe(takeUntil(this.destroyed)).subscribe(content => {
      window.setTimeout(() => {
        if (content.length > 0) {
          this.view.tabs = content.map(c => {
            return {
              key: c.contentKey,
              label: c.label,
              iconName: c.iconName
            }
          })
        } else {
          this.view.tabs = [];
          this.view.activeTabKey = '';
          this.view.dirtyTabs = new Array<string>();
        }
      });
    })

    this._contentManagerService.onContentStatusChanged().pipe(takeUntil(this.destroyed)).subscribe(status => {
      const index = this.view.dirtyTabs.findIndex(x => x === status.contentKey);
      if (status.isDirty && index === -1) {
        this.view.dirtyTabs.push(status.contentKey);
      } else if (!status.isDirty && index > -1) {
        this.view.dirtyTabs.splice(index, 1);
      }
    })

    this._contentManagerService.overrideLabels().pipe(takeUntil(this.destroyed)).subscribe(overrideLabels => {
      this.view.tabs = this.view.tabs.map(t => {
        const override = overrideLabels.find(ol => ol.key === t.key);
        if (!!override) {
          return {
            iconName: t.iconName,
            key: t.key,
            label: override.label
          };
        } else {
          return t;
        }
      })
    })
  }

  public get tabSelector(): HTMLSelectElement {
    return document.getElementById('aq4w-tab-selector') as HTMLSelectElement;
  }

}
