import { CommandOutput } from '../generated';
import { HandlerContext } from './common';
import { Utils } from '../utils';
import { VERSION_STRINGS } from '../../version-strings';

export class EnvHandlers {
    public static async EnvVersion(input: string, variables: Array<string>): Promise<CommandOutput> {
        return Utils.cmdPrependInput(input, Utils.cmdInfo(
            `Allium architecture definitions: ${VERSION_STRINGS.arch}`,
            `Allium Assembler: ${VERSION_STRINGS.asm}`,
            `Allium Emulator: ${VERSION_STRINGS.emulator}`,
            `Allium Platform: ${VERSION_STRINGS.platform}`,
            `Allium shell: ${VERSION_STRINGS.shell}`,
            `Allium typelib: ${VERSION_STRINGS.types}`,
            `YFS: ${VERSION_STRINGS.yfs}`
        ));
    }

    public static async EnvGetVar(input: string, variables: Array<string>): Promise<CommandOutput> {
        if (variables.length === 1) {
            const varValue = HandlerContext.sharedContext.envProps.get(variables[0]);
            if (!!varValue) {
                return Utils.cmdPrependInput(input, Utils.cmdInfo(varValue));
            } else {
                return Utils.cmdPrependInput(input, Utils.cmdInfo(`undefined variable: "${varValue}"`));
            }
        } else {
            return Utils.cmdPrependInput(input, Utils.cmdError('invalid arg(s)'));
        }
    }

    public static async EnvSetVar(input: string, variables: Array<string>): Promise<CommandOutput> {
        if (variables.length === 2) {
            HandlerContext.sharedContext.envProps.set(variables[0], variables[1]);
            return Utils.cmdPrependInput(input, Utils.cmdInfo(''));
        } else {
            return Utils.cmdPrependInput(input, Utils.cmdError('invalid arg(s)'));
        }
    }
    
    public static async EnvUnsetVar(input: string, variables: Array<string>): Promise<CommandOutput> {
        if (variables.length === 1) {
            if (HandlerContext.sharedContext.envProps.has(variables[0])) {
                HandlerContext.sharedContext.envProps.delete(variables[0]);
                return Utils.cmdPrependInput(input, Utils.cmdInfo(`cleared variable "${variables[0]}"`));
            } else {
                return Utils.cmdPrependInput(input, Utils.cmdError(`undefined variable "${variables[0]}"`));
            }
        } else {
            return Utils.cmdPrependInput(input, Utils.cmdError('invalid arg(s)'));
        }
    }

    public static async EnvEcho(input: string, variables: Array<string>): Promise<CommandOutput> {
        const template = variables.length > 0 ? variables[0] : '';
        return Utils.cmdPrependInput(input, Utils.cmdInfo(template)); // TODO
    }
}