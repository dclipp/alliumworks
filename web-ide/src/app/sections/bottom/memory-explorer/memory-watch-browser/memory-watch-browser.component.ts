import { Component, OnInit } from '@angular/core';
import { MemoryExplorerItemViewModel } from 'src/app/view-models/memory-explorer/memory-explorer-item-view-model';
import { DynamicByteSequence, QuadByte } from '@allium/types';
import { emptyMemoryExplorerModel, MemoryExplorerModel } from 'src/app/view-models/memory-explorer/memory-explorer-model';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { takeUntil } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'aq4w-memory-watch-browser',
  templateUrl: './memory-watch-browser.component.html',
  styleUrls: ['./memory-watch-browser.component.scss']
})
export class MemoryWatchBrowserComponent extends Aq4wComponent implements OnInit {

  public view = {
    currentMemoryItems: new Array<MemoryExplorerItemViewModel>(),
    watches: emptyMemoryExplorerModel(),
  }

  public on = {
    valueEdited: (event: { memAddress: QuadByte, updatedValue: DynamicByteSequence }) => {
      this._sessionService.platform.machine.memory.updateValue(event.memAddress, event.updatedValue.getByte(1));
      // this.refreshViewMemoryValues(this._currentOffset);
      // this.valueEdited.emit({ memAddress: memAddress, updatedValue: updatedValue });
    }
  }

  constructor(private _sessionService: SessionService) {
    super();
  }

  ngOnInit() {
    this._sessionService.platform.machine.memoryExplorer.model().pipe(takeUntil(this.destroyed)).subscribe(model => {
      this.view.watches = model;
      this.refreshCurrentItems(this.view.watches);
    })

    this._sessionService.platform.machine.memory.onValueUpdated().pipe(takeUntil(this.destroyed)).subscribe(address => {
      if (this.view.currentMemoryItems.some(i => i.address.isEqualTo(address))) {
        this.refreshCurrentItems(this.view.watches);
      }
    })
  }

  private refreshCurrentItems(watches: MemoryExplorerModel): void {
    const writes = watches.writes.valueOf().map(a => a);
    const reads = watches.reads.valueOf().filter(a => !writes.some(w => w.isEqualTo(a))).map(a => a);
    const bookmarks = watches.bookmarks.valueOf().filter(a => !writes.some(w => w.isEqualTo(a)) && !reads.some(w => w.isEqualTo(a))).map(a => a);
    const addresses = writes.concat(reads).concat(bookmarks);

    this._sessionService.platform.machine.memoryExplorer.fetchValues(addresses).then(mem => {
      this.view.currentMemoryItems = mem.sort((a, b) => a.address.isLessThan(b.address) ? -1 : a.address.isGreaterThan(b.address) ? 1 : 0).map(o => {
        return {
          address: o.address,
          value: o.value
        }
      })
    })
  }

}
