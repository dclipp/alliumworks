import { ModalOutput } from './modal-output';
import { Byte } from '@allium/types';

export interface DeviceInstallationModalOutput extends ModalOutput {
    readonly installationName?: string;
    readonly portIndex?: Byte;
}