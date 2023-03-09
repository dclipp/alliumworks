export interface TreeSelectMember {
    name: string;
    isContainer: boolean;
    id: string;
    parent?: string;
}

export interface TreeSelectMembeNEWr {
    name: string;
    isContainer: boolean;
    // parentPath: string;
    fullPath: string;
    id: string;
    parentId?: string;
}