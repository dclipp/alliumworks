import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { SidebarButtonBarButton } from '../view-models/sidebar/sidebar-button-bar-button';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  public onButtonBarButtonClicked(keys?: Array<string>): Observable<string> {
    if (!!keys && keys.length > 0) {
      return this._buttonBarBtnClicks.pipe(
        filter(x => x !== null && x !== undefined && (x === '' || keys.includes(x))),
        distinctUntilChanged());
    } else {
      return this._buttonBarBtnClicks.pipe(filter(x => x !== null && x !== undefined), distinctUntilChanged());
    }
  }

  public buttonBarButtonClicked(key: string): void {
    this._buttonBarBtnClicks.next(key);
    window.setTimeout(() => {
      this._buttonBarBtnClicks.next('');
    });
  }

  public onPendingChangeStatusChanged(): Observable<boolean> {
    return this._hasPendingChanges.pipe(distinctUntilChanged());
  }

  public changePendingChangeStatus(hasPendingChanges: boolean): void {
    this._hasPendingChanges.next(hasPendingChanges);
  }

  public onSelectionsCleared(): Observable<number> {
    return this._clearSelections.pipe(filter(x => x > -1), distinctUntilChanged());
  }

  public clearSelections(): void {
    this._clearSelections.next(new Date().valueOf());
  }

  public setDynamicState(buttonKey: string, stateKey?: string): void {
    const current = this._dynamicStates.getValue();
    const index = current.findIndex(c => c.buttonKey === buttonKey);
    let updated: Array<{ buttonKey: string, stateKey?: string }>;

    if (index > -1) {
      if (!!stateKey) {
        updated = current;
        updated[index].stateKey = stateKey;
      } else {
        updated = current.filter((c, i) => i !== index);
      }
    } else {
      if (!!stateKey) {
        updated = current;
        updated.push({ buttonKey: buttonKey, stateKey: stateKey });
      }
    }

    this._dynamicStates.next(updated);
  }

  public onDynamicStatesChanged(): Observable<Array<{ buttonKey: string, stateKey?: string }>> {
    return this._dynamicStates;
  }

  public loadCustomButtonSet(buttonSet: Array<SidebarButtonBarButton>): void {
    this._customButtonSets.next(buttonSet);
  }

  public clearCustomButtonSet(): void {
    this._customButtonSets.next('none');
  }

  public onCustomButtonSetChanged(): Observable<Array<SidebarButtonBarButton> | 'none'> {
    return this._customButtonSets.pipe(filter(x => x !== null), distinctUntilChanged());
  }

  constructor() { }

  private readonly _customButtonSets = new BehaviorSubject<Array<SidebarButtonBarButton> | 'none'>(null);
  private readonly _dynamicStates = new BehaviorSubject<Array<{ buttonKey: string, stateKey?: string }>>([]);
  private readonly _buttonBarBtnClicks = new BehaviorSubject<string>(null);
  private readonly _hasPendingChanges = new BehaviorSubject<boolean>(false);
  private readonly _clearSelections = new BehaviorSubject<number>(-1);
}
