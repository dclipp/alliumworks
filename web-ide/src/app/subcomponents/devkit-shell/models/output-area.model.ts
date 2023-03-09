import { OutputLineModel } from './output-line.model';

export interface OutputAreaModel {
    readonly lines: Array<OutputLineModel>;
    readonly append: boolean;
}