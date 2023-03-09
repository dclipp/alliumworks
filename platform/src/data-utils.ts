import { Writer } from 'protobufjs/minimal';
import { YfsFile } from 'yfs';
import { SerializationFormat } from './serialization-format';
import { btoa } from 'abab';

export class DataUtils {
    public static binarySerializationFormatIndicator(): string {
        return String.fromCharCode(1);
    }
    
    public static getFileSerializationFormat(file: YfsFile): SerializationFormat {
        if (file.content.startsWith(DataUtils.binarySerializationFormatIndicator())) {
            return 'binary';
        } else {
            return 'base64';
        }
    }

    public static decodeSerializationFile(file: YfsFile): {
        readonly format: SerializationFormat;
        readonly content: string;
    } {
        if (DataUtils.getFileSerializationFormat(file) === 'base64') {
            return {
                format: 'base64',
                content: file.content
            };
        } else {
            return {
                format: 'binary',
                content: file.content.substring(1)
            }
        }
    }

    public static stringToUint8Array(s: string): Uint8Array {
        const numerics = new Array<number>();
        for (let i = 0; i < s.length; i++) {
            const code = s.charCodeAt(i);
            if (code > 255) {
                let c = code;
                do {
                    numerics.push(c & 255);
                    c = c >> 8;
                } while (c > 0);
            } else {
                numerics.push(code);
            }
        }
        return new Uint8Array(numerics);
    }

    public static uint8ArrayToString(arr: Uint8Array): string {
        let s = '';
        for (let i = 0; i < arr.length; i++) {
            s += String.fromCharCode(arr[i]);
        }
        return s;
    }

    public static encodeSerializationFile(writer: Writer, format: SerializationFormat): string {
        const s = DataUtils.uint8ArrayToString(writer.finish());
        if (format === 'base64') {
            return btoa(s) || '';
        } else {
            return s;
        }
    }
}