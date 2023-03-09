import { Component, OnInit, ViewChild, ChangeDetectorRef, Input, AfterViewInit, Output, EventEmitter, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { HistoricEntryModel } from 'src/app/subcomponents/devkit-shell/models/historic-entry.model';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, debounceTime, take, distinctUntilChanged, bufferCount } from 'rxjs/operators';
import { HistoryQueryMatchModel } from 'src/app/subcomponents/devkit-shell/models/history-query-match.model';
import { NgcInputBuffer } from 'src/app/subcomponents/devkit-shell/objects/ngc-input-buffer';
// import { DomService } from 'src/app/services/dom.service';
import { InputAreaModel } from 'src/app/subcomponents/devkit-shell/models/input-area.model';
import { Autocompleter } from '../../models/autocompleter.model';
import { NgcFloatingInputHelper } from '../../objects/ngc-floating-input-helper';

@Component({
  selector: 'ngconsole-input-area',
  templateUrl: './input-area.component.html',
  styleUrls: ['./input-area.component.scss']
})
export class InputAreaComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('data')
  public set data(data: InputAreaModel | undefined | null) {
    this._data.next(data);
  }
  
  @Input('chUnitSizePx')
  public set chUnitSizePx(chUnitSizePx: number) {
    this.style.chUnitSizePx = chUnitSizePx;
    console.log(`chUnitSizePx=${chUnitSizePx}`)
  }
  
  @Input('optAltKeyName')
  public set optAltKeyName(optAltKeyName: string) {
    this.view.optAltKeyName = optAltKeyName;
  }

  @Output('updated')
  public readonly updated = new EventEmitter<InputAreaModel>();
  
  @Output('commit')
  public readonly commit = new EventEmitter<{ readonly literal: string, readonly viewKey: string }>();

  @Output('showing')
  public readonly showing = new EventEmitter<boolean>();

  public view = {
    showHistory: false,
    historyQueryMatches: new Array<HistoryQueryMatchModel>(),
    historySearch: '',
    selectedHistoryIndex: 0,
    showCompletionsList: false,
    completionsListQueryMatches: new Array<HistoryQueryMatchModel>(),
    completionsListSearch: '',
    selectedCompletionsListIndex: 0,
    suggestedCompletion: '',
    optAltKeyName: ''
  }

  public style = {
    history: {
      left: 0
    },

    completionsList: {
      left: 0
    },
    
    suggestedCompletion: {
      transform: ''
    },
    chUnitSizePx: 1
  }

  public on = {
    toggleHistory: () => {
      this._historyInputHelper.toggle();
    },
    toggleCompletionsList: () => {
      this._completionsListInputHelper.toggle();
    },
    keystroke: (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey) {
        this.on.toggleHistory();
      } else if (event.altKey && !!event.key && event.key.toLowerCase() === 'c') {
        this.on.toggleCompletionsList();
      } else if (event.key === 'Tab') {
        if (!!this.view.suggestedCompletion) {
          this.textboxInput.nativeElement.value += this.view.suggestedCompletion;
          this.view.suggestedCompletion = '';
          this._scheduleSuggestion.next(Date.now());
          return false;
        } else {
          return true;
        }
      } else if (event.key === 'ArrowUp') {
        console.log(`AUp, canUp=${this._inputBuffer.canScrollUp()}`);
        if (this._inputBuffer.canScrollUp()) {
          this._inputBuffer.scrollUp(event.shiftKey);
        }
      } else if (event.key === 'ArrowDown') {
        console.log(`ADown, canDown=${this._inputBuffer.canScrollDown()}`);
        if (this._inputBuffer.canScrollDown()) {
          this._inputBuffer.scrollDown(event.shiftKey);
        }
      } else if (event.key === 'Enter') {
        this._latestInput.next(this.textboxInput.nativeElement.value || '');
      } else if (event.key === 'Backspace') {
        // const ti = this.textboxInput.nativeElement;
        // if (ti.selectionStart === ti.selectionEnd) {
        //   this._latestInput.next(this._CHAR_DELETE);
        // } else {
        //   this._latestInput.next(this._CHAR_DELETE + `${ti.selectionStart},${ti.selectionEnd}`);
        // }
        this._inputBuffer.updateCurrent(this.textboxInput.nativeElement.value);
        // this._scheduleSuggestion.next(Date.now());
        setTimeout(() => {
          this._scheduleSuggestion.next(Date.now());
        }, 350)
      } else {
        this._scheduleSuggestion.next(Date.now());
      }
    },
    historyKeystroke: (event: KeyboardEvent) => {
      return this._historyInputHelper.pipeKeystroke(event);
    },
    completionsListKeystroke: (event: KeyboardEvent) => {
      return this._completionsListInputHelper.pipeKeystroke(event, 'c');
    },
    historyItemClicked: (index: number) => {
      return this._historyInputHelper.pipeItemClick(index);
    },
    completionsListItemClicked: (index: number) => {
      return this._completionsListInputHelper.pipeItemClick(index);
    }
  }

  public emptyBuffer(): void {
    this._inputBuffer.empty();
  }

  constructor(private _cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    window['TSTSetLmargin'] = (n) => {
      this._cd.detectChanges();
    }
    window['TSTAddHistItem'] = (n) => {
      this.view.historyQueryMatches.push({
        chars: [
          {
            index: 0,
            value: 'a'
          }
        ]
      })
      this._cd.detectChanges();
    }

    this._scheduleSuggestion.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(() => {
      const textboxInput = this.textboxInput.nativeElement;
      const input = textboxInput.value || '';
      if (!!input) {
        const suggestedCompletionLiteral = this.computeSuggestion(input);
        this.view.suggestedCompletion = suggestedCompletionLiteral.replace(/[\0]/g, '');
          // console.log(`leadingSpaceOffset=${leadingSpaceOffset}`)
          console.log(`suggestedCompletionLiteral=${this.view.suggestedCompletion}`)

        // this.view.completionsListQueryMatches = this.getSuggestedCompletions(input);
        this._completionsListInputHelper.updateSearch();
        // console.log(JSON.stringify(this.view.completionsListQueryMatches, null, 2))
        this.style.suggestedCompletion.transform = `translateX(calc(-1 * (${Math.ceil(textboxInput.clientWidth)}px - ${input.length}ch) + 4px))`;
      } else {
        this.view.suggestedCompletion = '';
        this.style.suggestedCompletion.transform = '';
        console.log(`suggestedCompletionLiteral=><`)
      }
      this._inputBuffer.updateCurrent(textboxInput.value);
    })

    this._latestInput.pipe(filter(x => !!x && !!x.trim())).subscribe(latestInput => {
        // if (latestInput.startsWith(this._CHAR_DELETE)) {
        //   console.log(`_CHAR_DELETE`)

        //   // const ti = this.textboxInput.nativeElement;
        //   // if (latestInput.length === 1) { // delete single char at cursor

        //   // } else { // delete range

        //   // }
        // } else {
          // this.view.suggestedCompletion = this._DEFAULT_SUGGESTED_COMPLETION();
          // this.textboxInput.nativeElement.value = '';
          // this.style.suggestedCompletion.marginLeft = 0;
          // this.style.textboxInput.width = 2;
          this._inputBuffer.commitCurrent();
          
          this.view.suggestedCompletion = '';
          this.textboxInput.nativeElement.value = '';

          console.log(`input=${latestInput}`)
          //TODO handle command
        // })
        // }
    })

    this._inputBuffer.onScroll(bufferState => {
      if (bufferState.viewKey === this._currentViewKey) {
        this.textboxInput.nativeElement.value = bufferState.literal;
        this._scheduleSuggestion.next(Date.now());
        this.emitUpdatedModel();
      }
    })

    this._inputBuffer.onCommit(event => {
      this.commit.next(event);
    })
  }

  ngAfterViewInit(): void {
    let olAttempts = 0;
    const olHandle = setInterval(() => {
      const tb = this.textbox.nativeElement;
      if (!!tb && tb.offsetLeft > 0) {
        this.style.history.left = this.textbox.nativeElement.offsetLeft;
        this.style.completionsList.left = this.textbox.nativeElement.offsetLeft;
        clearInterval(olHandle);
        console.log(`this.style.history.left=${this.style.history.left}`)
      } else if (olAttempts > 20) {
        console.error(`failed to get offsetLeft after ${olAttempts} attempts`);
        clearInterval(olHandle);
      } else {
        olAttempts++;
      }
    }, 250)
    window.addEventListener('click', this.onWindowClick.bind(this));

    this._historyInputHelper.init(() => {
      return this.historyTextbox;
    }, (query) => {
      return this.searchHistory(query);
    })
    
    this._completionsListInputHelper.init(() => {
      return this.completionsListTextbox;
    }, (query) => {
      return this.searchSuggestedCompletions(this.textboxInput.nativeElement.value || '', query);
    })

    this._historyInputHelper.onInputCommitted().subscribe(historyInput => {
      this.setTextboxInputValue(historyInput.value, true);
    })

    this._completionsListInputHelper.onInputCommitted().subscribe(completionsListInput => {
      this.setTextboxInputValue(completionsListInput.value, true);
    })
    
    this._data.subscribe(data => {
      if (!!data) {
        this._currentViewKey = data.viewKey;
        this._inputBuffer.setCurrentView(data.viewKey);
        this._currentAutocompleter = data.autocompleter;

        this._historyInputHelper.load(
          data.view.showHistory,
          data.view.historyQueryMatches,
          data.view.historySearch,
          data.view.selectedHistoryIndex,
          data.historyInputRawBuffer,
          data.historyInputString);
          
        // this._completionsListInputHelper.load(
        //   data.view.showxHistory,
        //   data.view.historxyQueryMatches,
        //   data.view.histoxrySearch,
        //   data.view.selectedHixstoryIndex,
        //   data.historyInputRawBuffer,
        //   data.historyInputString);
        
        this.view.suggestedCompletion = data.view.suggestedCompletion;

        this._latestInput.next(data.latestInput);
        this.textboxInput.nativeElement.value = data.textboxValue;
      } else {
        this._currentViewKey = '';
        this._currentAutocompleter = undefined;
      }
    })

    this._historyInputHelper.show().subscribe(show => {
      this.view.showHistory = show;
      this.showing.emit(this.view.showHistory || this.view.showCompletionsList);
    })
    this._historyInputHelper.queryMatches().subscribe(queryMatches => {
      this.view.historyQueryMatches = queryMatches;
    })
    this._historyInputHelper.search().subscribe(search => {
      this.view.historySearch = search;
    })
    this._historyInputHelper.selectedIndex().subscribe(selectedIndex => {
      this.view.selectedHistoryIndex = selectedIndex;
    })
    
    this._completionsListInputHelper.show().subscribe(show => {
      this.view.showCompletionsList = show;
      this.showing.emit(this.view.showHistory || this.view.showCompletionsList);
    })
    this._completionsListInputHelper.queryMatches().subscribe(queryMatches => {
      this.view.completionsListQueryMatches = queryMatches;
    })
    this._completionsListInputHelper.search().subscribe(search => {
      this.view.completionsListSearch = search;
    })
    this._completionsListInputHelper.selectedIndex().subscribe(selectedIndex => {
      this.view.selectedCompletionsListIndex = selectedIndex;
    })
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.onWindowClick.bind(this));
  }

  private searchHistory(query: string): Promise<{
    readonly queryMatches: Array<HistoryQueryMatchModel>;
    readonly selectedIndex: number;
    readonly search: string;
  }> {
    return new Promise<{
      readonly queryMatches: Array<HistoryQueryMatchModel>;
      readonly selectedIndex: number;
      readonly search: string;
    }>((resolve) => {
      let models: Array<HistoricEntryModel>;
      if (!!query) {
        models = this._inputBuffer.getHistory()
          .filter(he => he.literal.startsWith(query))
          .map(e => {
            return {
              timestamp: e.timestamp,
              literal: e.literal
            }
          })
      } else {
        models = this._inputBuffer.getHistory()
          .map(e => {
            return {
              timestamp: e.timestamp,
              literal: e.literal
            }
          })
      }

      const queryMatches = models.filter(m => m.literal.length > 0).map(m => this.mapHistoryQueryMatches(m));
      resolve({
        queryMatches: queryMatches,
        selectedIndex: queryMatches.length - 1,
        search: query
      });
    })
  }

  private mapHistoryQueryMatches(he: HistoricEntryModel): HistoryQueryMatchModel {
    const chars = new Array<{
      readonly index: number;
      readonly value: string;
    }>();

    for (let i = 0; i < he.literal.length; i++) {
      chars.push({
        index: i,
        value: he.literal.charAt(i)
      });
    }
    
    return {
      chars: chars
    };
  }

  private computeSuggestion(workingInputValue: string): string {
    if (!!this._currentAutocompleter) {
      const best = this._currentAutocompleter.getBestCompletion(workingInputValue);
      if (!!best) {
        return best.literal.replace(workingInputValue, '');
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  private searchSuggestedCompletions(input: string, query: string): Promise<{
    readonly queryMatches: Array<HistoryQueryMatchModel>;
    readonly selectedIndex: number;
    readonly search: string;
  }> {
    return new Promise<{
      readonly queryMatches: Array<HistoryQueryMatchModel>;
      readonly selectedIndex: number;
      readonly search: string;
    }>((resolve) => {
      let suggestedCompletions = new Array<string>();
      if (!!this._currentAutocompleter) {
        suggestedCompletions = this._currentAutocompleter.getSuggestedCompletion(query)
          .filter(sc => sc.literal.endsWith('\0'))
          .map(sc => sc.literal.replace(query, '').replace(/[\0]/g, ''));
      }

      if (!!query) {
        suggestedCompletions = suggestedCompletions.filter(sc => sc.startsWith(query));
      }

      if (!!input) {
        console.log(`input=${input}`)
        suggestedCompletions = suggestedCompletions.filter(sc => sc.startsWith(input));
      }

      const queryMatches = suggestedCompletions.filter(m => m.length > 0).map(m => {
        const chars = new Array<{ readonly index: number, readonly value: string }>();
        for (let i = 0; i < m.length; i++) {
          const char = m.charAt(i);
          if (char !== '\0') {
            chars.push({
              index: i,
              value: char
            });
          }
        }
        return {
          chars: chars
        }
      });

      resolve({
        queryMatches: queryMatches,
        selectedIndex: queryMatches.length - 1,
        search: query
      });
    })
  }

  private emitUpdatedModel(): void {
    combineLatest(
      this._historyInputHelper.inputString().pipe(take(1)),
      this._historyInputHelper.rawBuffer().pipe(take(1)),
      this._latestInput.pipe(take(1))
    ).subscribe(([historyInputString, historyInputRawBuffer, latestInput]) => {
      const model: InputAreaModel = {
        viewKey: this._currentViewKey,
        latestInput: latestInput,
        textboxValue: this.textboxInput.nativeElement.value,
        historyInputRawBuffer: historyInputRawBuffer,
        historyInputString: historyInputString,
        view: JSON.parse(JSON.stringify(this.view))
      }
      this.updated.emit(model);
    })
  }

  private setTextboxInputValue(value: string, focus: boolean): void {
    this.textboxInput.nativeElement.value = value;
    this._scheduleSuggestion.next(Date.now());
    if (focus) {
      setTimeout(() => {
        this.textboxInput.nativeElement.focus();
      }, 350);
    }
  }

  private onWindowClick(event: MouseEvent): void {
    if (this.view.showHistory) {
      let target = event.target as HTMLElement;
      let foundHistoryFloat = false;
      while (!!target && !foundHistoryFloat) {
        try {
          foundHistoryFloat = target.classList.contains('history-float-outer') || target.classList.contains('history-btn');
        } catch (ex) { }

        if (!foundHistoryFloat && !!target) {
          target = target.parentElement;
        }
      }

      if (!foundHistoryFloat) {
        this.on.toggleHistory();
      }
    }
  }

  private get historyTextbox(): { nativeElement: HTMLInputElement } {
    return this.bufferFloatTextboxes.find(bft => bft.nativeElement.getAttribute('data-name') === 'historyTextbox');
  }
  
  private get completionsListTextbox(): { nativeElement: HTMLInputElement } {
    return this.bufferFloatTextboxes.find(bft => bft.nativeElement.getAttribute('data-name') === 'completionsListTextbox');
  }

  @ViewChild('textbox')
  textbox: { nativeElement: HTMLElement }

  @ViewChild('textboxInput')
  textboxInput: { nativeElement: HTMLInputElement }

  @ViewChildren('bufferFloatTextbox')
  bufferFloatTextboxes: QueryList<{ nativeElement: HTMLInputElement }>

  private _currentAutocompleter?: Autocompleter = undefined;
  private _currentViewKey = '';
  private readonly _historyInputHelper = new NgcFloatingInputHelper();
  private readonly _completionsListInputHelper = new NgcFloatingInputHelper();
  private readonly _inputBuffer = new NgcInputBuffer();
  private readonly _data = new BehaviorSubject<InputAreaModel | undefined | null>(null);
  private readonly _latestInput = new BehaviorSubject<string>('');
  private readonly _scheduleSuggestion = new BehaviorSubject<number>(0);
  // private readonly _historyInputString = new BehaviorSubject<string>('');
  // private readonly _historyInputRawBuffer = new BehaviorSubject<string>('');
  private readonly _CHAR_DELETE = String.fromCharCode(127);

}
