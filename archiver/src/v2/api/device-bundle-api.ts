// import { ArchivedComputerSpec } from '../models/archived-computer-spec';
import { ArchivedEntity } from '../models/archived-entity';
import { ArchivedDeviceBundle } from '../models/devices/archived-device-bundle';
import { ArchivedDeviceMetadata } from '../models/devices/archived-device-metadata';
// import { ArchivedViewState } from '../models/archived-view-state';
// import { ArchivedViewStateCustomProperty } from '../models/archived-view-state-custom-property';
import { Utils } from '../utils';

import { ArchivedDeviceProfile } from '../models/devices/archived-device-profile';
import { ArchivedDeviceReadme } from '../models/devices/archived-device-readme';

// readonly bundleId?: string;
// readonly profile?: ArchivedDeviceProfile;
// readonly metadata?: ArchivedDeviceMetadata;
// readonly html?: string;
// readonly script?: string;
// readonly stylesheet?: string;
// readonly readme?: ArchivedDeviceReadme;

// readonly primaryDeviceIdentifier?: string;
// readonly secondaryDeviceIdentifier?: string;
// readonly clientToHostBufferSize?: number;
// readonly hostToClientBufferSize?: number;
export interface DeviceBundleApi {
    hasPendingProfileInput(): boolean;
    beginProfileInput(creator: string, producer: string): void;
    setProfilePrimaryDeviceIdentifier(primaryDeviceIdentifier: string): void;
    clearProfilePrimaryDeviceIdentifier(): void;
    setProfileSecondaryDeviceIdentifier(secondaryDeviceIdentifier: string): void;
    clearProfileSecondaryDeviceIdentifier(): void;
    setProfileClientToHostBufferSize(bufferSize: number): void;
    clearProfileClientToHostBufferSize(): void;
    setProfileHostToClientBufferSize(bufferSize: number): void;
    clearProfileHostToClientBufferSize(): void;
    finishProfileInput(): ArchivedEntity<ArchivedDeviceProfile>;
    cancelProfileInput(): void;
    getWorkingProfileValue(): ArchivedDeviceProfile;
    deserializeProfile(serializedEntity: string): ArchivedDeviceProfile;

    hasPendingMetadataInput(): boolean;
    beginMetadataInput(creator: string, producer: string): void;
    setMetadataDeveloperId(developerId: string): void;
    clearMetadataDeveloperId(): void;
    setMetadataDeviceCategory(deviceCategory: string): void;
    clearMetadataDeviceCategory(): void;
    setMetadataHumanReadableDeviceName(humanReadableDeviceName: string): void;
    clearMetadataHumanReadableDeviceName(): void;

    setMetadataPreferredWidth(preferredWidth: {
        readonly amount: number;
        readonly units: 'rel' | 'px';
    }): void;
    clearMetadataPreferredWidth(): void;
    setMetadataPreferredHeight(preferredHeight: {
        readonly amount: number;
        readonly units: 'rel' | 'px';
    }): void;
    clearMetadataPreferredHeight(): void;

    cancelMetadataInput(): void;
    getWorkingMetadataValue(): ArchivedDeviceMetadata;
    finishMetadataInput(): ArchivedEntity<ArchivedDeviceMetadata>;
    deserializeMetadata(serializedEntity: string): ArchivedDeviceMetadata;

    hasPendingBundleInput(): boolean;
    beginBundleInput(creator: string, producer: string): void;
    
    setBundleId(id: string): void;
    clearBundleId(): void;

    setBundleHtml(html: string): void;
    clearBundleHtml(): void;

    setBundleScript(dddd: string): void;
    clearBundleScript(): void;

    setBundleStylesheet(dddd: string): void;
    clearBundleStylesheet(): void;

    setBundleProfile(profile: ArchivedDeviceProfile): void;
    clearBundleProfile(): void;

    setBundleMetadata(metadata: ArchivedDeviceMetadata): void;
    clearBundleMetadata(): void;

    setBundleReadme(readme: ArchivedDeviceReadme): void;
    clearBundleReadme(): void;

    finishBundleInput(): ArchivedEntity<ArchivedDeviceBundle>;
    cancelBundleInput(): void;
    getWorkingBundleValue(): ArchivedDeviceBundle;
    deserializeBundle(serializedEntity: string): ArchivedDeviceBundle;
}

class _DeviceBundleApi implements DeviceBundleApi {

    public hasPendingProfileInput(): boolean {
        return this._workingProfileValue !== null;
    }

