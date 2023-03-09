import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreeSelectMember } from 'src/app/view-models/tree-select/tree-select-member';

@Component({
  selector: 'aq4w-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss']
})
export class TreeSelectComponent implements OnInit {

  @Input('resources')
  public set resources(resources: Array<TreeSelectMember>) {
    this.pushResources(resources);
  }

  @Input('containerIcon')
  public set containerIcon(containerIcon: string) {
    this.view.containerIcon = containerIcon;
  }

  @Input('itemIcon')
  public set itemIcon(itemIcon: string) {
    this.view.itemIcon = itemIcon;
  }

  @Input('allowContainerSelection')
  public set allowContainerSelection(allowContainerSelection: boolean) {
    this.view.allowContainerSelection = allowContainerSelection;
  }

  @Input('selectedPath')
  public set selectedPath(selectedPath: string | {
    selectedPath: string;
    separator: string;
    hideLeading: boolean
  }) {
    if (Object.getOwnPropertyNames(selectedPath).includes('length')) {
      const useSelectedPath = selectedPath as string;
      if (!!useSelectedPath && this.view.selectedPath !== useSelectedPath) {
        this._lastSelectedPathInput = useSelectedPath;
        const paths = this._pathMap.filter(p => p.path === useSelectedPath);
        if (paths.length === 1) {
          this.view.selectedPath = paths[0].path;
          this._lastSelectedPathInput = false;
        } else if (paths.length > 1) {
          throw new Error('EXC');
        }
      }
    } else {
      const options = selectedPath as {
        selectedPath: string;
        separator: string;
        hideLeading: boolean
      };
      this.setPathFormat(options.separator, options.hideLeading);
      if (!!options.selectedPath && this.view.selectedPath !== options.selectedPath) {
        this._lastSelectedPathInput = options.selectedPath;
        const paths = this._pathMap.filter(p => p.path === options.selectedPath);
        if (paths.length === 1) {
          this.view.selectedPath = paths[0].path;
          this._lastSelectedPathInput = false;
        } else if (paths.length > 1) {
          throw new Error('EXC');
          // this.view.selectedPath = paths[0].path;
        }
        // this.view.selectedPath = selectedPath;
      }
    }
  }

  @Input('noSelectionPlaceholder')
  public set noSelectionPlaceholder(noSelectionPlaceholder: string) {
    this.view.noSelectionPlaceholder = noSelectionPlaceholder;
  }

  @Input('noSelectionIcon')
  public set noSelectionIcon(noSelectionIcon: string) {
    this.view.noSelectionIcon = noSelectionIcon;
  }

  @Input('allowSelectNone')
  public set allowSelectNone(allowSelectNone: boolean) {
    this.view.allowSelectNone = allowSelectNone;
  }

  // @Input('pathSeparator')
  // public pathSeparator = '/';

  // @Input('pathFormat')
  // public set pathFormat(pathFormat: {
  //   separator: string;
  //   hideLeading: boolean;
  // }) {
  //   this._pathFormat.separator = pathFormat.separator;
  //   this._pathFormat.hideLeading = pathFormat.hideLeading;
  //   this._pathMap = this.mapPaths();
  //   if (this._lastSelectedPathInput !== false) {
  //     const resources = this.view.resources;
  //     const pathSegments = this._lastSelectedPathInput.split(this._pathFormat.separator).reverse();
  //     let member = resources.find(r => r.name === pathSegments.pop());
  //     let pathText = this._pathFormat.hideLeading ? '' : this._pathFormat.separator;
  //     let isFirst = true;
  //     while (pathSegments.length > 0 && !!member) {
  //       if (isFirst) {
  //         if (this._pathFormat.hideLeading) {
  //           pathText += member.name;
  //         } else {
  //           pathText += this._pathFormat.separator + member.name;
  //         }
  //         isFirst = false;
  //       } else {
  //         pathText += this._pathFormat.separator + member.name;
  //       }
  //       const ps = pathSegments.pop();
  //       member = resources.find(r => r.name === ps);
  //     }
  //     if (!!member) {
  //       this.view.selectedId = member.id;
  //       this.view.selectedPath = !!pathText ? pathText + this._pathFormat.separator + member.name : member.name;
  //     }
  //     this._lastSelectedPathInput = false;
  //     // this.on.selectResource(this._lastSelectedPathInput, true);
  //   }
  //   // this.pushResources(this._inputResources);
  //   // this.updateSelectedPath();
  // }

  @Output('selection')
  public readonly selection = new EventEmitter<string>();

  public view = {
    expandedResources: new Array<string>(),
    visibleResources: new Array<string>(),
    selectedId: '',
    selectedPath: '',
    resources: new Array<{
      name: string,
      icon: string,
      isContainer: boolean,
      level: number,
      id: string,
      parent: string
    }>(),
    formActive: false,
    containerIcon: '',
    itemIcon: '',
    allowContainerSelection: false,
    noSelectionPlaceholder: '--',
    noSelectionIcon: '',
    allowSelectNone: false
  }

