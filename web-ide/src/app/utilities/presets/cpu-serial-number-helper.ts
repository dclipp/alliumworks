export class CpuSerialNumberHelper {
    public static get NOT_SET_SERIAL_NUMBER(): string {
        return 'Not set';
    }

    public static encodeSerialNumber(sn: string, format: 'val' | 'num'): Array<number> {
        const code = new Array<number>();
        if (format === 'val') {
            let snLiteral = sn;

            if (snLiteral === CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER) {
                for (let i = 0; i < CpuSerialNumberHelper._snLength; i++) {
                    code.push(0);
                }
            } else if (snLiteral.length !== CpuSerialNumberHelper._snLength) {
                throw new Error(`Invalid length. Serial number must be exactly ${CpuSerialNumberHelper._snLength} characters long.`);
            } else {
                for (let i = 0; i < snLiteral.length; i++) {
                    const idx = CpuSerialNumberHelper._snChars.indexOf(snLiteral.charAt(i).toUpperCase());
                    if (idx > -1) {
                        code.push(idx);
                    } else {
                        throw new Error(`Forbidden character: "${snLiteral.charAt(i)}"`);
                    }
                }
            }

            return code;
        } else {
            if (RegExp(/^[ 0-9a-f]+$/gi).test(sn)) {
                const segments = sn.match(/[0-9a-f]{1,2}/gi);
                if (!(!!segments) || segments.length !== CpuSerialNumberHelper._snLength) {
                    throw new Error(`Invalid length. Serial number must be exactly ${CpuSerialNumberHelper._snLength} digits long.`); 
                } else if (segments.every(s => /^[0]{1,2}$/.test(s))) {
                    for (let i = 0; i < CpuSerialNumberHelper._snLength; i++) {
                        code.push(0);
                    }
                } else {
                    segments.map(s => Number.parseInt(s, 16)).forEach(s => {
                        if (s >= CpuSerialNumberHelper._snChars.length) {
                            throw new Error(`Hex digit too large: "${s}"`);  
                        } else {
                            code.push(s);
                        }
                    })
                }
            } else {
                throw new Error('Invalid hex string');
            }

            return code;
        }
    }
    
    public static decodeSerialNumber(code: Array<number>, decodeAsFormat: 'val' | 'num'): string {
        let decodedSn = '';
        let notSet = false;
        if (code.length !== CpuSerialNumberHelper._snLength) {
            throw new Error('Invalid length');
        } else {
            if (code.every(c => c === 0)) {
                decodedSn = CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER;
                notSet = true;
            } else {
                let sn = '';
                for (let i = 0; i < code.length; i++) {
                    const ch = CpuSerialNumberHelper._snChars[code[i]];
                    if (!!ch) {
                        sn += ch;
                    } else {
                        throw new Error(`Code out of range: ${code[i]}`);
                    }
                }
                decodedSn = sn;
            }
        }

        if (decodeAsFormat === 'num') {
            if (notSet) {
                decodedSn = '00 '.repeat(CpuSerialNumberHelper._snLength);
                decodedSn = decodedSn.substring(0, decodedSn.length - 1);
            } else {
                let hexString = '';
                for (let i = 0; i < decodedSn.length; i++) {
                    const ch = decodedSn.charAt(i);
                    const index = CpuSerialNumberHelper._snChars.indexOf(ch);
                    if (index > -1) {
                        let hs = index.toString(16);
                        if (hs.length < 2) {
                            hs = `0${hs}`;
                        }

                        hexString += hs;
                        if (i < decodedSn.length - 1) {
                            hexString += ' ';
                        }
                    } else {
                        throw new Error(`Code out of range: ${ch}`);
                    }
                }
                decodedSn = hexString;
            }
        }

        if (!notSet) {
            decodedSn = decodedSn.toUpperCase();
        }
        return decodedSn;
    }
    
    public static randomSerialNumber(): string {
        let sn = '';
        while (sn.length < CpuSerialNumberHelper._snLength) {
            let randIdx = Number(Math.random().toString().substring(3, 5));
            while (randIdx >= CpuSerialNumberHelper._snChars.length) {
                randIdx = Number(Math.random().toString().substring(3, 5));
            }       
            sn += CpuSerialNumberHelper._snChars[randIdx];
        }
        return sn.toUpperCase();
    }
    
    private static readonly _snChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'W', 'X', 'Y', 'Z'];
    private static readonly _snLength = 12;
}