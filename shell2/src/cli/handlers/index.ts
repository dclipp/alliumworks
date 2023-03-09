import { AsmCommandNames, EnvCommandNames, MachineCommandNames, MachineShortcutCommandNames } from '../command-names';
import { CommandOutput } from '../generated';
import { take } from 'rxjs/operators';
import { VariableRegisterReference, RegisterHelper, NamedRegisterMask, ByteSequenceCreator, QuadByte, Byte } from '@allium/types';
import { AlmAssembler, AsmMessageHelper } from '@allium/asm';
import { Utils } from '../utils';
import { BreakpointHandlers } from './breakpoints';
import { HandlerContext, notImplementedOutput, platformUnavailableOutput } from './common';
import { EnvHandlers } from './env';

function tryParseRegister(variable: string): VariableRegisterReference | null {
    const match = variable.match(/^[ \t]{0,}\[[ \t]{0,}(INSPTR|ACCUMULATOR|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|G7|G8|G9|G10|G11|G12|G13|G14|STKPTR)[ \t]{0,}(\.[ \t]{0,}[0-1]{4}){0,1}\]/);
    if (!!match) {
        const regName = RegisterHelper.parseRegisterNameFromString(match[1]);
        if (regName === undefined) {
            return null;
        } else {
            const isBitMask = !!match[2];
            const isNamedMask = !isBitMask && !!match[3];

            if (isBitMask) {
                const byte1 = match[2].charAt(0) === '1';
                const byte2 = match[2].charAt(1) === '1';
                const byte3 = match[2].charAt(2) === '1';
                const byte4 = match[2].charAt(3) === '1';

                return VariableRegisterReference.create(regName, {
                    byte1: byte1,
                    byte2: byte2,
                    byte3: byte3,
                    byte4: byte4
                });
            } else if (isNamedMask) {
return null;//TODO
            } else {
                return VariableRegisterReference.create(regName);
            }
        }
    } else {
        return null;
    }
}

function tryParseNumber(variable: string, radix?: 10 | 16): {
    readonly value: number;
    readonly matchLength: number;
} | 'wrong-radix' | null {
    const hexMatch = variable.match(/^[ \t]{0,}0x([0-9a-fA-F]+)/);
    if (!!hexMatch) {
        if (radix === 10) {
            return 'wrong-radix';
        } else {
            return {
                value: Number.parseInt(hexMatch[1], 16),
                matchLength: hexMatch[0].length
            };
        }
    } else {
        const decMatch = variable.match(/^[ \t]{0,}([0-9]+)/);
        if (!!decMatch) {
            if (radix === 16) {
                return 'wrong-radix';
            } else {
                return {
                    value: Number.parseInt(decMatch[1], 10),
                    matchLength: decMatch[0].length
                };
            }
        } else {
            return null;
        }
    }
}

function tryParseNumberOrNumberRange(variable: string, radix?: 10 | 16): {
    readonly values: Array<number>;
    readonly hasHexFlag: boolean;
    readonly matchLength: number;
} | null {
    const values = new Array<number>();
    let hasHexFlag = false;
    let matchLength = 0;
    
    let workingInput = variable;
    let numMatch = tryParseNumber(workingInput, radix);
    while (numMatch !== null && numMatch !== 'wrong-radix' && workingInput.trim().length > 0) {
        values.push(numMatch.value);
        matchLength += numMatch.matchLength;
        workingInput = workingInput.substring(numMatch.matchLength);
        numMatch = tryParseNumber(workingInput, radix);
    }

    const hexFlagMatch = workingInput.match(/^[ \t]{0,}\-\-hex/);
    if (hexFlagMatch) {
        matchLength += hexFlagMatch[0].length;
        hasHexFlag = true;
    }

    if (numMatch !== 'wrong-radix' && values.length > 0) {
        return {
            values: values,
            hasHexFlag: hasHexFlag,
            matchLength: matchLength
        };
    } else {
        return null;
    }
}

