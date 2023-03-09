import { CommandOutput } from '../generated';
import { Platform } from '@alliumworks/platform';
import { take } from 'rxjs/operators';
import { Utils } from '../utils';
import { SharedBackendContext } from '../../shared-backend-context';

export class HandlerContext {
    public static platform: Platform | null = null;

    public static readonly sharedContext: SharedBackendContext = new SharedBackendContext();

    public static async platformOrNotAvailable<T>(input: string, action: (p: Platform) => Promise<T>, requiresActiveMachine?: boolean): Promise<{
        readonly notAvailable: true;
        readonly output: CommandOutput;
    } | {
        readonly notAvailable: false;
        readonly data: T;
    }> {
        if (HandlerContext.platform === null) {
            return {
                notAvailable: true,
                output: Utils.cmdPrependInput(input, Utils.cmdError('Platform unavailable'))
            };
        } else {
            // let sldf = false;
            if (requiresActiveMachine === true) {
                const currentMachineState = await HandlerContext.platform.machine.currentMachineState().pipe(take(1)).toPromise();
                if (!currentMachineState.isComputerPoweredOn) {
                    return {
                        notAvailable: true,
                        output: Utils.cmdPrependInput(input, Utils.cmdError('The machine is not powered on'))
                    };
                }
            }

            const result = await action(HandlerContext.platform);
            return {
                notAvailable: false,
                data: result
            };
        }
    }

    public static async platformOrNotAvailableVoid(input: string, action: (p: Platform) => void, requiresActiveMachine?: boolean): Promise<{
        readonly notAvailable: true;
        readonly output: CommandOutput;
    } | {
        readonly notAvailable: false;
        readonly output: CommandOutput;
    }> {
        if (HandlerContext.platform === null) {
            return {
                notAvailable: true,
                output: Utils.cmdPrependInput(input, Utils.cmdError('Platform unavailable'))
            };
        } else {
            // let sldf = false;
            if (requiresActiveMachine === true) {
                const currentMachineState = await HandlerContext.platform.machine.currentMachineState().pipe(take(1)).toPromise();
                if (!currentMachineState.isComputerPoweredOn) {
                    return {
                        notAvailable: true,
                        output: Utils.cmdPrependInput(input, Utils.cmdError('The machine is not powered on'))
                    };
                }
            }

            action(HandlerContext.platform);
            return {
                notAvailable: false,
                output: {
                    isError: false,
                    messages: []
                }
            };
        }
    }
}

export function notImplementedOutput(input: string): CommandOutput {
    // return Utils.cmdError('Not Implemented');
    return Utils.cmdPrependInput(input, Utils.cmdError('Not Implemented'));
}

export function platformUnavailableOutput(input: string): CommandOutput {
    return Utils.cmdPrependInput(input, Utils.cmdError('Platform unavailable'));
}