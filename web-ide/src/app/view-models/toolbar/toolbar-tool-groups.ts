import { ToolGroup } from './tool-group';
import { ToolbarButtonKeys } from './toolbar-button-keys';
import { ToolbarButton } from './toolbar-button';

export class ToolbarToolGroups {
    public static readonly GroupNames: {
        readonly FONT_SIZE: 'FONT_SIZE',
        readonly FILE_OPTIONS: 'FILE_OPTIONS',
        readonly SOURCE_CODE_OPTIONS: 'SOURCE_CODE_OPTIONS',
        readonly ASM_SETTINGS_OPTIONS: 'ASM_SETTINGS_OPTIONS'
    } = {
        FONT_SIZE: 'FONT_SIZE',
        FILE_OPTIONS: 'FILE_OPTIONS',
        SOURCE_CODE_OPTIONS: 'SOURCE_CODE_OPTIONS',
        ASM_SETTINGS_OPTIONS: 'ASM_SETTINGS_OPTIONS'
    }

    public static get FONT_SIZE(): ToolGroup {
        return {
            disabled: false,
            buttons: [{
                disabled: false,
                iconName: '(c)searchplus',
                buttonKey: ToolbarButtonKeys.IncreaseFontSize,
                tooltip: 'Increase text font size'
            }, {
                disabled: false,
                iconName: '(c)searchminus',
                buttonKey: ToolbarButtonKeys.DecreaseFontSize,
                tooltip: 'Decrease text font size'
            }]
        }
    }
    
    public static get FILE_OPTIONS(): ToolGroup {
        return {
            disabled: false,
            buttons: [{
                disabled: true,
                iconName: '(fa)fas.reply',
                buttonKey: ToolbarButtonKeys.RevertFile,
                tooltip: 'Discard all unsaved changes made to the current item'
            }, {
                disabled: true,
                iconName: '(c)disks5',
                buttonKey: ToolbarButtonKeys.SaveAllFiles,
                tooltip: 'Save unsaved changes for all open items'
            }, {
                disabled: true,
                iconName: '(c)disk3',//'(fa)fas.save',
                buttonKey: ToolbarButtonKeys.SaveFile,
                tooltip: 'Save unsaved changes for the current item'
            }]
        }
    }

    public static get SOURCE_CODE_OPTIONS(): ToolGroup {
        return {
            disabled: false,
            buttons: [{
                disabled: false,
                iconName: '(fa)fas.comments',
                buttonKey: ToolbarButtonKeys.ToggleComment,
                tooltip: '(un)comment selection'
            }, {
                disabled: false,
                iconName: '(fa)fas.paint-roller',
                buttonKey: ToolbarButtonKeys.FormatSelection,
                tooltip: 'Format selection'
            }, {
                disabled: false,
                iconName: '(fa)edit',
                buttonKey: ToolbarButtonKeys.ToggleSourceEditing,
                tooltip: 'Toggle source editing',
                enableStatus: true
            }, {
                disabled: false,
                iconName: '(c)disassemble',
                buttonKey: ToolbarButtonKeys.ToggleShowCompiledInstructionValues,
                tooltip: 'Toggle show disassembly',
                enableStatus: true
            }, {
                disabled: false,
                iconName: '(fa)fas.bug',
                buttonKey: ToolbarButtonKeys.DebugThisFile,
                tooltip: 'Debug this file',
                enableStatus: false
            }]
        }
    }

    public static get ASM_SETTINGS_OPTIONS(): ToolGroup {
        return {
            disabled: ToolbarToolGroups.FILE_OPTIONS.disabled,
            buttons: ToolbarToolGroups.FILE_OPTIONS.buttons.concat({
                disabled: false,
                iconName: '(fa)fas.microscope',
                buttonKey: ToolbarButtonKeys.ToggleRawEditor,
                tooltip: 'Toggle raw editor',
                enableStatus: true
            })
        }
    }

    /** [GroupName] ?[.(dis)(en)abled] ?[:ButtonKey=(dis)(en)abled] */
    public static getGroupsByName(groupNames: Array<string>): Array<ToolGroup> {
        return groupNames.map(groupName => ToolbarToolGroups.getGroupByName(groupName));
    }

