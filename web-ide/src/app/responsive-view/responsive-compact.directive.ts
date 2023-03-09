import { Directive, OnInit, AfterViewInit, ElementRef, Input, OnDestroy } from '@angular/core';
import { ResponsiveViewService } from '../services/responsive-view.service';

@Directive({
    selector: '[rx-compact]'
})
export class ResponsiveCompactDirective implements AfterViewInit, OnDestroy {
    public ngAfterViewInit(): void {
        const when = this._ref.nativeElement.getAttribute('rx-compact');
        if (!!when) {
            const c = ResponsiveCompactDirective.parseCondition(when);
            this._handle = ResponsiveViewService.bindResponsiveCondition(c.group, c.state, 'compact', () => {
                return this._ref.nativeElement;
            })
        }
    }

    public ngOnDestroy(): void {
        if (!!this._handle) {
            ResponsiveViewService.unbindCondition(this._handle);
        }
    }

    public constructor(private _ref: ElementRef<HTMLElement>) {

    }

    private _handle = '';

    private static parseCondition(when: string): {
        readonly group: string,
        readonly state: 'a' | 'b'
    } {
        if (when.startsWith('!')) {
            return {
                group: when.substring(1),
                state: 'b'
            }
        } else {
            return {
                group: when,
                state: 'a'
            }
        }
    }
}