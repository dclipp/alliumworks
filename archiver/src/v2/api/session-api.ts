import { ArchivedComputerSpec } from '../models/archived-computer-spec';
import { ArchivedEntity } from '../models/archived-entity';
import { ArchivedViewState } from '../models/archived-view-state';
import { ArchivedViewStateCustomProperty } from '../models/archived-view-state-custom-property';
import { Utils } from '../utils';

export interface SessionApi {
    hasPendingSpecInput(): boolean;
    beginSpecInput(creator: string, producer: string): void;
    setSpecName(name: string): void;
    setSpecComputerMemorySize(computerMemorySize: number): void;
    setSpecComputerCpuSpeed(computerCpuSpeed: number): void;
    setSpecCpuModelId(cpuModelId: number): void;
    setSpecCpuFeatureFlags1(cpuFeatureFlags1: number): void;
    setSpecCpuFeatureFlags2(cpuFeatureFlags2: number): void;
    setSpecCpuSerialNumber(cpuSerialNumber: string): void;
    setSpecCpuBatchMarket(cpuBatchMarket: number): void;
    setSpecCpuInstructionSetArchitecture(cpuInstructionSetArchitecture: number): void;
    setSpecOversizedInlineValueSizing(oversizedInlineValueSizing: string): void;
    setSpecTreatOversizedInlineValuesAsWarnings(treatOversizedInlineValuesAsWarnings: boolean): void;
    setSpecIsDefault(isDefault: boolean): void;
    setSpecKey(key: string): void;
    getSpecName(): string;
    getSpecComputerMemorySize(): number;
    getSpecComputerCpuSpeed(): number;
    getSpecCpuModelId(): number;
    getSpecCpuFeatureFlags1(): number;
    getSpecCpuFeatureFlags2(): number;
    getSpecCpuSerialNumber(): string;
    getSpecCpuBatchMarket(): number;
    getSpecCpuInstructionSetArchitecture(): number;
    getSpecOversizedInlineValueSizing(): string;
    getSpecTreatOversizedInlineValuesAsWarnings(): boolean;
    getSpecIsDefault(): boolean;
    getSpecKey(): string;
    finishSpecInput(): ArchivedEntity<ArchivedComputerSpec>;
    cancelSpecInput(): void;
    getWorkingSpecValue(): ArchivedComputerSpec;
    deserializeSpec(serializedEntity: string): ArchivedComputerSpec;

    hasPendingViewStateInput(): boolean;
    beginViewStateInput(creator: string, producer: string): void;
    setViewStateActiveWorkspaceId(workspaceId: string): void;
    clearViewStateActiveWorkspaceId(): void;
    setViewStateUserId(userId: string): void;
    clearViewStateUserId(): void;
    hasViewStateCustomProperty(key: string): boolean;
    setViewStateCustomProperty(key: string, value: string | number | boolean): void;
    removeViewStateCustomProperty(key: string): void;
    setViewStateCustomProperties(customProperties: Array<ArchivedViewStateCustomProperty>): void;
    getViewStateActiveWorkspaceId(): string;
    getViewStateUserId(): string;
    getViewStateCustomProperties(): Array<ArchivedViewStateCustomProperty>;
    finishViewStateInput(): ArchivedEntity<ArchivedViewState>;
    cancelViewStateInput(): void;
    getWorkingViewStateValue(): ArchivedViewState;
    deserializeViewState(serializedEntity: string): ArchivedViewState;
}

class _SessionApi implements SessionApi {
    public hasPendingSpecInput(): boolean {
        return this._workingSpecValue !== null;
    }

    public beginSpecInput(creator: string, producer: string): void {
        this.assertDoesNotHaveWorkingSpecValue();
        this._workingSpecValue = {
            spec: {
                name: '',
                computerMemorySize: 0,
                computerCpuSpeed: 0,
                cpuModelId: 0,
                cpuFeatureFlags1: 0,
                cpuFeatureFlags2: 0,
                cpuSerialNumber: '',
                cpuBatchMarket: 0,
                cpuInstructionSetArchitecture: 0,
                oversizedInlineValueSizing: 'min-required',
                treatOversizedInlineValuesAsWarnings: false,
                isDefault: false,
                key: ''
            },
            creator: creator,
            producer: producer
        };
    }

