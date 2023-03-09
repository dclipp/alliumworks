export interface Completion {
    readonly fullCommandText: string;
    readonly commandName: string;
    readonly parameterizedInput: string;
    readonly variableValues: Array<string>;
    readonly completionText: string;
    readonly requiresPostSpace: boolean;
    readonly isFullMatch: boolean;
    readonly matchLength: number;
    readonly nextVariableName: string | null;
    readonly nextIsVariable: boolean;
}