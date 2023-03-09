import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TextService {

  public getCodeEditorStrings(): Observable<{ readonly [key: string]: any }> {
    if (this._codeEditorStrings.getValue() === null) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          console.log('Response')
          
          this._codeEditorStrings.next(JSON.parse(xhr.responseText));
        }
      }
      xhr.open('GET', './assets/cm4a.strings.json', true);
      xhr.send();
    }

    return this._codeEditorStrings.pipe(filter(x => x !== null));
  }

  public deviceCategoryStrings(): Observable<{ readonly [key: string]: any }> {
    return this._deviceCategoryStrings;
  }

  constructor() { }

  private readonly _deviceCategoryStrings = new BehaviorSubject<{ readonly [key: string]: any }>({
    'input': 'Input',
    'output': 'Output'
  });
  private readonly _codeEditorStrings = new BehaviorSubject<{ readonly [key: string]: any } | null>(null);
}
