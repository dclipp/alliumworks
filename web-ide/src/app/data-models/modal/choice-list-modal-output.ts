import { ModalOutput } from './modal-output';

export interface ChoiceListModalOutput extends ModalOutput {
    readonly choice?: string;
}