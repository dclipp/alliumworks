import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'radixPrefix' })
export class RadixPrefixPipe implements PipeTransform {
    transform(value: string, radix: 2 | 10 | 16): string {
        if (radix === 16) {
            return `0x${value}`;
        } else {
            return value;
        }
    }
}