import { CommandDefinition } from './command-definition';
import { Completion } from './completion';

export class Engine {
    public findCompletions(definitions: Array<CommandDefinition>, input: string): Array<Completion> {
        const parameterizedInputs = new Array<{
            readonly input: Array<{
                readonly literal: string;
                readonly isPartial: boolean;
                readonly isVariable: boolean;
            }>;
            readonly definition: CommandDefinition;
        }>();
        const normalizedInput = input.replace(/[ ]{2,}/g, ' ').replace(/[\t]/g, ' ').replace(/^[ ]/, '');

        for (let i = 0; i < definitions.length; i++) {
            const d = definitions[i];
            const completionWords = d.templateWords;
            const parameterizedInputWords = new Array<{
                readonly literal: string;
                readonly isPartial: boolean;
                readonly isVariable: boolean;
            }>();
            let workingInput = normalizedInput;
            let isNonMatch = false;
            let isPartialMatch = false;
            for (let j = 0; j < completionWords.length && !isNonMatch && !isPartialMatch && !!workingInput; j++) {
                const cw = completionWords[j];
                if (cw === '?') {
                    if (j === completionWords.length - 1) {
                        parameterizedInputWords.push({
                            literal: workingInput,
                            isPartial: false,
                            isVariable: true
                        });
                    } else {
                        const indexOfNextNonVariable = workingInput.indexOf(completionWords[j + 1], 1);
                        if (indexOfNextNonVariable > -1) {
                            const nnvSpaceOffset = 1;
                            parameterizedInputWords.push({
                                literal: workingInput.substring(0, indexOfNextNonVariable - nnvSpaceOffset),
                                isPartial: false,
                                isVariable: true
                            });
                            workingInput = workingInput.substring(indexOfNextNonVariable);
                        } else {
                            isNonMatch = true;
                        }
                    }
                } else {
                    const currentInputWordMatch = workingInput.match(/[ ]{0,1}([^ ]+)/);
                    if (!!currentInputWordMatch) {
                        if (currentInputWordMatch[1] === cw) {
                            parameterizedInputWords.push({
                                literal: currentInputWordMatch[1],
                                isPartial: false,
                                isVariable: false
                            });
                            workingInput = workingInput.substring(currentInputWordMatch[0].length);
                        } else if (workingInput.replace(currentInputWordMatch[0], '').trim() === '' && cw.startsWith(currentInputWordMatch[1])) {
                            isPartialMatch = true;
                            parameterizedInputWords.push({
                                literal: currentInputWordMatch[1],
                                isPartial: true,
                                isVariable: false
                            });
                        } else {
                            isNonMatch = true;
                        }
                    } else {
                        isNonMatch = true;
                    }
                }
            }
    
            if (!isNonMatch) {
                parameterizedInputs.push({
                    input: parameterizedInputWords,
                    definition: d
                })
            }
        }
    
        return parameterizedInputs.map(pi => {
            let parameterizedInput = pi.input.map(i => i.isVariable ? '?' : i.literal).join(' ');
    
            let completionText = '';
            let requiresPostSpace = false;
            let isFullMatch = false;
            let matchLength = 0;
            let nextVariableName = null;
            let nextIsVariable = false;
    
            const variableValues = pi.input.filter(i => i.isVariable).map(i => i.literal.startsWith(' ') ? i.literal.substring(1) : i.literal);
            const fullText = pi.definition.templateWords.join(' ');
    
            if (fullText === parameterizedInput) {
                isFullMatch = true;
                matchLength = pi.input.map(i => i.literal.length).reduce((x, y) => x + y, 0) + pi.input.length - 2;
    
                if (variableValues.length > 0 && variableValues[variableValues.length - 1] === '') {
                    nextVariableName = (pi.definition.variableNames || [])[variableValues.length - 1] || null;
                    nextIsVariable = true;
                    matchLength -= 1;
                    isFullMatch = false;
                    requiresPostSpace = true;
                    variableValues.splice(variableValues.length - 1, 1);
                    parameterizedInput = parameterizedInput.substring(0, parameterizedInput.length - 2);
                }
            } else {
                matchLength = pi.input.map(i => i.literal.length).reduce((x, y) => x + y, 0) + pi.input.length - 1;
                
                const trailingText = fullText.substring(matchLength).split(' ');
                completionText = trailingText[0];
                if (completionText === '') {
                    requiresPostSpace = true;
                    if (variableValues.length === 0 && trailingText[1] === '?') {
                        nextVariableName = (pi.definition.variableNames || [])[0] || null;
                        nextIsVariable = true;
                    }
                }
            }
    
            return {
                fullCommandText: fullText,
                commandName: pi.definition.name,
                parameterizedInput: parameterizedInput,
                variableValues: variableValues,
                completionText: completionText,
                requiresPostSpace: requiresPostSpace,
                isFullMatch: isFullMatch,
                matchLength: matchLength,
                nextVariableName: nextVariableName,
                nextIsVariable: nextIsVariable
            }
        })
    }
}