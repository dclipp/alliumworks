import { ButtonBarButton } from './button-bar-button';

export const ButtonKeys = {
    CloseWorkspace: 'CloseWorkspace',
    CloseWorkspaceDiscardChanges: 'CloseWorkspaceDiscardChanges',
    NewFile: 'NewFile',
    NewFolder: 'NewFolder',
    DeleteSelected: 'DeleteSelected',
    RenameSelected: 'RenameSelected',
    TagSelected: 'TagSelected',
    NewWorkspace: 'NewWorkspace',
    OpenWorkspace: 'OpenWorkspace',
    UploadWorkspace: 'UploadWorkspace',
    DownloadWorkspace: 'DownloadWorkspace',
    // ShowWorkspaceHistory: 'ShowWorkspaceHistory',
    // ShowDeletedWorkspaces: 'ShowDeletedWorkspaces',
    ShowWorkspaceHistories: 'ShowWorkspaceHistories',
    CollapseHistorySections: 'CollapseHistorySections',
    DiscardScratchWorkspace: 'DiscardScratchWorkspace',
    Workspace_NewFromHistoricVersion: 'Workspace_NewFromHistoricVersion',
    Workspace_RestoreHistoricVersion: 'Workspace_RestoreHistoricVersion',
    Workspace_PurgeHistoricVersion: 'Workspace_PurgeHistoricVersion',
    Workspace_RestoreDeleted: 'Workspace_RestoreDeleted',
    Discard: 'Discard',
    Commit: 'Commit',
    LoadDevice: 'LoadDevice',
    NavigateToDeviceWebsite: 'NavigateToDeviceWebsite',
    FavoriteDevice: 'FavoriteDevice',
    ImportDevice: 'ImportDevice',
    MoreMenu: 'MoreMenu',
    ExportPortableSession: 'ExportPortableSession',
    DownloadSourceMap: 'DownloadSourceMap',
    DownloadCompiledAssembly: 'DownloadCompiledAssembly'
}

