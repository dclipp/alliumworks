import { ComputerSpecOption } from './computer-spec-option.model';
// import { CpuSerialNumberHelper } from './cpu-serial-number-helper';
import { btoa } from 'abab';

const _DEFAULT_SPEC_NAME = 'Default';
const _DEFAULT_OVERSIZE_VALUE_SIZING = 'min-required';
const _DEFAULT_MEM_SIZE = 2048;
const _DEFAULT_CPU_SPEED = 1;
const _DEFAULT_BATCH_MARKET = 0;
const _DEFAULT_ISA = 0;
const _MAX_CPU_MODEL_NUMERIC = Math.pow(2, 16) - 1;
const _DEFAULT_CPU_MODEL_NUMERIC = 0;
const _DEFAULT_CPU_MODEL = _DEFAULT_CPU_MODEL_NUMERIC.toString().padStart(Math.ceil(Math.log10(_MAX_CPU_MODEL_NUMERIC)), '0');
const _IMPLICIT_SPEC_KEY = '__default__';

const _OPT_MANAGE_NAME = '__manage__';
const _OPT_NEW_NAME = '__new__';

const _NOT_SET_SERIAL_NUMBER = 'Not set';
const _SERIAL_NUM_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'W', 'X', 'Y', 'Z'];
const _SERIAL_NUM_LENGTH = 12;

export interface ComputerSpec {}

export class ComputerSpec implements ComputerSpec {
    public readonly name: string;
    public readonly computerMemorySize: number;
    public readonly computerCpuSpeed: number;
    public readonly cpuModelId: number;
    public readonly cpuFeatureFlags1: number;
    public readonly cpuFeatureFlags2: number;
    public readonly cpuSerialNumber: string;
    public readonly cpuBatchMarket: number;
    public readonly cpuISA: number;

    public readonly oversizedInlineValueSizing: string;
    public readonly treatOversizedInlineValuesAsWarnings: boolean;

    public readonly isDefault: boolean;
    public readonly key: string;

    public getOption(): ComputerSpecOption {
        return {
            label: this.name,
            value: this.key,
            action: 'none'
        }
    }

    public update(values: Partial<ComputerSpec>): ComputerSpec {
        return new ComputerSpec(
            values.name === undefined ? this.name : values.name,
            values.computerMemorySize === undefined ? this.computerMemorySize : values.computerMemorySize,
            values.computerCpuSpeed === undefined ? this.computerCpuSpeed : values.computerCpuSpeed,
            values.cpuModelId === undefined ? this.cpuModelId : values.cpuModelId,
            values.cpuFeatureFlags1 === undefined ? this.cpuFeatureFlags1 : values.cpuFeatureFlags1,
            values.cpuFeatureFlags2 === undefined ? this.cpuFeatureFlags2 : values.cpuFeatureFlags2,
            values.cpuSerialNumber === undefined ? this.cpuSerialNumber : values.cpuSerialNumber,
            values.cpuBatchMarket === undefined ? this.cpuBatchMarket : values.cpuBatchMarket,
            values.cpuISA === undefined ? this.cpuISA : values.cpuISA,

            values.oversizedInlineValueSizing === undefined ? this.oversizedInlineValueSizing : values.oversizedInlineValueSizing,
            values.treatOversizedInlineValuesAsWarnings === undefined ? this.treatOversizedInlineValuesAsWarnings : values.treatOversizedInlineValuesAsWarnings,
            
            values.isDefault === undefined ? this.isDefault : values.isDefault)
    }

