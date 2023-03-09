export class Utils {
    static parentsUntil(el, predicate, stopPredicate) {
        let current = el;
        let stop = false;
        let foundMatch = false;
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
                }
            } catch (ex) {
                stop = true;
            }
        }
    
        return foundMatch ? current : null;
    }

    static debounce(actionHandle, delayMs, debouncedActions, action) {
        const pendingHandle = debouncedActions[actionHandle];
        if (pendingHandle !== undefined) {
            window.clearTimeout(pendingHandle);
        }
    
        debouncedActions[actionHandle] = window.setTimeout(() => {
            try {
                action();
            } catch (ex) {
    
            } finally {
                delete debouncedActions[actionHandle];
            }
        }, delayMs);
    }

    static get SIBLING_ID_PREFIX() {
        return '@sib:';
    }

    static beginElementReadyListener(id, sentryClassName, intervalMs, maxIntervals, minUnchangedCount, callback) {
        const getCheckElement = id.startsWith(Utils.SIBLING_ID_PREFIX)
            ? () => { const e = document.getElementById(id.substring(Utils.SIBLING_ID_PREFIX.length)); return !!e ? e.nextElementSibling : null }
            : () => document.getElementById(id);

        let initCount = 0;
        let initUnchangedCount = 0;
        let intervalCount = 0;
        const iHandle = window.setInterval(() => {
            const cel = getCheckElement();
            const c = !!cel ? cel.getElementsByClassName(sentryClassName).length : 0;
            if (c > 0 && c === initCount) {
                if (initUnchangedCount === minUnchangedCount) {
                    window.clearInterval(iHandle);
                    callback(true);
                } else {
                    initUnchangedCount++;
                }
            } else if (intervalCount >= maxIntervals) {
                window.clearInterval(iHandle);
                callback(false);
                // throw new Error('Element ready timed out');
            } else {
                initCount = c;
            }

            intervalCount++;
        }, intervalMs);
    }
}