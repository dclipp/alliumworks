import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreeSelectMembeNEWr } from 'src/app/view-models/tree-select/tree-select-member';
import { BehaviorSubject } from 'rxjs';
import { take, filter, distinctUntilChanged, switchMapTo, map, withLatestFrom, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'aq4w-tree-selectnew',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss']
})
export class TreeSelectNEWComponent implements OnInit {

  @Input('options')
  public set options(options: {
    separator: string,
    hideLeading: boolean,
    containerIcon?: string,
    itemIcon?: string
  }) {
    this._pathFormat2.next({
      separator: options.separator,
      hideLeading: options.hideLeading,
      containerIcon: options.containerIcon || '',
      itemIcon: options.itemIcon || ''
    });
  }

  @Input('items')
  public set items(members: Array<TreeSelectMembeNEWr>) {
    this._keyedItems = members.map(m => {
      return {
        name: m.name,
        fullPath: m.fullPath,
        isContainer: m.isContainer,
        id: m.id,
        parentId: m.parentId || this._ROOT_ID
      }
    });
    this.deferUntilReady(() => {
      this.pushItems(this._keyedItems);
    })
  }

  @Input('allowContainerSelection')
  public set allowContainerSelection(allowContainerSelection: boolean) {
    this.view.allowContainerSelection = allowContainerSelection;
  }

