import { WorkspaceNode, deserializeWorkspaceNode } from './workspace-node';
import { WorkspaceFile, deserializeWorkspaceFile } from './workspace-file';

export interface SessionWorkspace {
    workspaceId: string;
    profile: string;
    version: number;
    title: string;
    nodes: Array<WorkspaceNode>;
    files: Array<WorkspaceFile>;
}

export function deserializeSessionWorkspace(json: string): SessionWorkspace {
    const o = JSON.parse(json);
    return {
        workspaceId: o['payload']['workspace_id'],
        profile: o['payload']['profile'],
        version: Number(o['payload']['version']) || 0,
        title: o['payload']['title'],
        nodes: !!o['payload']['nodes'] ? o['payload']['nodes'].map(n => deserializeWorkspaceNode(JSON.stringify(n))) : new Array<WorkspaceNode>(),
        files: !!o['payload']['files'] ? o['payload']['files'].map(f => deserializeWorkspaceFile(JSON.stringify(f))) : new Array<WorkspaceFile>()
    }
}

// [JsonProperty("workspace_id")]
//         public string WorkspaceId { get; set; }

//         [JsonProperty("profile")]
//         public string Profile { get; set; }

//         [JsonProperty("version")]
//         public long Version { get; set; }

//         [JsonProperty("title")]
//         public string Title { get; set; }

//         [JsonProperty("nodes")]
//         public IEnumerable<WorkspaceNode> Nodes { get; set; }

//         [JsonProperty("files")]
//         public IEnumerable<WorkSessionVirtualWorkspaceFile> Files { get; set; }