  public on = {
    expandContainer: (id: string) => {
      const index = this.view.expandedResources.indexOf(id);
      if (index === -1) {
        this.view.expandedResources.push(id);
        this.recomputeVisibilities();
      }
    },
    collapseContainer: (id: string) => {
      const index = this.view.expandedResources.indexOf(id);
      if (index > -1) {
          this.view.expandedResources.splice(index, 1);
          this.recomputeVisibilities();
      }
    },
    selectResource: (id: string) => {
      const resource = this.view.resources.find(r => r.id === id);
      if (!resource.isContainer || this.view.allowContainerSelection) {
        this.view.selectedId = id;
        this.view.formActive = false;
        this.updateSelectedPath();
        this.selection.emit(id);
      }
    },
    selectNone: () => {
      this.view.selectedId = '';
      this.view.formActive = false;
      this.updateSelectedPath();
      this.selection.emit('');
    },
    toggleForm: () => {
      this.view.formActive = !this.view.formActive;
    }
  }
  constructor() { }

  ngOnInit() {
  }

  private updateSelectedPath(): void {
    if (!!this.view.selectedId) {
      const selectedRsrc = this.view.resources.find(r => r.id === this.view.selectedId);
      const hierarchy = this._resourceHierarchies.find(h => h.id === this.view.selectedId);
      let fullPath = selectedRsrc.name;
      hierarchy.path.forEach(h => {
        if (h === this._ROOT_ID) {
          fullPath = this._pathFormat.hideLeading ? fullPath : `${this._pathFormat.separator}${fullPath}`;
        } else {
          const r = this.view.resources.find(rsrc => rsrc.id === h);
          fullPath = `${r.name}${this._pathFormat.separator}${fullPath}`;
        }
      })
      this.view.selectedPath = fullPath;
    } else {
      this.view.selectedPath = '';
    }
  }

  private mapPaths(): Array<{ path: string, id: string }> {
    const paths = new Array<{ path: string, id: string }>();
    // if (!!this.view.selectedId) {
      this.view.resources.map(r => {
        const hierarchy = this._resourceHierarchies.find(h => h.id === r.id);
        let fullPath = r.name;
        hierarchy.path.forEach(h => {
          if (h === this._ROOT_ID) {
            fullPath = this._pathFormat.hideLeading ? fullPath : `${this._pathFormat.separator}${fullPath}`;
          } else {
            const r = this.view.resources.find(rsrc => rsrc.id === h);
            fullPath = `${!!r ? r.name : ''}${this._pathFormat.separator}${fullPath}`;
          }
        })
        paths.push({
          path: fullPath,
          id: r.id
        })
      })
      return paths;
      // this.view.selectedPath = fullPath;
    // } else {
    //   this.view.selectedPath = '';
    // }
  }

  private pushResources(resources: Array<TreeSelectMember>): void {
    // this._inputResources = resources;
    const models = resources.map(r => {
      return {
        name: r.name,
        icon: r.isContainer ? this.containerIcon : this.itemIcon,
        isContainer: r.isContainer,
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

    this.view.resources = models;
    this._resourceHierarchies = hierarchies;
    this.view.expandedResources = [this._ROOT_ID];
    this._pathMap = this.mapPaths();
    this.recomputeVisibilities();
  }

  private recomputeVisibilities(): void {
    const visibleResources = new Array<string>();
    this._resourceHierarchies.forEach(h => {
      const isParentExpanded = h.path.every(p => this.view.expandedResources.includes(p));
      if (isParentExpanded) {
        visibleResources.push(h.id);
      }
    })
    this.view.visibleResources = visibleResources;
  }

  private setPathFormat(separator: string, hideLeading: boolean) {
    this._pathFormat.separator = separator;
    this._pathFormat.hideLeading = hideLeading;
    this._pathMap = this.mapPaths();
    if (this._lastSelectedPathInput !== false) {
      const resources = this.view.resources;
      const pathSegments = this._lastSelectedPathInput.split(this._pathFormat.separator).reverse();
      let member = resources.find(r => r.name === pathSegments.pop());
      let pathText = this._pathFormat.hideLeading ? '' : this._pathFormat.separator;
      let isFirst = true;
      while (pathSegments.length > 0 && !!member) {
        if (isFirst) {
          if (this._pathFormat.hideLeading) {
            pathText += member.name;
          } else {
            pathText += this._pathFormat.separator + member.name;
          }
          isFirst = false;
        } else {
          pathText += this._pathFormat.separator + member.name;
        }
        const ps = pathSegments.pop();
        member = resources.find(r => r.name === ps);
      }
      if (!!member) {
        this.view.selectedId = member.id;
        this.view.selectedPath = !!pathText ? pathText + this._pathFormat.separator + member.name : member.name;
      }
      this._lastSelectedPathInput = false;
      // this.on.selectResource(this._lastSelectedPathInput, true);
    }
    // this.pushResources(this._inputResources);
    // this.updateSelectedPath();
  }

  private _lastSelectedPathInput: string | false = false;
  // private _inputResources = new Array<TreeSelectMember>();
  private _pathMap = new Array<{ path: string, id: string }>();
  private _resourceHierarchies: Array<{
    id: string;
    path: Array<string>;
  }>;

  private readonly _pathFormat = {
    separator: '/',
    hideLeading: false
  };
  private readonly _ROOT_ID = '_root_';
}
