import { ChoiceListModalOption } from './choice-list-modal-option';

export interface ChoiceListModalInput {
    readonly title: string;
    readonly body: string;
    readonly choices: Array<ChoiceListModalOption>;
    readonly cancelButtonCaption?: string;
}