// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ResponsiveViewService {

//   public bindResponsiveCondition(elementGroup: string, state: 'a' | 'b', viewType: 'compact' | 'tiny', getElement: () => HTMLElement): string {

//   }

//   constructor() { }

//   private readonly _callbacks = new Array<[string, () => void]>();
// }


const allGroupNames = [
  'ComCtl',
  'ComCtlMore'
]

// TODO merge into AgentService
export class ResponsiveViewService {

  public static get GROUP_NAMES(): {
    readonly ComputerControls: string
  } {
    return {
      ComputerControls: allGroupNames[0]
    }
  }
  
  public static get CURRENT_TYPE(): 'full' | 'compact' | 'tiny' {
    return ResponsiveViewService._currentType;
  }

  public static bindResponsiveCondition(elementGroup: string, state: 'a' | 'b', viewType: 'compact' | 'tiny', getElement: () => HTMLElement): string {
    const handle = `rvs_${Math.random().toString().split('.')[1]}`;
    ResponsiveViewService._visibilityCallbacks.push({
      handle: handle,
      group: elementGroup,
      state: state,
      type: viewType,
      cb: (show) => {
        if (show) {
          getElement().removeAttribute(`data-responsive-hide-${viewType}`);
        } else {
          getElement().setAttribute(`data-responsive-hide-${viewType}`, 'true');
        }
      }
    })
    return handle;
  }

  public static unbindCondition(handle: string): void {
    if (handle.startsWith(ResponsiveViewService._HANDLE_PREFIX_STYLE)) {
      const i = ResponsiveViewService._styleCallbacks.findIndex(c => c.handle === handle);
      if (i > -1) {
        const c = ResponsiveViewService._styleCallbacks.splice(i, 1)[0];
        c.cb('none');
      }
    } else {
      const i = ResponsiveViewService._visibilityCallbacks.findIndex(c => c.handle === handle);
      if (i > -1) {
        const c = ResponsiveViewService._visibilityCallbacks.splice(i, 1)[0];
        c.cb(true);
      }
    }
  }

  public static bindResponsiveStyle(elementGroup: string, viewType: 'compact' | 'tiny', getElement: () => HTMLElement): string {
    const handle = `${ResponsiveViewService._HANDLE_PREFIX_STYLE}${Math.random().toString().split('.')[1]}`;
    ResponsiveViewService._styleCallbacks.push({
      handle: handle,
      group: elementGroup,
      type: viewType,
      cb: (state) => {
        if (state === 'none') {
          getElement().removeAttribute(`data-responsive-style-${viewType}`);
        } else {
          getElement().setAttribute(`data-responsive-style-${viewType}`, state);
        }
      }
    })
    return handle;
  }

  public static toggleGroup(group: string): 'a' | 'b' {
    let nextGroup: 'a' | 'b';
    const i = ResponsiveViewService._groupStates.findIndex(g => g.group === group);
    if (ResponsiveViewService._groupStates[i].state === 'a') {
      ResponsiveViewService._groupStates[i].state = 'b';
      ResponsiveViewService._visibilityCallbacks.filter(c => c.type === ResponsiveViewService._currentType && c.group === group).forEach(c => {
        if (c.state === 'b') {
          // show
          c.cb(true);
        } else {
          // hide
          c.cb(false);
        }
      })
      nextGroup = 'b';
    } else {
      ResponsiveViewService._groupStates[i].state = 'a';
      ResponsiveViewService._visibilityCallbacks.filter(c => c.type === ResponsiveViewService._currentType && c.group === group).forEach(c => {
        if (c.state === 'b') {
          // hide
          c.cb(false);
        } else {
          // show
          c.cb(true);
        }
      })
      nextGroup = 'a';
    }
    
    ResponsiveViewService._styleCallbacks.filter(c => c.type === ResponsiveViewService._currentType).forEach(c => {
      c.cb(nextGroup);
    })
    ResponsiveViewService.updateResponsiveStyleAttrs();

    return nextGroup;
  }

  public static setType(type: 'full' | 'compact' | 'tiny' = 'full'): void {
    ResponsiveViewService._currentType = type;
    if (type === 'full') {
      ResponsiveViewService._visibilityCallbacks.forEach(c => c.cb(true));
      ResponsiveViewService._styleCallbacks.forEach(c => c.cb('none'));
    } else {
      ResponsiveViewService._visibilityCallbacks.forEach(c => {
        if (c.type === type) {
          c.cb(ResponsiveViewService._groupStates.find(g => g.group === c.group).state === c.state);
        } else {
          c.cb(false);
        }
      })
      ResponsiveViewService._styleCallbacks.forEach(c => {
        if (c.type === type) {
          c.cb(ResponsiveViewService._groupStates.find(g => g.group === c.group).state);
        } else {
          c.cb('none');
        }
      })
    }
    ResponsiveViewService.updateResponsiveStyleAttrs();
  }

  private static updateResponsiveStyleAttrs(): void {
    ResponsiveViewService._groupStates.forEach(g => {
      if (ResponsiveViewService._currentType === 'full') {
        document.body.removeAttribute(`data-rx-group-${g.group}`);
        document.body.removeAttribute('data-responsive-type');
      } else {
        document.body.setAttribute(`data-rx-group-${g.group}`, g.state);
        document.body.setAttribute('data-responsive-type', ResponsiveViewService._currentType);
      }
    })
  }

  private static _currentType: 'full' | 'compact' | 'tiny' = 'full';

  private static readonly _HANDLE_PREFIX_STYLE = 'rvs_st_';
  
  private static readonly _groupStates: ReadonlyArray<{
    readonly group: string,
    state: 'a' | 'b'
  }> = [
    {
      group: allGroupNames[0],
      state: 'a'
    }
  ]

  private static readonly _styleCallbacks = new Array<{
    readonly handle: string,
    readonly group: string,
    readonly type: 'compact' | 'tiny',
    readonly cb: (state: 'none' | 'a' | 'b') => void
  }>();

  private static readonly _visibilityCallbacks = new Array<{
    readonly handle: string,
    readonly group: string,
    readonly state: 'a' | 'b',
    readonly type: 'compact' | 'tiny',
    readonly cb: (show: boolean) => void
  }>();
}
