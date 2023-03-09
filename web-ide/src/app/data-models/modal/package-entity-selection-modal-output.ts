import { ModalOutput } from './modal-output';

export interface PackageEntitySelectionModalOutput extends ModalOutput {
    readonly selectedKeys?: Array<string>;
    readonly inputValues?: { readonly [key: string]: string };
}