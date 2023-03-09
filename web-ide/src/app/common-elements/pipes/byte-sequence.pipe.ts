import { Pipe, PipeTransform } from '@angular/core';
import { ByteSequence } from '@allium/types';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({ name: 'byteSequence' })
export class ByteSequencePipe implements PipeTransform {
    transform(value: ByteSequence<1 | 2 | 3 | 4>, radix?: 2 | 10 | 16): string {
        const useRadix = !!radix ? radix : 10;
        if (value.LENGTH === 1) {
            return value.toString({ radix: useRadix, padZeroes: true });
        } else {
            let text = '';
            for (let i = 1; i <= value.LENGTH; i++) {
                text += value.getByte(i as 1 | 2 | 3 | 4).toString({ radix: useRadix, padZeroes: true });
                if (i < value.LENGTH) {
                    text += ' ';
                }
            }
            return text;
        }
    }
}