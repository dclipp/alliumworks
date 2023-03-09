export interface ResourceBr2owserViewModel {
    readonly containerPath: string;
    readonly name: string;
    readonly fullPath: string;
    readonly isFile: boolean;
    isSourceFile: boolean;
    readonly depthFromTop: number;
    iconName: string;
    isEditing?: boolean;
    isPending?: boolean;
    pendingName?: string;
    displayNameOverride?: string;
}