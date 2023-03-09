export const MachineCommandNames: {
    readonly ReadRegBase10: string;
    readonly ReadRegBase16: string;
    readonly WriteReg: string;
    // readonly RegWatch

    readonly ReadFlag: string;
    readonly RaiseFlag: string;
    readonly ClearFlag: string;
    
    readonly ReadMemBase10: string;
    readonly ReadMemBase16: string;
    readonly WriteMemBase10: string;
    readonly WriteMemBase16: string;

    readonly BreakpointAdd: string;
    readonly BreakpointRemove: string;
    readonly BreakpointsEnable: string;
    readonly BreakpointsDisable: string;

    readonly ControlGetState: string;
    readonly ControlSetState: string;
    readonly ControlStep: string;
    readonly ControlStepMulti: string;
    readonly ControlCycle: string;
    readonly ControlCycleMulti: string;
    readonly ControlContinue: string;
    readonly ControlPause: string;

    readonly GetPowerState: string;
    readonly PowerOn: string;
    readonly PowerOff: string;
    readonly Restart: string;
    
    // readonly WriteMemByteBase10: string;
    // readonly WriteMemByteBase16: string;
    // readonly WriteMemRangeBase10: string;
    // readonly WriteMemRangeBase16: string;
} = {
    ReadRegBase10: '',
    ReadRegBase16: '',
    WriteReg: 'WriteReg',
    ReadFlag: 'ReadFlag',
    RaiseFlag: 'RaiseFlag',
    ClearFlag: 'ClearFlag',
    ReadMemBase10: 'ReadMemBase10',
    ReadMemBase16: 'ReadMemBase16',
    WriteMemBase10: 'WriteMemBase10',
    WriteMemBase16: 'WriteMemBase16',
    BreakpointAdd: 'BreakpointAdd',
    BreakpointRemove: 'BreakpointRemove',
    BreakpointsEnable: 'BreakpointsEnable',
    BreakpointsDisable: 'BreakpointsDisable',
    ControlGetState: 'ControlGetState',
    ControlSetState: 'ControlSetState',
    ControlStep: 'ControlStep',
    ControlStepMulti: 'ControlStepMulti',
    ControlCycle: 'ControlCycle',
    ControlCycleMulti: 'ControlCycleMulti',
    ControlContinue: 'ControlContinue',
    ControlPause: 'ControlPause',
    GetPowerState: 'GetPowerState',
    PowerOn: 'PowerOn',
    PowerOff: 'PowerOff',
    Restart: 'Restart'
}

export const MachineShortcutCommandNames: {
    readonly ReadRegBase10: string;
    readonly ReadRegBase16: string;
    readonly WriteReg: string;

    readonly ReadFlag: string;
    readonly RaiseFlag: string;
    readonly ClearFlag: string;
    
    readonly ReadMemBase10: string;
    readonly ReadMemBase16: string;
    readonly WriteMemBase10: string;
    readonly WriteMemBase16: string;

    readonly BreakpointAdd: string;
    readonly BreakpointRemove: string;
    readonly BreakpointsEnable: string;
    readonly BreakpointsDisable: string;

    readonly ControlGetState: string;
    readonly ControlSetState: string;
    readonly ControlStep: string;
    readonly ControlStepMulti: string;
    readonly ControlCycle: string;
    readonly ControlCycleMulti: string;
    readonly ControlContinue: string;
    readonly ControlPause: string;

    readonly GetPowerState: string;
    readonly PowerOn: string;
    readonly PowerOff: string;
    readonly Restart: string;
} = {
    ReadRegBase10: MachineCommandNames.ReadRegBase10,
    ReadRegBase16: MachineCommandNames.ReadRegBase16,
    WriteReg: MachineCommandNames.WriteReg,
    ReadFlag: MachineCommandNames.ReadFlag,
    RaiseFlag: MachineCommandNames.RaiseFlag,
    ClearFlag: MachineCommandNames.ClearFlag,
    ReadMemBase10: MachineCommandNames.ReadMemBase10,
    ReadMemBase16: MachineCommandNames.ReadMemBase16,
    WriteMemBase10: MachineCommandNames.WriteMemBase10,
    WriteMemBase16: MachineCommandNames.WriteMemBase16,
    BreakpointAdd: MachineCommandNames.BreakpointAdd,
    BreakpointRemove: MachineCommandNames.BreakpointRemove,
    BreakpointsEnable: MachineCommandNames.BreakpointsEnable,
    BreakpointsDisable: MachineCommandNames.BreakpointsDisable,
    ControlGetState: MachineCommandNames.ControlGetState,
    ControlSetState: MachineCommandNames.ControlSetState,
    ControlStep: MachineCommandNames.ControlStep,
    ControlStepMulti: MachineCommandNames.ControlStepMulti,
    ControlCycle: MachineCommandNames.ControlCycle,
    ControlCycleMulti: MachineCommandNames.ControlCycleMulti,
    ControlContinue: MachineCommandNames.ControlContinue,
    ControlPause: MachineCommandNames.ControlPause,
    GetPowerState: MachineCommandNames.GetPowerState,
    PowerOn: MachineCommandNames.PowerOn,
    PowerOff: MachineCommandNames.PowerOff,
    Restart: MachineCommandNames.Restart
}

export const EnvCommandNames: {
    readonly EnvVersion: string;
    readonly EnvGetVar: string;
    readonly EnvSetVar: string;
    readonly EnvUnsetVar: string;
    readonly EnvEcho: string;
} = {
    EnvVersion: 'EnvVersion',
    EnvGetVar: 'EnvGetVar',
    EnvSetVar: 'EnvSetVar',
    EnvUnsetVar: 'EnvUnsetVar',
    EnvEcho: 'EnvEcho'
}

export const AsmCommandNames: {
    readonly Msg: {
        readonly Localize: string;
    };
    readonly Dasm: {
        readonly Inline: string;
    };
} = {
    Msg: {
        Localize: 'Localize'
    },
    Dasm: {
        Inline: 'Inline'
    }
}