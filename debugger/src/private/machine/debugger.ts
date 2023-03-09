import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { RegisterValueManager } from './register-value-manager';
import { ByteSequence, ByteSequenceCreator, QuadByte, Register, VariableRegisterReference, Byte, FlagName, DynamicByteSequence } from '@allium/types';
import { DebugSession, ContinuousExecutionHaltOriginator, TrapType, Trap, InstructionTrap, ExecutionInterval } from '../debug/index';
import { AssemblySourceMap } from '@allium/asm';
import { distinctUntilChanged, map, filter, take, mapTo, takeUntil } from 'rxjs/operators';
import { MachineBreakpointManager } from './machine-breakpoint-manager';
import { MachineTrapsManager } from './machine-traps-manager';
import { MemoryExplorerCache } from './memory-explorer-cache';
import { MemoryExplorerModel, createMemoryExplorerModel, MutableMachineState, MachineState, SerializedMachine } from '../models';
import { DebugIoController } from '@allium/emulator';
import { createAsyncScheduler } from './async-scheduler';
import { ComputerSpec } from '../../models/computer-specs/computer-spec.model';
import { IoBus } from '@allium/arch';

const _DEFAULT_IO_CAPACITY = 1024;

export class CDebugger {

  public activeInstructionIdentity(): Observable<string> {
    this.assertNotDisposed();
    return this._activeInstructionIdentity;
  }

  public activeInstructionAddress(): Observable<QuadByte | 'na'> {
    this.assertNotDisposed();
    return this._activeInstructionAddress;
  }

  public currentMachineState(): Observable<MachineState> {
    this.assertNotDisposed();
    return this._currentMachineState;
  }

  public sessionIsDefined(): Observable<boolean> {
    this.assertNotDisposed();
    return this._debugSessionIsDefined.pipe(distinctUntilChanged());
  }
  
  public machineBecameIdle(): Observable<void> {
    this.assertNotDisposed();
    return this._machineBecameIdle.pipe(filter(x => x > -1), distinctUntilChanged(), mapTo(undefined));
  }

  public registers: {
    values: () => Observable<Map<Register, QuadByte>>,
    updateValue: (register: Register | VariableRegisterReference, value: ByteSequence<1 | 2 | 3 | 4>) => void
  } = {
    values: () => {
      this.assertNotDisposed();
      return this._registerValues;
    },
    updateValue: (register: Register | VariableRegisterReference, value: ByteSequence<1 | 2 | 3 | 4>) => {
      this.assertNotDisposed();
      this.assertSessionAndProgramLoaded();
      this.assertComputerNotRunning();
      this._debugSession!.machineData.editRegisterValue(register, value);
    }
  }

  public memory: {
    updateValue: (address: QuadByte, value: Byte) => void,
    onValueUpdated: () => Observable<QuadByte>
  } = {
    updateValue: (address: QuadByte, value: Byte) => {
      this.assertNotDisposed();
      this.assertSessionAndProgramLoaded();
      this.assertComputerNotRunning();
      this._debugSession!.machineData.editMemoryValue(address, value);
      this._memoryExplorerCache.invalidate([address]);
      this._onMemoryValueUpdatedManually.next(address);
    },
    onValueUpdated: () => {
      this.assertNotDisposed();
      return this._onMemoryValueUpdatedManually.pipe(distinctUntilChanged(), filter(x => x !== null), map(x => x!));
    }
  }

  public toggleBreakpoints(): void {
    this.assertNotDisposed();
    const breakpointsEnabledNext = !this._machineState.getValue().breakpointsEnabled;
    this._machineBreakpointManager.setBreakMode(breakpointsEnabledNext);
    this._machineState.update({ breakpointsEnabled: breakpointsEnabledNext });
  }

  public addBreakpoint(instructionAddress: QuadByte): boolean {
    this.assertNotDisposed();
    return this._machineBreakpointManager.addBreakpoint(instructionAddress);
  }

  public removeBreakpoint(instructionAddress: QuadByte): boolean {
    this.assertNotDisposed();
    return this._machineBreakpointManager.removeBreakpoint(instructionAddress);
  }

