import { QuadByte } from '@allium/types';
import { take } from 'rxjs/operators';
import { CommandOutput } from '../generated';
import { HandlerContext } from './common';
import { Utils } from '../utils';

export class BreakpointHandlers {
    private static parseBreakpointVariable(v: string): {
        readonly objectName?: string;
        readonly lineIndex: number;
    } | 'all' | null {
        let w = v || '';
        if (w.trim() === 'all') {
            return 'all';
        } else {
            let parsedObjectName: string | undefined = undefined;
            const objectNameMatch = w.match(/^[ \t]{0,}\(([^\)]+)\)/);
            if (!!objectNameMatch) {
                parsedObjectName = objectNameMatch[1].trim();
                w = w.substring(objectNameMatch[0].length);
            }
            
            const lineIndex = Number.parseInt(w.trim());

            if (Number.isInteger(lineIndex)) {
                return {
                    objectName: parsedObjectName,
                    lineIndex: lineIndex
                }
            } else {
                return null;
            }
        }
    }

    public static async BreakpointAdd(input: string, variables: Array<string>): Promise<CommandOutput> {
        if (variables.length < 1) {
            return Utils.cmdError('Missing breakpoint location arg');
        } else {
            const bpLocation = BreakpointHandlers.parseBreakpointVariable(variables[0]);
            if (bpLocation === null || bpLocation === 'all') {
                return Utils.cmdError('Invalid breakpoint location');
            } else {
                const result = await HandlerContext.platformOrNotAvailable(input, async (p) => {
                    let objectName: string | null = null;
                    if (!!bpLocation.objectName) {
                        objectName = bpLocation.objectName;
                    } else {
                        const cms = await p.machine.currentMachineState().pipe(take(1)).toPromise();
                        objectName = cms.currentObjectName;
                    }

                    let bpAddress: QuadByte | null = null;
                    
                    const asm = await p.assembler.assembly().pipe(take(1)).toPromise();
                    if (!!asm && !!asm.sourceMap) {
                        const address = asm.sourceMap.getAddressForLine(objectName, bpLocation.lineIndex);
                        if (address !== 'not-an-instruction') {
                            bpAddress = address;
                        }
                    }

                    if (!!bpAddress) {
                        return p.machine.addBreakpoint(bpAddress);
                    } else {
                        return false;
                    }
                }, true);

                if (result.notAvailable) {
                    return Utils.cmdPrependInput(input, Utils.cmdError('Platform unavailable'));
                } else if (result.data) {
                    return Utils.cmdPrependInput(input, Utils.cmdInfo('successfully added breakpoint'));
                } else {
                    return Utils.cmdPrependInput(input, Utils.cmdInfo('no breakpoint added'));
                }
            }
        }
    }

    public static async BreakpointRemove(input: string, variables: Array<string>): Promise<CommandOutput> {
        if (variables.length < 1) {
            return Utils.cmdError('Missing breakpoint location arg');
        } else {
            const bpLocation = BreakpointHandlers.parseBreakpointVariable(variables[0]);
            if (bpLocation === null) {
                return Utils.cmdError('Invalid breakpoint location');
            } else if (bpLocation === 'all') {
                return Utils.cmdError('NOT IMPLEMENTED');
                // TODO
                // HandlerContext.platformOrNotAvailable(input, async (p) => {
                //     const cms = await p.machine.currentMachineState().pipe(take(1)).toPromise();
                //     cms.
                //     p.machine.removeBreakpoint()
                // })
            } else {
                const result = await HandlerContext.platformOrNotAvailable(input, async (p) => {
                    let objectName: string | null = null;
                    if (!!bpLocation.objectName) {
                        objectName = bpLocation.objectName;
                    } else {
                        const cms = await p.machine.currentMachineState().pipe(take(1)).toPromise();
                        objectName = cms.currentObjectName;
                    }

                    let bpAddress: QuadByte | null = null;
                    
                    const asm = await p.assembler.assembly().pipe(take(1)).toPromise();
                    if (!!asm && !!asm.sourceMap) {
                        const address = asm.sourceMap.getAddressForLine(objectName, bpLocation.lineIndex);
                        if (address !== 'not-an-instruction') {
                            bpAddress = address;
                        }
                    }

                    if (!!bpAddress) {
                        return p.machine.removeBreakpoint(bpAddress);
                    } else {
                        return false;
                    }
                }, true);

                if (result.notAvailable) {
                    return Utils.cmdPrependInput(input, Utils.cmdError('Platform unavailable'));
                } else if (result.data) {
                    return Utils.cmdPrependInput(input, Utils.cmdInfo('removed breakpoint'));
                } else {
                    return Utils.cmdPrependInput(input, Utils.cmdInfo('no breakpoint to remove'));
                }
            }
        }
    }

    public static async BreakpointsEnable(input: string, variables: Array<string>): Promise<CommandOutput> {
        const result = await HandlerContext.platformOrNotAvailable(input, async (p) => {
            const cms = await p.machine.currentMachineState().pipe(take(1)).toPromise();

            if (cms.breakpointsEnabled) {
                return false;
            } else {
                p.machine.toggleBreakpoints();
                return true;
            }
        }, false);

        if (result.notAvailable) {
            return Utils.cmdPrependInput(input, Utils.cmdError('Platform unavailable'));
        } else if (result.data) {
            return Utils.cmdPrependInput(input, Utils.cmdInfo('enabled breakpoints'));
        } else {
            return Utils.cmdPrependInput(input, Utils.cmdInfo('breakpoints are already enabled'));
        }
    }

    public static async BreakpointsDisable(input: string, variables: Array<string>): Promise<CommandOutput> {
        const result = await HandlerContext.platformOrNotAvailable(input, async (p) => {
            const cms = await p.machine.currentMachineState().pipe(take(1)).toPromise();

            if (cms.breakpointsEnabled) {
                p.machine.toggleBreakpoints();
                return true;
            } else {
                return false;
            }
        }, false);

        if (result.notAvailable) {
            return Utils.cmdPrependInput(input, Utils.cmdError('Platform unavailable'));
        } else if (result.data) {
            return Utils.cmdPrependInput(input, Utils.cmdInfo('disabled breakpoints'));
        } else {
            return Utils.cmdPrependInput(input, Utils.cmdInfo('breakpoints are already disabled'));
        }
    }
}