  @Input('selectedPath')
  public set selectedPath(selectedPath: string) {
    this._selectedPathInput.next({
      value: selectedPath,
      ts: Date.now()
    });
    // this.deferUntilReady(() => {
    //   const useSelectedPath = selectedPath as string;
    //   console.log(`useSelectedPath=${useSelectedPath}`)
    //   if (!!useSelectedPath && this.view.selectedPath !== useSelectedPath) {
    //     this._lastSelectedPathInput = useSelectedPath;
    //     const paths = this._pathMap.filter(p => p.path === useSelectedPath);
    //     if (paths.length === 1) {
    //       this.view.selectedPath = paths[0].path;
    //       this._lastSelectedPathInput = false;
    //     } else if (paths.length > 1) {
    //       throw new Error('EXC');
    //     }
    //   }
    // })
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

  @Output('selection')
  public readonly selection = new EventEmitter<string>();

  public view = {
    expandedItems: new Array<string>(),
    visibleItems: new Array<string>(),
    selectedId: '',
    selectedPath: '',
    items: new Array<{
      name: string,
      icon: string,
      isContainer: boolean,
      level: number,
      id: string,
      parentId: string
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
      const index = this.view.expandedItems.indexOf(id);
      if (index === -1) {
        this.view.expandedItems.push(id);
        this.recomputeVisibilities();
      }
    },
    collapseContainer: (id: string) => {
      const index = this.view.expandedItems.indexOf(id);
      if (index > -1) {
          this.view.expandedItems.splice(index, 1);
          this.recomputeVisibilities();
      }
    },
    selectItem: (id: string) => {
      const item = this.view.items.find(i => i.id === id);
      if (!item.isContainer || this.view.allowContainerSelection) {
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
    this._pathFormat2
      .pipe(
        filter(x => !!x),
        distinctUntilChanged((a, b) => a.hideLeading === b.hideLeading && a.separator === b.separator && a.containerIcon === b.containerIcon && a.itemIcon === b.itemIcon),
        withLatestFrom(this._deferredActions)).subscribe(([format, deferredActions]) => {
          this.view.containerIcon = format.containerIcon || '';
          this.view.itemIcon = format.itemIcon || '';
          this._deferredActions.next([]);
          deferredActions.forEach(da => da());
    })

    this._selectedPathInput.pipe(
      distinctUntilChanged((a, b) => a.ts === b.ts),
      debounceTime(500)).subscribe(input => {
        if (input.ts > -1) {
          const useSelectedPath = input.value;
          console.log(`useSelectedPath=${useSelectedPath}`)
          if (!!useSelectedPath && this.view.selectedPath !== useSelectedPath) {
            this._lastSelectedPathInput = useSelectedPath;
            const paths = this._pathMap.filter(p => this.getPathFormat().separator + p.path === useSelectedPath);
            if (paths.length === 1) {
              this.view.selectedPath = paths[0].path;
              this._lastSelectedPathInput = false;
            } else if (paths.length > 1) {
              // throw new Error('EXC');
            }
          } else if (useSelectedPath === '' && this.view.selectedPath !== '') {
            this._lastSelectedPathInput = false;
            this.view.selectedPath = '';
          }

          this._selectedPathInput.next({ value: input.value, ts: -1 });
        }
      })
  }

  private updateSelectedPath(): void {
    this.deferUntilReady(() => {
      if (!!this.view.selectedId) {
        const selectedRsrc = this.view.items.find(i => i.id === this.view.selectedId);
        const hierarchy = this._itemHierarchies.find(h => h.id === this.view.selectedId);
        let fullPath = selectedRsrc.name;
        const pathFormat = this.getPathFormat();
        hierarchy.path.forEach(h => {
          if (h === this._ROOT_ID) {
            fullPath = pathFormat.hideLeading ? fullPath : `${pathFormat.separator}${fullPath}`;
          } else {
            const r = this.view.items.find(itm => itm.id === h);
            fullPath = `${r.name}${pathFormat.separator}${fullPath}`;
          }
        })
        this.view.selectedPath = fullPath;
      } else {
        this.view.selectedPath = '';
      }
    });
  }

  private mapPaths(): Array<{ path: string, id: string }> {
    const paths = new Array<{ path: string, id: string }>();
    const pathFormat = this.getPathFormat();
    this.view.items.map(item => {
      const hierarchy = this._itemHierarchies.find(h => h.id === item.id);
      let fullPath = item.name;
      hierarchy.path.forEach(h => {
        if (h === this._ROOT_ID) {
          fullPath = pathFormat.hideLeading ? fullPath : `${pathFormat.separator}${fullPath}`;
        } else {
          const r = this.view.items.find(itm => itm.id === h);
          fullPath = `${!!r ? r.name : ''}${pathFormat.separator}${fullPath}`;
        }
      })
      paths.push({
        path: fullPath,
        id: item.id
      })
    })
    return paths;
  }

  private pushItems(items: Array<InternalTreeSelectMember>): void {
    this.deferUntilReady(() => {
      const pathFormat = this.getPathFormat();
      const models = items.map(i => {
        return {
          name: i.name,
          icon: i.isContainer ? pathFormat.containerIcon : pathFormat.itemIcon,
          isContainer: i.isContainer,
          level: -1,
          id: i.id,
          parentId: i.parentId
        };
      })

      const hierarchies = models.map((m, mi, ma) => {
        const findAncestorIds = (mId: string) => {
          const ancestorIds = new Array<string>();
          let currentM = ma.find(_m => _m.id === mId);
          while (!!currentM) {
            ancestorIds.push(currentM.parentId);
            if (currentM.parentId === this._ROOT_ID) {
              currentM = null;
            } else {
              currentM = ma.find(_m => _m.id === currentM.parentId);
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

      this.view.items = models;
      this._itemHierarchies = hierarchies;
      this.view.expandedItems = [this._ROOT_ID];
      this._pathMap = this.mapPaths();
      this.recomputeVisibilities();
    });
  }

  private recomputeVisibilities(): void {
    const visibleItems = new Array<string>();
    this._itemHierarchies.forEach(h => {
      const isParentExpanded = h.path.every(p => this.view.expandedItems.includes(p));
      if (isParentExpanded) {
        visibleItems.push(h.id);
      }
    })
    this.view.visibleItems = visibleItems;
  }

  private getPathFormat(): {
    separator: string,
    hideLeading: boolean,
    containerIcon: string,
    itemIcon: string
  } {
    return this._pathFormat2.getValue();
  }

  private deferUntilReady(action: () => void): void {
    this._pathFormat2.pipe(take(1), map(x => !!x)).subscribe(isReady => {
      if (isReady) {
        action();
      } else {
        this._deferredActions.pipe(take(1)).subscribe(deferredActions => {
          this._deferredActions.next(deferredActions.concat([() => {
            action();
          }]))
        })
      }
    })
  }

  private _keyedItems = new Array<InternalTreeSelectMember>();

  private _lastSelectedPathInput: string | false = false;
  private _pathMap = new Array<{ path: string, id: string }>();
  private _itemHierarchies: Array<{
    id: string;
    path: Array<string>;
  }>;

  private readonly _selectedPathInput = new BehaviorSubject<{ readonly value: string, readonly ts: number }>({
    value: '',
    ts: -1
  });
  private readonly _deferredActions = new BehaviorSubject<Array<() => void>>([]);
  private readonly _pathFormat2 = new BehaviorSubject<{
    separator: string,
    hideLeading: boolean,
    containerIcon: string,
    itemIcon: string
  } | null>(null);
  private readonly _ROOT_ID = '_root_';
}

type InternalTreeSelectMember = TreeSelectMembeNEWr & {
  id: string;
  parentId: string;
}