import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HistoryQueryMatchModel } from '../../models/history-query-match.model';

@Component({
  selector: 'ngconsole-floating-list',
  templateUrl: './floating-list.component.html',
  styleUrls: ['./floating-list.component.scss']
})
export class FloatingListComponent implements OnInit {

  @Input('bfname')
  public set bfname(bfname: string) {
      this.view.bfname = bfname;
  }

  @Input('queryMatches')
  public set queryMatches(queryMatches: Array<HistoryQueryMatchModel>) {
      this.view.queryMatches = queryMatches;
      // this.updateScroll(queryMatches.length);
      this.updateScroll2(0);
  }

  @Input('show')
  public set show(show: boolean) {
      this.view.show = show;
  }

  @Input('leftPx')
  public set leftPx(leftPx: number) {
      this.view.leftPx = leftPx;
  }

  @Input('selectedIndex')
  public set selectedIndex(selectedIndex: number) {
      this.view.selectedIndex = selectedIndex;
  }

  @Input('searchString')
  public set searchString(searchString: string) {
      this.view.searchString = searchString;
  }

  @Output('keystroke')
  public readonly keystroke = new EventEmitter<KeyboardEvent>();

  @Output('itemClicked')
  public readonly itemClicked = new EventEmitter<number>();

  public view = {
    bfname: '',
    queryMatches: new Array<HistoryQueryMatchModel>(),
    show: false,
    leftPx: 0,
    selectedIndex: 0,
    searchString: '',
    scroll: {
      startIndex: 0,
      endIndexExclusive: 0,
      canScrollUp: false,
      canScrollDown: false
    }
  }

  public on = {
    keystroke: (event: KeyboardEvent) => {
      this.keystroke.emit(event);
      // return this._historyInputHelper.pipeKeystroke(event);
    },
    itemClicked: (index: number) => {
      this.itemClicked.emit(index);
      // return this._historyInputHelper.pipeItemClick(index);
    },
    scrollUp: () => {
      if (this.view.scroll.canScrollUp) {
        this.updateScroll2(this.view.scroll.startIndex - 1);
      }
    },
    scrollDown: () => {
      if (this.view.scroll.canScrollDown) {
        this.updateScroll2(this.view.scroll.startIndex + 1);
      }
    },
    mousewheel: (event: WheelEvent) => {
      if (event.deltaY < 0) { // scroll up
        this.on.scrollUp();
      } else if (event.deltaY > 0) { // scroll down
        this.on.scrollDown();
      }
    }
  }

  constructor() { }

  ngOnInit() {
  }

  // private updateScrollLimits(): void {
  //   this.view.scroll.canScrollUp = this.view.scroll.startIndex > 0;
  //   this.view.scroll.canScrollDown = this.view.scroll.endIndexExclusive < this.view.queryMatches.length;
  // }

  // private updateScroll(queryMatchCount: number): void {
  //   this.view.scroll.startIndex = 0;
  //   this.view.scroll.endIndexExclusive = Math.min(queryMatchCount, this._MAX_VISIBLE_ITEMS);
  //   this.updateScrollLimits();
  // }

  private updateScroll2(currentIndex?: number): void {
    if (currentIndex !== undefined) {
      this.view.scroll.startIndex = currentIndex;
    }

    const matchEndIndex = Math.min(this.view.scroll.startIndex + this._MAX_VISIBLE_ITEMS, this.view.queryMatches.length);
    this.view.scroll.endIndexExclusive = matchEndIndex;

    this.view.scroll.canScrollUp = this.view.scroll.startIndex > 0;
    this.view.scroll.canScrollDown = this.view.scroll.endIndexExclusive < this.view.queryMatches.length;
  }

  private readonly _MAX_VISIBLE_ITEMS = 10;
}