async function readRegisterValue(input: string, variables: Array<string>, radix: 10 | 16): Promise<CommandOutput> {
    const rr = tryParseRegister(variables[0] || '');
    if (rr === null) {
        return Utils.cmdError('Invalid register');
    } else {
        const actionResult = await HandlerContext.platformOrNotAvailable(input, (p) => p.machine.registers.values().pipe(take(1)).toPromise(), true);
        if (actionResult.notAvailable) {
            return actionResult.output;
        } else {
            let outValue = Number.NaN;
            const value = actionResult.data.get(rr.register)!;
            if (rr.mask.name === NamedRegisterMask.Full) {
                outValue = ByteSequenceCreator.Unbox(value);
            } else if (rr.mask.name === NamedRegisterMask.ExtendedHigh) {
                outValue = ByteSequenceCreator.Unbox(value.getBytes(1, 3));
            } else if (rr.mask.name === NamedRegisterMask.ExtendedLow) {
                outValue = ByteSequenceCreator.Unbox(value.getBytes(2, 3));
            } else if (rr.mask.name === NamedRegisterMask.High) {
                outValue = ByteSequenceCreator.Unbox(value.getBytes(1, 2));
            } else if (rr.mask.name === NamedRegisterMask.HighHigh) {
                outValue = ByteSequenceCreator.Unbox(value.getByte(1));
            } else if (rr.mask.name === NamedRegisterMask.HighLow) {
                outValue = ByteSequenceCreator.Unbox(value.getByte(2));
            } else if (rr.mask.name === NamedRegisterMask.Low) {
                outValue = ByteSequenceCreator.Unbox(value.getBytes(3, 2));
            } else if (rr.mask.name === NamedRegisterMask.LowHigh) {
                outValue = ByteSequenceCreator.Unbox(value.getByte(3));
            } else if (rr.mask.name === NamedRegisterMask.LowLow) {
                outValue = ByteSequenceCreator.Unbox(value.getByte(4));
            } else {
                // outValue = 'g';TODO
            }

            return Utils.cmdInfo(outValue.toString(radix));
        }
    }
}

const _handlers: { [name: string]: <T>(input: string, variables: Array<string>) => Promise<CommandOutput<T>> } = {};

_handlers[MachineCommandNames.ReadRegBase10] = async (input, variables) => {
    return readRegisterValue(input, variables, 10);
};

_handlers[MachineCommandNames.ReadRegBase16] = async (input, variables) => {
    return readRegisterValue(input, variables, 16);
};

_handlers[MachineCommandNames.WriteReg] = async (input, variables) => {
    const register = tryParseRegister(variables[0] || '');
    if (register === null) {
        return Utils.cmdPrependInput(input, Utils.cmdError('Invalid register'));
    } else {
        const value = tryParseNumber(variables[1] || '');

        if (value === null || value === 'wrong-radix') {
            return Utils.cmdPrependInput(input, Utils.cmdError('Invalid value'));
        } else {
            const actionResult = await HandlerContext.platformOrNotAvailableVoid(input, (p) => p.machine.registers.updateValue(register, ByteSequenceCreator.QuadByte(value.value)), true);
            if (actionResult.notAvailable) {
                return actionResult.output;
            } else {
                return Utils.cmdPrependInput(input, Utils.cmdInfo('OK'));
            }
        }
    }
};

// _handlers[CommandNames.ReadFlag] = async (input, variables) => {
//     // FlagHelper.
// };

_handlers[MachineCommandNames.ReadMemBase10] = async (input, variables) => {
    const address = tryParseNumber(variables[0] || '', 10);

    if (address === null || address === 'wrong-radix') {
        return Utils.cmdPrependInput(input, Utils.cmdError('Invalid address'));
    } else {
        const actionResult = await HandlerContext.platformOrNotAvailable(input, (p) => p.machine.memoryExplorer.fetchValues([ByteSequenceCreator.QuadByte(address.value)]), true);
        if (actionResult.notAvailable) {
            return actionResult.output;
        } else {
            return Utils.cmdPrependInput(input, Utils.cmdInfo(actionResult.data[0].value.toString({ radix: 10, padZeroes: false })));
        }
    }
};

_handlers[MachineCommandNames.ReadMemBase16] = async (input, variables) => {
    const address = tryParseNumber(variables[0] || '', 16);

    if (address === null || address === 'wrong-radix') {
        return Utils.cmdPrependInput(input, Utils.cmdError('Invalid address'));
    } else {
        const actionResult = await HandlerContext.platformOrNotAvailable(input, (p) => p.machine.memoryExplorer.fetchValues([ByteSequenceCreator.QuadByte(address.value)]), true);
        if (actionResult.notAvailable) {
            return actionResult.output;
        } else {
            return Utils.cmdPrependInput(input, Utils.cmdInfo(actionResult.data[0].value.toString({ radix: 16, padZeroes: true })));
        }
    }
};

