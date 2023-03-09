import { ExecutionInterval } from './execution-interval';
import { VariableRegisterReference, Register, DynamicByteSequence, QuadByte, Byte, FlagName, RegisterHelper,
    ByteSequenceCreator, INSTRUCTION_BYTE_COUNT, MnemonicHelper, Mnemonic, FlagHelper, NamedRegisterMask} from '@allium/types';
import { ActionOriginator } from './action-originator';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { ContinuousExecutionHaltOriginator } from '../halts/continuous-execution-halt-originator';
import { ContinuousExecutionHaltContext } from '../halts/continuous-execution-halt-context';
import { TrapsProcessor } from '../traps/traps-processor';
import { Trap } from '../traps/trap';
import { TrapType } from '../traps/trap-type';
import { SessionTrapControls } from './functionality/session-trap-controls';
import { MachineDataControls } from './functionality/machine-data-controls';
import { PostExecutionListeners } from './functionality/post-execution-listeners';
import { MachineStateControls } from './functionality/machine-state-controls';
import { DebuggableComputer, DebugIoController } from '@allium/emulator';
import { IterationInterval, IterationOutput, MutatorTarget, RegisterHitsByMask, MemoryMutator, ExecutorArgumentHelper, CpuInfo, HumanReadableCpuInfo, ClockType, RegisterMutator, IoController, SerializedComputer, IoBus } from '@allium/arch';

export class DebugSession {

