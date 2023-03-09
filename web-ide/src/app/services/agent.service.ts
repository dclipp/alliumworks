import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { UserPreferencesModel } from '../data-models/user-preferences-model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, distinctUntilChanged, debounceTime, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  public toPreferredDateTimeFormat(value: number): string {
    let isoString = new Date(value).toISOString();
    if (this._currentPrefs.preferTimestampsInUTC !== true) {
      const d = new Date(value);
      isoString = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())).toISOString();
    }
    return isoString.replace(/[TZ]/g, ' ');
  }

  public shellTopVarChanged(): Observable<number> {
    return this._shellTopVar.pipe(filter(x => x > -1), distinctUntilChanged());
  }
  
  public setShellTopVar(value: number): void {
    this._shellTopVar.next(value);
  }

  public optAltKeyName(): string {
    if (navigator.platform.toLowerCase().startsWith('mac')) {
      return 'Option';
    } else {
      return 'Alt';
    }
  }

  public windowResized(): Observable<{ readonly w: number, readonly h: number }> {
    return this._resized.pipe(
      filter(x => x !== null),
      debounceTime(250),
      distinctUntilChanged((x, y) => { return !!x === !!y && x.w === y.w && x.h === y.h }));
  }

  public get locale(): string {
    return 'default_default'; // TODO
  }

  public popupGainedFocus(): Observable<string> {
    return this._focusedPopupKey.pipe(filter(x => !!x));
  }

  public popupLostFocus(): Observable<string> {
    return this._focusLost.pipe(filter(x => !!x));
  }
  
  constructor(private _sessionService: SessionService) {
    this._sessionService.onUserPrefsChanged().subscribe(up => {
      this._currentPrefs = up;
    });
    
    this._sessionService.platform.workspaceManager.activeWorkspace().subscribe(activeWorkspace => {
      if (!!activeWorkspace) {
        document.title = `${activeWorkspace.title} | AlliumWorks`;
      } else {
        document.title = 'AlliumWorks';
      }
    });

    window.addEventListener('resize', () => {
      this._resized.next({
        w: window.innerWidth,
        h: window.innerHeight
      })
    });

    this._resized.next({
      w: window.innerWidth,
      h: window.innerHeight
    });

    window.addEventListener(AgentService.CSTEVT_POPUP_FOCUS_GAINED, (event) => {
      this.setFocusedPopupKey((event as any).detail.popupKey);
    });

    window.addEventListener(AgentService.CSTEVT_POPUP_FOCUS_LOST, (event) => {
      this.setFocusedPopupKey('');
    });
    
    window.addEventListener(AgentService.CSTEVT_MAIN_WINDOW_FOCUS_GAINED, () => {
      this.setFocusedPopupKey('');
    });
  }

  private setFocusedPopupKey(nextKey: string): void {
    this._focusedPopupKey.pipe(take(1)).subscribe(focusedPopupKey => {
      if (!!focusedPopupKey) {
        this._lastFocusedPopupKey = focusedPopupKey;
      } else {
        this._lastFocusedPopupKey = '';
      }
      if (!!this._lastFocusedPopupKey) {
        this._focusLost.next(this._lastFocusedPopupKey);
      }
      this._focusedPopupKey.next(nextKey);
    });
  }

  private _currentPrefs: UserPreferencesModel = {};
  private readonly _resized = new BehaviorSubject<{ readonly w: number, readonly h: number }>(null);
  private readonly _shellTopVar = new BehaviorSubject<number>(-1);
  private _lastFocusedPopupKey = '';
  private readonly _focusLost = new BehaviorSubject<string>('');
  private readonly _focusedPopupKey = new BehaviorSubject<string>('');
  
  public static readonly CSTEVT_POPUP_FOCUS_GAINED = 'aw_popup_focus_gained';
  public static readonly CSTEVT_POPUP_FOCUS_LOST = 'aw_popup_focus_lost';
  public static readonly CSTEVT_MAIN_WINDOW_FOCUS_GAINED = 'aw_main_window_focus_gained';
}
