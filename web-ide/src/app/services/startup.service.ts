import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { AppEntry } from '../app-entry';
// import { BackendConfig } from './backend/backend-config';

@Injectable({
  providedIn: 'root'
})
export class StartupService {

  public isPlayground(): Observable<boolean> {
    return this._isPlayground.pipe(filter(x => x !== null), distinctUntilChanged());
  }

  constructor() {
    this._isPlayground.next(AppEntry.isPlaygroundOnly);
  }

  private readonly _isPlayground = new BehaviorSubject<boolean | null>(null);
}
