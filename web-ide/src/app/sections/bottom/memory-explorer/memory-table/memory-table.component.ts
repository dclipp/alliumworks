import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MemoryExplorerItemViewModel } from 'src/app/view-models/memory-explorer/memory-explorer-item-view-model';
import { MemoryExplorerQuadCollection } from 'src/app/view-models/memory-explorer/memory-explorer-quad-collection';
import { ByteSequenceCreator, QuadByte, DynamicByteSequence } from '@allium/types';
import { RadixHelper } from 'src/app/utilities/radix-helper';
import { takeUntil } from 'rxjs/operators';
import { emptyMemoryExplorerModel } from 'src/app/view-models/memory-explorer/memory-explorer-model';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { MemoryTablePaginationHelper } from 'src/app/view-models/memory-explorer/memory-table-pagination-helper';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'aq4w-memory-table',
  templateUrl: './memory-table.component.html',
  styleUrls: ['./memory-table.component.scss']
})
export class MemoryTableComponent extends Aq4wComponent implements OnInit {

  @Input('currentItems')
  public set currentItems(currentItems: Array<MemoryExplorerItemViewModel>) {
    this._currentMemoryItems = currentItems;
    this.setPage(0);
  }

  @Output('valueEdited')
  public readonly valueEdited = new EventEmitter<{ memAddress: QuadByte, updatedValue: DynamicByteSequence }>();

  public view = {
    addressRadix: 10,
    valueRadix: 10,
    currentMemoryItems: new Array<MemoryExplorerItemViewModel>(),
    watches: emptyMemoryExplorerModel(),
    emphasis: {
      readIconsStatic: {
        includes: (a: any) => false
      },
      writeIconsStatic: {
        includes: (a: any) => false
      }
    },
    editingAddresses: new MemoryExplorerQuadCollection(),
    editor: {
      radix: 10,
      initialValue: ByteSequenceCreator.Byte(0)
    },
    pagination2: new Array<{ readonly text: string, readonly clickable: boolean, readonly selected: boolean }>()
  }

  public on = {
    readWatchCellClicked: (memAddress: QuadByte) => {
      this.view.watches.reads.toggle(memAddress);
    },
    writeWatchCellClicked: (memAddress: QuadByte) => {
      this.view.watches.writes.toggle(memAddress);
    },
    bookmarkCellClicked: (memAddress: QuadByte) => {
      this.view.watches.bookmarks.toggle(memAddress);
    },
    changeAddressRadix: () => {
      this.view.addressRadix = this.getNextRadixForNonValue(this.view.addressRadix);
    },
    changeValueRadix: () => {
      this.view.valueRadix = RadixHelper.getNextRadix(this.view.valueRadix as 2 | 10 | 16);
    },
    toggleEditMode: (memAddress: QuadByte, editorContext: { show: boolean, setValue?: (value: DynamicByteSequence) => void }) => {
      this.view.editor.initialValue = this._currentMemoryItems.find(x => x.address.isEqualTo(memAddress)).value;
      if (editorContext.show) {
        editorContext.setValue(this.view.editor.initialValue.clone());
      }
    },
    valueEdited: (memAddress: QuadByte, updatedValue: DynamicByteSequence) => {
      this.valueEdited.emit({ memAddress: memAddress, updatedValue: updatedValue });
    },
    selectPage: (pageNumber: string) => {
      this.setPage(Number.parseInt(pageNumber) - 1);
    }
  }

  constructor(private _sessionService: SessionService) {
    super();
  }

  ngOnInit() {
    this._sessionService.platform.machine.memoryExplorer.model().pipe(takeUntil(this.destroyed)).subscribe(model => {
      this.view.watches = model;
    })
  }

  private getNextRadixForNonValue(current: number): 2 | 10 | 16 {
    return RadixHelper.getNextRadix(current as 2 | 10 | 16, [2]);
  }

  private setPage(pageIndex: number): void {
    this.updatePagination(this._currentMemoryItems.length, pageIndex);
    const min = this._MAX_ITEMS_PER_PAGE * pageIndex;
    const max = min + this._MAX_ITEMS_PER_PAGE - 1;
    this.view.currentMemoryItems = this._currentMemoryItems.filter((i, ii) => ii >= min && ii <= max);
  }

  private updatePagination(totalItemCount: number, currentPageIndex: number = 0): void {
    this.view.pagination2 = MemoryTablePaginationHelper.getPageButtons(totalItemCount, currentPageIndex);
  }

  private _currentMemoryItems = new Array<MemoryExplorerItemViewModel>();
  private readonly _MAX_ITEMS_PER_PAGE = 5;
}