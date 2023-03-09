export interface WorkspaceNode {
    nodeId: string;
    nodeName: string;
    rootNode?: string;
}

export function deserializeWorkspaceNode(json: string): WorkspaceNode {
    const o = JSON.parse(json);
    return {
        nodeId: o['node_id'],
        nodeName: o['nodename'],
        rootNode: o['root_node'] || undefined
    }
}