    public beginProfileInput(creator: string, producer: string): void {
        this.assertDoesNotHaveWorkingProfileValue();
        this._workingProfileValue = {
            profile: {
                primaryDeviceIdentifier: '',
                secondaryDeviceIdentifier: '',
                clientToHostBufferSize: 0,
                hostToClientBufferSize: 0
            },
            creator: creator,
            producer: producer
        };
    }

    public setProfilePrimaryDeviceIdentifier(primaryDeviceIdentifier: string): void {
        this.assertHasWorkingProfileValue();
        const updatedProfile = JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
        updatedProfile.primaryDeviceIdentifier = primaryDeviceIdentifier;
        this._workingProfileValue!.profile = updatedProfile;
    }

    public clearProfilePrimaryDeviceIdentifier(): void {
        this.assertHasWorkingProfileValue();
        const updatedProfile = JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
        updatedProfile.primaryDeviceIdentifier = '';
        this._workingProfileValue!.profile = updatedProfile;
    }

    public setProfileSecondaryDeviceIdentifier(secondaryDeviceIdentifier: string): void {
        this.assertHasWorkingProfileValue();
        const updatedProfile = JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
        updatedProfile.secondaryDeviceIdentifier = secondaryDeviceIdentifier;
        this._workingProfileValue!.profile = updatedProfile;
    }

    public clearProfileSecondaryDeviceIdentifier(): void {
        this.assertHasWorkingProfileValue();
        const updatedProfile = JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
        updatedProfile.secondaryDeviceIdentifier = '';
        this._workingProfileValue!.profile = updatedProfile;
    }

    public setProfileClientToHostBufferSize(bufferSize: number): void {
        this.assertHasWorkingProfileValue();
        const updatedProfile = JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
        updatedProfile.clientToHostBufferSize = bufferSize;
        this._workingProfileValue!.profile = updatedProfile;
    }

    public clearProfileClientToHostBufferSize(): void {
        this.assertHasWorkingProfileValue();
        const updatedProfile = JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
        updatedProfile.clientToHostBufferSize = 0;
        this._workingProfileValue!.profile = updatedProfile;
    }

    public setProfileHostToClientBufferSize(bufferSize: number): void {
        this.assertHasWorkingProfileValue();
        const updatedProfile = JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
        updatedProfile.hostToClientBufferSize = bufferSize;
        this._workingProfileValue!.profile = updatedProfile;
    }

    public clearProfileHostToClientBufferSize(): void {
        this.assertHasWorkingProfileValue();
        const updatedProfile = JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
        updatedProfile.hostToClientBufferSize = 0;
        this._workingProfileValue!.profile = updatedProfile;
    }

    public finishProfileInput(): ArchivedEntity<ArchivedDeviceProfile> {
        this.assertHasWorkingProfileValue();
        const archive = {
            schemaVersion: _DeviceBundleApi._SCHEMA_VERSION,
            creator: this._workingProfileValue!.creator,
            producer: this._workingProfileValue!.producer,
            timestamp: Date.now(),
            payloadType: _DeviceBundleApi._PROFILE_PAYLOAD_TYPE,
            payload: this._workingProfileValue!.profile
        };
        this._workingProfileValue = null;
        return archive;
    }

    public cancelProfileInput(): void {
        this.assertHasWorkingProfileValue();
        this._workingProfileValue = null;
    }

    public getWorkingProfileValue(): ArchivedDeviceProfile {
        this.assertHasWorkingProfileValue();
        return JSON.parse(JSON.stringify(this._workingProfileValue!.profile));
    }

    public deserializeProfile(serializedEntity: string): ArchivedDeviceProfile {
        const entity = Utils.deserializeEntity(serializedEntity);
        if (entity.payloadType === _DeviceBundleApi._PROFILE_PAYLOAD_TYPE) {
            const p: Partial<ArchivedDeviceProfile> | undefined = entity.payload;
            if (!!p) {
                const primaryDeviceIdentifier = this.requireString(p, 'primaryDeviceIdentifier', false);
                const secondaryDeviceIdentifier = this.requireString(p, 'secondaryDeviceIdentifier', true);
                const clientToHostBufferSize = this.requireNumber(p, 'clientToHostBufferSize', {
                    allowFloat: false,
                    allowNegative: false,
                    byteCount: 1
                });
                const hostToClientBufferSize = this.requireNumber(p, 'hostToClientBufferSize', {
                    allowFloat: false,
                    allowNegative: false,
                    byteCount: 1
                });

                return {
                    primaryDeviceIdentifier: primaryDeviceIdentifier,
                    secondaryDeviceIdentifier: secondaryDeviceIdentifier,
                    clientToHostBufferSize: clientToHostBufferSize,
                    hostToClientBufferSize: hostToClientBufferSize
                };
            } else {
                throw new Error('missing payload');
            }
        } else {
            throw new Error('payload is not an archived device profile');
        }
    }

