import { AsmCommandNames, EnvCommandNames, MachineCommandNames, MachineShortcutCommandNames } from './command-names';
import { CommandDefinition } from './generated';

const RegDefinitions: Array<CommandDefinition> = [
    {
        name: MachineCommandNames.ReadRegBase10,
        templateWords: ['mac', 'reg', '?'],
        notPatterns: [
            /^[ \t]{0,}mac[ \t]+reg[ \t]+set/,
            /\-\-hex[ \t]{0,}$/,
            /\-\-he[ \t]{0,}$/,
            /\-\-h[ \t]{0,}$/,
            /\-\-[ \t]{0,}$/,
            /\-[ \t]{0,}$/
        ],
        variableNames: ['regName']
    },
    {
        name: MachineCommandNames.ReadRegBase16,
        templateWords: ['mac', 'reg', '?', '--hex'],
        notPatterns: [
            /^[ \t]{0,}mac[ \t]+reg[ \t]+set/
        ]
    },
    {
        name: MachineCommandNames.WriteReg,
        templateWords: ['mac', 'reg', 'set', '?', '=', '?']
    }
]

const FlagDefinitions: Array<CommandDefinition> = [
    {
        name: MachineCommandNames.ReadFlag,
        templateWords: ['mac', 'flag', '?'],
        notPatterns: [
            /^[ \t]{0,}mac[ \t]+flag[ \t]+raise/,
            /^[ \t]{0,}mac[ \t]+flag[ \t]+clear/
        ]
    },
    {
        name: MachineCommandNames.RaiseFlag,
        templateWords: ['mac', 'flag', 'raise', '?']
    },
    {
        name: MachineCommandNames.ClearFlag,
        templateWords: ['mac', 'flag', 'clear']
    }
]

const MemDefinitions: Array<CommandDefinition> = [
    {
        name: MachineCommandNames.ReadMemBase10,
        templateWords: ['mac', 'mem', '?'],
        notPatterns: [
            /^[ \t]{0,}mac[ \t]+mem[ \t]+set/,
            /\-\-hex[ \t]{0,}$/,
            /\-\-he[ \t]{0,}$/,
            /\-\-h[ \t]{0,}$/,
            /\-\-[ \t]{0,}$/,
            /\-[ \t]{0,}$/
        ]
    },
    {
        name: MachineCommandNames.ReadMemBase16,
        templateWords: ['mac', 'mem', '?'],
        notPatterns: [
            /^[ \t]{0,}mac[ \t]+mem[ \t]+set/
        ]
    },
    {
        name: MachineCommandNames.WriteMemBase10,
        templateWords: ['mac', 'mem', 'set', '?', '=', '?'],
        notPatterns: [
            /^[ \t]{0,}mac[ \t]+mem[ \t]+set \-/
        ]
    },
    {
        name: MachineCommandNames.WriteMemBase16,
        templateWords: ['mac', 'mem', 'set', '--hex', '?', '=', '?']
    }
]

const BreakpointDefinitions: Array<CommandDefinition> = [
    {
        name: MachineCommandNames.BreakpointAdd,
        templateWords: ['mac', 'bp', 'add', '?'],
        variableNames: ['location']
    },
    {
        name: MachineCommandNames.BreakpointRemove,
        templateWords: ['mac', 'bp', 'rm', '?'],
        variableNames: ['location']
    },
    {
        name: MachineCommandNames.BreakpointsEnable,
        templateWords: ['mac', 'bp', 'on']
    },
    {
        name: MachineCommandNames.BreakpointsDisable,
        templateWords: ['mac', 'bp', 'off']
    }
]