  public loadProgram(programBytes: Array<Byte>, stopCurrentProgram?: boolean, sourceMap?: AssemblySourceMap): void {
    this.assertNotDisposed();
    this.assertSessionLoaded();
    this.assertComputerNotRunning();
    const isProgramLoaded = this.isProgramLoaded();
    if (isProgramLoaded && stopCurrentProgram !== true) {
      throw new Error('A program is already loaded.');
    } else {
      this._programBytes = programBytes;
      this._sourceMap = sourceMap || null;
      this._debugSession!.loadProgram(this.getProgramBytes());
      this._machineState.update({ isProgramLoaded: true, programSize: this._programBytes.length });
      this._activeInstructionIdentity.next(this.getInstructionLineIdentifier(ByteSequenceCreator.QuadByte(0)) || '');
      this.sessionIsDefined().pipe(filter(x => x === true), take(1)).subscribe(() => {
        this.memoryExplorer.fetchValues([
          ByteSequenceCreator.QuadByte(0),
          ByteSequenceCreator.QuadByte(1),
          ByteSequenceCreator.QuadByte(2),
          ByteSequenceCreator.QuadByte(3),
          ByteSequenceCreator.QuadByte(4),
        ]).then(() => {
          this._memoryExplorerCache.invalidateAll();
          this._memoryExplorerModel.next(this._memoryExplorerModel.getValue());
        });
      })
    }
  }

  public changeActiveInstruction(instructionAddress: QuadByte): void {
    this.assertNotDisposed();
    console.log(`changeActiveInstruction ${instructionAddress.toString()}`)
    this.assertSessionAndProgramLoaded();
    this._debugSession!.machineData.editRegisterValue(Register.InstructionPtr, instructionAddress);
  }

  public getIoController(): DebugIoController {
    this.assertNotDisposed();
    return this._ioController;
  }

  public getIoBus(): IoBus {
    this.assertNotDisposed();
    return this._ioBus();
  }

  public computerControls: {
    run: () => void,
    pause: () => void,
    cyclePipeline: () => void,
    advancePipeline: () => void,
    powerOn: (computer: ComputerSpec) => void,
    powerOff: () => void,
    setExecutionInterval: (interval: ExecutionInterval) => void,
    getExecutionInterval: () => ExecutionInterval
  } = {
    run: () => {
      this.assertNotDisposed();
      this.assertSessionAndProgramLoaded();
      if (this._machineState.getValue().isRunPaused) {
        this._machineState.update({ isRunPaused: false });
        this._debugSession!.machineState.beginExecution();
      } else {
        this.assertComputerNotRunning();
        this._machineState.update({ isComputerRunning: true });
        this._debugSession!.machineState.setExecutionInterval(ExecutionInterval.Continuous);
        this._debugSession!.machineState.beginExecution();
      }
    },
    pause: () => {
      this.assertNotDisposed();
      this.assertSessionAndProgramLoaded();
      if (this._machineState.getValue().isRunPaused) {
        this._machineState.update({ isRunPaused: false });
      } else {
        this._debugSession!.machineState.haltExecution();
      }
      this._machineState.update({ isComputerRunning: false });
      this._activeInstructionIdentity.next('');
    },
    cyclePipeline: () => {
      this.assertNotDisposed();
      this.assertSessionAndProgramLoaded();
      this.assertComputerNotRunning();
      this._debugSession!.machineState.setExecutionInterval(ExecutionInterval.PipelineCycle);
      this._debugSession!.machineState.beginExecution();
    },
    advancePipeline: () => {
      this.assertNotDisposed();
      this.assertSessionAndProgramLoaded();
      this.assertComputerNotRunning();
      this._debugSession!.machineState.setExecutionInterval(ExecutionInterval.PipelineStage);
      this._debugSession!.machineState.beginExecution();
    },
    powerOn: (computer: ComputerSpec) => {
      this.assertNotDisposed();
      if (this._debugSession === null) {
        this._debugSession = this.instantiateNewSession(computer.computerMemorySize);
        this._debugSessionIsDefined.next(true);
        this._machineState.update({ isComputerPoweredOn: true });
      } else {
        throw new Error('The computer is already powered on');
      }
    },
    powerOff: () => {
      this.assertNotDisposed();
      this.assertSessionLoaded();
      if (this.isProgramLoaded() && this._machineState.getValue().isComputerRunning) {
        this.computerControls.pause();
        setTimeout(() => {
          this.computerControls.powerOff();
          this._machineState.update({ isComputerPoweredOn: false });
        }, 150);
      } else {
        this._debugSessionIsDefined.next(false);
        this._debugSession!.endSession();
        this._debugSession = null;
        this._activeInstructionIdentity.next('');
        this._machineState.update(MutableMachineState.DEFAULT_STATE);
      }
    },
    setExecutionInterval: (interval) => {
      this.assertNotDisposed();
      this._debugSession!.machineState.setExecutionInterval(interval);
    },
    getExecutionInterval: () => {
      this.assertNotDisposed();
      return this._debugSession!.machineState.getExecutionInterval();
    }
  }
  
