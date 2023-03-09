export class DomUtility {
    public static parentsUntil(startElement: HTMLElement, predicate: (el: HTMLElement) => boolean, breakPredicate: (el: HTMLElement) => boolean): HTMLElement | null {
        let current: HTMLElement | null = startElement;
        let stop = false;
        while (!!current && !stop) {
            try {
                if (predicate(current)) {
                    stop = true;
                } else if (breakPredicate(current)) {
                    stop = true;
                    current = null;
                } else if (current.tagName === 'BODY') {
                    stop = true;
                    current = null;
                } else {
                    current = current.parentElement || null;
                }
            } catch (ex) {
                stop = true;
                current = null;
            }
        }

        return current;
    }
}