export class DebugInspector {
    _parentsUntil(el, predicate, stopPredicate) {
        let current = el;
        let stop = false;
        let foundMatch = false;
        let detail = null;
        while (!!current && !stop && !foundMatch) {
            try {
                const r = predicate(current);
                if (r === false) {
                    if (stopPredicate(current) === true) {
                        stop = true;
                    } else {
                        current = current.parentNode;
                    }
                } else {
                    foundMatch = true;
                    if (Array.isArray(r)) {
                        // detail = r[0];
                        detail = r;
                    }
                }
                // if (predicate(current) === true) {
                //     foundMatch = true;
                // } else if (stopPredicate(current) === true) {
                //     stop = true;
                // } else {
                //     current = current.parentNode;
                // }
            } catch (ex) {
                stop = true;
            }
        }

        return foundMatch ? {
            detail: detail,
            element: current
        } : null;
    }

    _isTokenElement(el) {
        try {
            const typeKey = Object.keys(STYLES).find(k => el.classList.contains(`cm-${STYLES[k]}`));
            if (!!typeKey) {
                const languageClasses = el.className.split(' ').filter(x => x.startsWith('cm-al-')).map(x => x.substring(6));
                return [typeKey, ...languageClasses];
            } else {
                return false;
            }
            // return Object.keys(STYLES).some(k => el.classList.contains(`cm-${STYLES[k]}`));
        } catch (ex) {
            return false;
        }
    }

    _generateInnerHTML(detail, text) {
        let innerHTML = '';
        if (!!detail) {
            const type = detail[0];
            innerHTML = `<h3>${type}</h3><h5>${text}</h5>`;
            if (detail.length > 1) {
                innerHTML += 'Language Classes:<br><ul>';
                detail.slice(1).forEach(d => innerHTML += `<li>${d}</li>`);
                innerHTML += '</ul>';
            }
        }
        return innerHTML;
    }

    _showPopover(detail, text, x, y) {
        const popover = this._vdom.getElementById('debug-inspector-popover');
        popover.innerHTML = this._generateInnerHTML(detail, text);

        if (popover.innerHTML !== this._latestPopoverContent) {
            this._latestPopoverContent = popover.innerHTML;
            popover.classList.add('show');
            popover.setAttribute('style', `left: ${x + 4}px;top:${y}px;`);
        }
    }

    _forceHidePopover() {
        this._latestPopoverContent = null;
        const popover = this._vdom.getElementById('debug-inspector-popover');
        popover.innerHTML = '';
        popover.classList.remove('show');
        popover.removeAttribute('style');
    }

    _maybeHidePopover(detail, text) {        
        const content = this._generateInnerHTML(detail, text);

        if (content !== this._latestPopoverContent) {
            this._forceHidePopover();
        }
    }

    // _debounce(action, delayTimeMs) {
        
    // }

    constructor(vdom) {
        // this._actionHandle = -1;
        this._latestPopoverContent = null;
        // this._disabled = false;
        this._disabled = true;
        this._vdom = vdom;
    }

    init() {
        document.addEventListener('mouseover', (event) => {
            if (!this._disabled) {
                const tokenElement = this._parentsUntil(event.target, (el) => this._isTokenElement(el), (el) => el.nodeName === 'BODY' || el.getAttribute('role') === 'presentation');
                if (!!tokenElement) {
                    this._showPopover(tokenElement.detail, tokenElement.element.innerText, event.x, event.y);
                }
            }
        })

        document.addEventListener('mouseout', (event) => {
            if (!this._disabled) {
                const tokenElement = this._parentsUntil(event.target, (el) => this._isTokenElement(el), (el) => el.nodeName === 'BODY' || el.getAttribute('role') === 'presentation');
                if (!!tokenElement) {
                    this._maybeHidePopover(tokenElement.detail, tokenElement.element.innerText);
                } else {
                    this._forceHidePopover();
                }
            }
        })
    }

    toggle() {
        this._disabled = !this._disabled;
    }
}