  public traps: {
    onCaught: () => Observable<Array<Trap>>,
    onSet: () => Observable<Trap>,
    onUnset: () => Observable<Trap>,
    instructionBreaks: () => Observable<QuadByte>,
    getAll: () => Array<Trap>,
    registerReads: {
      remove: (registers?: Array<Register>) => void,
      listen: (registers?: Array<Register>) => void
    },
    registerWrites: {
      remove: (registers?: Array<Register>) => void,
      listen: (registers?: Array<Register>) => void
    },
    memoryReads: {
      remove: (addresses?: Array<QuadByte>) => void,
      listen: (addresses?: Array<QuadByte>) => void
    },
    memoryWrites: {
      remove: (addresses?: Array<QuadByte>) => void,
      listen: (addresses?: Array<QuadByte>) => void
    },
    flagRaises: {
      remove: (flags?: Array<FlagName>) => void,
      listen: (flags?: Array<FlagName>) => void
    },
    flagAcknowledgements: {
      remove: (flags?: Array<FlagName>) => void,
      listen: (flags?: Array<FlagName>) => void
    }
  } = {
    onCaught: () => {
      this.assertNotDisposed();
      return this._trapsCaught.pipe(filter(n => n.length > 0));
    },
    onSet: () => {
      this.assertNotDisposed();
      return this._trapSet.pipe(filter(x => x !== null), map(x => x as Trap));
    },
    onUnset: () => {
      this.assertNotDisposed();
      return this._trapUnset.pipe(filter(x => x !== null), map(x => x as Trap));
    },
    instructionBreaks: () => {
      this.assertNotDisposed();
      return this._trapsCaught.pipe(map(x => {
        const n = x.find(y => y.type === TrapType.InstructionBreak);
        if (!!n) {
          return (n as InstructionTrap).instructionAddress;
        } else {
          return null;
        }
      }), filter(x => !!x), map(x => x!));
      },
      getAll: () => {
        this.assertNotDisposed();
        return this._machineTrapsManager.getAll();
      },
      registerReads: {
        remove: (registers) => {
          this.assertNotDisposed();
          this._machineTrapsManager.removeTrap(TrapType.RegisterRead, registers);
        },
        listen: (registers) => {
          this.assertNotDisposed();
          this._machineTrapsManager.addTrap(TrapType.RegisterRead, registers);
        }
      },
      registerWrites: {
        remove: (registers) => {
          this.assertNotDisposed();
          this._machineTrapsManager.removeTrap(TrapType.RegisterWrite, registers);
        },
        listen: (registers) => {
          this.assertNotDisposed();
          this._machineTrapsManager.addTrap(TrapType.RegisterWrite, registers);
        }
      },
      memoryReads: {
        remove: (addresses) => {
          this.assertNotDisposed();
          this._machineTrapsManager.removeTrap(TrapType.MemoryRead, addresses);
        },
        listen: (addresses) => {
          this.assertNotDisposed();
          this._machineTrapsManager.addTrap(TrapType.MemoryRead, addresses);
        }
      },
      memoryWrites: {
        remove: (addresses) => {
          this.assertNotDisposed();
          this._machineTrapsManager.removeTrap(TrapType.MemoryWrite, addresses);
        },
        listen: (addresses) => {
          this.assertNotDisposed();
          this._machineTrapsManager.addTrap(TrapType.MemoryWrite, addresses);
        }
      },
      flagRaises: {
        remove: (flags) => {
          this.assertNotDisposed();
          this._machineTrapsManager.removeTrap(TrapType.FlagRaised, flags);
        },
        listen: (flags) => {
          this.assertNotDisposed();
          this._machineTrapsManager.addTrap(TrapType.FlagRaised, flags);
        }
      },
      flagAcknowledgements: {
        remove: (flags) => {
          this.assertNotDisposed();
          this._machineTrapsManager.removeTrap(TrapType.FlagAcknowledged, flags);
        },
        listen: (flags) => {
          this.assertNotDisposed();
          this._machineTrapsManager.addTrap(TrapType.FlagAcknowledged, flags);
        }
      }
  }

