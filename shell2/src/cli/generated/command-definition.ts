export interface CommandDefinition {
    readonly name: string;
    readonly templateWords: Array<string>;
    readonly notPatterns?: Array<RegExp>;
    readonly variableNames?: Array<string>;
}