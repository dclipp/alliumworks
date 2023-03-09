import { QuadByte, Register, VariableRegisterReference, FlagName } from '@allium/types';
import { Observable } from 'rxjs';
import { ActionOriginator } from '../action-originator';

export interface PostExecutionListeners {
    onMemoryWrite(filters?: {
        address?: QuadByte,
        originator?: ActionOriginator
    }): Observable<Array<QuadByte>>;

    onRegisterWrite(filters?: {
        register?: Register | VariableRegisterReference,
        originator?: ActionOriginator,
        exactMaskOnly?: boolean
    }): Observable<Array<VariableRegisterReference>>;

    onMemoryRead(filters?: {
        address?: QuadByte,
        originator?: ActionOriginator
    }): Observable<Array<QuadByte>>;

    onRegisterRead(filters?: {
        register?: Register | VariableRegisterReference,
        originator?: ActionOriginator,
        exactMaskOnly?: boolean
    }): Observable<Array<VariableRegisterReference>>;

    onFlagRaised(filters?: {
        flags?: Array<FlagName>,
        originator?: ActionOriginator
    }): Observable<Array<FlagName>>;

    onFlagCleared(filters?: {
        flags?: Array<FlagName>,
        originator?: ActionOriginator
    }): Observable<Array<FlagName>>;
}