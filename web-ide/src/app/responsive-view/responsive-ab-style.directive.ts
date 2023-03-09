// import { Directive, OnInit, AfterViewInit, ElementRef, Input, OnDestroy } from '@angular/core';
// import { ResponsiveViewService } from '../services/responsive-view.service';

// @Directive({
//     selector: '[rx-style]'
// })
// export class ResponsiveAbStyleDirective implements AfterViewInit, OnDestroy {
//     public ngAfterViewInit(): void {
//         const when = this._ref.nativeElement.getAttribute('rx-style');
//         if (!!when) {
//             const c = ResponsiveAbStyleDirective.parseCondition(when);
//             this._handle = ResponsiveViewService.bindResponsiveStyle(c.group, c.type, () => {
//                 return this._ref.nativeElement;
//             })
//         } else {
//             console.log(`NO ATTR`)
//             // throw this._ref.nativeElement.in'';//TODO ??
//         }
//     }

//     public ngOnDestroy(): void {
//         if (!!this._handle) {
//             ResponsiveViewService.unbindCondition(this._handle);
//         }
//     }

//     public constructor(private _ref: ElementRef<HTMLElement>) {

//     }

//     private _handle = '';

//     private static parseCondition(when: string): {
//         readonly group: string,
//         readonly type: 'compact' | 'tiny'
//     } {
//         const s = when.split('.');
//         return {
//             group: s[0],
//             type: s[1] as 'compact' | 'tiny'
//         }
//     }
// }