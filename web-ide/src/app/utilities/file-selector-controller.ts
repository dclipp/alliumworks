export class FileSelectorController {
    public expandFolder(id: string): void {
        //$event.target.parentNode.setAttribute('data-is-expanded', 'true');ul.toggleAttribute('data-rsrc-scope-show-' + fsResource.id.toString())
        const index = this._expandedResourceIds.indexOf(id);
        if (index === -1) {
            this._expandedResourceIds.push(id);
            this.recomputeVisibilities();
        }
    }

    public collapseFolder(id: string): void {
        //$event.target.parentNode.setAttribute('data-is-expanded', 'true');ul.toggleAttribute('data-rsrc-scope-show-' + fsResource.id.toString())
        const index = this._expandedResourceIds.indexOf(id);
        if (index > -1) {
            this._expandedResourceIds.splice(index, 1);
            this.recomputeVisibilities();
        }
    }

    public get expandedResources(): Array<string> {
        return this._expandedResourceIds;
    }

    public get visibleResources(): Array<string> {
        return this._visibleResourceIds;
    }

    public get selectedId(): string {
        return this._selectedId;
    }

    public get selectedPath(): string {
        if (!!this._selectedId) {
            const selectedRsrc = this._resources.find(r => r.id === this._selectedId);
            const hierarchy = this._resourceHierarchies.find(h => h.id === this._selectedId);
            let fullPath = selectedRsrc.name;
            hierarchy.path.forEach(h => {
                if (h === this._ROOT_ID) {
                    fullPath = `/${fullPath}`;
                } else {
                    const r = this._resources.find(rsrc => rsrc.id === h);
                    fullPath = `${r.name}/${fullPath}`;
                }
            })
            return fullPath;
        } else {
            return '';
        }
        // return !!this._selectedId ? this._selectedId : '';//TODO
    }

    public get resources(): Array<{
        name: string,
        icon: string,
        isFolder: boolean,
        level: number,
        id: string,
        parent: string
    }> {
        return this._resources;
    }

    public get formActive(): boolean {
        return this._formActive;
    }

    public selectResource(id: string): void {
        this._selectedId = id;
        this._formActive = false;
    }

    public pushResources(resources: Array<{
        name: string,
        isFolder: boolean,
        id: string,
        parent?: string
    }>): void {
        const models = resources.map(r => {
            return {
                name: r.name,
                icon: r.isFolder ? '(fa)far.folder' : 'code',
                isFolder: r.isFolder,
                level: -1,
                id: r.id,
                parent: r.parent || this._ROOT_ID
            };
        })

        const hierarchies = models.map((m, mi, ma) => {
            const findAncestorIds = (mId: string) => {
                const ancestorIds = new Array<string>();
                let currentM = ma.find(_m => _m.id === mId);
                while (!!currentM) {
                    ancestorIds.push(currentM.parent);
                    if (currentM.parent === this._ROOT_ID) {
                        currentM = null;
                    } else {
                        currentM = ma.find(_m => _m.id === currentM.parent);
                    }
                }
                return ancestorIds;
            }

            return {
                id: m.id,
                path: findAncestorIds(m.id)
            };
        })

        hierarchies.forEach(h => {
            const modelIndex = models.findIndex(m => m.id === h.id);
            models[modelIndex].level = h.path.length - 1;
        })

        this._resources = models;
        this._resourceHierarchies = hierarchies;
        this._expandedResourceIds = new Array<string>();
        this._expandedResourceIds.push(this._ROOT_ID);
        this.recomputeVisibilities();
    }

    public toggleForm(): void {
        this._formActive = !this._formActive;
    }

    private recomputeVisibilities(): void {
        const visibleResources = new Array<string>();
        this._resourceHierarchies.forEach(h => {
            const isParentExpanded = h.path.every(p => this._expandedResourceIds.includes(p));
            if (isParentExpanded) {
                visibleResources.push(h.id);
            }
        })
        this._visibleResourceIds = visibleResources;
    }

    public constructor(resources?: Array<{
        name: string,
        isFolder: boolean,
        id: string,
        parent?: string
    }>) {
        this._formActive = false;
        this._selectedId = '';
        this.pushResources(resources || []);
    }

    private _formActive: boolean;
    private _selectedId: string;
    private _visibleResourceIds: Array<string>;
    private _expandedResourceIds: Array<string>;
    private _resourceHierarchies: Array<{
        id: string;
        path: Array<string>;
    }>;
    private _resources: Array<{
        name: string,
        icon: string,
        isFolder: boolean,
        level: number,
        id: string,
        parent: string
    }>;

    private readonly _ROOT_ID = '_root_';
}

// TESTrsrc: [
//     {
//       name: 'abc',
//       icon: '(fa)far.folder',
//       isFolder: true,
//       level: 0,
//       id: 1,
//       parent: 0
//     },
//     {
//       name: 'xyz',
//       icon: '(fa)far.folder',
//       isFolder: true,
//       level: 0,
//       id: 2,
//       parent: 0
//     },
//     {
//       name: 'abc.f1',
//       icon: 'code',
//       isFolder: false,
//       level: 1,
//       id: 3,
//       parent: 2
//     },
//     {
//       name: 'qrs',
//       icon: '(fa)far.folder',
//       isFolder: true,
//       level: 0,
//       id: 4,
//       parent: 0
//     },
//     {
//       name: 'qrs.D1',
//       icon: '(fa)far.folder',
//       isFolder: true,
//       level: 1,
//       id: 5,
//       parent: 4
//     },
//     {
//       name: 'qrs.f1',
//       icon: 'code',
//       isFolder: false,
//       level: 2,
//       id: 7,
//       parent: 4
//     },
//     {
//       name: 'qrs.D1',
//       icon: '(fa)far.folder',
//       isFolder: true,
//       level: 1,
//       id: 6,
//       parent: 4
//     },
//     {
//       name: 'qrs.f2',
//       icon: 'code',
//       isFolder: false,
//       level: 2,
//       id: 8,
//       parent: 4
//     },
//     {
//       name: 'qrs.D1.E1',
//       icon: '(fa)far.folder',
//       isFolder: true,
//       level: 2,
//       id: 9,
//       parent: 6
//     },
//     {
//       name: 'qrs.D1.E1.f1',
//       icon: 'code',
//       isFolder: false,
//       level: 3,
//       id: 11,
//       parent: 9
//     },
//     {
//       name: 'qrs.D1.E2',
//       icon: '(fa)far.folder',
//       isFolder: true,
//       level: 2,
//       id: 10,
//       parent: 6
//     }
//   ]