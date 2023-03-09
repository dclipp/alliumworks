import { SidebarButtonBarButton, SidebarButtonKeys } from './sidebar-button-bar-button';
import { SidebarBrowserType } from './sidebar-browser-type';

export const SidebarCustomButtonSets: {
    readonly WorkspaceHistory: Array<SidebarButtonBarButton>,
    readonly DeletedWorkspace: Array<SidebarButtonBarButton>
} = {
    WorkspaceHistory: [{
        iconName: 'star'/*TODO*/,
        key: SidebarButtonKeys.Workspace_RestoreHistoricVersion,
        requiresSelection: true,
        browserTypes: [SidebarBrowserType.Workspace],
        tooltip: 'Restore the selected version'
    }, {
        iconName: 'star'/*TODO*/,
        key: SidebarButtonKeys.Workspace_NewFromHistoricVersion,
        requiresSelection: true,
        browserTypes: [SidebarBrowserType.Workspace],
        tooltip: 'Clone the selected version into a new workspace'
    // }, {
    //     iconName: 'star'/*TODO*/,
    //     key: SidebarButtonKeys.Workspace_PurgeHistoricVersion,
    //     requiresSelection: true,
    //     browserTypes: [SidebarBrowserType.Workspace],
    //     tooltip: 'Permanently delete the selected previous version and all associated assets...'
    }],
    DeletedWorkspace: [{
        iconName: 'star'/*TODO*/,
        key: SidebarButtonKeys.Workspace_RestoreDeleted,
        requiresSelection: true,
        browserTypes: [SidebarBrowserType.Workspace],
        tooltip: 'Restore the selected workspace'
    }]
}