    private static getGroupByName(groupName: string): ToolGroup {
        const indexOfDot = groupName.indexOf('.');
        const overrideGroupState = indexOfDot > -1;
        const overrideGroupStateValue = overrideGroupState ? groupName.substring(indexOfDot + 1).startsWith('enabled') : false;

        const buttonStateOverrides = new Array<[string, Boolean]>();
        const indexOfFirstColon = groupName.indexOf(':');
        let indexOfColon = indexOfFirstColon;
        while (indexOfColon > -1) {
            const nextIndex = groupName.indexOf(':', indexOfColon + 1);
            const buttonOverride = nextIndex > -1 ? groupName.substring(indexOfColon + 1, nextIndex) : groupName.substring(indexOfColon + 1);
            const v = buttonOverride.split('=');
            buttonStateOverrides.push([v[0], v[1] === 'enabled']);
            indexOfColon = nextIndex;
        }

        const actualGroupName = indexOfDot > -1
            ? groupName.substring(0, indexOfDot).trim()
            : indexOfFirstColon > -1
            ? groupName.substring(0, indexOfFirstColon).trim()
            : groupName.trim();
        
        const toolGroup = ToolbarToolGroups.getNamedGroup(actualGroupName);

        if (!!toolGroup) {
            const groupButtons = new Array<ToolbarButton>();
            toolGroup.buttons.forEach(b => {
                const overrideIndex = buttonStateOverrides.findIndex(x => x[0] === b.buttonKey);
                if (overrideIndex > -1) {
                    groupButtons.push({
                        disabled: !buttonStateOverrides[overrideIndex][1],
                        buttonKey: b.buttonKey,
                        iconName: b.iconName,
                        tooltip: b.tooltip,
                        enableStatus: b.enableStatus === true
                    });
                } else {
                    groupButtons.push({
                        disabled: b.disabled,
                        buttonKey: b.buttonKey,
                        iconName: b.iconName,
                        tooltip: b.tooltip,
                        enableStatus: b.enableStatus === true
                    });
                }
            })

            return {
                disabled: overrideGroupState ? !overrideGroupStateValue : toolGroup.disabled,
                buttons: groupButtons
            }
        } else {
            throw new Error(`Invalid pre-defined tool group "${actualGroupName}"`);
        }
    }

    private static getNamedGroup(groupName: string): ToolGroup {
        let toolGroup: ToolGroup = null;

        if (groupName === ToolbarToolGroups.GroupNames.FONT_SIZE) {
            toolGroup = ToolbarToolGroups.FONT_SIZE;
        } else if (groupName === ToolbarToolGroups.GroupNames.ASM_SETTINGS_OPTIONS) {
            toolGroup = ToolbarToolGroups.ASM_SETTINGS_OPTIONS;
        } else if (groupName === ToolbarToolGroups.GroupNames.FILE_OPTIONS) {
            toolGroup = ToolbarToolGroups.FILE_OPTIONS;
        } else if (groupName === ToolbarToolGroups.GroupNames.SOURCE_CODE_OPTIONS) {
            toolGroup = ToolbarToolGroups.SOURCE_CODE_OPTIONS;
        }

        return toolGroup;
    }

    public static getButtonKeysForGroup(groupName: string): Array<string> {
        return ToolbarToolGroups.getNamedGroup(groupName).buttons.map(b => b.buttonKey);
    }
    
    public static doesButtonSupportStatus(buttonKey: string): boolean {
        let foundButton = false;
        let enableStatus = false;
        const keys = Object.keys(ToolbarToolGroups.GroupNames);
        for (let i = 0; i < keys.length && !foundButton; i++) {
            const group = ToolbarToolGroups.getGroupByName(keys[i]);
            const button = group.buttons.find(b => b.buttonKey === buttonKey);
            if (!!button) {
                foundButton = true;
                enableStatus = button.enableStatus === true;
            }
        }
        return enableStatus;
    }
}