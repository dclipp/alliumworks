const TOKEN_TYPES = {
    BlockName: 'BlockName',
    BlockOpener: 'BlockOpener',

    BlockStart: 'BlockStart',
    MarkupScopeStart: 'MarkupScopeStart',
    MarkupScopeEnd: 'MarkupScopeEnd',
    Mnemonic: 'Mnemonic',
    InlineNumericArgBase10: 'InlineNumericArgBase10',
    InlineNumericArgBase16: 'InlineNumericArgBase16',

    RegRefStart: 'RegRefStart',
    RegRefRegister: 'RegRefRegister',
    RegRefDot: 'RegRefDot',
    RegRefNamedMask: 'RegRefNamedMask',
    RegRefBitMask: 'RegRefBitMask',
    RegRefEnd: 'RegRefEnd',

    ConstantInjectorStart: 'ConstantInjectorStart',
    ConstantInjectorName: 'ConstantInjectorName',
    ConstantInjectorEquals: 'ConstantInjectorEquals',
    ConstantInjectorValue: 'ConstantInjectorValue',

    AliasRefIndicator: 'AliasRefIndicator',
    AliasRefValue: 'AliasRefValue',

    AddressRefIndicator: 'AddressRefIndicator',
    AddressRefBlock: 'AddressRefBlock',
    AddressRefExpressionStart: 'AddressRefExpressionStart',
    AddressRefExpressionEnd: 'AddressRefExpressionEnd',
    AddressRefExpressionAnchor: 'AddressRefExpressionAnchor',
    AddressRefExpressionOperator: 'AddressRefExpressionOperator',
    AddressRefExpressionRValue: 'AddressRefExpressionRValue',

    DirectiveIndicator: 'DirectiveIndicator',
    DirectiveCommand: 'DirectiveCommand',
    DirectiveReceiver: 'DirectiveReceiver',
    DirectiveEquals: 'DirectiveEquals',
    DirectiveValue: 'DirectiveValue'
}

const STYLES = {
    Error: 'error',
    Variable: 'atom',
    TypeName: 'builtin',
    Keyword: 'keyword',
    ArrayDec: 'bracket',
    operator: 'operator',
    punctuation: 'punctuation',
    number: 'number',

    Variable2: 'variable-2',
    Markup: 'em',
    Comment: 'comment'
    // Identifier: 'Identifier'
}

const SCOPE_NAMES = {
    BlockBody: 'BlockBody',
    InstructionArgsList: 'InstructionArgsList',
    RegRef: 'RegRef',
    RegRefMask: 'RegRefMask',
    AddressRef: 'AddressRef',
    AddressRefExpression: 'AddressRefExpression'
}