    public setSpecName(name: string): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.name = name;
        return updatedSpec;
    }
    
    public setSpecComputerMemorySize(computerMemorySize: number): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.computerMemorySize = computerMemorySize;
        return updatedSpec;
    }
    
    public setSpecComputerCpuSpeed(computerCpuSpeed: number): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.computerCpuSpeed = computerCpuSpeed;
        return updatedSpec;
    }
    
    public setSpecCpuModelId(cpuModelId: number): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.cpuModelId = cpuModelId;
        return updatedSpec;
    }
    
    public setSpecCpuFeatureFlags1(cpuFeatureFlags1: number): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.cpuFeatureFlags1 = cpuFeatureFlags1;
        return updatedSpec;
    }
    
    public setSpecCpuFeatureFlags2(cpuFeatureFlags2: number): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.cpuFeatureFlags2 = cpuFeatureFlags2;
        return updatedSpec;
    }
    
    public setSpecCpuSerialNumber(cpuSerialNumber: string): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.cpuSerialNumber = cpuSerialNumber;
        return updatedSpec;
    }
    
    public setSpecCpuBatchMarket(cpuBatchMarket: number): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.cpuBatchMarket = cpuBatchMarket;
        return updatedSpec;
    }
    
    public setSpecCpuInstructionSetArchitecture(cpuInstructionSetArchitecture: number): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.cpuInstructionSetArchitecture = cpuInstructionSetArchitecture;
        return updatedSpec;
    }
    
    public setSpecOversizedInlineValueSizing(oversizedInlineValueSizing: string): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.oversizedInlineValueSizing = oversizedInlineValueSizing;
        return updatedSpec;
    }
    
    public setSpecTreatOversizedInlineValuesAsWarnings(treatOversizedInlineValuesAsWarnings: boolean): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.treatOversizedInlineValuesAsWarnings = treatOversizedInlineValuesAsWarnings;
        return updatedSpec;
    }
    
    public setSpecIsDefault(isDefault: boolean): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.isDefault = isDefault;
        return updatedSpec;
    }
    
    public setSpecKey(key: string): void {
        this.assertHasWorkingSpecValue();
        const updatedSpec = JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
        updatedSpec.key = key;
        return updatedSpec;
    }

    public getSpecName(): string {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.name;
    }
    
    public getSpecComputerMemorySize(): number {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.computerMemorySize;
    }
    
    public getSpecComputerCpuSpeed(): number {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.computerCpuSpeed;
    }
    
    public getSpecCpuModelId(): number {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.cpuModelId;
    }
    
    public getSpecCpuFeatureFlags1(): number {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.cpuFeatureFlags1;
    }
    
    public getSpecCpuFeatureFlags2(): number {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.cpuFeatureFlags2;
    }
    
    public getSpecCpuSerialNumber(): string {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.cpuSerialNumber;
    }
    
    public getSpecCpuBatchMarket(): number {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.cpuBatchMarket;
    }
    
    public getSpecCpuInstructionSetArchitecture(): number {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.cpuInstructionSetArchitecture;
    }
    
    public getSpecOversizedInlineValueSizing(): string {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.oversizedInlineValueSizing;
    }
    
    public getSpecTreatOversizedInlineValuesAsWarnings(): boolean {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.treatOversizedInlineValuesAsWarnings;
    }
    
    public getSpecIsDefault(): boolean {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.isDefault;
    }
    
    public getSpecKey(): string {
        this.assertHasWorkingSpecValue();
        return this._workingSpecValue!.spec.key;
    }    

    public finishSpecInput(): ArchivedEntity<ArchivedComputerSpec> {
        this.assertHasWorkingSpecValue();
        const archive = {
            schemaVersion: _SessionApi._SCHEMA_VERSION,
            creator: this._workingSpecValue!.creator,
            producer: this._workingSpecValue!.producer,
            timestamp: Date.now(),
            payloadType: _SessionApi._SPEC_PAYLOAD_TYPE,
            payload: this._workingSpecValue!.spec
        };
        this._workingSpecValue = null;
        return archive;
    }

    public cancelSpecInput(): void {
        this.assertHasWorkingSpecValue();
        this._workingSpecValue = null;
    }

    public getWorkingSpecValue(): ArchivedComputerSpec {
        this.assertHasWorkingSpecValue();
        return JSON.parse(JSON.stringify(this._workingSpecValue!.spec));
    }

    public deserializeSpec(serializedEntity: string): ArchivedComputerSpec {
        const entity = Utils.deserializeEntity(serializedEntity);
        if (entity.payloadType === _SessionApi._SPEC_PAYLOAD_TYPE) {
            const p: Partial<ArchivedComputerSpec> | undefined = entity.payload;
            if (!!p) {
                const specName = this.requireString(p, 'name', false);
                const specComputerMemorySize = this.requireNumber(p, 'computerMemorySize', {
                    byteCount: 4
                });
                const specComputerCpuSpeed = this.requireNumber(p, 'computerCpuSpeed', {
                    byteCount: 4,
                    minValue: 1000
                });
                const specCpuModelId = this.requireNumber(p, 'cpuModelId', {
                    byteCount: 2
                });
                const specCpuFeatureFlags1 = this.requireNumber(p, 'cpuFeatureFlags1', {
                    minValue: 0,
                    maxValue: 15
                });
                const specCpuFeatureFlags2 = this.requireNumber(p, 'cpuFeatureFlags2', {
                    minValue: 0,
                    maxValue: 15
                });
                const specCpuSerialNumber = this.requireString(p, 'cpuSerialNumber', true);
                const specCpuBatchMarket = this.requireNumber(p, 'cpuBatchMarket', {
                    minValue: 0,
                    maxValue: 15
                });
                const specCpuInstructionSetArchitecture = this.requireNumber(p, 'cpuInstructionSetArchitecture', {
                    byteCount: 2 // TODO ???
                });
                const specOversizedInlineValueSizing = this.requireString(p, 'oversizedInlineValueSizing', true, {
                    validator: (s) => {
                        return ['quad', 'tri', 'double', 'min-required'].includes(s);
                    },
                    mapEmpty: 'min-required'
                });
                const specTreatOversizedInlineValuesAsWarnings = this.requireBool(p, 'treatOversizedInlineValuesAsWarnings', true);
                const specIsDefault = this.requireBool(p, 'isDefault', true);
                const specKey = this.requireString(p, 'key', false);

                return {
                    name: specName,
                    computerMemorySize: specComputerMemorySize,
                    computerCpuSpeed: specComputerCpuSpeed,
                    cpuModelId: specCpuModelId,
                    cpuFeatureFlags1: specCpuFeatureFlags1,
                    cpuFeatureFlags2: specCpuFeatureFlags2,
                    cpuSerialNumber: specCpuSerialNumber,
                    cpuBatchMarket: specCpuBatchMarket,
                    cpuInstructionSetArchitecture: specCpuInstructionSetArchitecture,
                    oversizedInlineValueSizing: specOversizedInlineValueSizing,
                    treatOversizedInlineValuesAsWarnings: specTreatOversizedInlineValuesAsWarnings,
                    isDefault: specIsDefault,
                    key: specKey
                };
            } else {
                throw new Error('missing payload');
            }
        } else {
            throw new Error('payload is not an archived computer spec');
        }
    }

    public hasPendingViewStateInput(): boolean {
        return this._workingViewStateValue !== null;
    }
    
    public beginViewStateInput(creator: string, producer: string): void {
        this.assertDoesNotHaveWorkingViewStateValue();
        this._workingViewStateValue = {
            state: {
                activeWorkspaceId: '',
                userId: '',
                customProperties: new Array<ArchivedViewStateCustomProperty>()
            },
            creator: creator,
            producer: producer
        };
    }
    
    public setViewStateActiveWorkspaceId(workspaceId: string): void {
        this.assertHasWorkingViewStateValue();
        this._workingViewStateValue!.state = {
            activeWorkspaceId: workspaceId,
            userId: this._workingViewStateValue!.state.userId,
            customProperties: this._workingViewStateValue!.state.customProperties
        };
    }
    
    public clearViewStateActiveWorkspaceId(): void {
        this.assertHasWorkingViewStateValue();
        this._workingViewStateValue!.state = {
            activeWorkspaceId: '',
            userId: this._workingViewStateValue!.state.userId,
            customProperties: this._workingViewStateValue!.state.customProperties
        };
    }
    
    public setViewStateUserId(userId: string): void {
        this.assertHasWorkingViewStateValue();
        this._workingViewStateValue!.state = {
            activeWorkspaceId: this._workingViewStateValue!.state.activeWorkspaceId,
            userId: userId,
            customProperties: this._workingViewStateValue!.state.customProperties
        };
    }
    
    public clearViewStateUserId(): void {
        this.assertHasWorkingViewStateValue();
        this._workingViewStateValue!.state = {
            activeWorkspaceId: this._workingViewStateValue!.state.activeWorkspaceId,
            userId: '',
            customProperties: this._workingViewStateValue!.state.customProperties
        };
    }
    
    public hasViewStateCustomProperty(key: string): boolean {
        this.assertHasWorkingViewStateValue();
        return this._workingViewStateValue!.state.customProperties.some(p => p.key === key);
    }
    
    public setViewStateCustomProperty(key: string, value: string | number | boolean): void {
        this.assertHasWorkingViewStateValue();
        const customProps = this._workingViewStateValue!.state.customProperties;
        const index = customProps.findIndex(p => p.key === key);
        if (index > -1) {
            customProps[index] = {
                key: key,
                value: value
            };
        } else {
            customProps.push({
                key: key,
                value: value
            });
        }

        this._workingViewStateValue!.state = {
            activeWorkspaceId: this._workingViewStateValue!.state.activeWorkspaceId,
            userId: this._workingViewStateValue!.state.userId,
            customProperties: customProps
        };
    }
    
    public removeViewStateCustomProperty(key: string): void {
        this.assertHasWorkingViewStateValue();
        const customProps = this._workingViewStateValue!.state.customProperties;
        const index = customProps.findIndex(p => p.key === key);
        if (index > -1) {
            customProps.splice(index, 1);
            this._workingViewStateValue!.state = {
                activeWorkspaceId: this._workingViewStateValue!.state.activeWorkspaceId,
                userId: this._workingViewStateValue!.state.userId,
                customProperties: customProps
            };
        } else {
            throw new Error(`custom property is not defined: "${key}"`);
        }
    }
    
    public setViewStateCustomProperties(customProperties: Array<ArchivedViewStateCustomProperty>): void {
        this.assertHasWorkingViewStateValue();
        this._workingViewStateValue!.state = {
            activeWorkspaceId: this._workingViewStateValue!.state.activeWorkspaceId,
            userId: this._workingViewStateValue!.state.userId,
            customProperties: customProperties
        };
    }

    public getViewStateActiveWorkspaceId(): string {
        this.assertHasWorkingViewStateValue();
        return this._workingViewStateValue!.state.activeWorkspaceId;
    }
    
    public getViewStateUserId(): string {
        this.assertHasWorkingViewStateValue();
        return this._workingViewStateValue!.state.userId;
    }
    
    public getViewStateCustomProperties(): Array<ArchivedViewStateCustomProperty> {
        this.assertHasWorkingViewStateValue();
        return JSON.parse(JSON.stringify(this._workingViewStateValue!.state.customProperties));
    }

    public finishViewStateInput(): ArchivedEntity<ArchivedViewState> {
        this.assertHasWorkingViewStateValue();
        const archive = {
            schemaVersion: _SessionApi._SCHEMA_VERSION,
            creator: this._workingViewStateValue!.creator,
            producer: this._workingViewStateValue!.producer,
            timestamp: Date.now(),
            payloadType: _SessionApi._VIEW_STATE_PAYLOAD_TYPE,
            payload: this._workingViewStateValue!.state
        };
        this._workingViewStateValue = null;
        return archive;
    }
    
    public cancelViewStateInput(): void {
        this.assertHasWorkingViewStateValue();
        this._workingViewStateValue = null;
    }
    
    public getWorkingViewStateValue(): ArchivedViewState {
        this.assertHasWorkingViewStateValue();
        return JSON.parse(JSON.stringify(this._workingViewStateValue!.state));
    }
    
    public deserializeViewState(serializedEntity: string): ArchivedViewState {
        const entity = Utils.deserializeEntity(serializedEntity);
        if (entity.payloadType === _SessionApi._VIEW_STATE_PAYLOAD_TYPE) {
            const p: Partial<ArchivedViewState> | undefined = entity.payload;
            if (!!p) {
                const activeWorkspaceId = this.requireString(p, 'activeWorkspaceId', true);
                const userId = this.requireString(p, 'userId', true);
                const customProperties = new Array<ArchivedViewStateCustomProperty>();

                if (!!p.customProperties) {
                    if (Array.isArray(p.customProperties)) {
                        p.customProperties.forEach((cp, cpi) => {
                            if (typeof cp === 'object' && !!cp.key && typeof cp.key === 'string' && cp.value !== undefined && (typeof cp.value === 'string' || typeof cp.value === 'number' || typeof cp.value === 'boolean')) {
                                customProperties.push({
                                    key: cp.key,
                                    value: cp.value
                                });
                            } else {
                                throw new Error(`invalid view state custom property: property at ${cpi} is not a key-value pair object`);
                            }
                        });
                    } else {
                        throw new Error('invalid view state custom properties: not an array');
                    }
                }

                return {
                    activeWorkspaceId: activeWorkspaceId,
                    userId: userId,
                    customProperties: customProperties
                };
            } else {
                throw new Error('missing payload');
            }
        } else {
            throw new Error('payload is not an archived view state');
        }
    }    

    private assertHasWorkingSpecValue(): void {
        if (this._workingSpecValue === null) {
            throw new Error('no pending input');
        }
    }

    private assertDoesNotHaveWorkingSpecValue(): void {
        if (this._workingSpecValue !== null) {
            throw new Error('already has pending input');
        }
    }

    private requireString(container: { [key: string]: any | undefined }, propName: string, allowEmptyString: boolean, opts?: {
        readonly validator?: (s: string) => boolean;
        readonly mapEmpty?: string;
    }): string {
        const pv = container[propName];
        if (pv === undefined) {
            throw new Error(`missing string property "${propName}"`);
        } else if (typeof pv !== 'string') {
            throw new Error(`property "${propName}" must be a string`);
        } else {
            if (pv === '') {
                if (allowEmptyString) {
                    if (!!opts && opts.mapEmpty !== undefined) {
                        return opts.mapEmpty;
                    } else {
                        return pv;
                    }
                } else {
                    throw new Error(`empty string not allowed for property "${propName}"`);
                }
            } else {
                if (!!opts && !!opts.validator && !opts.validator(pv)) {
                    throw new Error(`invalid value for property "${propName}"`);
                } else {
                    return pv;
                }
            }
        }
    }
    
    private requireNumber(container: { [key: string]: any | undefined }, propName: string, opts?: {
        readonly byteCount?: 1 | 2 | 3 | 4;
        readonly allowFloat?: boolean;
        readonly allowNegative?: boolean;
        readonly minValue?: number;
        readonly maxValue?: number;
    }): number {
        const pv = container[propName];
        if (pv === undefined) {
            throw new Error(`missing numeric property "${propName}"`);
        } else if (typeof pv !== 'number') {
            throw new Error(`property "${propName}" must be a number`);
        } else {
            const validateMinValue = !!opts && opts.minValue !== undefined
                ? opts.minValue
                : null;
            const validateMaxValue = !!opts && opts.maxValue !== undefined
                ? opts.maxValue
                : null;
            const validateByteCount = !!opts && opts.byteCount !== undefined
                ? opts.byteCount
                : null;
            const validateAllowFloat = !!opts && opts.allowFloat === true;
            const validateAllowNegative = !!opts && opts.allowNegative === true;

            let validateUseMax: number | null = null;
            if (validateMaxValue !== null && validateByteCount !== null) {
                validateUseMax = Math.max(validateMaxValue, Math.pow(2, 8 * validateByteCount) - 1);
            } else if (validateMaxValue === null && validateByteCount !== null) {
                validateUseMax = Math.pow(2, 8 * validateByteCount) - 1;
            } else if (validateMaxValue !== null && validateByteCount === null) {
                validateUseMax = validateMaxValue;
            }

            if (validateMinValue !== null && pv < validateMinValue) {
                throw new Error(`property "${propName}" is less than the minimum allowed value (${validateMinValue})`);
            }

            if (validateUseMax !== null && pv > validateUseMax) {
                throw new Error(`property "${propName}" is greater than the maximum allowed value (${validateUseMax})`);
            }

            if (!Number.isInteger(pv) && !validateAllowFloat) {
                throw new Error(`property "${propName}" must be an integer value`);
            }
            
            if (pv < 0 && !validateAllowNegative) {
                throw new Error(`property "${propName}" must be a non-negative number`);
            }

            return pv;
        }
    }

    private requireBool(container: { [key: string]: any | undefined }, propName: string, allowUndefined?: boolean): boolean {
        const pv = container[propName];
        if (pv === undefined) {
            if (allowUndefined === true) {
                return false;
            } else {
                throw new Error(`missing boolean property "${propName}"`);
            }
        } else if (typeof pv !== 'boolean') {
            throw new Error(`property "${propName}" must be a boolean`);
        } else {
            return pv;
        }
    }

    private assertHasWorkingViewStateValue(): void {
        if (this._workingViewStateValue === null) {
            throw new Error('no pending input');
        }
    }

    private assertDoesNotHaveWorkingViewStateValue(): void {
        if (this._workingViewStateValue !== null) {
            throw new Error('already has pending input');
        }
    }

    private _workingSpecValue: {
        spec: ArchivedComputerSpec;
        readonly creator: string;
        readonly producer: string;
    } | null;

    private _workingViewStateValue: {
        state: ArchivedViewState;
        readonly creator: string;
        readonly producer: string;
    } | null;

    private static readonly _SCHEMA_VERSION = 1;
    private static readonly _SPEC_PAYLOAD_TYPE = 'spec';
    private static readonly _VIEW_STATE_PAYLOAD_TYPE = 'view_st';

    public constructor() {
        this._workingSpecValue = null;
        this._workingViewStateValue = null;
    }
}

export function initSessionApi(): SessionApi {
    return new _SessionApi();
}