    private constructor(name: string, computerMemorySize: number, computerCpuSpeed: number, cpuModelId: number, cpuFeatureFlags1: number, cpuFeatureFlags2: number, cpuSerialNumber: string, cpuBatchMarket: number, cpuISA: number, oversizedInlineValueSizing: string, treatOversizedInlineValuesAsWarnings: boolean, isDefault: boolean, isImplicit?: boolean) {
        this.name = name;
        this.computerMemorySize = computerMemorySize;
        this.computerCpuSpeed = computerCpuSpeed;
        this.cpuModelId = cpuModelId;
        this.cpuFeatureFlags1 = cpuFeatureFlags1;
        this.cpuFeatureFlags2 = cpuFeatureFlags2;
        this.cpuSerialNumber = cpuSerialNumber;
        this.cpuBatchMarket = cpuBatchMarket;
        this.cpuISA = cpuISA;
        this.oversizedInlineValueSizing = oversizedInlineValueSizing;
        this.treatOversizedInlineValuesAsWarnings = treatOversizedInlineValuesAsWarnings;
        this.isDefault = isDefault;
        this.key = isImplicit === true
            ? ComputerSpec.Defaults.Fields.DefaultKey()
            : ComputerSpec.generateKey(name);
    }

    public static create(name: string, computerMemorySize: number, computerCpuSpeed: number, cpuModelId: number, cpuFeatureFlags1: number, cpuFeatureFlags2: number, cpuSerialNumber: string, cpuBatchMarket: number, cpuISA: number, oversizedInlineValueSizing: string, treatOversizedInlineValuesAsWarnings: boolean, isDefault: boolean): ComputerSpec {
        return new ComputerSpec(name, computerMemorySize, computerCpuSpeed, cpuModelId, cpuFeatureFlags1, cpuFeatureFlags2, cpuSerialNumber, cpuBatchMarket, cpuISA, oversizedInlineValueSizing, treatOversizedInlineValuesAsWarnings, isDefault);
    }

    public static createCustom(name: string, computerMemorySize: number, computerCpuSpeed: number, cpuModelId: number, cpuFeatureFlags1: number, cpuFeatureFlags2: number, cpuSerialNumber: string, cpuBatchMarket: number, cpuISA: number, oversizedInlineValueSizing: string, treatOversizedInlineValuesAsWarnings: boolean, isDefault: boolean): ComputerSpec {
        return ComputerSpec.create(name, computerMemorySize, computerCpuSpeed, cpuModelId, cpuFeatureFlags1, cpuFeatureFlags2, cpuSerialNumber, cpuBatchMarket, cpuISA, oversizedInlineValueSizing, treatOversizedInlineValuesAsWarnings, isDefault);
    }

    public static createDefault(): ComputerSpec {
        return new ComputerSpec(
            ComputerSpec.Defaults.Fields.DefaultName(),
            ComputerSpec.Defaults.Fields.DefaultMemSize(),
            ComputerSpec.Defaults.Fields.DefaultCpuSpeed(),
            ComputerSpec.Defaults.Fields.DefaultModelIdentifierNumeric(),
            0,
            0,
            ComputerSpec.CpuSerialNumberHelper.NOT_SET_SERIAL_NUMBER,
            ComputerSpec.Defaults.Fields.DefaultProductionMarket(),
            ComputerSpec.Defaults.Fields.DefaultIsa(),
            ComputerSpec.Defaults.Fields.DefaultOversizeValueSizing(),
            false,
            true,
            true);
    }

    public static get Defaults(): {
        readonly Options: {
            readonly NewSpec: () => ComputerSpecOption,
            readonly ManageSpecs: () => ComputerSpecOption
        },
        readonly Fields: {
            readonly DefaultName: () => string,
            readonly DefaultOversizeValueSizing: () => string,
            readonly DefaultMemSize: () => number,
            readonly DefaultCpuSpeed: () => number,
            readonly DefaultProductionMarket: () => number,
            readonly DefaultIsa: () => number,
            readonly DefaultModelIdentifierNumeric: () => number,
            readonly DefaultModelIdentifier: () => string,
            readonly DefaultKey: () => string
        },
        readonly Constraints: {
            readonly MaxModelNumeric: () => number
        }
    } {
        return {
            Options: {
                NewSpec: () => {
                    return {
                        label: 'New...',
                        value: _OPT_NEW_NAME,
                        action: 'new'
                    }
                },
                ManageSpecs: () => {
                    return {
                        label: 'Manage...',
                        value: _OPT_MANAGE_NAME,
                        action: 'manage'
                    }
                }
            },
            Fields: {
                DefaultName: () => _DEFAULT_SPEC_NAME,
                DefaultOversizeValueSizing: () => _DEFAULT_OVERSIZE_VALUE_SIZING,
                DefaultMemSize: () => _DEFAULT_MEM_SIZE,
                DefaultCpuSpeed: () => _DEFAULT_CPU_SPEED,
                DefaultProductionMarket: () => _DEFAULT_BATCH_MARKET,
                DefaultIsa: () => _DEFAULT_ISA,
                DefaultModelIdentifierNumeric: () => _DEFAULT_CPU_MODEL_NUMERIC,
                DefaultModelIdentifier: () => _DEFAULT_CPU_MODEL,
                DefaultKey: () => _IMPLICIT_SPEC_KEY
            },
            Constraints: {
                MaxModelNumeric: () => _MAX_CPU_MODEL_NUMERIC
            }
        }
    }

