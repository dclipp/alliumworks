export interface ComputerSpecOption {
    readonly label: string;
    readonly value: string;
    readonly action: 'none' | 'new' | 'manage';
}
