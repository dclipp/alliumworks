// import { Resource } from 'src/app/data-models/resource/resource';

// export interface ResourceViewModel extends Resource {
//     isSelected: boolean;
//     isEditing: boolean;
//     isAncestorCollapsed: boolean;
//     depthFromTop: number;
//     iconName: string;
// }

export interface ResourceViewModel {
    isSelected: boolean;
    isEditing: boolean;
    isAncestorCollapsed: boolean;
    depthFromTop: number;
    iconName: string;

    name: string;
    readonly fullPath: string;
    // readonly assetId: string;
    // readonly parentNodeId: string;
    readonly isFolder: boolean;
    readonly isNew: boolean;
}