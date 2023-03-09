import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MemoryExplorerTabKey } from 'src/app/view-models/memory-explorer/memory-explorer-tab-key';

@Component({
  selector: 'aq4w-memory-explorer-sidebar',
  templateUrl: './memory-explorer-sidebar.component.html',
  styleUrls: ['./memory-explorer-sidebar.component.scss']
})
export class MemoryExplorerSidebarComponent implements OnInit {

  @Input('activeTab')
  public set activeTab(activeTab: MemoryExplorerTabKey) {
    this.view.activeTab = activeTab;
  }

  @Output('tabChanged')
  public readonly tabChanged = new EventEmitter<MemoryExplorerTabKey>();

  public view = {
    activeTab: 'browser'
  }
  
  public on = {
    changeTab: (tabKey: MemoryExplorerTabKey) => {
      this.view.activeTab = tabKey;
      this.tabChanged.emit(tabKey);
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
