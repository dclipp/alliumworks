import { ModalOutput } from 'src/app/data-models/modal/modal-output';

export interface ModalLauncher<TIn, TOut extends ModalOutput> {
    launch(data: TIn, decision: (output: TOut) => void): void;
}