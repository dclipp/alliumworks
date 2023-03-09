export class MemoryTablePaginationHelper {
    public static getPageButtons(totalItemCount: number, currentPageIndex: number): Array<{
        readonly text: string;
        readonly clickable: boolean;
        readonly selected: boolean;
    }> {
        const pageCount = Math.ceil(totalItemCount / MemoryTablePaginationHelper._MAX_ITEMS_PER_PAGE);
        const pagesPerSide = (MemoryTablePaginationHelper._MAX_VISIBLE_PAGES - 1) / 2;

        let before = new Array<string>();
        for (let i = currentPageIndex - 1; i > -1 && before.length < pagesPerSide; i--) {
            before.push((i + 1).toString());
        }

        if (before.length > 1 && before[0] !== '1') {
            before = before.reverse();
            // before[before.length - 1] = '...';
            before[0] = '...';
            before = ['1'].concat(before);//.slice(0, before.length));
        }

        if (before.length > 2 && before[0] === '1' && before[2] === '2') {
            before.splice(1, 1);
        }

        const afterAdditional = Math.max(0, pagesPerSide - before.length);

        let after = new Array<string>();
        for (let i = currentPageIndex + 1; i < pageCount && after.length < pagesPerSide + afterAdditional; i++) {
            after.push((i + 1).toString());
        }

        if (after.length === pagesPerSide + afterAdditional && after[after.length - 1] !== pageCount.toString()) {
            after[after.length - 2] = '...';
            after[after.length - 1] = pageCount.toString();
        }

        let all = before.concat([(currentPageIndex + 1).toString()].concat(after));
        // if (all.length < pageCount) {
        //     if (before.length < pagesPerSide && before.length > 0 && before[before.length - 1] !== '...') {
        //         let idx = Number(before[before.length - 1]) - 1;
        //         while (before.length < pagesPerSide && idx < currentPageIndex) {
        //             before.push((idx + 1).toString());
        //             idx++;
        //         }
        //         all = before.concat([(currentPageIndex + 1).toString()].concat(after));
        //     }
        // }

        return all.map(x => {
            return {
                text: x,
                clickable: x !== '...',//!['...','bbb'].includes(x)
                selected: x === (currentPageIndex + 1).toString()
            }
        })
    }

    private static readonly _MAX_ITEMS_PER_PAGE = 10;
    private static readonly _MAX_VISIBLE_PAGES = 9;
}