export class ArrayUtility {
    public static distinct<T>(array: Array<T>, comparator: (v: T, w: T) => boolean): Array<T> {
        const distinctArray = new Array<T>();
        array.forEach(x => {
            if (!distinctArray.some(y => comparator(x, y))) {
                distinctArray.push(x);
            }
        })
        return distinctArray;
    }
}