    public hasPendingMetadataInput(): boolean {
        return this._workingMetadataValue !== null;
    }

    public beginMetadataInput(creator: string, producer: string): void {
        this.assertDoesNotHaveWorkingMetadataValue();
        this._workingMetadataValue = {
            metadata: {
                developerId: '',
                deviceCategory: '',
                humanReadableDeviceName: '',
                preferredWidth: undefined,
                preferredHeight: undefined
            },
            creator: creator,
            producer: producer
        };
    }

    public setMetadataDeveloperId(developerId: string): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.developerId = developerId;
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public clearMetadataDeveloperId(): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.developerId = '';
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public setMetadataDeviceCategory(deviceCategory: string): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.deviceCategory = deviceCategory;
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public clearMetadataDeviceCategory(): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.deviceCategory = '';
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public setMetadataHumanReadableDeviceName(humanReadableDeviceName: string): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.humanReadableDeviceName = humanReadableDeviceName;
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public clearMetadataHumanReadableDeviceName(): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.humanReadableDeviceName = '';
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public setMetadataPreferredWidth(preferredWidth: {
        readonly amount: number;
        readonly units: 'rel' | 'px';
    }): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.preferredWidth = preferredWidth;
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public clearMetadataPreferredWidth(): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.preferredWidth = undefined;
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public setMetadataPreferredHeight(preferredHeight: {
        readonly amount: number;
        readonly units: 'rel' | 'px';
    }): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.preferredHeight = preferredHeight;
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public clearMetadataPreferredHeight(): void {
        this.assertHasWorkingMetadataValue();
        const updatedMetadata = JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
        updatedMetadata.preferredHeight = '';
        this._workingMetadataValue!.metadata = updatedMetadata;
    }

    public cancelMetadataInput(): void {
        this.assertHasWorkingMetadataValue();
        this._workingMetadataValue = null;
    }

    public getWorkingMetadataValue(): ArchivedDeviceMetadata {
        this.assertHasWorkingMetadataValue();
        return JSON.parse(JSON.stringify(this._workingMetadataValue!.metadata));
    }

    public finishMetadataInput(): ArchivedEntity<ArchivedDeviceMetadata> {
        this.assertHasWorkingMetadataValue();
        const archive = {
            schemaVersion: _DeviceBundleApi._SCHEMA_VERSION,
            creator: this._workingBundleValue!.creator,
            producer: this._workingBundleValue!.producer,
            timestamp: Date.now(),
            payloadType: _DeviceBundleApi._METADATA_PAYLOAD_TYPE,
            payload: this._workingMetadataValue!.metadata
        };
        this._workingMetadataValue = null;
        return archive;
    }

    public deserializeMetadata(serializedEntity: string): ArchivedDeviceMetadata {
        const entity = Utils.deserializeEntity(serializedEntity);
        if (entity.payloadType === _DeviceBundleApi._METADATA_PAYLOAD_TYPE) {
            const p: Partial<ArchivedDeviceMetadata> | undefined = entity.payload;
            if (!!p) {
                const developerId = this.requireString(p, 'developerId', true);
                const deviceCategory = this.requireString(p, 'deviceCategory', true);
                const humanReadableDeviceName = this.requireString(p, 'humanReadableDeviceName', true);

                return {
                    developerId: developerId || '',
                    deviceCategory: deviceCategory || '',
                    humanReadableDeviceName: humanReadableDeviceName || ''
                    //TODO preferreds
                };
            } else {
                throw new Error('missing payload');
            }
        } else {
            throw new Error('payload is not an archived device metadata object');
        }
    }

    public hasPendingBundleInput(): boolean {
        return this._workingBundleValue !== null;
    }

    public beginBundleInput(creator: string, producer: string): void {
        this.assertDoesNotHaveWorkingBundleValue();
        this._workingBundleValue = {
            bundle: {
                bundleId: '',
                profile: undefined,
                metadata: undefined,
                html: '',
                script: '',
                stylesheet: '',
                readme: undefined
            },
            creator: creator,
            producer: producer
        };
    }