    public static get CpuSerialNumberHelper(): {
        readonly NOT_SET_SERIAL_NUMBER: string;
        encodeSerialNumber(sn: string, format: 'val' | 'num'): Array<number>;
        decodeSerialNumber(code: Array<number>, decodeAsFormat: 'val' | 'num'): string;
        randomSerialNumber(): string;
    } {
        return {
            NOT_SET_SERIAL_NUMBER: _NOT_SET_SERIAL_NUMBER,
            encodeSerialNumber: (sn, format) => {
                const code = new Array<number>();
                if (format === 'val') {
                    let snLiteral = sn;

                    if (snLiteral === _NOT_SET_SERIAL_NUMBER) {
                        for (let i = 0; i < _SERIAL_NUM_LENGTH; i++) {
                            code.push(0);
                        }
                    } else if (snLiteral.length !== _SERIAL_NUM_LENGTH) {
                        throw new Error(`Invalid length. Serial number must be exactly ${_SERIAL_NUM_LENGTH} characters long.`);
                    } else {
                        for (let i = 0; i < snLiteral.length; i++) {
                            const idx = _SERIAL_NUM_CHARS.indexOf(snLiteral.charAt(i).toUpperCase());
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
                        if (!(!!segments) || segments.length !== _SERIAL_NUM_LENGTH) {
                            throw new Error(`Invalid length. Serial number must be exactly ${_SERIAL_NUM_LENGTH} digits long.`);
                        } else if (segments.every(s => /^[0]{1,2}$/.test(s))) {
                            for (let i = 0; i < _SERIAL_NUM_LENGTH; i++) {
                                code.push(0);
                            }
                        } else {
                            segments.map(s => Number.parseInt(s, 16)).forEach(s => {
                                if (s >= _SERIAL_NUM_CHARS.length) {
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
            },
            decodeSerialNumber: (code, decodeAsFormat) => {
                let decodedSn = '';
                let notSet = false;
                if (code.length !== _SERIAL_NUM_LENGTH) {
                    throw new Error('Invalid length');
                } else {
                    if (code.every(c => c === 0)) {
                        decodedSn = _NOT_SET_SERIAL_NUMBER;
                        notSet = true;
                    } else {
                        let sn = '';
                        for (let i = 0; i < code.length; i++) {
                            const ch = _SERIAL_NUM_CHARS[code[i]];
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
                        decodedSn = '00 '.repeat(_SERIAL_NUM_LENGTH);
                        decodedSn = decodedSn.substring(0, decodedSn.length - 1);
                    } else {
                        let hexString = '';
                        for (let i = 0; i < decodedSn.length; i++) {
                            const ch = decodedSn.charAt(i);
                            const index = _SERIAL_NUM_CHARS.indexOf(ch);
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
            },
            randomSerialNumber: () => {
                let sn = '';
                while (sn.length < _SERIAL_NUM_LENGTH) {
                    let randIdx = Number(Math.random().toString().substring(3, 5));
                    while (randIdx >= _SERIAL_NUM_CHARS.length) {
                        randIdx = Number(Math.random().toString().substring(3, 5));
                    }
                    sn += _SERIAL_NUM_CHARS[randIdx];
                }
                return sn.toUpperCase();
            }
        }
    }

    private static generateKey(name: string): string {
        return btoa(name) || '';
    }
}