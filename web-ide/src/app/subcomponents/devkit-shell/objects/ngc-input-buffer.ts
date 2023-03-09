import { InputBufferScrollEvent } from '../models/input-buffer-scroll-event';
import { InputBufferEventType } from '../models/input-buffer-event-type';
import { InputBufferCommitEvent } from '../models/input-buffer-commit-event';
import { InputBufferInputEvent } from '../models/input-buffer-input-event';

export class NgcInputBuffer {
    public updateCurrent(inputText: string): void {
        this.setCurrentUnbuffered(inputText || '');
    }

    public commitCurrent(): void {
        const cv = this.currentView;
        console.log(`cu=>>${cv.currentUnbuffered}<<`)
        this.pushLiteral(cv.currentUnbuffered);
        this.emitCommit(cv.currentUnbuffered);
        this.setCurrentUnbuffered('');
        this.setCurrentBufferIndex(-1);
        this.emitScroll();
    }

    public scrollUp(multi: boolean): void {
        if (this.canScrollUp()) {//TODO multi
            this.setCurrentBufferIndex(this.currentView.bufferIndex - 1);
            if (this.currentView.bufferIndex === -1) {
                this.setCurrentUnbuffered('');
            }
            this.emitScroll();
        }
    }

    public scrollDown(multi: boolean): void {
        if (this.canScrollDown()) {//TODO multi
            this.setCurrentBufferIndex(this.currentView.bufferIndex + 1);
            this.emitScroll();
        }
    }

    public canScrollUp(): boolean {
        return this.currentView.bufferIndex > -1;
    }

    public canScrollDown(): boolean {
        const cv = this.currentView;
        return cv.bufferIndex < cv.literals.length - 1;
    }

    public onScroll(cb: (bufferState: InputBufferScrollEvent) => void): { unsubscribe(): void } {
        let handle = 'ib' + Math.random().toString().split('.')[1];
        while (this._subscribers.some(s => s.handle === handle)) {
            handle = 'ib' + Math.random().toString().split('.')[1];
        }

        this._subscribers.push({
            viewKey: this._currentViewKey,
            handle: handle,
            cb: cb,
            isActive: true,
            type: InputBufferEventType.Scroll
        })

        return {
            unsubscribe: () => {
                const index = this._subscribers.findIndex(s => s.handle === handle);
                if (index > -1) {
                    this._subscribers[index].isActive = false;
                }
            }
        }
    }

    public onCommit(cb: (event: InputBufferCommitEvent) => void): { unsubscribe(): void } {
        let handle = 'ib' + Math.random().toString().split('.')[1];
        while (this._subscribers.some(s => s.handle === handle)) {
            handle = 'ib' + Math.random().toString().split('.')[1];
        }

        this._subscribers.push({
            viewKey: this._currentViewKey,
            handle: handle,
            cb: cb,
            isActive: true,
            type: InputBufferEventType.Commit
        })

        return {
            unsubscribe: () => {
                const index = this._subscribers.findIndex(s => s.handle === handle);
                if (index > -1) {
                    this._subscribers[index].isActive = false;
                }
            }
        }
    }

    public onInput(cb: (event: InputBufferInputEvent) => void): { unsubscribe(): void } {
        let handle = 'ib' + Math.random().toString().split('.')[1];
        while (this._subscribers.some(s => s.handle === handle)) {
            handle = 'ib' + Math.random().toString().split('.')[1];
        }

        this._subscribers.push({
            viewKey: this._currentViewKey,
            handle: handle,
            cb: cb,
            isActive: true,
            type: InputBufferEventType.Input
        })

        return {
            unsubscribe: () => {
                const index = this._subscribers.findIndex(s => s.handle === handle);
                if (index > -1) {
                    this._subscribers[index].isActive = false;
                }
            }
        }
    }

    public getHistory(): Array<{ readonly timestamp: number, readonly literal: string }> {
        const cv = this.currentView;
        return !!cv ? cv.literals.map(l => l) : [];
    }

    public setCurrentView(viewKey: string): void {
        if (!this._views.some(v => v.viewKey === viewKey)) {
            this._views.push({
                viewKey: viewKey,
                bufferIndex: -1,
                currentUnbuffered: '',
                literals: new Array<{ readonly timestamp: number, readonly literal: string }>()
            })
        }

        this._currentViewKey = viewKey;
    }

