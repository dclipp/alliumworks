export interface Workspace {
    readonly id: string;
    readonly title: string;
    readonly version: number;
}

export function deserializeWorkspace(json: string): Workspace {
    const o = JSON.parse(json || '{}');
    return {
        id: o['workspace_id'],
        title: o['title'],
        version: Number(o['version']) || 0
    }
}