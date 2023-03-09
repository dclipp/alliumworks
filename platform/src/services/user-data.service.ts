import { Observable } from 'rxjs';
import { ComputerSpec, ComputerSpecInput, ComputerSpecCreateInput } from '@alliumworks/debugger';

export interface UserDataService {
    computerSpecs(): Observable<Array<ComputerSpec>>;
    updateComputerSpec(specName: string, updates: Partial<ComputerSpecInput>): Promise<ComputerSpec>;
    deleteComputerSpec(specName: string): Promise<void>;
    createComputerSpec(spec: ComputerSpecCreateInput): Promise<ComputerSpec>;
}