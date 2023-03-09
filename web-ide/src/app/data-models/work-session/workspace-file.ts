export interface WorkspaceFile {
    body: string;
    isBodyModified: boolean;
    fileId: string;
    filename: string;
    node: string;
    assetIdentifier: string;
}

export function deserializeWorkspaceFile(json: string): WorkspaceFile {
    const o = JSON.parse(json);
    return {
        body: o['body'],
        isBodyModified: o['is_body_modified'],
        fileId: o['file_id'],
        filename: o['filename'],
        node: o['node'] || undefined,
        assetIdentifier: o['asset_identifier']
    }
}