export const ButtonSets: {
    WorkspacesList: {
        Default: Array<ButtonBarButton>,
        HistoryView: {
            buttons: Array<ButtonBarButton>,
            defaultDisabledButtons: Array<string>
        }
    },
    ResourcesList: {
        buttons: Array<ButtonBarButton>,
        defaultDisabledButtons: Array<string>
    },
    DevicesList: {
        buttons: Array<ButtonBarButton>,
        defaultDisabledButtons: Array<string>
    },
    PendingChange: Array<ButtonBarButton>
} = {
    WorkspacesList: {
        Default: [{
            iconName: '(c)briefcase4',
            key: ButtonKeys.NewWorkspace,
            selectionRequirement: 'any',
            additionalClass: 'x-icon-plus',
            tooltip: 'Create a new workspace'
        }, {
            iconName: '(fa)fas.sign-in-alt',
            key: ButtonKeys.OpenWorkspace,
            selectionRequirement: 'one',
            tooltip: 'Open the selected workspace'
        }, {
            iconName: '(fa)fas.trash-alt',
            key: ButtonKeys.DeleteSelected,
            selectionRequirement: 'one',
            tooltip: 'Delete the selected item'
        }, {
            iconName: '(c)rename',
            key: ButtonKeys.RenameSelected,
            selectionRequirement: 'one',
            tooltip: 'Rename the selected item'
        }, {
            iconName: '(fa)fas.history',
            key: ButtonKeys.ShowWorkspaceHistories,
            selectionRequirement: 'any',
            tooltip: 'Open workspace histories'
        }, {
            iconName: '(c)briefcasedown',
            key: ButtonKeys.DownloadWorkspace,
            selectionRequirement: 'one-or-many',
            tooltip: 'Download workspace',
            additionalClass: 'more-menu-item'
        }, {
            iconName: '(c)briefcaseup2',
            key: ButtonKeys.UploadWorkspace,
            selectionRequirement: 'any',
            tooltip: 'Import workspace...',
            additionalClass: 'more-menu-item'
        }, {
            iconName: '(fa)fas.ellipsis-v',
            key: ButtonKeys.MoreMenu,
            selectionRequirement: 'any',
            tooltip: 'More actions...'
        }],
        HistoryView: {
            buttons: [{
                iconName: '(fa)fas.bars',
                key: ButtonKeys.CollapseHistorySections,
                selectionRequirement: 'any',
                tooltip: 'Collapse all sections'
            }, {
                iconName: '(fa)fas.trash-restore-alt',
                key: ButtonKeys.Workspace_RestoreDeleted,
                selectionRequirement: 'one',
                tooltip: 'Restore the selected workspace'
            }, {
                iconName: '(fa)fas.code-branch',
                key: ButtonKeys.Workspace_RestoreHistoricVersion,
                selectionRequirement: 'one',
                tooltip: 'Restore the selected version'
            }, {
                iconName: '(fa)clone',
                key: ButtonKeys.Workspace_NewFromHistoricVersion,
                selectionRequirement: 'one',
                tooltip: 'Clone the selected version into a new workspace'
            }, {
                iconName: '(fa)trash-alt',
                key: ButtonKeys.Workspace_PurgeHistoricVersion,
                selectionRequirement: 'one',
                tooltip: 'Purge the selected workspace and all of its history'
            }, {
                iconName: '(fa)fas.history',
                key: ButtonKeys.ShowWorkspaceHistories,
                selectionRequirement: 'any',
                tooltip: 'Close workspace histories',
                additionalClass: 'btn-emphasized'
            }],
            defaultDisabledButtons: [
                ButtonKeys.Workspace_RestoreDeleted,
                ButtonKeys.Workspace_RestoreHistoricVersion,
                ButtonKeys.Workspace_NewFromHistoricVersion,
                ButtonKeys.Workspace_PurgeHistoricVersion
            ]
        }
    },
    ResourcesList: {
        buttons: [{
            iconName: '(fa)fas.sign-out-alt',
            key: ButtonKeys.CloseWorkspace,
            selectionRequirement: 'any',
            additionalClass: 'x-icon-rotate-180',
            tooltip: 'Close workspace',
            contextMenu: [
                {
                    key: 'discardChanges',
                    emitButtonKey: ButtonKeys.CloseWorkspaceDiscardChanges,
                    caption: 'Close and discard changes',
                    tooltip: 'Closes the workspace and discards any changes made since the last time it was opened.\nNote that all discarded changes are lost permanently.'
                },
                {
                    key: 'normal',
                    emitButtonKey: ButtonKeys.CloseWorkspace,
                    caption: 'Close and save',
                    tooltip: 'Closes the workspace and preserves all changes.\nThis is the default option.'
                }
            ]
        }, {
            iconName: '(fa)fas.file-alt',
            key: ButtonKeys.NewFile,
            selectionRequirement: 'any',
            additionalClass: 'x-icon-plus',
            tooltip: 'New file'
        }, {
            iconName: '(fa)fas.folder',
            key: ButtonKeys.NewFolder,
            selectionRequirement: 'any',
            additionalClass: 'x-icon-plus',
            tooltip: 'New folder'
        }, {
            iconName: '(fa)fas.trash-alt',
            key: ButtonKeys.DeleteSelected,
            selectionRequirement: 'one-or-many',
            tooltip: 'Delete the selected item'
        }, {
            iconName: '(c)rename',
            key: ButtonKeys.RenameSelected,
            selectionRequirement: 'one',
            tooltip: 'Rename the selected item'
        }, {
            iconName: '(fa)fas.cube',
            key: ButtonKeys.DownloadCompiledAssembly,
            selectionRequirement: 'any',
            additionalClass: 'more-menu-item',
            // additionalClass: 'more-menu-item.suboptions:"ddd"[{(fa)fas.trash-alt,bin,Bin},{(fa)fas.trash-alt,hex,Hex},{(fa)fas.trash-alt,dec,Dec}]',
            tooltip: 'Download compiled assembly'
        }, {
            iconName: '(fa)fas.project-diagram',
            key: ButtonKeys.DownloadSourceMap,
            selectionRequirement: 'any',
            additionalClass: 'more-menu-item',
            tooltip: 'Download source map'
        }, {
            iconName: '(fa)fas.luggage-cart',
            key: ButtonKeys.ExportPortableSession,
            selectionRequirement: 'any',
            additionalClass: 'more-menu-item',
            tooltip: 'Export as portable session...'
        }, {
            iconName: '(fa)fas.ellipsis-v',
            key: ButtonKeys.MoreMenu,
            selectionRequirement: 'any',
            tooltip: 'More actions...'
        }],
        defaultDisabledButtons: []
    },
    DevicesList: {
        buttons: [{
            iconName: '(fa)fas.download',
            key: ButtonKeys.LoadDevice,
            selectionRequirement: 'one',
            tooltip: 'Attach a new instance of this device'
        }, {
            iconName: '(fa)fas.heart',
            key: ButtonKeys.FavoriteDevice,
            selectionRequirement: 'one',
            tooltip: 'Make favorite',
            // dynamicStates: {
            //     'not-favorited': {
            //         iconName: 'heart',
            //         tooltip: 'Make favorite'
            //     },
            //     'favorited': {
            //         iconName: 'heart-empty',
            //         tooltip: 'Remove from favorites'
            //     }
            // }
        }, {
            iconName: '(fa)fas.external-link-square-alt',
            key: ButtonKeys.NavigateToDeviceWebsite,
            selectionRequirement: 'one',
            tooltip: 'Go to device project homepage'
        }, {
            iconName: '(fa)fas.cloud-upload-alt',
            key: ButtonKeys.ImportDevice,
            selectionRequirement: 'any',
            tooltip: 'Import device...'
        }],
        defaultDisabledButtons: []
    },
    PendingChange: [
        {
            iconName: '(c)crosscircle',
            key: ButtonKeys.Discard,
            selectionRequirement: 'any',
            // tooltip: 'Show or hide history'
        },
        {
            iconName: '(c)checkcircle',
            key: ButtonKeys.Commit,
            selectionRequirement: 'any',
            // tooltip: 'Show or hide history'
        }
    ]
}
// export const ButtonSets: Array<ButtonBarButton> = [{
//     iconName: 'log-out',
//     key: ButtonKeys.CloseWorkspace,
//     requiresSelection: false,
//     browserTypes: [SidebarBrowserType.Resource],
//     additionalClass: 'x-icon-flip-x'
// }, {
//     iconName: 'document',
//     key: ButtonKeys.NewFile,
//     requiresSelection: false,
//     browserTypes: [SidebarBrowserType.Resource],
//     additionalClass: 'x-icon-plus'
// }, {
//     iconName: 'folder',
//     key: ButtonKeys.NewFolder,
//     requiresSelection: false,
//     browserTypes: [SidebarBrowserType.Resource],
//     additionalClass: 'x-icon-plus'
// }, {
//     iconName: 'browsers',
//     key: ButtonKeys.NewWorkspace,
//     requiresSelection: false,
//     browserTypes: [SidebarBrowserType.Workspace],
//     additionalClass: 'x-icon-plus',
//     tooltip: 'Create a new workspace'
// }, {
//     iconName: 'download',
//     key: ButtonKeys.OpenWorkspace,
//     requiresSelection: true,
//     browserTypes: [SidebarBrowserType.Workspace],
//     additionalClass: 'x-icon-rotate-270',
//     tooltip: 'Open the selected workspace'
// }, {
//     iconName: 'trash',
//     key: ButtonKeys.DeleteSelected,
//     requiresSelection: true,
//     browserTypes: [SidebarBrowserType.Workspace, SidebarBrowserType.Resource],
//     tooltip: 'Delete the selected item'
// }, {
//     iconName: 'text',
//     key: ButtonKeys.RenameSelected,
//     requiresSelection: true,
//     browserTypes: [SidebarBrowserType.Workspace, SidebarBrowserType.Resource],
//     tooltip: 'Rename the selected item'
// }, {
//     iconName: 'pricetag',
//     key: ButtonKeys.TagSelected,
//     requiresSelection: true,
//     browserTypes: [SidebarBrowserType.Workspace, SidebarBrowserType.Resource]
// }, {
//     iconName: '(fa)fas.history',
//     key: ButtonKeys.ShowWorkspaceHistory,
//     requiresSelection: true,
//     browserTypes: [SidebarBrowserType.Workspace],
//     tooltip: 'Show or hide history'
// }, {
//     iconName: 'filing',
//     key: ButtonKeys.ShowDeletedWorkspaces,
//     requiresSelection: false,
//     browserTypes: [SidebarBrowserType.Workspace],
//     tooltip: 'Show deleted workspaces'
// }, {
//     iconName: '(fa)fas.download',
//     key: ButtonKeys.LoadDevice,
//     requiresSelection: true,
//     browserTypes: [SidebarBrowserType.Device],
//     tooltip: 'Load a new instance of this device'
// }, {
//     iconName: 'heart',
//     key: ButtonKeys.FavoriteDevice,
//     requiresSelection: true,
//     browserTypes: [SidebarBrowserType.Device],
//     tooltip: 'Make favorite',
//     dynamicStates: {
//         'not-favorited': {
//             iconName: 'heart',
//             tooltip: 'Make favorite'
//         },
//         'favorited': {
//             iconName: 'heart-empty',
//             tooltip: 'Remove from favorites'
//         }
//     }
// }, {
//     iconName: 'open',
//     key: ButtonKeys.NavigateToDeviceWebsite,
//     requiresSelection: true,
//     browserTypes: [SidebarBrowserType.Device],
//     tooltip: 'Go to device project homepage'
// }];