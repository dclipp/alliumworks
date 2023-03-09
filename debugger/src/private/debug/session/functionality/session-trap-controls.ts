import { Trap } from '../../traps/trap';
import { TrapType } from '../../traps/trap-type';
import { Observable } from 'rxjs';

export interface SessionTrapControls {
    trapsCaught(): Observable<Array<Trap>>;
    enableTrapType(type?: TrapType): void;
    disableTrapType(type?: TrapType): void;
    addTrap(trap: Trap): void;
    removeTrap(trap: Trap): void;
}