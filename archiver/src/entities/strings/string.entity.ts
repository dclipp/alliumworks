import { StringEncodingEntity } from './string-encoding.entity';

export interface StringEntity {
    readonly name?: string;
    readonly value?: string;
    readonly encoding?: StringEncodingEntity;
}