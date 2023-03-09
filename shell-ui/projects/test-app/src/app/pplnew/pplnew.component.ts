import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'testapp-pplnew',
  templateUrl: './pplnew.component.html',
  styleUrls: ['./pplnew.component.css']
})
export class PplNewComponent implements AfterViewInit {

  public view = {
    // itemsOLD: new Array<{
    //   readonly id: string;
    //   readonly parentId: string;
    //   readonly text: string;
    //   readonly hasChildren: boolean;
    // }>(),
    // items2OLD: new Array<{
    //   readonly ancestry: string;
    //   readonly fullPath: string;
    //   readonly id: string;
    //   readonly parentId: string;
    //   readonly text: string;
    //   // readonly hasChildren: boolean;
    //   isVisible: boolean;
    // }>(),
    items: new Array<{
      readonly id: string;
      readonly parentId: string;
      readonly text: string;
      readonly hasChildren: boolean;
      isVisible: boolean;
    }>(),
    expandedIds: new Array<string>(),
    activeItemId: ''
  }
  
  public on = {
    expandRow: (id: string) => {
      this.view.expandedIds.push(id);

      this.view.items.filter(i => i.parentId === id).forEach(i => {
        i.isVisible = true;
      });

      // this.view.items.forEach((item, index) => {
      //   if (!item.isVisible && item.ancestry.split('.').includes(id)) {
          
      //   }
      // })
    },
    collapseRow: (id: string) => {
      this.view.expandedIds = this.view.expandedIds.filter(eId => eId !== id);

      const hideDescendants = (parentId: string) => {
        this.view.items.filter(i => i.parentId === parentId).forEach(i => {
          i.isVisible = false;
          if (i.hasChildren) {
            hideDescendants(i.id);
          }
        })
      }

      hideDescendants(id);

      
      // if (!!this.view.activeItemId) {
      //   // const mostVisibleIdInSubTree = this.getMostVisibleIdInSubTree(this.view.activeItemId);
      //   // if (mostVisibleIdInSubTree !== this.view.activeItemId) {
      //   //   this.view.activeItemId = mostVisibleIdInSubTree;
      //   // }
      // }
    }
  }

  constructor() { }

  ngAfterViewInit(): void {
    window['SelectItm'] = (x: string) => {
      this.view.activeItemId = x
    }
    window.setTimeout(() => {
      this.view.items = this.mapItems([{
        id: 'i0',
        parentId: '',
        text: 'Item 0',
        hasChildren: false
      }, {
        id: 'i1',
        parentId: '',
        text: 'Item 1',
        hasChildren: true
      }, {
        id: 'i2',
        parentId: '',
        text: 'Item 2',
        hasChildren: true
      }, {
        id: 'i1.0',
        parentId: 'i1',
        text: 'Item 1 Child 0',
        hasChildren: false
      }, {
        id: 'i1.1',
        parentId: 'i1',
        text: 'Item 1 Child 1',
        hasChildren: true
      }, {
        id: 'i1.1.0',
        parentId: 'i1.1',
        text: 'Item 1 Child 1 Sub 0',
        hasChildren: false
      }, {
        id: 'i1.1.1',
        parentId: 'i1.1',
        text: 'Item 1 Child 1 Sub 1',
        hasChildren: false
      }, {
        id: 'i2.0',
        parentId: 'i2',
        text: 'Item 2 Child 0',
        hasChildren: false
      }])

      // this.view.expandedIds = this.view.items.filter(i => i.parentId === '').map(i=>i.id);
    })
  }

  private isRowVisible(id: string): boolean {
    let row = this.view.items.find(i => i.id === id);
    let notVisible = false;
    while (!!row && !notVisible) {
      const isTopLevel = row.parentId === '';
      notVisible = !isTopLevel && !this.view.expandedIds.includes(row.parentId);
      row = isTopLevel ? undefined : this.view.items.find(i => i.id === row.parentId);
    }

    return !notVisible;
  }

  private getMostVisibleIdInSubTree(id: string): string {
    let row = this.view.items.find(i => i.id === id);
    let mvId: string | null = null;
    while (mvId === null && !!row) {
      if (this.isRowVisible(row.id)) {
        mvId = row.id;
      } else if (!!row.parentId) {
        row = this.view.items.find(i => i.id === row.parentId);
      } else {
        mvId = '';
      }
    }
    
    return mvId === null ? '' : mvId;
  }

  private mapItems(allItems: Array<{readonly id: string,readonly parentId: string, readonly text: string,readonly hasChildren: boolean}>): Array<{
  // private mapItems(allItems: Array<PopoverItemModel2>): Array<{
    readonly id: string;
    readonly parentId: string;
    readonly text: string;
    readonly hasChildren: boolean;
    isVisible: boolean;
  }> {
    // const list = allItems.map(i => {
    return allItems.map(i => {
      return {
        id: i.id,
        parentId: i.parentId,
        text: i.text,
        hasChildren: i.hasChildren,
        isVisible: i.parentId === ''
      }
    }).sort((a, b) => {
      if (!!a.parentId === !!b.parentId) {
        return a.text.localeCompare(b.text);
        // if (a.parentId === b.parentId) {
        //   return a.text.localeCompare(b.text);
        // } else {

        // }
      } else if (!!a.parentId) {
        return 1;
      } else {
        return -1;
      }
    });

    // const getSortedChildren = (itemId: string) => {
    //   const children = list.filter(i => i.parentId === itemId);
    //   return children.map(child => {
    //     const x = [child].concat(...getSortedChildren(child.id))
    //     return x;
    //   })
    // }
  }

  private mapToKeyedItems(allItems: Array<{
    readonly id: string;
    readonly parentId: string;
    readonly text: string;
  }>): Array<{
    readonly ancestry: string;
    readonly fullPath: string;
    readonly id: string;
    readonly parentId: string;
    readonly text: string;
  }> {
    // const keyedItems = new Array<{
    //   ancestry: string;
    //   readonly id: string;
    //   readonly parentId: string;
    //   readonly text: string;
    // }>();

    const keyedItems: Array<{
      ancestry: string | null;
      fullPath: string | null;
      readonly id: string;
      readonly parentId: string;
      readonly text: string;
    }> = allItems.map(i => {
      return {
        ancestry: null,
        fullPath: null,
        id: i.id,
        parentId: i.parentId,
        text: i.text
      }
    });

    const buildAncestry = (_id: string, _parentId: string) => {
      let anc = new Array<string>();
      anc.push(_id);
      if (!!_parentId) {
        const parent = allItems.find(i => i.id === _parentId);
        anc = anc.concat(...buildAncestry(parent.id, parent.parentId));
      }

      return anc;
    }

    keyedItems.forEach(ki => {
      const ancestryArr = buildAncestry(ki.id, ki.parentId);
      ki.ancestry = ancestryArr.slice(0, Math.max(1, ancestryArr.length - 1)).join('.');
      ki.fullPath = ancestryArr.join('.');
    });
    
    return keyedItems;
    // let row = this.view.items.find(i => i.id === id);
    // let mvId: string | null = null;
    // while (mvId === null && !!row) {
    //   if (this.isRowVisible(row.id)) {
    //     mvId = row.id;
    //   } else if (!!row.parentId) {
    //     row = this.view.items.find(i => i.id === row.parentId);
    //   } else {
    //     mvId = '';
    //   }
    // }
    
    // return mvId === null ? '' : mvId;
  }
}
