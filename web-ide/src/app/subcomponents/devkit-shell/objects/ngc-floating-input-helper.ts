import { HistoryQueryMatchModel } from '../models/history-query-match.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, debounceTime, take } from 'rxjs/operators';

export class NgcFloatingInputHelper {
    private styleLeftPx = 0;

    public show(): Observable<boolean> {
        return this._show;
    }

    public queryMatches(): Observable<Array<HistoryQueryMatchModel>> {
        return this._queryMatches;
    }

    public search(): Observable<string> {
        return this._search;
    }

    public selectedIndex(): Observable<number> {
        return this._selectedIndex;
    }

    public rawBuffer(): Observable<string> {
        return this._inputRawBuffer;
    }
    
    public inputString(): Observable<string> {
        return this._inputString;
    }

    public toggle(): void {
        if (this._isReady) {
            this.show().pipe(take(1)).subscribe(currentlyShowing => {
                this._show.next(!currentlyShowing);
                if (!currentlyShowing) {
                    const searchQuery = this._inputString.getValue();
                    this.executeSearch(searchQuery);
                    setTimeout(() => {
                        this._getElement().nativeElement.focus();
                    }, 400);
                }
            })
        }
    }

    public pipeKeystroke(event: KeyboardEvent, toggleSpecialKey?: string): boolean {
        let continueEvent = true;
        if (this._isReady) {
            const selectedIndex = this._selectedIndex.getValue();
            const queryMatches = this._queryMatches.getValue();
            let updateSelectedIndex: number | null = null;

            const checkToggleKey = !!toggleSpecialKey
                ? event.key.toLowerCase() === toggleSpecialKey.toLowerCase()
                : event.shiftKey;

            if (event.altKey && checkToggleKey) {
                this.toggle();
                continueEvent = false;
            } else if (event.shiftKey && event.ctrlKey) {
                updateSelectedIndex = selectedIndex + 1;
            } else if (event.shiftKey) {
                // TODO
            } else if (event.key === 'ArrowUp') {
                if (selectedIndex > 0) {
                    updateSelectedIndex = selectedIndex - 1;
                }
            } else if (event.key === 'ArrowDown') {
                if (selectedIndex < queryMatches.length - 1) {
                    updateSelectedIndex = selectedIndex + 1;
                }
            } else if (event.key === 'Tab') {
                let s = '';
                queryMatches[selectedIndex].chars.forEach(ch => s += ch.value);
                this._getElement().nativeElement.value += s;
                continueEvent = false;
            } else if (event.key === 'Escape') {
                this.toggle();
            } else if (event.key === 'Enter') {
                this._onInputCommitted.next({
                    value: this._getElement().nativeElement.value,
                    selectedIndex: selectedIndex
                });
            } else if (!event.metaKey) {
                // console.log(event.key)
                if (event.key.length === 1) {
                    this._inputRawBuffer.next(event.key);
                } else if (event.key === 'Backspace') {
                    this._inputRawBuffer.next(NgcFloatingInputHelper._CHAR_DELETE);
                }
                // this.view.historySearch += 'h';//event.key
            }

            if (updateSelectedIndex !== null) {
                this._selectedIndex.next(updateSelectedIndex);
            }
        }

        return continueEvent;
    }

    public pipeItemClick(itemIndex: number): boolean {
        let continueEvent = true;
        if (this._isReady) {
            this._getElement().nativeElement.value += this._queryMatches.getValue()[itemIndex].chars.map(ch => ch.value).reduce((x, y) => x + y, '');
        }

        return continueEvent;
    }

    public onInputCommitted(): Observable<{
        readonly value: string;
        readonly selectedIndex: number;
    }> {
        return this._onInputCommitted.pipe(filter(x => x !== null && !!x.value && this._isReady));
    }

    public load(
        show: boolean,
        queryMatches: Array<HistoryQueryMatchModel>,
        search: string,
        selectedIndex: number,
        rawBuffer: string,
        inputString: string): void {
        this._show.next(show);
        this._queryMatches.next(queryMatches);
        this._search.next(search);
        this._selectedIndex.next(selectedIndex);
            
        this._inputRawBuffer.next(rawBuffer);
        this._inputString.next(inputString);
        
        this._onInputCommitted.next(null);
    }

    public init(getElement: () => { nativeElement: HTMLInputElement }, performSearch: ((query: string) => Promise<{
        readonly queryMatches: Array<HistoryQueryMatchModel>;
        readonly selectedIndex: number;
        readonly search: string;
    }>)): void {
        this._getElement = getElement;
        this._performSearch = performSearch;
        this._inputRawBuffer.pipe(filter(x => !!x)).subscribe(key => {
            if (key === NgcFloatingInputHelper._CHAR_DELETE) { // backspace
                const cv = this._inputString.getValue();
                this._inputString.next(cv.length > 0 ? cv.substring(0, cv.length - 1) : '');
            } else {
                this._inputString.next(this._inputString.getValue() + key);
            }
        })

        this._inputString.pipe(debounceTime(500)).subscribe(s => {
            console.log(`hs=${s}`)
            setTimeout(() => {
                this.executeSearch(s);
            })
        })

        this.onInputCommitted().subscribe(() => {
            setTimeout(() => {
                this._getElement().nativeElement.value = '';
                this._selectedIndex.next(0);
                this.toggle();
            })
        })

        this._isReady = true;
    }

    public updateSearch(): void {
        const searchQuery = this._inputString.getValue();
        this.executeSearch(searchQuery);
    }

    public constructor() { }

    private executeSearch(query: string): void {
        if (!!this._performSearch) {
            this._performSearch(query).then(results => {
                this._queryMatches.next(results.queryMatches);
                this._selectedIndex.next(results.selectedIndex);
                this._search.next(results.search);
            })
        }
    }

    private _isReady = false;
    private _performSearch: ((query: string) => Promise<{
        readonly queryMatches: Array<HistoryQueryMatchModel>;
        readonly selectedIndex: number;
        readonly search: string;
    }>) | null = null;
    private _getElement: (() => { nativeElement: HTMLInputElement }) | null = null;
    private readonly _onInputCommitted = new BehaviorSubject<{
        readonly value: string;
        readonly selectedIndex: number;
    } | null>(null);
    private readonly _show = new BehaviorSubject<boolean>(false);
    private readonly _queryMatches = new BehaviorSubject<Array<HistoryQueryMatchModel>>([]);
    private readonly _search = new BehaviorSubject<string>('');
    private readonly _selectedIndex = new BehaviorSubject<number>(0);
    private readonly _inputString = new BehaviorSubject<string>('');
    private readonly _inputRawBuffer = new BehaviorSubject<string>('');

    private static readonly _CHAR_DELETE = String.fromCharCode(127);
}