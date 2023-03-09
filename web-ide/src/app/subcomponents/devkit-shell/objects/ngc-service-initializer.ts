import { OutputLineModel } from '../models/output-line.model';
import { Autocompleter } from '../models/autocompleter.model';

export class NgcServiceInitializer {
    public containerRegistrar(register: {
        onCreateInstance(viewKey: string, name: string, allowInput: boolean, makeActive: boolean, autocompleter?: Autocompleter): void;
        onDeleteInstance(viewKey: string): void;
        onWriteOutput(viewKey: string, append: boolean, ...lines: Array<OutputLineModel>): void;
    }): {
        commitInput(viewKey: string, literal: string): void;
    } {
        this._setCreateInstanceHandler(register.onCreateInstance);
        this._setDeleteInstanceHandler(register.onDeleteInstance);
        this._setWriteOutputHandler(register.onWriteOutput);
        this._registrationCompleted();

        return {
            commitInput: (viewKey, literal) => {
                this._commitInputHandler(viewKey, literal);
            }
        }
    }

    public constructor(
        setCreateInstanceHandler: (handler: (viewKey: string, name: string, allowInput: boolean, makeActive: boolean, autocompleter?: Autocompleter) => void) => void,
        setDeleteInstanceHandler: (handler: (viewKey: string) => void) => void,
        setWriteOutputHandler: (handler: (viewKey: string, append: boolean, ...lines: Array<OutputLineModel>) => void) => void,
        commitInputHandler: (viewKey: string, literal: string) => void,
        registrationCompleted: () => void
    ) {
        this._setCreateInstanceHandler = setCreateInstanceHandler;
        this._setDeleteInstanceHandler = setDeleteInstanceHandler;
        this._setWriteOutputHandler = setWriteOutputHandler;
        this._commitInputHandler = commitInputHandler;
        this._registrationCompleted = registrationCompleted;
    }

    private readonly _setCreateInstanceHandler: (handler: (viewKey: string, name: string, allowInput: boolean, makeActive: boolean, autocompleter?: Autocompleter) => void) => void;
    private readonly _setDeleteInstanceHandler: (handler: (viewKey: string) => void) => void;
    private readonly _setWriteOutputHandler: (handler: (viewKey: string, append: boolean, ...lines: Array<OutputLineModel>) => void) => void;
    private readonly _commitInputHandler: (viewKey: string, literal: string) => void;
    private readonly _registrationCompleted: () => void;

}