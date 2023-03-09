export const FsList: {
    readonly WorkspacesDirectory: string;
    readonly WorkspaceMetadataFile: {
        readonly title: string;
        readonly extension: string;
    };
    readonly WorkspaceTrackingFile: {
        readonly title: string;
        readonly extension: string;
    };
    readonly WorkspaceImportFile: {
        readonly title: string;
        readonly extension: string;
    };
    readonly WorkspaceResourcesDirectory: string;
    readonly DevicesDirectory: string;
    readonly ImportedDevicesDirectory: string;
    readonly DeviceBundleFiles: {
        readonly Profile: {
            readonly title: string;
            readonly extension: string;
        };
        readonly Metadata: {
            readonly title: string;
            readonly extension: string;
        };
        readonly Html: {
            readonly title: string;
            readonly extension: string;
        };
        readonly Script: {
            readonly title: string;
            readonly extension: string;
        };
        readonly Stylesheet: {
            readonly title: string;
            readonly extension: string;
        };
        readonly Readme: {
            readonly title: string;
            readonly extension: string;
        };
    };
    readonly ComputerConfigsDirectory: string;
} = {
    WorkspacesDirectory: 'workspaces',
    WorkspaceMetadataFile: {
        title: 'metadata',
        extension: 'json'
    },
    WorkspaceTrackingFile: {
        title: 'tracking',
        extension: 'flag'
    },
    WorkspaceImportFile: {
        title: 'import_origin',
        extension: 'txt'
    },
    WorkspaceResourcesDirectory: 'rsrc',
    DevicesDirectory: 'devices',
    ImportedDevicesDirectory: 'imported',
    DeviceBundleFiles: {
        Profile: {
            title: 'profile',
            extension: 'json'
        },
        Metadata: {
            title: 'metadata',
            extension: 'json'
        },
        Html: {
            title: 'device',
            extension: 'html',
        },
        Script: {
            title: 'device',
            extension: 'js',
        },
        Stylesheet: {
            title: 'device',
            extension: 'css',
        },
        Readme: {
            title: 'readme',
            extension: 'json'
        },
    },
    ComputerConfigsDirectory: 'computers'
}