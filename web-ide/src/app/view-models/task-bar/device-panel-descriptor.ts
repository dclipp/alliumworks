import { PanelDescriptor } from './panel-descriptor';
import { Byte, ByteSequenceCreator } from '@allium/types';

export const DEVICE_DEFAULT_PREFERRED_DIMENSION = 1;

export type DevicePanelDescriptor = PanelDescriptor & {
    readonly portIndex: Byte;
    readonly bundleId: string;
    readonly preferredWidthAmount: number;
    readonly preferredWidthUnits: 'rel' | 'px';
    readonly preferredHeightAmount: number;
    readonly preferredHeightUnits: 'rel' | 'px';
    readonly descriptorType: 'device';
    readonly installationTitle: string;
}

export function createDevicePanelDescriptor(values?: {
    titleIcon: string,
    key: string,
    portIndex: Byte,
    bundleId: string,
    preferredWidthAmount: number,
    preferredWidthUnits: 'rel' | 'px',
    preferredHeightAmount: number,
    preferredHeightUnits: 'rel' | 'px',
    installationTitle?: string
}): DevicePanelDescriptor {
    if (!!values) {
        return {
            title: values.installationTitle || values.bundleId,
            titleIcon: values.titleIcon,
            key: values.key,
            descriptorType: 'device',
            portIndex: values.portIndex.clone(),
            bundleId: values.bundleId,
            preferredWidthAmount: values.preferredWidthAmount,
            preferredWidthUnits: values.preferredWidthUnits,
            preferredHeightAmount: values.preferredHeightAmount,
            preferredHeightUnits: values.preferredHeightUnits,
            installationTitle: values.installationTitle
        }
    } else {
        // this.inputChannel = null;
        // this.outputChannel = null;
        // this.bundleId = '';
        // this.preferredWidthAmount = DEVICE_DEFAULT_PREFERRED_DIMENSION;
        // this.preferredWidthUnits = 'rel';
        // this.preferredHeightAmount = DEVICE_DEFAULT_PREFERRED_DIMENSION;
        // this.preferredHeightUnits = 'rel';

        return {
            title: '',//values.installationTitle || values.bundleId,
            titleIcon: values.titleIcon,
            key: values.key,
            descriptorType: 'device',
            portIndex: ByteSequenceCreator.Byte(0),
            bundleId: '',
            preferredWidthAmount: DEVICE_DEFAULT_PREFERRED_DIMENSION,
            preferredWidthUnits: 'rel',
            preferredHeightAmount: DEVICE_DEFAULT_PREFERRED_DIMENSION,
            preferredHeightUnits: 'rel',
            installationTitle: undefined
        }
    }
}