_handlers[MachineCommandNames.WriteMemBase10] = async (input, variables) => {
    const address = tryParseNumber(variables[0] || '', 10);

    if (address === null || address === 'wrong-radix') {
        return Utils.cmdPrependInput(input, Utils.cmdError('Invalid address'));
    } else {
        const setValues = tryParseNumberOrNumberRange(variables[1] || '', 10);

        if (setValues === null) {
            return Utils.cmdPrependInput(input, Utils.cmdError('Invalid value(s)'));
        } else {
            const addressQuad = ByteSequenceCreator.QuadByte(address.value);
            const setPairs: Array<[QuadByte, Byte]> = setValues.values.map((v, vi) => [addressQuad.computeSum(vi), ByteSequenceCreator.Byte(v)]);

            let output: CommandOutput | null = null;
            for (let i = 0; i < setPairs.length && output === null; i++) {
                const actionResult = await HandlerContext.platformOrNotAvailableVoid(input, (p) => p.machine.memory.updateValue(setPairs[i][0], setPairs[i][1]), true);
                if (actionResult.notAvailable) {
                    output = actionResult.output;
                }
            }

            if (output === null) {
                return Utils.cmdPrependInput(input, Utils.cmdInfo('OK'));
            } else {
                return output;
            }
        }
    }
};

_handlers[MachineCommandNames.WriteMemBase16] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.BreakpointAdd] = async (input, variables) => {
    return BreakpointHandlers.BreakpointAdd(input, variables);
};

_handlers[MachineCommandNames.BreakpointRemove] = async (input, variables) => {
    return BreakpointHandlers.BreakpointRemove(input, variables);
};

_handlers[MachineCommandNames.BreakpointsEnable] = async (input, variables) => {
    return BreakpointHandlers.BreakpointsEnable(input, variables);
};

_handlers[MachineCommandNames.BreakpointsDisable] = async (input, variables) => {
    return BreakpointHandlers.BreakpointsDisable(input, variables);
};

_handlers[MachineCommandNames.ControlGetState] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.ControlSetState] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.ControlStep] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.ControlStepMulti] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.ControlCycle] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.ControlCycleMulti] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.ControlContinue] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.ControlPause] = async (input, variables) => {
    return (await HandlerContext.platformOrNotAvailableVoid(input, (p) => p.machine.computerControls.pause(), true)).output;
};

_handlers[MachineCommandNames.GetPowerState] = async (input, variables) => {
    const r = await HandlerContext.platformOrNotAvailable(input, async (p) => {
        const cms = await p.machine.currentMachineState().pipe(take(1)).toPromise();
        return cms.isComputerPoweredOn;
    });

    if (r.notAvailable) {
        return platformUnavailableOutput(input) as any;
    } else {
        return {
            isError: false,
            messages: [],
            payload: r.data ? 'on' : 'off'
        } as any;
    };
};

_handlers[MachineCommandNames.PowerOn] = async (input, variables) => {
    return notImplementedOutput(input);
};

_handlers[MachineCommandNames.PowerOff] = async (input, variables) => {
    return (await HandlerContext.platformOrNotAvailableVoid(input, (p) => p.machine.computerControls.powerOff(), true)).output;
};

_handlers[MachineCommandNames.Restart] = async (input, variables) => {
    return notImplementedOutput(input);
};

///fsdfdsdsfdsf
_handlers[MachineShortcutCommandNames.ReadRegBase10] = async (input, variables) => {
    return _handlers[MachineCommandNames.ReadRegBase10](input, variables);
};

_handlers[MachineShortcutCommandNames.ReadRegBase16] = async (input, variables) => {
    return _handlers[MachineCommandNames.ReadRegBase16](input, variables);
};

_handlers[MachineShortcutCommandNames.WriteReg] = async (input, variables) => {
    return _handlers[MachineCommandNames.WriteReg](input, variables);
};

_handlers[MachineShortcutCommandNames.ReadFlag] = async (input, variables) => {
    return _handlers[MachineCommandNames.ReadFlag](input, variables);
};

_handlers[MachineShortcutCommandNames.RaiseFlag] = async (input, variables) => {
    return _handlers[MachineCommandNames.RaiseFlag](input, variables);
};

_handlers[MachineShortcutCommandNames.ClearFlag] = async (input, variables) => {
    return _handlers[MachineCommandNames.ClearFlag](input, variables);
};

_handlers[MachineShortcutCommandNames.ReadMemBase10] = async (input, variables) => {
    return _handlers[MachineCommandNames.ReadMemBase10](input, variables);
};

_handlers[MachineShortcutCommandNames.ReadMemBase16] = async (input, variables) => {
    return _handlers[MachineCommandNames.ReadMemBase16](input, variables);
};

_handlers[MachineShortcutCommandNames.WriteMemBase10] = async (input, variables) => {
    return _handlers[MachineCommandNames.WriteMemBase10](input, variables);
};

_handlers[MachineShortcutCommandNames.WriteMemBase16] = async (input, variables) => {
    return _handlers[MachineCommandNames.WriteMemBase16](input, variables);
};