const ControlDefinitions: Array<CommandDefinition> = [
    {
        name: MachineCommandNames.ControlGetState,
        templateWords: ['mac', 'ctl', 'state']
    },
    {
        name: MachineCommandNames.ControlSetState,
        templateWords: ['mac', 'ctl', 'state', '?']
    },
    {
        name: MachineCommandNames.ControlStep,
        templateWords: ['mac', 'ctl', 'step']
    },
    {
        name: MachineCommandNames.ControlStepMulti,
        templateWords: ['mac', 'ctl', 'step', '?']
    },
    {
        name: MachineCommandNames.ControlCycle,
        templateWords: ['mac', 'ctl', 'cycle']
    },
    {
        name: MachineCommandNames.ControlCycleMulti,
        templateWords: ['mac', 'ctl', 'cycle', '?']
    },
    {
        name: MachineCommandNames.ControlContinue,
        templateWords: ['mac', 'ctl', 'continue']
    },
    {
        name: MachineCommandNames.ControlPause,
        templateWords: ['mac', 'ctl', 'pause']
    }
]

const PowerDefinitions: Array<CommandDefinition> = [
    {
        name: MachineCommandNames.GetPowerState,
        templateWords: ['mac', 'pwr']
    },
    {
        name: MachineCommandNames.PowerOn,
        templateWords: ['mac', 'pwr', 'on']
    },
    {
        name: MachineCommandNames.PowerOff,
        templateWords: ['mac', 'pwr', 'off']
    },
    {
        name: MachineCommandNames.Restart,
        templateWords: ['mac', 'pwr', 'restart']
    }
]

const ShortcutRegDefinitions: Array<CommandDefinition> = [
    {
        name: MachineShortcutCommandNames.ReadRegBase10,
        templateWords: ['.xr', '?'],
        notPatterns: [
            /^[ \t]{0,}\.xr[ \t]+set/,
            /\-\-hex[ \t]{0,}$/,
            /\-\-he[ \t]{0,}$/,
            /\-\-h[ \t]{0,}$/,
            /\-\-[ \t]{0,}$/,
            /\-[ \t]{0,}$/
        ]
    },
    {
        name: MachineShortcutCommandNames.ReadRegBase16,
        templateWords: ['.xr', '?', '--hex'],
        notPatterns: [
            /^[ \t]{0,}\.xr[ \t]+set/
        ]
    },
    {
        name: MachineShortcutCommandNames.WriteReg,
        templateWords: ['.xr', 'set', '?', '=', '?']
    }
]

const ShortcutFlagDefinitions: Array<CommandDefinition> = [
    {
        name: MachineShortcutCommandNames.ReadFlag,
        templateWords: ['.xf', '?'],
        notPatterns: [
            /^[ \t]{0,}\.xf[ \t]+raise/,
            /^[ \t]{0,}\.xf[ \t]+clear/
        ]
    },
    {
        name: MachineShortcutCommandNames.RaiseFlag,
        templateWords: ['.xf', 'raise', '?']
    },
    {
        name: MachineShortcutCommandNames.ClearFlag,
        templateWords: ['.xf', 'clear']
    }
]

const ShortcutMemDefinitions: Array<CommandDefinition> = [
    {
        name: MachineShortcutCommandNames.ReadMemBase10,
        templateWords: ['.xm', '?'],
        notPatterns: [
            /^[ \t]{0,}\.xm[ \t]+set/,
            /\-\-hex[ \t]{0,}$/,
            /\-\-he[ \t]{0,}$/,
            /\-\-h[ \t]{0,}$/,
            /\-\-[ \t]{0,}$/,
            /\-[ \t]{0,}$/
        ]
    },
    {
        name: MachineShortcutCommandNames.ReadMemBase16,
        templateWords: ['.xm', '?'],
        notPatterns: [
            /^[ \t]{0,}\.xm[ \t]+set/
        ]
    },
    {
        name: MachineShortcutCommandNames.WriteMemBase10,
        templateWords: ['.xm', 'set', '?', '=', '?'],
        notPatterns: [
            /^[ \t]{0,}\.xm[ \t]+set \-/
        ]
    },
    {
        name: MachineShortcutCommandNames.WriteMemBase16,
        templateWords: ['.xm', 'set', '--hex', '?', '=', '?']
    },
]