const _Parsers = {
    BlockName: {
        name: TOKEN_TYPES.BlockName,
        pattern: /^[ \t]{0,}([_a-zA-Z0-9]+)/,
        scopeRequirements: [],
        notScopes: [SCOPE_NAMES.BlockBody],
        languageClasses: ['block-name'],
        style: STYLES.Variable2,
    },
    BlockOpener: {
        name: TOKEN_TYPES.BlockOpener,
        pattern: /^[ \t]{0,}:[ \t]{0,}$/,
        scopeRequirements: 'any',//[TOKEN_TYPES.BlockName],
        languageClasses: ['block-opener'],
        applyScopes: [SCOPE_NAMES.BlockBody],
        style: STYLES.punctuation,
    },
    MarkupScopeStart: {
        name: TOKEN_TYPES.MarkupScopeStart,
        pattern: /^[ \t]{0,}''[ \t]{0,}<[ \t]{0,}scope[ \t]{0,}>[ \t]{0,}$/,
        scopeRequirements: 'any',
        languageClasses: ['markup-scope-start'],
        applyMarkupScope: true,
        style: STYLES.Markup
    },
    MarkupScopeEnd: {
        name: TOKEN_TYPES.MarkupScopeEnd,
        pattern: /^[ \t]{0,}''[ \t]{0,}<[ \t]{0,}\/[ \t]{0,}scope[ \t]{0,}>[ \t]{0,}$/,
        scopeRequirements: 'any',
        clearScopes: [SCOPE_NAMES.BlockBody],
        applyMarkupScope: false,
        languageClasses: ['markup-scope-end'],
        style: STYLES.Markup
    },
    CommentLine: {
        name: TOKEN_TYPES.CommentLine,
        pattern: /^[ \t]{0,}'[\u0000-\uFFFF]{0,}$/,
        scopeRequirements: 'any',
        languageClasses: ['comment'],
        style: STYLES.Comment
    },
    Mnemonic: {
        name: TOKEN_TYPES.Mnemonic,
        pattern: /^[ \t]{0,}([_a-zA-Z0-9]+)([ \t]{0,}|$)/,
        scopeRequirements: [SCOPE_NAMES.BlockBody],
        languageClasses: ['mnemonic'],
        applyScopes: [SCOPE_NAMES.InstructionArgsList],
        onEol: {
            clearScopes: [SCOPE_NAMES.InstructionArgsList]
        },
        style: STYLES.Keyword,
        onMatch: (match) => {
            if (!!match[1].match(/^(ADD|SUB|MULT|DIV|MOD|MEMREAD|MEMREAD_Q|MEMREAD_X|MEMREAD_D|MEMWRITE|MEMWRITE_Q|MEMWRITE_X|MEMWRITE_D|PUSH_Q|PUSH_X|PUSH_D|PUSH|POP_Q|POP_X|POP_D|POP|LOAD_MONDAY|LOAD_TUESDAY|LOAD_WEDNESDAY|LOAD_THURSDAY|LOAD_FRIDAY|LOAD_ACCUMULATOR|LOAD_INSPTR|LOAD_G7|LOAD_G8|LOAD_G9|LOAD_G10|LOAD_G11|LOAD_G12|LOAD_G13|LOAD_G14|LOAD_STKPTR|COPY|INC|DEC|BITAND|BITOR|BITXOR|BITLSHIFT|BITRSHIFT|BITNOT|EQ|GT|LT|JMP|JNZ|JZ|JMPI|JNZI|JZI|ADDF|SUBF|MULTF|DIVF|FLOORF|CEILF|ROUNDF|FLAG_ACK|ADDV|SUBV|MULTV|DIVV|MODV|EQV|GTV|LTV|ABSV|NEGV|VEC|VEC_NEG|MAG|LOAD_D|LOAD_B|LOAD_X|NO_OP|ISCAN|OSCAN|IOSTAT|IOREAD_B|IOREAD_D|IOREAD_X|IOREAD_Q|IOWRITE_B|IOWRITE_D|IOWRITE_X|IOWRITE_Q|IOFLUSH|PERF_INFO|MODEL_INFO|SERIAL_NUMBER|TICKS|MEMSIZE|FLAGS|IODEV_IDP|IODEV_IDS|IODEV_CLS|IODEV_CLSX||END)$/)) {
                return [];
            } else {
                return ['error'];
            }
        }
    },
    InlineNumericArgBase10: {
        name: TOKEN_TYPES.InlineNumericArgBase10,
        pattern: /^([0-9]+)[ \t]{0,}([ \t]|$)/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList],
        languageClasses: ['inline-number', 'base-10', 'instruction-arg'],
        style: STYLES.number,
        onMatch: (match) => {
            if (Number.parseInt(match[1], 10) > Math.pow(2, 32) - 1) {
                return ['error'];
            } else {
                return [];
            }
        }
    },
    InlineNumericArgBase16: {
        name: TOKEN_TYPES.InlineNumericArgBase16,
        pattern: /^0x([0-9a-fA-F]+)[ \t]{0,}([ \t]|$)/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList],
        languageClasses: ['inline-number', 'base-16', 'instruction-arg'],
        style: STYLES.number,
        onMatch: (match) => {
            if (Number.parseInt(match[1], 16) > Math.pow(2, 32) - 1) {
                return ['error'];
            } else {
                return [];
            }
        }
    },
    RegRefStart: {
        name: TOKEN_TYPES.RegRefStart,
        pattern: /^\[[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList],
        applyScopes: [SCOPE_NAMES.RegRef, TOKEN_TYPES.RegRefStart],
        languageClasses: ['instruction-arg'],
        style: STYLES.punctuation
    },
    RegRefRegister: {
        name: TOKEN_TYPES.RegRefRegister,
        pattern: /^(INSTRUCTIONPTR|ACCUMULATOR|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|G7|G8|G9|G10|G11|G12|G13|G14|STKPTR)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.RegRef, TOKEN_TYPES.RegRefStart],
        applyScopes: [TOKEN_TYPES.RegRefRegister],
        clearScopes: [TOKEN_TYPES.RegRefStart],
        languageClasses: ['register-name'],
        style: STYLES.TypeName
    },
    RegRefDot: {
        name: TOKEN_TYPES.RegRefDot,
        pattern: /^[ \t]{0,}\.[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.RegRef, TOKEN_TYPES.RegRefRegister],
        clearScopes: [TOKEN_TYPES.RegRefStart, TOKEN_TYPES.RegRefRegister],
        applyScopes: [SCOPE_NAMES.RegRefMask],
        style: STYLES.punctuation
    },
    RegRefEnd$NoMask: {
        name: TOKEN_TYPES.RegRefEnd,
        pattern: /^\][ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.RegRef, TOKEN_TYPES.RegRefRegister],
        clearScopes: [SCOPE_NAMES.RegRef, TOKEN_TYPES.RegRefStart, TOKEN_TYPES.RegRefRegister],
        style: STYLES.punctuation
    },
    RegRefEnd$Masked: {
        name: TOKEN_TYPES.RegRefEnd,
        pattern: /^\][ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.RegRef, SCOPE_NAMES.RegRefMask],
        clearScopes: [SCOPE_NAMES.RegRef, SCOPE_NAMES.RegRefMask],
        style: STYLES.punctuation
    },
    RegRefNamedMask: {
        name: TOKEN_TYPES.RegRefNamedMask,
        pattern: /^[ \t]{0,}(hh|hx|hl|lh|lx|ll|h|l)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.RegRef, SCOPE_NAMES.RegRefMask],
        languageClasses: ['reg-mask', 'named'],
        style: STYLES.TypeName
    },

    ConstantInjectorStart: {
        name: TOKEN_TYPES.ConstantInjectorStart,
        pattern: /^[ \t]{0,}@[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList],
        applyScopes: [TOKEN_TYPES.ConstantInjectorStart],
        style: STYLES.punctuation
    },
    ConstantInjectorName: {
        name: TOKEN_TYPES.ConstantInjectorName,
        pattern: /^[ \t]{0,}([_a-zA-Z]+)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, TOKEN_TYPES.ConstantInjectorStart],
        clearScopes: [TOKEN_TYPES.ConstantInjectorStart],
        applyScopes: [TOKEN_TYPES.ConstantInjectorName],
        languageClasses: ['constant-injector-name', 'instruction-arg'],
        style: STYLES.TypeName, // TODO ??
        onMatch: (match) => {
            if (!!match[1].match(/^flag$/)) {
                return ['']
            } else {
                return ['error'];
            }
        }
    },
    ConstantInjectorEquals: {
        name: TOKEN_TYPES.ConstantInjectorEquals,
        pattern: /^[ \t]{0,}=[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, TOKEN_TYPES.ConstantInjectorName],
        clearScopes: [TOKEN_TYPES.ConstantInjectorName],
        applyScopes: [TOKEN_TYPES.ConstantInjectorEquals],
        style: STYLES.punctuation
    },
    ConstantInjectorValue: {
        name: TOKEN_TYPES.ConstantInjectorValue,
        pattern: /^([_a-zA-Z0-9]+|("([^"]{0,})"))([ \t]|$)/, // TODO ??
        // pattern: /^([_a-zA_Z0-9]+)([ \t]|$)/, // TODO ??
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, TOKEN_TYPES.ConstantInjectorEquals],
        clearScopes: [TOKEN_TYPES.ConstantInjectorEquals],
        languageClasses: ['constant-injector-value'],
        style: STYLES.Variable // TODO ??
    },

    AliasRefIndicator: {
        name: TOKEN_TYPES.AliasRefIndicator,
        pattern: /^#[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList],
        applyScopes: [TOKEN_TYPES.AliasRefIndicator],
        style: STYLES.punctuation
    },
    AliasRefValue: {
        name: TOKEN_TYPES.AliasRefValue,
        pattern: /^([_a-zA-Z0-9]+)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, TOKEN_TYPES.AliasRefIndicator],
        clearScopes: [TOKEN_TYPES.AliasRefIndicator],
        languageClasses: ['alias-ref', 'instruction-arg'],
        style: STYLES.Variable2
    },

    AddressRefIndicator: {
        name: TOKEN_TYPES.AddressRefIndicator,
        pattern: /^[ \t]{0,}\$[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList],
        applyScopes: [SCOPE_NAMES.AddressRef],
        style: STYLES.punctuation
    },
    AddressRefBlock: {
        name: TOKEN_TYPES.AddressRefBlock,
        pattern: /^[ \t]{0,}([_a-zA-Z0-9]+)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef],
        clearScopes: [SCOPE_NAMES.AddressRef],
        languageClasses: ['address-ref-target-block'],
        style: STYLES.Variable // TODO ??
    },
    AddressRefExpressionStart: {
        name: TOKEN_TYPES.AddressRefExpressionStart,
        pattern: /^[ \t]{0,}\([ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef],
        applyScopes: [SCOPE_NAMES.AddressRefExpression],
        style: STYLES.punctuation
    },
    AddressRefExpressionEnd$ExprWithRValue: {
        name: TOKEN_TYPES.AddressRefExpressionEnd,
        pattern: /^[ \t]{0,}\)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef, SCOPE_NAMES.AddressRefExpression, TOKEN_TYPES.AddressRefExpressionRValue],
        clearScopes: [SCOPE_NAMES.AddressRefExpression, SCOPE_NAMES.AddressRef, TOKEN_TYPES.AddressRefExpressionOperator, TOKEN_TYPES.AddressRefExpressionRValue],
        style: STYLES.punctuation
    },
    AddressRefExpressionEnd$NonExpr: {
        name: TOKEN_TYPES.AddressRefExpressionEnd,
        pattern: /^[ \t]{0,}\)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef, SCOPE_NAMES.AddressRefExpression],
        clearScopes: [SCOPE_NAMES.AddressRefExpression, SCOPE_NAMES.AddressRef],
        style: STYLES.punctuation
    },
    AddressRefExpressionAnchor: {
        name: TOKEN_TYPES.AddressRefExpressionAnchor,
        pattern: /^[ \t]{0,}(here|todo)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef, SCOPE_NAMES.AddressRefExpression],
        applyScopes: [TOKEN_TYPES.AddressRefExpressionAnchor],
        languageClasses: ['address-ref-exp-anchor'],
        style: STYLES.TypeName
    },
    AddressRefExpressionOperator: {
        name: TOKEN_TYPES.AddressRefExpressionOperator,
        pattern: /^[ \t]{0,}(\+|\-)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef, SCOPE_NAMES.AddressRefExpression, TOKEN_TYPES.AddressRefExpressionAnchor],
        clearScopes: [TOKEN_TYPES.AddressRefExpressionAnchor],
        applyScopes: [TOKEN_TYPES.AddressRefExpressionOperator],
        languageClasses: ['address-ref-exp-operator'],
        style: STYLES.operator
    },
    AddressRefExpressionEnd$ExprNoRValue: {
        name: TOKEN_TYPES.AddressRefExpressionEnd,
        pattern: /^[ \t]{0,}\)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef, SCOPE_NAMES.AddressRefExpression, TOKEN_TYPES.AddressRefExpressionAnchor],
        clearScopes: [SCOPE_NAMES.AddressRefExpression, SCOPE_NAMES.AddressRef, TOKEN_TYPES.AddressRefExpressionAnchor],
        style: STYLES.punctuation
    },
    AddressRefExpressionRValue: { // TODO allow aliases??
        name: TOKEN_TYPES.AddressRefExpressionRValue,
        pattern: /^[ \t]{0,}\)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef, SCOPE_NAMES.AddressRefExpression, TOKEN_TYPES.AddressRefExpressionAnchor],
        applyScopes: [TOKEN_TYPES.AddressRefExpressionRValue],
        clearScopes: [TOKEN_TYPES.AddressRefExpressionAnchor],
        style: STYLES.punctuation
    },
    AddressRefExpressionRValueBase10: { // TODO allow aliases??
        name: TOKEN_TYPES.AddressRefExpressionRValue,
        pattern: /^([0-9]+)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef, SCOPE_NAMES.AddressRefExpression, TOKEN_TYPES.AddressRefExpressionOperator],
        clearScopes: [TOKEN_TYPES.AddressRefExpressionOperator],
        languageClasses: ['inline-number', 'base-10', 'address-ref-exp-rvalue'],
        style: STYLES.number,
        onMatch: (match) => {
            if (Number.parseInt(match[1], 10) > Math.pow(2, 32) - 1) {
                return ['error'];
            } else {
                return [];
            }
        }
    },
    AddressRefExpressionRValueBase16: { // TODO allow aliases??
        name: TOKEN_TYPES.AddressRefExpressionRValue,
        pattern: /^0x([0-9a-fA-F]+)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, SCOPE_NAMES.InstructionArgsList, SCOPE_NAMES.AddressRef, SCOPE_NAMES.AddressRefExpression, TOKEN_TYPES.AddressRefExpressionOperator],
        clearScopes: [TOKEN_TYPES.AddressRefExpressionOperator],
        languageClasses: ['inline-number', 'base-16', 'address-ref-exp-rvalue'],
        style: STYLES.number,
        onMatch: (match) => {
            if (Number.parseInt(match[1], 16) > Math.pow(2, 32) - 1) {
                return ['error'];
            } else {
                return [];
            }
        }
    },

    DirectiveIndicator: {
        name: TOKEN_TYPES.DirectiveIndicator,
        pattern: /^[ \t]{0,}\?[ \t]{0,}/,
        scopeRequirements: 'any',
        onEol: {
            clearScopes: [
                TOKEN_TYPES.DirectiveIndicator,
                TOKEN_TYPES.DirectiveCommand,
                TOKEN_TYPES.DirectiveReceiver,
                TOKEN_TYPES.DirectiveEquals,
                TOKEN_TYPES.DirectiveValue
            ]
        },
        applyScopes: [TOKEN_TYPES.DirectiveIndicator],
        style: STYLES.punctuation
    },
    DirectiveCommand: {
        name: TOKEN_TYPES.DirectiveCommand,
        pattern: /^[ \t]{0,}([_a-zA-Z]+)[ \t]{0,}/,
        scopeRequirements: [TOKEN_TYPES.DirectiveIndicator],
        clearScopes: [TOKEN_TYPES.DirectiveIndicator],
        applyScopes: [TOKEN_TYPES.DirectiveCommand],
        languageClasses: ['directive-command'],
        style: STYLES.TypeName,
        onMatch: (match) => {
            if (!!match[1].match(/^alias/) || !!match[1].match(/^import/)) {
                return [];
            } else {
                return ['error'];
            }
        }
    },
    DirectiveReceiver: {
        name: TOKEN_TYPES.DirectiveReceiver,
        pattern: /^[ \t]{0,}([_a-zA-Z]+)[ \t]{0,}/,
        scopeRequirements: [TOKEN_TYPES.DirectiveCommand],
        clearScopes: [TOKEN_TYPES.DirectiveCommand],
        applyScopes: [TOKEN_TYPES.DirectiveReceiver],
        languageClasses: ['directive-receiver'],
        style: STYLES.Variable2
    },
    DirectiveEquals: {
        name: TOKEN_TYPES.DirectiveEquals,
        pattern: /^[ \t]{0,}=[ \t]{0,}/,
        scopeRequirements: [TOKEN_TYPES.DirectiveReceiver],
        clearScopes: [TOKEN_TYPES.DirectiveReceiver],
        applyScopes: [TOKEN_TYPES.DirectiveEquals],
        style: STYLES.punctuation
    },
    DirectiveValue: {
        name: TOKEN_TYPES.DirectiveValue,
        pattern: /^([\u0000-\uFFFF]+)/,
        scopeRequirements: [TOKEN_TYPES.DirectiveEquals],
        languageClasses: ['directive-value'],
        style: STYLES.Variable
    },

    DirectiveIndicator$BlockLevel: {
        name: TOKEN_TYPES.DirectiveIndicator,
        pattern: /^[ \t]{0,}\?[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody],
        onEol: {
            clearScopes: [
                TOKEN_TYPES.DirectiveIndicator,
                TOKEN_TYPES.DirectiveCommand,
                TOKEN_TYPES.DirectiveReceiver,
                TOKEN_TYPES.DirectiveEquals,
                TOKEN_TYPES.DirectiveValue
            ]
        },
        applyScopes: [TOKEN_TYPES.DirectiveIndicator],
        style: STYLES.punctuation
    },
    DirectiveCommand$BlockLevel: {
        name: TOKEN_TYPES.DirectiveCommand,
        pattern: /^[ \t]{0,}([_a-zA-Z]+)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, TOKEN_TYPES.DirectiveIndicator],
        clearScopes: [TOKEN_TYPES.DirectiveIndicator],
        applyScopes: [TOKEN_TYPES.DirectiveCommand],
        languageClasses: ['directive-command', 'block-level-directive'],
        style: STYLES.TypeName,
        onMatch: (match) => {
            if (!!match[1].match(/^alias/) || !!match[1].match(/^import/)) {
                return [];
            } else {
                return ['error'];
            }
        }
    },
    DirectiveReceiver$BlockLevel: {
        name: TOKEN_TYPES.DirectiveReceiver,
        pattern: /^[ \t]{0,}([_a-zA-Z]+)[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, TOKEN_TYPES.DirectiveCommand],
        clearScopes: [TOKEN_TYPES.DirectiveCommand],
        applyScopes: [TOKEN_TYPES.DirectiveReceiver],
        languageClasses: ['directive-receiver', 'block-level-directive'],
        style: STYLES.Variable2
    },
    DirectiveEquals$BlockLevel: {
        name: TOKEN_TYPES.DirectiveEquals,
        pattern: /^[ \t]{0,}=[ \t]{0,}/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, TOKEN_TYPES.DirectiveReceiver],
        clearScopes: [TOKEN_TYPES.DirectiveReceiver],
        applyScopes: [TOKEN_TYPES.DirectiveEquals],
        style: STYLES.punctuation
    },
    DirectiveValue$BlockLevel: {
        name: TOKEN_TYPES.DirectiveValue,
        pattern: /^([\u0000-\uFFFF]+)/,
        scopeRequirements: [SCOPE_NAMES.BlockBody, TOKEN_TYPES.DirectiveEquals],
        languageClasses: ['directive-value', 'block-level-directive'],
        style: STYLES.Variable
    }
}

