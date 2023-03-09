import { ModalOutput } from './modal-output';

export interface RegularModalOutput extends ModalOutput {
    readonly formValues?: { readonly [formName: string]: string };
}