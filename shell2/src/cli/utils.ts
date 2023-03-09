import { CommandMessage, CommandOutput, Completion } from './generated';

export class Utils {
    public static cmdError(...messages: Array<string | [string, string]>): CommandOutput {
        const errorMessages: Array<CommandMessage> = messages.map(m => {
            if (Array.isArray(m)) {
                return {
                    type: 'error',
                    timestamp: Date.now(),
                    message: m[1],
                    icon: m[0]
                };
            } else {
                return {
                    type: 'error',
                    timestamp: Date.now(),
                    message: m
                };
            }
        });

        return {
            messages: errorMessages,
            isError: true
        };
    }

    public static cmdInfo(...messages: Array<string | [string, string]>): CommandOutput {
        const infoMessages: Array<CommandMessage> = messages.map(m => {
            if (Array.isArray(m)) {
                return {
                    type: 'info',
                    timestamp: Date.now(),
                    message: m[1],
                    icon: m[0]
                };
            } else {
                return {
                    type: 'info',
                    timestamp: Date.now(),
                    message: m
                };
            }
        });

        return {
            messages: infoMessages,
            isError: false
        };
    }

    public static cmdWarning(...messages: Array<string | [string, string]>): CommandOutput {
        const warningMessages: Array<CommandMessage> = messages.map(m => {
            if (Array.isArray(m)) {
                return {
                    type: 'warning',
                    timestamp: Date.now(),
                    message: m[1],
                    icon: m[0]
                };
            } else {
                return {
                    type: 'warning',
                    timestamp: Date.now(),
                    message: m
                };
            }
        });

        return {
            messages: warningMessages,
            isError: true
        };
    }

    public static cmdPrependInput<T = any>(input: string, output: CommandOutput<T>): CommandOutput<T> {
        return {
            messages: [{
                type: 'info' as 'error' | 'info' | 'warning' | 'success',
                timestamp: output.messages.length > 0
                    ? output.messages[0].timestamp
                    : Date.now(),
                message: `> ${input}`,
            }].concat(output.messages),
            isError: output.isError,
            payload: output.payload
        };
    }
    
    public static getBestCompletion(completions: Array<Completion>): Completion | null {        
        if (completions.length > 0) {
            const fullMatches = completions.filter(c => c.isFullMatch).sort((a, b) => b.matchLength - a.matchLength);
            if (fullMatches.length > 0) {
                return fullMatches[0];
            } else {
                return completions.sort((a, b) => b.matchLength - a.matchLength)[0];
            }
        } else {
            return null;
        }
    }
}