  public memoryExplorer: {
    readonly MAX_VALUES_PER_PAGE: number,
    getValuesBeginningAt: (offset: QuadByte) => Promise<Array<Byte>>,
    fetchValues: (addresses: Array<QuadByte>) => Promise<Array<{ address: QuadByte, value: Byte }>>,
    model: () => Observable<MemoryExplorerModel>
  } = {
    MAX_VALUES_PER_PAGE: 5,
    getValuesBeginningAt: (offset) => {
      this.assertNotDisposed();
      return new Promise((resolve) => {
        this.currentMachineState().pipe(take(1)).subscribe(state => {
          const max = this.memoryExplorer.MAX_VALUES_PER_PAGE;
          const takeCount = offset.computeSum(max).isGreaterThan(state.computerMemorySize)
            ? ByteSequenceCreator.Unbox(ByteSequenceCreator.QuadByte(state.computerMemorySize).computeDifference(offset))
            : max;
          this._memoryExplorerCache.readFromOffset(offset, takeCount).then(bytes => {
            resolve(bytes);
          })
        })
      })
    },
    fetchValues: (addresses) => {
      this.assertNotDisposed();
      return new Promise((resolve) => {
        try {
          const tasks = addresses.map(a => new Promise<{ address: QuadByte, value: Byte }>((rs) => {
            this._memoryExplorerCache.readValueAtAddress(a).then((value) => {
              rs({
                address: a,
                value: value
              })
            })
          }));
          Promise.all(tasks).then((objects) => {
            resolve(objects);
          })
        } catch (exc) {
          resolve([]);
        }
      })
    },
    model: () => {
      this.assertNotDisposed();
      return this._memoryExplorerModel.pipe(filter(x => x !== null), map(x => x!));
    }
  }

  public flags: {
    readonly isFlagRaised: (flag: FlagName) => boolean,
    readonly raiseFlag: (flag: FlagName) => void,
    readonly clearFlag: (flag: FlagName) => void
  } = {
      isFlagRaised: (flag: FlagName) => {
        this.assertNotDisposed();
        this.assertSessionLoaded();
        return this._debugSession!.machineData.isFlagRaised(flag);
      },
      raiseFlag: (flag: FlagName) => {
        this.assertNotDisposed();
        this.assertSessionLoaded();
        this._debugSession!.machineData.raiseFlag(flag);
      },
      clearFlag: (flag: FlagName) => {
        this.assertNotDisposed();
        this.assertSessionLoaded();
        this._debugSession!.machineData.clearFlag(flag);
      }
    }

  public serialize(): SerializedMachine {
    this.assertNotDisposed();
    const computer = !!this._debugSession ? this._debugSession.serialize() : null;
    
    return {
      computer: computer,
      breakpoints:this._machineBreakpointManager.serialize()
    }
  }

  public dispose(): void {
    this.assertNotDisposed();
    this._disposed.next(Math.random());
    setTimeout(() => {
      this._isDisposed = true;
    }, 250);
  }

  public isDisposed(): boolean {
    return this._isDisposed;
  }
  
  public constructor(ioBus: () => IoBus, ioCapacity?: number) {
    //TODO maxLogLength option
    const useIoCapacity = ioCapacity === undefined
      ? _DEFAULT_IO_CAPACITY
      : ioCapacity;
    this._ioController = new DebugIoController(createAsyncScheduler(), ByteSequenceCreator.DoubleByte(useIoCapacity));
    this._ioBus = ioBus;
    
    this._memoryExplorerModel.next(createMemoryExplorerModel((model) => {
      this._memoryExplorerModel.next(model);
    }));
  }

  private assertSessionLoaded(): void {
    if (!(!!this._debugSession)) {
      throw new Error('The computer is not powered on');
    }
  }

  private assertSessionAndProgramLoaded(): void {
    this.assertSessionLoaded();
    if (!this.isProgramLoaded()) {
      throw new Error('No program is loaded');
    }
  }

  private assertComputerNotRunning(): void {
    if (this._machineState.getValue().isComputerRunning) {
      throw new Error('The requested operation cannot be invoked while the computer is running');
    }
  }

  private assertNotDisposed(): void {
    if (this._isDisposed) {
      throw new Error('Cannot invoke method on a disposed debugger');
    }
  }

