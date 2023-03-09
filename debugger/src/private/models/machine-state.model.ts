import { btoa } from 'abab';

export interface MachineState {
    readonly breakpointsEnabled: boolean;
    readonly computerMemorySize: number;
    // readonly currentProgramBytes: Array<ByteSequence<1>>;
    readonly isComputerRunning: boolean;
    readonly isComputerPoweredOn: boolean;
    readonly programSize: number;
    readonly isProgramLoaded: boolean;
    readonly currentObjectName: string;
    readonly isRunPaused: boolean;
}

export class MutableMachineState {
    // public breakpointsEnabled = false;
    // public computerMemorySize = 0;
    // // public currentProgramBytes = new Array<ByteSequence<1>>();
    // public isComputerRunning = false;
    // public programSize = 0;
    // public isProgramLoaded = false;

    public static get DEFAULT_STATE(): MachineState {
        return {
            breakpointsEnabled: true,
            computerMemorySize: 0,
            isComputerRunning: false,
            isComputerPoweredOn: false,
            isProgramLoaded: false,
            programSize: 0,
            currentObjectName: '',
            isRunPaused: false
        }
    }

    public getValue(): MachineState {
        return {
            breakpointsEnabled: this._data.breakpointsEnabled,
            computerMemorySize: this._data.computerMemorySize,
            isComputerRunning: this._data.isComputerRunning,
            isComputerPoweredOn: this._data.isComputerPoweredOn,
            isProgramLoaded: this._data.isProgramLoaded,
            programSize: this._data.programSize,
            currentObjectName: this._data.currentObjectName,
            isRunPaused: this._data.isRunPaused
        }
    }

    public update(values: Partial<MachineState>): void {
        Object.keys(values).filter(k => k !== undefined).forEach(k => {
            (this._data as any)[k] = (values as any)[k];
        })
        const currentHash = this.computeHash();
        if (currentHash !== this._lastHash) {
            this._lastHash = currentHash;
            this._stateUpdated(this.getValue());
        }
    }

    public constructor(stateUpdated: (state: MachineState) => void) {
        this._stateUpdated = stateUpdated;
    }

    private computeHash(): string {
        return btoa(JSON.stringify(this)) || '';
    }

    private _lastHash = '';
    private readonly _stateUpdated: (state: MachineState) => void;
    private readonly _data: {
        breakpointsEnabled: boolean,
        computerMemorySize: number,
        isComputerRunning: boolean,
        isComputerPoweredOn: boolean,
        programSize: number,
        isProgramLoaded: boolean,
        currentObjectName: string,
        isRunPaused: boolean
    } = {
        breakpointsEnabled: true,
        computerMemorySize: 0,
        isComputerRunning: false,
        isComputerPoweredOn: false,
        programSize: 0,
        isProgramLoaded: false,
        currentObjectName: '',
        isRunPaused: false
    }
}