import { Observable, Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';

export abstract class Aq4wComponent implements OnDestroy {
    public get destroyed(): Observable<number> {
        return this._subject;
    }

    public ngOnDestroy(): void {
        this._subject.next(new Date().valueOf());
        this._subject.complete();
    }

    private readonly _subject = new Subject<number>();
}