  private instantiateNewSession(computerMemorySize: number): DebugSession {
    const debugSession = DebugSession.create(ByteSequenceCreator.QuadByte(computerMemorySize), () => {
      return this._ioController;
    }, () => {
      return this._ioBus();
    });

    debugSession.postExecutionListeners.onRegisterWrite().pipe(takeUntil(this._disposed)).subscribe(rr => {
      this._registerValueManager.valuesChanged(rr);
    })

    debugSession.postExecutionListeners.onRegisterWrite({ register: Register.InstructionPtr }).pipe(takeUntil(this._disposed)).subscribe(() => {
      const instructionPtrValue = debugSession.machineData.getRegisterValue(Register.InstructionPtr);
      const instructionPtrNumericValue = ByteSequenceCreator.Unbox(instructionPtrValue);
      this._activeInstructionAddress.next(instructionPtrValue as QuadByte);

      console.log(`ins changed: ${instructionPtrNumericValue}`)
      this._activeInstructionIdentity.next(this.getInstructionLineIdentifier(instructionPtrValue as ByteSequence<4>) || '');
    })

    debugSession.postExecutionListeners.onMemoryWrite().pipe(takeUntil(this._disposed)).subscribe(addressesWritten => {
      this._memoryExplorerCache.invalidate(addressesWritten);
    })

    debugSession.onContinuousExecutionHalted().pipe(takeUntil(this._disposed)).subscribe(context => {
      this._machineState.update({ isRunPaused: true });

      if (context.originator === ContinuousExecutionHaltOriginator.Trap) {
        this._trapsCaught.next(context.trapsCaught || []);
      } else if (context.originator === ContinuousExecutionHaltOriginator.Idle) {
        this._machineState.update({ isComputerRunning: false });
        this._machineBecameIdle.next(Math.random());
        this._activeInstructionAddress.next('na');
        this._activeInstructionIdentity.next('');
      }
    });

    debugSession.traps.trapsCaught().pipe(takeUntil(this._disposed)).subscribe(t => {
      this._trapsCaught.next(t);
    })

    this._machineState.update({ computerMemorySize: computerMemorySize });
    
    this._activeInstructionAddress.next(ByteSequenceCreator.QuadByte(0));
    return debugSession;
  }

  private isProgramLoaded(): boolean {
    return this._programBytes.length > 0;
  }

  private getProgramBytes(): ReadonlyArray<Byte> {
    return this._programBytes;
  }

  private getInstructionLineIdentifier(address: DynamicByteSequence): string | null {
    let lineIdentifier: string | null = null;
    if (!!this._sourceMap) {
      const line = this._sourceMap.getLineByAddress(address as ByteSequence<4>);
      if (!!line) {
        lineIdentifier = `${line.objectName}_${line.lineIndex}`;
      }
    }

    return lineIdentifier;
  }

  private _programBytes = new Array<Byte>();
  private _sourceMap: AssemblySourceMap | null = null;
  private _debugSession: DebugSession | null = null;
  private _ioController: DebugIoController;
  private _ioBus: () => IoBus;
  private _isDisposed = false;
  private readonly _disposed = new Subject<number>();
  private readonly _machineBecameIdle = new BehaviorSubject<number>(-1);
  private readonly _activeInstructionIdentity = new BehaviorSubject<string>('');
  private readonly _activeInstructionAddress = new BehaviorSubject<QuadByte | 'na'>('na');
  private readonly _registerValues = new BehaviorSubject<Map<Register, QuadByte>>(RegisterValueManager.DEFAULT_MAP);
  private readonly _registerValueManager = new RegisterValueManager(() => { return this._debugSession }, (map) => {
    this._registerValues.next(map);
  })
  private readonly _currentMachineState = new BehaviorSubject<MachineState>(MutableMachineState.DEFAULT_STATE);
  private readonly _machineState = new MutableMachineState((state) => {
    this._currentMachineState.next(state);
  });
  private readonly _debugSessionIsDefined = new BehaviorSubject<boolean>(false);
  private readonly _machineBreakpointManager = new MachineBreakpointManager((cb) => {
    this._debugSessionIsDefined.pipe(distinctUntilChanged(), takeUntil(this._disposed)).subscribe(isDefined => {
      cb(isDefined);
    })
  }, () => { return this._debugSession });
  private readonly _trapsCaught = new BehaviorSubject<Array<Trap>>([]);
  private readonly _trapSet = new BehaviorSubject<Trap | null>(null);
  private readonly _trapUnset = new BehaviorSubject<Trap | null>(null);
  private readonly _machineTrapsManager = new MachineTrapsManager((cb) => {
    this._debugSessionIsDefined.pipe(distinctUntilChanged(), takeUntil(this._disposed)).subscribe(isDefined => {
      cb(isDefined);
    })
  }, () => { return this._debugSession }, (trap) => {
    this._trapSet.next(trap);
  }, (trap) => {
    this._trapUnset.next(trap);
  });
  private readonly _memoryExplorerCache = new MemoryExplorerCache((address) => {
    return new Promise((resolve) => {
      this.sessionIsDefined().pipe(take(1)).subscribe(sessionIsDefined => {
        if (sessionIsDefined) {
          resolve(this._debugSession!.machineData.getMemoryValue(address));
        } else {
          resolve(ByteSequenceCreator.Byte(0));
        }
      })
    })
  });
  private readonly _memoryExplorerModel = new BehaviorSubject<MemoryExplorerModel | null>(null);
  private readonly _onMemoryValueUpdatedManually = new BehaviorSubject<QuadByte | null>(null);
}
