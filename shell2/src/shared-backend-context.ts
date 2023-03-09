export class SharedBackendContext {
    public readonly envProps: Map<string, string>;
    // public readonly envVars: Map<string, string>;

    public resolveProps(input: string): string {
        if (!!input.match(/[^\\]!~([^~]{0,})~!/)) {
            const resolvedValues = new Array<{
                readonly placeholder: string;
                readonly replacement: string;
                readonly placeholderStartIndex: number;
                readonly placeholderEndIndex: number;
            }>();

            let workingInput = input;
            let propMatch = workingInput.match(/!~([^~]{0,})~!/);
    let ITER=0;
            while (!!propMatch) {
                if (ITER > 1000) {
                    throw new Error("Too many itrs")
                }
                ITER++;
                let propValue = '!~';
                const propName = (propMatch[1] || '').trim();
                if (!!propName) {
                    const value = this.envProps.get(propName);
                    if (value === undefined) {
                        // TODO ??
                        propValue = 'ERR';
                    } else {
                        propValue = value;
                    }
                }

                const placeholderStartIndex = workingInput.indexOf(propMatch[0]);
                const placeholderEndIndex = placeholderStartIndex + propMatch[0].length;
                // resolvedValues.push([propMatch[0], propValue]);
                resolvedValues.push({
                    placeholder: propMatch[0],
                    replacement: propValue,
                    placeholderStartIndex: placeholderStartIndex,
                    placeholderEndIndex: placeholderEndIndex
                });
                
                workingInput = workingInput.substring(placeholderEndIndex);
                propMatch = workingInput.match(/!~([^~]{0,})~!/);
            }

            // let output = input;
            // resolvedValues.forEach(rv => {
            //     output = output.replace(rv[0], rv[1]);
            // });
            let output = '';
            let lastEndIndex = 0;
            resolvedValues.forEach(rv => {
                output += input.substring(lastEndIndex, rv.placeholderStartIndex) + rv.replacement;
                lastEndIndex = rv.placeholderEndIndex;
            });

            return output;
        } else {
            return input;
        }
    }

    public resolveProps2(input: string): string {
        // console.log(sbc.resolveProps('hello abc and %^{vvv} and abc'))
        let output = input.replace(/%\^\{[ \t]{0,}\}/g, '%^{');
        this.envProps.forEach((value, key) => {
            output = output.replace(RegExp('%\\^\\{[ \\t]{0,}' + key + '[ \\t]{0,}\\}', 'g'), value);
        });

        return output;
    }
    
    public constructor() {
        this.envProps = new Map<string, string>();
        // this.envVars = new Map<string, string>();
    }
}