    public setBundleId(id: string): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.bundleId = id;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public clearBundleId(): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.bundleId = '';
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public setBundleHtml(html: string): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.html = html;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public clearBundleHtml(): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.html = '';
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public setBundleScript(script: string): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.script = script;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public clearBundleScript(): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.script = '';
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public setBundleStylesheet(stylesheet: string): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.stylesheet = stylesheet;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public clearBundleStylesheet(): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.stylesheet = '';
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public setBundleProfile(profile: ArchivedDeviceProfile): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.profile = profile;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public clearBundleProfile(): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.profile = undefined;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public setBundleMetadata(metadata: ArchivedDeviceMetadata): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.metadata = metadata;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public clearBundleMetadata(): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.metadata = undefined;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public setBundleReadme(readme: ArchivedDeviceReadme): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.readme = readme;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public clearBundleReadme(): void {
        this.assertHasWorkingBundleValue();
        const updatedBundle = JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
        updatedBundle.readme = undefined;
        this._workingBundleValue!.bundle = updatedBundle;
    }

    public finishBundleInput(): ArchivedEntity<ArchivedDeviceBundle> {
        this.assertHasWorkingBundleValue();
        const archive = {
            schemaVersion: _DeviceBundleApi._SCHEMA_VERSION,
            creator: this._workingBundleValue!.creator,
            producer: this._workingBundleValue!.producer,
            timestamp: Date.now(),
            payloadType: _DeviceBundleApi._BUNDLE_PAYLOAD_TYPE,
            payload: this._workingBundleValue!.bundle
        };
        this._workingBundleValue = null;
        return archive;
    }

    public cancelBundleInput(): void {
        this.assertHasWorkingBundleValue();
        this._workingBundleValue = null;
    }

    public getWorkingBundleValue(): ArchivedDeviceBundle {
        this.assertHasWorkingBundleValue();
        return JSON.parse(JSON.stringify(this._workingBundleValue!.bundle));
    }

    public deserializeBundle(serializedEntity: string): ArchivedDeviceBundle {
        const entity = Utils.deserializeEntity(serializedEntity);
        if (entity.payloadType === _DeviceBundleApi._BUNDLE_PAYLOAD_TYPE) {
            const p: Partial<ArchivedDeviceBundle> | undefined = entity.payload;
            if (!!p) {
                const bundleId = this.requireString(p, 'bundleId', false);
                const html = this.requireString(p, 'html', true);
                const script = this.requireString(p, 'script', true);
                const stylesheet = this.requireString(p, 'stylesheet', true);

                return {
                    bundleId: bundleId,
                    profile: p.profile,
                    metadata: p.metadata,
                    html: html,
                    script: script,
                    stylesheet: stylesheet,
                    readme: p.readme,
                };
            } else {
                throw new Error('missing payload');
            }
        } else {
            throw new Error('payload is not an archived device bundle');
        }
    }

    private assertHasWorkingProfileValue(): void {
        if (this._workingProfileValue === null) {
            throw new Error('no pending input');
        }
    }

    private assertDoesNotHaveWorkingProfileValue(): void {
        if (this._workingProfileValue !== null) {
            throw new Error('already has pending input');
        }
    }

    private assertHasWorkingMetadataValue(): void {
        if (this._workingMetadataValue === null) {
            throw new Error('no pending input');
        }
    }

    private assertDoesNotHaveWorkingMetadataValue(): void {
        if (this._workingMetadataValue !== null) {
            throw new Error('already has pending input');
        }
    }
    
    private assertHasWorkingBundleValue(): void {
        if (this._workingBundleValue === null) {
            throw new Error('no pending input');
        }
    }

    private assertDoesNotHaveWorkingBundleValue(): void {
        if (this._workingBundleValue !== null) {
            throw new Error('already has pending input');
        }
    }
    // private assertHasWorkingSpecValue(): void {
    //     if (this._workingSpecValue === null) {
    //         throw new Error('no pending input');
    //     }
    // }

    // private assertDoesNotHaveWorkingSpecValue(): void {
    //     if (this._workingSpecValue !== null) {
    //         throw new Error('already has pending input');
    //     }
    // }

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

    private _workingProfileValue: {
        profile: ArchivedDeviceProfile;
        readonly creator: string;
        readonly producer: string;
    } | null;
    
    private _workingMetadataValue: {
        metadata: ArchivedDeviceMetadata;
        readonly creator: string;
        readonly producer: string;
    } | null;

    private _workingBundleValue: {
        bundle: ArchivedDeviceBundle;
        readonly creator: string;
        readonly producer: string;
    } | null;

    private static readonly _SCHEMA_VERSION = 1;
    private static readonly _PROFILE_PAYLOAD_TYPE = 'dev_profile';
    private static readonly _BUNDLE_PAYLOAD_TYPE = 'dev_bundle';
    private static readonly _METADATA_PAYLOAD_TYPE = 'dev_metadata';

    public constructor() {
        this._workingProfileValue = null;
        this._workingMetadataValue = null;
        this._workingBundleValue = null;
    }
}

export function initDeviceBundleApi(): DeviceBundleApi {
    return new _DeviceBundleApi();
}