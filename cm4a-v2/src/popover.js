import { Utils } from './utils';

export class Popover {
    showPopover(x, y, innerHTML, maybeErrorText) {
        try {
            const popover = this._vdom.getElementById('tooltip-popover');
            const hasErrorText = !!maybeErrorText;
            if (!(innerHTML === '' && !hasErrorText)) {
                if (hasErrorText) {
                    innerHTML += `<div class="error-display text-main">${maybeErrorText}</div>`;
                }

                if (innerHTML === popover.innerHTML) {
                    if (this._lastX < 0 || this._lastY < 0 || Math.abs(x - this._lastX) > 6 || Math.abs(y - this._lastY) > 6) {
                        popover.innerHTML = innerHTML;
                        popover.classList.add('show');
                        popover.setAttribute('style', `left: ${x + 4}px;top:${y}px;`);
                        this._lastX = x;
                        this._lastY = y;
                    }
                } else {
                    popover.innerHTML = innerHTML;
                    popover.classList.add('show');
                    popover.setAttribute('style', `left: ${x + 4}px;top:${y}px;`);
                    this._lastX = x;
                    this._lastY = y;
                }
            }
        } catch (ex) { }
    }

    constructor(vdom, tracer) {
        this._tracer = tracer;
        this._vdom = vdom;
        this._disabled = false;

        this._lastX = -1;
        this._lastY = -1;
        this._lastCursorX = -1;
        this._lastCursorY = -1;

        this._debouncedActions = {};
    }
    
    init() {
        document.addEventListener('mouseover', (event) => {
            if (!this._disabled) {
                this._lastCursorX = event.x;
                this._lastCursorY = event.y;

                this._lastCursorX = event.x;
                this._lastCursorY = event.y;
                Utils.debounce('maybeHidePopover', 600, this._debouncedActions, () => {
                    this._tracer.info('handling debounce action: maybeHidePopover')
                    const elementsAtCursor = document.elementsFromPoint(this._lastCursorX, this._lastCursorY);
                    let shouldHide = false;
                    if (this._vdom.getElementById('tooltip-popover').classList.contains('show') && elementsAtCursor.length > 0) {
                        let ttpTarget = Utils.parentsUntil(elementsAtCursor[0], (e) => e.classList.contains('tooltip-popover'), (e) => e.tagName === 'BODY');
                        let ttpTargetIteratorIndex = 1;
                        while (!(!!ttpTarget) && ttpTargetIteratorIndex < elementsAtCursor.length) {
                            ttpTarget = Utils.parentsUntil(elementsAtCursor[ttpTargetIteratorIndex], (e) => e.classList.contains('tooltip-popover'), (e) => e.tagName === 'BODY');
                            ttpTargetIteratorIndex++;
                        }
                        
                        let caAlTarget = !!ttpTarget ? null : Utils.parentsUntil(elementsAtCursor[0], (e) => /cm-al-([-_a-zA-Z0-9]+)/.test(e.className), (e) => e.tagName === 'BODY');
                        let caAlTargetIteratorIndex = 1;
                        while (!(!!caAlTarget) && caAlTargetIteratorIndex < elementsAtCursor.length) {
                            caAlTarget = Utils.parentsUntil(elementsAtCursor[caAlTargetIteratorIndex], (e) => /cm-al-([-_a-zA-Z0-9]+)/.test(e.className), (e) => e.tagName === 'BODY');
                            caAlTargetIteratorIndex++;
                        }

                        if (!(!!ttpTarget || !!caAlTarget)) {
                            shouldHide = true;
                        }
                    }

                        if (shouldHide) {
                            const popover = this._vdom.getElementById('tooltip-popover');
                            popover.innerHTML = '';
                            popover.classList.remove('show');
                            this._lastX = -1;
                            this._lastY = -1;
                        }
                    });
            }
        })
    }
}