    public get machineState(): MachineStateControls {
        return {
            setExecutionInterval: (interval: ExecutionInterval) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                this._executionInterval = interval;
            },
            getExecutionInterval: () => {
                return this.getExecutionInterval();
            },
            beginExecution: () => {
                this.assertNotEnded();
                this.assertNotExecuting();
                const interval = this.getExecutionInterval();
                if (interval === ExecutionInterval.Continuous) {
                    this._debugComputer.setIterationInterval(IterationInterval.PipelineCycle);
                    this._isExecuting = true;
                    this.beginOrResumeContinuousExecution();
                } else {
                    const iterationInterval = interval === ExecutionInterval.PipelineStage ? IterationInterval.PipelineStage : IterationInterval.PipelineCycle;
                    this._debugComputer.setIterationInterval(iterationInterval);
                    this.doAsync(() => {
                        this.processIterationOutput(this._debugComputer.iterate());
                        this.emitPostExecutionNotifications();
                    })
                }
            },
            haltExecution: () => {
                this.assertNotEnded();
                if (this.isExecuting()) {
                    this._haltRequested = true;
                } else {
                    throw new Error('Session error: The session is not executing.')
                }
            },
            isExecuting: () => {
                return this.isExecuting();
            },
            setClockType: (type: ClockType) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                this._debugComputer.clockType(type);
            },
            getClockType: () => {
                this.assertNotEnded();
                return this._debugComputer.clockType();
            },
            isIdle: () => {
                this.assertNotEnded();
                return this._debugComputer.isIdle();
            }
        }
    }

    public get machineData(): MachineDataControls {
        return {
            editMemoryValue: (address: QuadByte, value: Byte) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                this._debugComputer.setMemoryValue(address, value);
                this._memoryWrites.push({ address: address.clone(), originator: ActionOriginator.User });
                this.emitPostExecutionNotifications();
            },
            editRegisterValue: (register: Register | VariableRegisterReference, value: DynamicByteSequence) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                this._debugComputer.setRegisterValue(register, value);
                this._registerWrites.push({ registerReference: RegisterHelper.toVariableRegisterReference(register), originator: ActionOriginator.User });
                this.emitPostExecutionNotifications();
            },
            getMemoryValue: (address: QuadByte) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                const value = this._debugComputer.readMemoryValue(address);
                this._memoryReads.push({ address: address.clone(), originator: ActionOriginator.User });
                this.emitPostExecutionNotifications();
                return value;
            },
            getRegisterValue: (register: Register | VariableRegisterReference) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                const regReference = RegisterHelper.toVariableRegisterReference(register);
                const value = this._debugComputer.readRegisterValue(regReference.register, regReference.mask);
                this._registerReads.push({ registerReference: RegisterHelper.toVariableRegisterReference(register), originator: ActionOriginator.User });
                this.emitPostExecutionNotifications();
                return value;
            },
            isFlagRaised: (flag: FlagName) => {
                return this.isFlagRaised(flag);
            },
            raiseFlag: (flag: FlagName) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                if (!this.isFlagRaised(flag)) {
                    this._debugComputer.setFlag(flag, true);
                    this._flagsRaised.push({ flag: flag, originator: ActionOriginator.User });
                }
            },
            clearFlag: (flag: FlagName) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                if (this.isFlagRaised(flag)) {
                    this._debugComputer.setFlag(flag, false);
                    this._flagsCleared.push({ flag: flag, originator: ActionOriginator.User });
                }
            },
            getCpuInfo: () => {
                return this._debugComputer.getCpuInfo();
            },
            getCycleCount: () => {
                this.assertNotEnded();
                this.assertNotExecuting();
                return this._debugComputer.getCycleCount();
            },
            setCycleCount: (value: QuadByte) => {
                this.assertNotEnded();
                this.assertNotExecuting();
                this._debugComputer.setCycleCount(value);
            }
        }
    }

    public loadProgram(program: Array<Byte> | ReadonlyArray<Byte>): void {
        this.assertNotEnded();
        this.assertNotExecuting();

        const programBytes = new Array<Byte>();
        this._noOpAddresses = new Array<QuadByte>();
        for (let i = 0; i < program.length; i++) {
            programBytes.push(program[i].clone());

            if (i % INSTRUCTION_BYTE_COUNT === 0 && MnemonicHelper.GetMnemonicFromByte(program[i]) === Mnemonic.NO_OP) {
                this._noOpAddresses.push(ByteSequenceCreator.QuadByte(i));
            }
        }
        this._debugComputer.loadProgram(programBytes);
    }

    public get postExecutionListeners(): PostExecutionListeners {
        return {
            onFlagRaised: (filters?: {
                flags?: Array<FlagName>,
                originator?: ActionOriginator
            }) => {
                this.assertNotEnded();
                return this._triggerEmits.pipe(distinctUntilChanged(), map(() => {
                    return this._flagsRaised.filter(flagRaised => {
                        if (!!filters) {
                            const flagMatch = filters.flags === undefined || filters.flags.includes(flagRaised.flag);
                            const originatorMatch = filters.originator === undefined || flagRaised.originator === filters.originator;
                            return flagMatch && originatorMatch;
                        } else {
                            return true;
                        }
                    }).map(flagRaised => flagRaised.flag);
                }), filter(flags => flags.length > 0), takeUntil(this._onEnd));
            },
            onFlagCleared: (filters?: {
                flags?: Array<FlagName>,
                originator?: ActionOriginator
            }) => {
                this.assertNotEnded();
                return this._triggerEmits.pipe(distinctUntilChanged(), map(() => {
                    return this._flagsCleared.filter(clearedFlag => {
                        if (!!filters) {
                            const flagMatch = filters.flags === undefined || filters.flags.includes(clearedFlag.flag);
                            const originatorMatch = filters.originator === undefined || clearedFlag.originator === filters.originator;
                            return flagMatch && originatorMatch;
                        } else {
                            return true;
                        }
                    }).map(clearedFlag => clearedFlag.flag);
                }), filter(flags => flags.length > 0), takeUntil(this._onEnd));
            },
            onMemoryWrite: (filters?: { address?: QuadByte, originator?: ActionOriginator }) => {
                this.assertNotEnded();
                return this._triggerEmits.pipe(distinctUntilChanged(), map(() => {
                    return this._memoryWrites.filter(mw => {
                        if (!!filters) {
                            const addressMatch = filters.address === undefined || mw.address.isEqualTo(filters.address);
                            const originatorMatch = filters.originator === undefined || mw.originator === filters.originator;
                            return addressMatch && originatorMatch;
                        } else {
                            return true;
                        }
                    }).map(rw => rw.address);
                }), filter(rw => rw.length > 0), takeUntil(this._onEnd));
            },
            onMemoryRead: (filters?: {
                address?: QuadByte,
                originator?: ActionOriginator
            }) => {
                this.assertNotEnded();
                return this._triggerEmits.pipe(distinctUntilChanged(), map(() => {
                    return this._memoryReads.filter(mr => {
                        if (!!filters) {
                            const addressMatch = filters.address === undefined || mr.address.isEqualTo(filters.address);
                            const originatorMatch = filters.originator === undefined || mr.originator === filters.originator;
                            return addressMatch && originatorMatch;
                        } else {
                            return true;
                        }
                    }).map(rw => rw.address);
                }), filter(rw => rw.length > 0), takeUntil(this._onEnd));
            },
            onRegisterWrite: (filters?: {
                register?: Register | VariableRegisterReference,
                originator?: ActionOriginator,
                exactMaskOnly?: boolean
            }) => {
                this.assertNotEnded();
                return this._triggerEmits.pipe(distinctUntilChanged(), map(() => {
                    return this._registerWrites.filter(rw => {
                        if (!!filters) {
                            let registerMatch = filters.register === undefined || rw.registerReference.register === filters.register;
                            if (filters.register !== undefined) {
                                registerMatch = RegisterHelper.IsReferenceToRegister(filters.register, rw.registerReference, filters.exactMaskOnly === true);
                            }
                            const originatorMatch = filters.originator === undefined || rw.originator === filters.originator;
                            return registerMatch && originatorMatch;
                        } else {
                            return true;
                        }
                    }).map(rw => rw.registerReference);
                }), filter(rw => rw.length > 0), takeUntil(this._onEnd));
            },
            onRegisterRead: (filters?: {
                register?: Register | VariableRegisterReference,
                originator?: ActionOriginator,
                exactMaskOnly?: boolean
            }) => {
                this.assertNotEnded();
                return this._triggerEmits.pipe(distinctUntilChanged(), map(() => {
                    return this._registerReads.filter(rr => {
                        if (!!filters) {
                            let registerMatch = filters.register === undefined || rr.registerReference.register === filters.register;
                            if (filters.register !== undefined) {
                                registerMatch = RegisterHelper.IsReferenceToRegister(filters.register, rr.registerReference, filters.exactMaskOnly === true);
                            }
                            const originatorMatch = filters.originator === undefined || rr.originator === filters.originator;
                            return registerMatch && originatorMatch;
                        } else {
                            return true;
                        }
                    }).map(rw => rw.registerReference);
                }), filter(rw => rw.length > 0), takeUntil(this._onEnd));
            }
        }
    }

    public endSession(): void {
        this.assertNotEnded();
        this._onEnd.next(true);
        this._sessionEnded = true;
    }

    public onContinuousExecutionHalted(): Observable<ContinuousExecutionHaltContext> {
        return this._continuousExecutionHalted.pipe(filter(x => !!x), map(x => x!));
    }

    public get traps(): SessionTrapControls {
        return {
            trapsCaught: () => { return this._traps.pipe(filter(x => !this._isExecuting && x.length > 0)) },
            enableTrapType: (type?: TrapType) => {
                if (type === undefined) {
                    this._trapsProcessor.enableAllTypes();
                } else {
                    this._trapsProcessor.enableType(type);
                }
            },
            disableTrapType: (type?: TrapType) => {
                if (type === undefined) {
                    this._trapsProcessor.disableAllTypes();
                } else {
                    this._trapsProcessor.disableType(type);
                }
            },
            addTrap: (trap: Trap) => {
                this._trapsProcessor.add(trap);
            },
            removeTrap: (trap: Trap) => {
                this._trapsProcessor.remove(trap);
            }
        }
    }

    public serialize(): SerializedComputer {
        return this._debugComputer.serialize();
    }

    private constructor(computerMemorySize: QuadByte, io: () => DebugIoController, ioBus: () => IoBus, cpuInfo?: CpuInfo | Partial<HumanReadableCpuInfo>) {
        this._triggerEmits = new BehaviorSubject<number>(0);
        this._registerReads = new Array<{ registerReference: VariableRegisterReference, originator: ActionOriginator }>();
        this._registerWrites = new Array<{ registerReference: VariableRegisterReference, originator: ActionOriginator }>();
        this._memoryWrites = new Array<{ address: QuadByte, originator: ActionOriginator }>();
        this._memoryReads = new Array<{ address: QuadByte, originator: ActionOriginator }>();
        this._haltRequested = false;
        this._isExecuting = false;
        this._debugComputer = DebuggableComputer.create(computerMemorySize, () => { return io(); }, () => { return ioBus(); }, cpuInfo);
        this._executionInterval = ExecutionInterval.PipelineStage;
        this._onEnd = new Subject<boolean>();
        this._sessionEnded = false;
        this._continuousExecutionHalted = new BehaviorSubject<ContinuousExecutionHaltContext | null>(null);
        this._noOpAddresses = new Array<QuadByte>();
        this._currentFlagsSet = new Array<FlagName>();
        this._flagsRaised = new Array<{ flag: FlagName, originator: ActionOriginator }>();
        this._flagsCleared = new Array<{ flag: FlagName, originator: ActionOriginator }>();
        this._trapsProcessor = new TrapsProcessor();
        this._traps = new BehaviorSubject<Array<Trap>>([]);
    }

    private assertNotExecuting(): void {
        if (this.isExecuting()) {
            throw new Error('Session error: The session must not be executing when this method is called.');
        }
    }

    private assertNotEnded(): void {
        if (this._sessionEnded) {
            throw new Error('Session error: This session has been closed. Please create a new session.');
        }
    }

    private isFlagRaised(flag: FlagName): boolean {
        this.assertNotEnded();
        this.assertNotExecuting();
        return this._currentFlagsSet.some(f => f === flag);
    }
    
    private getExecutionInterval(): ExecutionInterval {
        this.assertNotEnded();
        return this._executionInterval;
    }

    private isExecuting(): boolean {
        this.assertNotEnded();
        return this._isExecuting;
    }

    private doAsync(fn: () => void): void {
        setTimeout(() => {
            fn();
        })
    }

    private shouldContinueExecution(): ContinuousExecutionHaltContext | true {
        let shouldContinue: ContinuousExecutionHaltContext | true = true;
        const latestTraps = this._traps.getValue();
        if (this._haltRequested) {
            shouldContinue = { originator: ContinuousExecutionHaltOriginator.ExplicitRequest }
        } else if (latestTraps.length > 0) {
            shouldContinue = { originator: ContinuousExecutionHaltOriginator.Trap, trapsCaught: latestTraps }
        } else if (this._debugComputer.isIdle()) {
            shouldContinue = { originator: ContinuousExecutionHaltOriginator.Idle }
        }
        return shouldContinue;
    }

    private beginOrResumeContinuousExecution(): void {
        this.doAsync(() => {
            const output = this._debugComputer.iterate();
            this.processIterationOutput(output);
            const shouldContinue = this.shouldContinueExecution();
            if (shouldContinue === true) {
                this.beginOrResumeContinuousExecution();
            } else {
                this._isExecuting = false;
                this._haltRequested = false;
                this.emitPostExecutionNotifications(shouldContinue);
            }
        })
    }

    private processIterationOutput(output: IterationOutput): void {
        const registerHits = this._debugComputer.getRegisterHitStats();
        registerHits.forEach(rh => {
            this.pushRegisterHits(rh.register, rh.reads, (val) => this._registerReads.push(val));
        })

        const memoryHits = this._debugComputer.getMemoryHitStats();
        memoryHits.reads.forEach(mr => this._memoryReads.push({ address: mr, originator: ActionOriginator.Computer }))

        if (!!output.output) {
            output.output.mutators.filter(m => m.target === MutatorTarget.Memory).map(m => m as MemoryMutator).forEach(mm => {
                this._memoryWrites.push({ address: mm.address.clone(), originator: ActionOriginator.Computer });
            })
    
            const registerWrites = output.output.mutators
                .filter(m => m.target === MutatorTarget.Register)
                .map(m => {
                    const rm = m as RegisterMutator;
                    return { registerReference: VariableRegisterReference.create(rm.register, rm.mask), originator: ActionOriginator.Computer }
                });
            if (!registerWrites.some(rw => rw.registerReference.register === Register.InstructionPtr)) {
                registerWrites.push({ registerReference: VariableRegisterReference.create(Register.InstructionPtr), originator: ActionOriginator.Computer });
            }
            registerWrites.forEach(rw => this._registerWrites.push(rw));
            
            this._currentFlagsSet.filter(f => !output.output.flags.includes(f)).forEach(f => {
                this._flagsCleared.push({ flag: f, originator: ActionOriginator.Computer });
            });

            output.output.flags.filter(f => !this._currentFlagsSet.includes(f)).forEach(f => {
                this._flagsRaised.push({ flag: f, originator: ActionOriginator.Computer });
                this._currentFlagsSet.push(f);
            });

            if (output.mnemonic === Mnemonic.FLAG_ACK && !ExecutorArgumentHelper.isNullExecutorArgument(output.argument.inlineValue)) {
                FlagHelper.TryGetFlagFromNumber(ByteSequenceCreator.Unbox(output.argument.inlineValue), (flagName) => {
                    this._currentFlagsSet = this._currentFlagsSet.filter(f => f !== flagName);
                });
            }
        }

        const trapsCaught = this._trapsProcessor.process(this._debugComputer, output);
        if (trapsCaught === 'none') {
            this._traps.next([]);
        } else {
            this._traps.next(trapsCaught);
        }
    }

    private emitPostExecutionNotifications(continuousExecHaltContext?: ContinuousExecutionHaltContext): void {
        this._triggerEmits.next(new Date().valueOf());
        if (!!continuousExecHaltContext) {
            this._continuousExecutionHalted.next(continuousExecHaltContext);
        }
        this._registerWrites = new Array<{ registerReference: VariableRegisterReference, originator: ActionOriginator }>();
        this._registerReads = new Array<{ registerReference: VariableRegisterReference, originator: ActionOriginator }>();
    }

    private pushRegisterHits(register: Register, hitsByMask: RegisterHitsByMask, appendFn: (val: { registerReference: VariableRegisterReference, originator: ActionOriginator }) => void): void {
        if (hitsByMask.full > 0) {
            appendFn({ registerReference: VariableRegisterReference.create(register, NamedRegisterMask.Full), originator: ActionOriginator.Computer });
        }
        if (hitsByMask.hh > 0) {
            appendFn({ registerReference: VariableRegisterReference.create(register, NamedRegisterMask.HighHigh), originator: ActionOriginator.Computer });
        }
        if (hitsByMask.hl > 0) {
            appendFn({ registerReference: VariableRegisterReference.create(register, NamedRegisterMask.HighLow), originator: ActionOriginator.Computer });
        }
        if (hitsByMask.lh > 0) {
            appendFn({ registerReference: VariableRegisterReference.create(register, NamedRegisterMask.LowHigh), originator: ActionOriginator.Computer });
        }
        if (hitsByMask.ll > 0) {
            appendFn({ registerReference: VariableRegisterReference.create(register, NamedRegisterMask.LowLow), originator: ActionOriginator.Computer });
        }
    }

    private _triggerEmits: BehaviorSubject<number>;
    private _registerReads: Array<{ registerReference: VariableRegisterReference, originator: ActionOriginator }>;
    private _registerWrites: Array<{ registerReference: VariableRegisterReference, originator: ActionOriginator }>;
    private _memoryWrites: Array<{ address: QuadByte, originator: ActionOriginator }>;
    private _memoryReads: Array<{ address: QuadByte, originator: ActionOriginator }>;
    private _haltRequested: boolean;
    private _isExecuting: boolean;
    private _debugComputer: DebuggableComputer;
    private _executionInterval: ExecutionInterval;
    private _onEnd: Subject<boolean>;
    private _sessionEnded: boolean;
    private _continuousExecutionHalted: BehaviorSubject<ContinuousExecutionHaltContext | null>;
    private _noOpAddresses: Array<QuadByte>;
    private _currentFlagsSet: Array<FlagName>;
    private _flagsRaised: Array<{ flag: FlagName, originator: ActionOriginator }>;
    private _flagsCleared: Array<{ flag: FlagName, originator: ActionOriginator }>;
    private _trapsProcessor: TrapsProcessor;
    private _traps: BehaviorSubject<Array<Trap>>;

    public static create(computerMemorySize: QuadByte, io: () => DebugIoController, ioBus: () => IoBus): DebugSession {
        return new DebugSession(computerMemorySize, io, ioBus);
    }
}