const ShortcutBreakpointDefinitions: Array<CommandDefinition> = [
    {
        name: MachineShortcutCommandNames.BreakpointAdd,
        templateWords: ['.xb', 'add', '?']
    },
    {
        name: MachineShortcutCommandNames.BreakpointRemove,
        templateWords: ['.xb', 'rm', '?']
    },
    {
        name: MachineShortcutCommandNames.BreakpointsEnable,
        templateWords: ['.xb', 'on']
    },
    {
        name: MachineShortcutCommandNames.BreakpointsDisable,
        templateWords: ['.xb', 'off']
    }
]

const ShortcutControlDefinitions: Array<CommandDefinition> = [
    {
        name: MachineShortcutCommandNames.ControlGetState,
        templateWords: ['.xc', 'state']
    },
    {
        name: MachineShortcutCommandNames.ControlSetState,
        templateWords: ['.xc', 'state', '?']
    },
    {
        name: MachineShortcutCommandNames.ControlStep,
        templateWords: ['.xc', 'step']
    },
    {
        name: MachineShortcutCommandNames.ControlStepMulti,
        templateWords: ['.xc', 'step', '?']
    },
    {
        name: MachineShortcutCommandNames.ControlCycle,
        templateWords: ['.xc', 'cycle']
    },
    {
        name: MachineShortcutCommandNames.ControlCycleMulti,
        templateWords: ['.xc', 'cycle', '?']
    },
    {
        name: MachineShortcutCommandNames.ControlContinue,
        templateWords: ['.xc', 'continue']
    },
    {
        name: MachineShortcutCommandNames.ControlPause,
        templateWords: ['.xc', 'pause']
    }
]

const ShortcutPowerDefinitions: Array<CommandDefinition> = [
    {
        name: MachineShortcutCommandNames.GetPowerState,
        templateWords: ['.xp']
    },
    {
        name: MachineShortcutCommandNames.PowerOn,
        templateWords: ['.xp', 'on']
    },
    {
        name: MachineShortcutCommandNames.PowerOff,
        templateWords: ['.xp', 'off']
    },
    {
        name: MachineShortcutCommandNames.Restart,
        templateWords: ['.xp', 'restart']
    }
]

const EnvDefinitions: Array<CommandDefinition> = [
    {
        name: EnvCommandNames.EnvVersion,
        templateWords: ['env', '--version']
    },
    {
        name: EnvCommandNames.EnvGetVar,
        templateWords: ['env', 'get', '?'],
        notPatterns: [
            /^[ \t]{0,}env[ \t]+\-/,
            /^[ \t]{0,}env[ \t]+set/,
            /^[ \t]{0,}env[ \t]+echo/
        ]
    },
    {
        name: EnvCommandNames.EnvSetVar,
        templateWords: ['env', 'set', '?', '=', '?'],
        variableNames: ['name', 'value']
    },
    {
        name: EnvCommandNames.EnvUnsetVar,
        templateWords: ['env', 'unset', '?'],
        variableNames: ['name']
    },
    {
        name: EnvCommandNames.EnvEcho,
        templateWords: ['env', 'echo', '?']
    }
]

const AsmDefinitions: Array<CommandDefinition> = [
    // {
    //     name: AsmCommandNames.Msg.Localize,
    //     templateWords: ['asm', 'msg', 'localize', '?', '?']
    // },
    {
        name: AsmCommandNames.Dasm.Inline,
        templateWords: ['asm', 'inline', '?'],
        variableNames: ['sourceCode'],
        notPatterns: [
            /^[ \t]{0,}asm[ \t]+[0-9]+/
        ]
    }
]

export const Definitions: Array<CommandDefinition> = [
    ...RegDefinitions,
    ...FlagDefinitions,
    ...MemDefinitions,
    ...BreakpointDefinitions,
    ...ControlDefinitions,
    ...PowerDefinitions,
    ...ShortcutRegDefinitions,
    ...ShortcutFlagDefinitions,
    ...ShortcutMemDefinitions,
    ...ShortcutBreakpointDefinitions,
    ...ShortcutControlDefinitions,
    ...ShortcutPowerDefinitions,
    ...EnvDefinitions,
    ...AsmDefinitions
]