_handlers[MachineShortcutCommandNames.BreakpointAdd] = async (input, variables) => {
    return BreakpointHandlers.BreakpointAdd(input, variables);
};

_handlers[MachineShortcutCommandNames.BreakpointRemove] = async (input, variables) => {
    return BreakpointHandlers.BreakpointRemove(input, variables);
};

_handlers[MachineShortcutCommandNames.BreakpointsEnable] = async (input, variables) => {
    return BreakpointHandlers.BreakpointsEnable(input, variables);
};

_handlers[MachineShortcutCommandNames.BreakpointsDisable] = async (input, variables) => {
    return BreakpointHandlers.BreakpointsDisable(input, variables);
};

_handlers[MachineShortcutCommandNames.ControlGetState] = async (input, variables) => {
    return _handlers[MachineCommandNames.ControlGetState](input, variables);
};

_handlers[MachineShortcutCommandNames.ControlSetState] = async (input, variables) => {
    return _handlers[MachineCommandNames.ControlSetState](input, variables);
};

_handlers[MachineShortcutCommandNames.ControlStep] = async (input, variables) => {
    return _handlers[MachineCommandNames.ControlStep](input, variables);
};

_handlers[MachineShortcutCommandNames.ControlStepMulti] = async (input, variables) => {
    return _handlers[MachineCommandNames.ControlStepMulti](input, variables);
};

_handlers[MachineShortcutCommandNames.ControlCycle] = async (input, variables) => {
    return _handlers[MachineCommandNames.ControlCycle](input, variables);
};

_handlers[MachineShortcutCommandNames.ControlCycleMulti] = async (input, variables) => {
    return _handlers[MachineCommandNames.ControlCycleMulti](input, variables);
};

_handlers[MachineShortcutCommandNames.ControlContinue] = async (input, variables) => {
    return _handlers[MachineCommandNames.ControlContinue](input, variables);
};

_handlers[MachineShortcutCommandNames.ControlPause] = async (input, variables) => {
    return _handlers[MachineCommandNames.ControlPause](input, variables);
};

_handlers[MachineShortcutCommandNames.GetPowerState] = async (input, variables) => {
    return _handlers[MachineCommandNames.GetPowerState](input, variables);
};

_handlers[MachineShortcutCommandNames.PowerOn] = async (input, variables) => {
    return _handlers[MachineCommandNames.PowerOn](input, variables);
};

_handlers[MachineShortcutCommandNames.PowerOff] = async (input, variables) => {
    return _handlers[MachineCommandNames.PowerOff](input, variables);
};

_handlers[MachineShortcutCommandNames.Restart] = async (input, variables) => {
    return _handlers[MachineCommandNames.Restart](input, variables);
};

_handlers[EnvCommandNames.EnvVersion] = async (input, variables) => {
    return EnvHandlers.EnvVersion(input, variables);
};
_handlers[EnvCommandNames.EnvGetVar] = async (input, variables) => {
    return EnvHandlers.EnvGetVar(input, variables);
};
_handlers[EnvCommandNames.EnvSetVar] = async (input, variables) => {
    return EnvHandlers.EnvSetVar(input, variables);
};
_handlers[EnvCommandNames.EnvUnsetVar] = async (input, variables) => {
    return EnvHandlers.EnvUnsetVar(input, variables);
};
_handlers[EnvCommandNames.EnvEcho] = async (input, variables) => {
    return EnvHandlers.EnvEcho(input, variables);
};

_handlers[AsmCommandNames.Dasm.Inline] = async (input, variables) => {
    const assembly = AlmAssembler.build([{
        referenceName: 'inline',
        fileContent: variables[0].replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    }], {
        generateSourceMap: true,
        useMockForExternalAddresses: true
    });

    let outputLines = new Array<string>();
    if (assembly.buildSucceeded) {
        outputLines.push(assembly.compilation.programBytes.map(b => b.toString({ radix: 10, padZeroes: true })).join(' '));
    } else {
        outputLines = assembly.messages.map(m => AsmMessageHelper.localizeMessage(m.code, ''));// TODO locale
    }

    const output: CommandOutput = {
        isError: !assembly.buildSucceeded,
        messages: outputLines.map(ol => {
            return {
                type: assembly.buildSucceeded ? 'info' : 'error',
                timestamp: Date.now(),
                message: ol
            }
        })
    };

    return Utils.cmdPrependInput(input, output) as any;
};

// _handlers[CommandNames.ReadRegBase16] = (variables) => {
    
// };

export const Handlers: { readonly [name: string]: (input: string, variables: Array<string>) => Promise<CommandOutput> } = _handlers;