    public empty(): void {
        const index = this.findIndexOfCurrentView();
        if (index > -1) {
            this._views[index] = {
                viewKey: this._views[index].viewKey,
                bufferIndex: -1,
                currentUnbuffered: '',
                literals: []
            }

            this.emitScroll();
        }
    }

    public constructor(multiScrollCount?: number) {
        this._multiScrollCount = multiScrollCount || 5;
    }

    private emitScroll(): void {
        const cv = this.currentView;
        const event: InputBufferScrollEvent = cv.bufferIndex > -1
            ? {
                isBuffered: true,
                literal: cv.literals[cv.literals.length - cv.bufferIndex - 1].literal,
                isFirst: cv.bufferIndex === 0,
                isLatest: cv.bufferIndex === cv.literals.length - 1,
                viewKey: this._currentViewKey
            } : {
                isBuffered: false,
                literal: cv.currentUnbuffered,
                viewKey: this._currentViewKey
            }
        
        this._subscribers.filter(s => s.isActive && s.type === InputBufferEventType.Scroll).forEach(s => {
            setTimeout(() => {
                s.cb(event);
            })
        })

        console.log(`_bufferIndex=${cv.bufferIndex}`)
    }

    private emitCommit(literal: string): void {
        const cv = this.currentView;
        const event: InputBufferCommitEvent = {
            literal: literal,
            viewKey: cv.viewKey
        }
        
        this._subscribers.filter(s => s.isActive && s.type === InputBufferEventType.Commit).forEach(s => {
            setTimeout(() => {
                s.cb(event);
            })
        })
    }

    private emitInputChanged(currentUnbuffered: string): void {
        const cv = this.currentView;
        const event: InputBufferInputEvent = {
            currentInput: currentUnbuffered,
            viewKey: cv.viewKey
        }
        
        this._subscribers.filter(s => s.isActive && s.type === InputBufferEventType.Input).forEach(s => {
            setTimeout(() => {
                s.cb(event);
            })
        })
    }

    private get currentView(): {
        readonly viewKey: string,
        readonly bufferIndex: number,
        readonly currentUnbuffered: string,
        readonly literals: Array<{ readonly timestamp: number, readonly literal: string }>
    } {
        return this._views.find(v => v.viewKey === this._currentViewKey);
    }

    private setCurrentUnbuffered(ub: string): void {
        const index = this.findIndexOfCurrentView();
        if (index > -1) {
            this._views[index] = {
                viewKey: this._views[index].viewKey,
                bufferIndex: this._views[index].bufferIndex,
                currentUnbuffered: ub,
                literals: this._views[index].literals
            }
            
            this.emitInputChanged(ub);
        }
    }

    private setCurrentBufferIndex(bi: number): void {
        const index = this.findIndexOfCurrentView();
        if (index > -1) {
            this._views[index] = {
                viewKey: this._views[index].viewKey,
                bufferIndex: bi,
                currentUnbuffered: this._views[index].currentUnbuffered,
                literals: this._views[index].literals
            }
        }
    }

    private pushLiteral(literal: string): void {
        const index = this.findIndexOfCurrentView();
        if (index > -1) {
            this._views[index] = {
                viewKey: this._views[index].viewKey,
                bufferIndex: this._views[index].bufferIndex,
                currentUnbuffered: this._views[index].currentUnbuffered,
                literals: this._views[index].literals.concat([{ timestamp: Date.now(), literal: literal }])
            }
        }
    }

    private findIndexOfCurrentView(): number {
        return this._views.findIndex(v => v.viewKey === this._currentViewKey);
    }

    private _currentViewKey = '';
    private readonly _views = new Array<{
        readonly viewKey: string,
        readonly bufferIndex: number,
        readonly currentUnbuffered: string,
        readonly literals: Array<{ readonly timestamp: number, readonly literal: string }>
    }>();
    private readonly _multiScrollCount: number;
    private readonly _subscribers = new Array<{
        readonly viewKey: string;
        readonly handle: string;
        readonly type: InputBufferEventType;
        readonly cb: (event: InputBufferScrollEvent | InputBufferCommitEvent | InputBufferInputEvent) => void;
        isActive: boolean;
    }>();
}