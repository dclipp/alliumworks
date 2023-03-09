import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { MemoryExplorerTabKey } from 'src/app/view-models/memory-explorer/memory-explorer-tab-key';
import { MemoryExplorerQuadCollection } from 'src/app/view-models/memory-explorer/memory-explorer-quad-collection';
import { ByteSequenceCreator } from '@allium/types';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { emptyMemoryExplorerModel } from 'src/app/view-models/memory-explorer/memory-explorer-model';
import { SessionService } from 'src/app/services/session.service';
// import { MemoryExplorerWatchPayloadOLD } from 'src/app/view-models/memory-explorer/memory-explorer-watch-payloadOLD';

@Component({
  selector: 'aq4w-memory-explorer-container',
  templateUrl: './memory-explorer-container.component.html',
  styleUrls: ['./memory-explorer-container.component.scss']
})
export class MemoryExplorerContainerComponent extends Aq4wComponent implements OnInit {

  @Input('isExpanded')
  public set isExpanded(isExpanded: boolean) {
    // this.setupExpansionTriggeredSubscription(expansionTriggered);
    // if (!isExpanded) {
    //   this.view.staticEmphasizeWriteIcons = this.view.emphasizeWriteIcons;
    //   this.view.emphasizeWriteIcons = [];
    //   this.view.staticEmphasizeReadIcons = this.view.emphasizeReadIcons;
    //   this.view.emphasizeReadIcons = [];
    // }
  }

  @Output('emphasizeInTaskBar')
  public readonly emphasizeInTaskBar = new EventEmitter<boolean>();
  
  public view = {
    activeTab: 'browser',
    watches: emptyMemoryExplorerModel(),
    // writeWatches: new MemoryExplorerQuadCollection(),
    // readWatches: new MemoryExplorerQuadCollection(),
    // emphasis: {
    //   writeIcons: new MemoryExplorerQuadCollection(),
    //   readIcons: new MemoryExplorerQuadCollection(),
    //   writeIconsStatic: new MemoryExplorerQuadCollection(),
    //   readIconsStatic: new MemoryExplorerQuadCollection()
    // },
    editingAddresses: new MemoryExplorerQuadCollection(),
    isMachineReady: false
  }
  
  public on = {
    tabChanged: (tabKey: MemoryExplorerTabKey) => {
      this.view.activeTab = tabKey;
    },
    // toggleReadWatch: (address: QuadByte) => {
    //   this._dataHelper.toggleReadWatch(address);
    // },
    // toggleWriteWatch: (address: QuadByte) => {
    //   this._dataHelper.toggleWriteWatch(address);
    // },
    // watchChanged: (payload: MemoryExplorerWatchPayloadOLD) => {
      // this.view.watches = payload;
      // this._dataHelper.toggleWriteWatch(address);
    // }
  }

  constructor(private _sessionService: SessionService) {
    super();
  }

  ngOnInit() {
    this._sessionService.platform.machine.sessionIsDefined().pipe(distinctUntilChanged(), takeUntil(this.destroyed)).subscribe(sessionIsDefined => {
      this.view.isMachineReady = sessionIsDefined;
    })

    // this.view.watches.subscribe()TODO
    window['TSTEMMEM'] = (addr: number, isWrite?: boolean) => {
      if (isWrite === true) {
        const a = ByteSequenceCreator.QuadByte(addr);
        if (this.view.watches.emphasis.writes.includes(a)) {
          this.view.watches.emphasis.writes.remove(a);
        } else {
          this.view.watches.emphasis.writes.insert(a);
        }
      } else {
        const a = ByteSequenceCreator.QuadByte(addr);
        if (this.view.watches.emphasis.reads.includes(a)) {
          this.view.watches.emphasis.reads.remove(a);
        } else {
          this.view.watches.emphasis.reads.insert(a);
        }
      }
    }
  }

  // private updateViewQuads(changes: {
  //   writeWatches?: MemoryExplorerQuadCollection,
  //   readWatches?: MemoryExplorerQuadCollection,
  //   editingAddresses?: MemoryExplorerQuadCollection,
  //   writeIcons?: MemoryExplorerQuadCollection,
  //   readIcons?: MemoryExplorerQuadCollection,
  //   writeIconsStatic?: MemoryExplorerQuadCollection,
  //   readIconsStatic?: MemoryExplorerQuadCollection
  // }): void {
  //   if (!!changes.writeWatches) {
  //     this.view.writeWatches = changes.writeWatches;
  //   }
  //   if (!!changes.readWatches) {
  //     this.view.readWatches = changes.readWatches;
  //   }
  //   if (!!changes.editingAddresses) {
  //     this.view.editingAddresses = changes.editingAddresses;
  //   }
  //   if (!!changes.writeIcons) {
  //     this.view.emphasis.writeIcons = changes.writeIcons;
  //   }
  //   if (!!changes.readIcons) {
  //     this.view.emphasis.readIcons = changes.readIcons;
  //   }
  //   if (!!changes.writeIconsStatic) {
  //     this.view.emphasis.writeIconsStatic = changes.writeIconsStatic;
  //   }
  //   if (!!changes.readIconsStatic) {
  //     this.view.emphasis.readIconsStatic = changes.readIconsStatic;
  //   }
  // }

  // private readonly _dataHelper = new MemoryExplorerDataHelper(
  //   (changes) => { this.updateViewQuads(changes) });

}
