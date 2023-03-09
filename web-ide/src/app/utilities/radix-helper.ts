export class RadixHelper {
    public static getNextRadix(current: 2 | 10 | 16, skip?: Array<2 | 10 | 16>): 2 | 10 | 16 {
        const index = RadixHelper._radixValues.findIndex(v => v === current);
        let nextIndex = 0;
        if (index < RadixHelper._radixValues.length - 1) {
            nextIndex = index + 1;
        }

        let nextRadix = RadixHelper._radixValues[nextIndex];
        while (!!skip && skip.includes(nextRadix)) {
            nextRadix = RadixHelper.getNextRadix(nextRadix, skip);
        }
        
        return nextRadix;
    }

    private static readonly _radixValues: [2, 10, 16] = [2, 10, 16];
}