export function alliumMode(CodeMirror, tracer) {
    "use strict";

    CodeMirror.defineMode('allium', function (_config, parserConfig) {

        function startState() {
            return {
                lastType: null,
                currentScopes: [],
                onEol_clearScopes: [],
                isInMarkupScope: false
            }
        }

        function sequenceMatch(stream, currentScopes) {
            const scopePath = currentScopes.join('.');
            const candidates = Object.keys(_Parsers)
                .filter(k => _Parsers[k].scopeRequirements === 'any' || _Parsers[k].scopeRequirements.join('.') === scopePath)
                .map(k => _Parsers[k]);

            let matchingSeq = null;
            let matchCandidate = null;
            let i = 0;
            while (i < candidates.length && !(!!matchingSeq)) {
                const match = stream.match(candidates[i].pattern, false);
                if (!!match) {
                    matchingSeq = match;
                    matchCandidate = candidates[i];
                } else {
                    i++;
                }
            }

            return !!matchCandidate ? {
                matchCandidate: matchCandidate,
                matchingSeq: matchingSeq
            } : null
        }

        function token(stream, state) {
                let style = null;

                const emptyLineMatch = stream.match(/^[ \t]{0,}$/, false);
                if (!!emptyLineMatch && emptyLineMatch.length > 0) {
                    stream.match(/^[ \t]{0,}$/);
                } else {
                    const result = sequenceMatch(stream, state.currentScopes);
                    let isInvalid = false;
                    if (!!result) {
                        if (!!result.matchCandidate.clearScopes && result.matchCandidate.clearScopes.length > 0) {
                            result.matchCandidate.clearScopes.forEach(s => {
                                const index = state.currentScopes.indexOf(s);
                                if (index > -1) {
                                    state.currentScopes.splice(index, 1);
                                }
                            })
                        }
                        
                        if (!!result.matchCandidate.applyScopes && result.matchCandidate.applyScopes.length > 0) {
                            result.matchCandidate.applyScopes.forEach(s => {
                                if (!state.currentScopes.includes(s)) {
                                    state.currentScopes.push(s);
                                }
                            })
                        }
                        
                        if (!!result.matchCandidate.onEol) {
                            if (!!result.matchCandidate.onEol.clearScopes && result.matchCandidate.onEol.clearScopes.length > 0) {
                                result.matchCandidate.onEol.clearScopes.forEach(s => {
                                    if (!state.onEol_clearScopes.includes(s)) {
                                        state.onEol_clearScopes.push(s);
                                    }
                                })
                            }
                        }

                        // handle improperly closed blocks
                        if (state.currentScopes.length > 0) {
                            const bbIndex = state.currentScopes.indexOf(SCOPE_NAMES.BlockBody);
                            if (bbIndex > -1) {
                                let lookAheadCount = 1;
                                let checkFinished = false;
                                while (!checkFinished) {
                                    const nextLine = stream.lookAhead(lookAheadCount);
                                    if (!!nextLine) {
                                        if (/^[ \t]{0,}$/.test(nextLine)) {
                                            lookAheadCount++;
                                        } else if (/^[ \t]{0,}([_a-zA-Z0-9]+)[ \t]{0,}:/.test(nextLine)) {
                                            state.currentScopes.splice(bbIndex, 1);
                                            checkFinished = true;
                                        } else {
                                            checkFinished = true;
                                        }
                                    } else {
                                        checkFinished = true;
                                    }
                                }
                            }
                        }

                        for (let i = 0; i < result.matchingSeq[0].length; i++) {
                            stream.next();
                        }
                        style = result.matchCandidate.style;

                        if (!!result.matchCandidate.notScopes && state.currentScopes.some(s => result.matchCandidate.notScopes.includes(s))) {
                            isInvalid = true;
                            tracer.info(`isInvalid=true`)
                        }

                        if (result.matchCandidate.applyMarkupScope === true) {
                            state.isInMarkupScope = true;
                        } else if (result.matchCandidate.applyMarkupScope === false) {
                            state.isInMarkupScope = false;
                        }
                    } else {
                        // const m = stream.match(/([^\$]{0,})$/, true);
                        const m = stream.match(/([\u0000-\uFFFF]{0,})$/, true);
                        // state.currentScopes = state.currentScopes.filter(cs => cs !== SCOPE_NAMES.BlockBody);
                        // console.log(`DKF: >>${((m || [])[1]) || ''}<<, sol=${stream.sol()}`)
                        // // state.previousIsError = true;
                        // // stream.skipToEnd();
                        // // stream.next();
                        // // console.log(`DKF: >>${stream.current()}<<, sol=${stream.sol()}`)
                        // // if (!!m && !!m[1]) {
                        // //     state.previousIsError = true;
                        // //     tracer.info(`token error segment: >>${m[1]}<<`);
                        // // } else if (!stream.sol()) {
                        // //     stream.next();
                        // // }
                        style = 'error indeterminate';
                    }

                    if (!!result && !!result.matchCandidate.languageClasses && result.matchCandidate.languageClasses.length > 0) {
                        const additionalClasses = ' ' + result.matchCandidate.languageClasses.map(lc => `al-${lc}`).join(' ');
                        style += additionalClasses;
                    }
                    
                    if (!!result && !!result.matchCandidate.onMatch) {
                        let additionalStyles = result.matchCandidate.onMatch(result.matchingSeq);
                        additionalStyles = !!additionalStyles
                            ? additionalStyles.filter(s => !style.split(' ').some(s2 => s2 === s))
                            : additionalStyles;

                        if (!!additionalStyles && additionalStyles.length > 0) {
                            const additionalStyleClasses = ' ' + additionalStyles.join(' ');
                            style += additionalStyleClasses;
                        }
                    }

                    if (isInvalid && !style.includes('error')) {
                        style += ' error';
                    }

                    if (stream.eol() && state.onEol_clearScopes.length > 0) {
                        tracer.info('clearing scopes: ' + state.onEol_clearScopes.join(';') + `, all=${state.currentScopes.join(';')}`)
                        const count = state.onEol_clearScopes.length;
                        state.onEol_clearScopes
                            .splice(0, count)
                            .forEach(s => {
                                const index = state.currentScopes.indexOf(s);
                                if (index > -1) {
                                    state.currentScopes.splice(index, 1);
                                }
                            })
                    }
                }
                
                return style;
        }

        function indent(state, textAfter) {
            let indentation = 0;

            if (state.isInMarkupScope) {
                if (!/^[ \t]{0,}''[ \t]{0,}</.test(textAfter)) {
                    indentation += 4;
                }
            }

            if (state.currentScopes.includes(SCOPE_NAMES.BlockBody)) {
                indentation += 4;
            }

            if (state.isInMarkupScope && /^[ \t]{0,}''[ \t]{0,}</.test(textAfter)) { // scope closure
                indentation = 0;
            }
            
            return indentation;
        }

        return {
            startState: startState,
            token: token,
            indent: indent
        }
    });

    CodeMirror.defineMIME("text/allium", "allium");
};