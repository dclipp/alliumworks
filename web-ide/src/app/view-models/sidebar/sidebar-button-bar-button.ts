import { SidebarBrowserType } from './sidebar-browser-type';

export interface SidebarButtonBarButton {
    readonly iconName: string;
    readonly key: string;
    readonly browserTypes: Array<SidebarBrowserType>;
    readonly requiresSelection: boolean;
    readonly additionalClass?: string;
    readonly tooltip?: string;
    readonly dynamicStates?: { [key: string]: {
        readonly iconName: string;
        readonly tooltip?: string;
    } }
}

export const SidebarButtonKeys = {
    CloseWorkspace: 'CloseWorkspace',
    NewFile: 'NewFile',
    NewFolder: 'NewFolder',
    DeleteSelected: 'DeleteSelected',
    RenameSelected: 'RenameSelected',
    TagSelected: 'TagSelected',
    NewWorkspace: 'NewWorkspace',
    OpenWorkspace: 'OpenWorkspace',
    ShowWorkspaceHistory: 'ShowWorkspaceHistory',
    ShowDeletedWorkspaces: 'ShowDeletedWorkspaces',
    DiscardScratchWorkspace: 'DiscardScratchWorkspace',
    Workspace_NewFromHistoricVersion: 'Workspace_NewFromHistoricVersion',
    Workspace_RestoreHistoricVersion: 'Workspace_RestoreHistoricVersion',
    // Workspace_PurgeHistoricVersion: 'Workspace_PurgeHistoricVersion',
    Workspace_RestoreDeleted: 'Workspace_RestoreDeleted',
    Discard: 'Discard',
    Commit: 'Commit',
    LoadDevice: 'LoadDevice',
    NavigateToDeviceWebsite: 'NavigateToDeviceWebsite',
    FavoriteDevice: 'FavoriteDevice',
    ImportDevice: 'ImportDevice'
}

export const SidebarButtonBarButtons: Array<SidebarButtonBarButton> = [{
    iconName: 'log-out',
    key: SidebarButtonKeys.CloseWorkspace,
    requiresSelection: false,
    browserTypes: [SidebarBrowserType.Resource],
    additionalClass: 'x-icon-flip-x'
}, {
    iconName: 'document',
    key: SidebarButtonKeys.NewFile,
    requiresSelection: false,
    browserTypes: [SidebarBrowserType.Resource],
    additionalClass: 'x-icon-plus'
}, {
    iconName: 'folder',
    key: SidebarButtonKeys.NewFolder,
    requiresSelection: false,
    browserTypes: [SidebarBrowserType.Resource],
    additionalClass: 'x-icon-plus'
}, {
    iconName: '(c)briefcase4',
    key: SidebarButtonKeys.NewWorkspace,
    requiresSelection: false,
    browserTypes: [SidebarBrowserType.Workspace],
    additionalClass: 'x-icon-plus',
    tooltip: 'Create a new workspace'
}, {
    iconName: 'download',
    key: SidebarButtonKeys.OpenWorkspace,
    requiresSelection: true,
    browserTypes: [SidebarBrowserType.Workspace],
    additionalClass: 'x-icon-rotate-270',
    tooltip: 'Open the selected workspace'
}, {
    iconName: 'trash',
    key: SidebarButtonKeys.DeleteSelected,
    requiresSelection: true,
    browserTypes: [SidebarBrowserType.Workspace, SidebarBrowserType.Resource],
    tooltip: 'Delete the selected item'
}, {
    iconName: '(c)rename',
    key: SidebarButtonKeys.RenameSelected,
    requiresSelection: true,
    browserTypes: [SidebarBrowserType.Workspace, SidebarBrowserType.Resource],
    tooltip: 'Rename the selected item'
}, {
    iconName: 'pricetag',
    key: SidebarButtonKeys.TagSelected,
    requiresSelection: true,
    browserTypes: [SidebarBrowserType.Workspace, SidebarBrowserType.Resource]
}, {
    iconName: '(fa)fas.history',
    key: SidebarButtonKeys.ShowWorkspaceHistory,
    requiresSelection: true,
    browserTypes: [SidebarBrowserType.Workspace],
    tooltip: 'Show or hide history'
}, {
    iconName: '(fa)fas.history',
    key: SidebarButtonKeys.ShowDeletedWorkspaces,
    requiresSelection: false,
    browserTypes: [SidebarBrowserType.Workspace],
    tooltip: 'Show deleted workspaces'
}, {
    iconName: '(fa)fas.download',
    key: SidebarButtonKeys.LoadDevice,
    requiresSelection: true,
    browserTypes: [SidebarBrowserType.Device],
    tooltip: 'Attach a new instance of this device'
}, {
    iconName: 'heart',
    key: SidebarButtonKeys.FavoriteDevice,
    requiresSelection: true,
    browserTypes: [SidebarBrowserType.Device],
    tooltip: 'Make favorite',
    dynamicStates: {
        'not-favorited': {
            iconName: '(fa)fas.heart',
            tooltip: 'Make favorite'
        },
        'favorited': {
            iconName: '(fa)far.heart',
            tooltip: 'Remove from favorites'
        }
    }
}, {
    iconName: 'open',
    key: SidebarButtonKeys.NavigateToDeviceWebsite,
    requiresSelection: true,
    browserTypes: [SidebarBrowserType.Device],
    tooltip: 'Go to device project homepage'
}, {
    iconName: '(fa)fas.cloud-upload-alt',
    key: SidebarButtonKeys.ImportDevice,
    requiresSelection: false,
    browserTypes: [SidebarBrowserType.Device],
    tooltip: 'Import device...'
}];