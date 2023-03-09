// import { MatchNode } from '@alliumworks/shell';

export interface Autocompleter {
    // getSuggestedCompletion(input: string): Array<MatchNode>;
    getSuggestedCompletion(input: string): Array<any>;
    // getBestCompletion(input: string): MatchNode | null;
    getBestCompletion(input: string): any | null;
}