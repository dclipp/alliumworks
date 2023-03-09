// import { Injectable } from '@angular/core';
// import { lib } from './lib-imports';

// @Injectable({
//   providedIn: 'root'
// })
// export class ShellUiServiceOLD {
//     public addPage(model: {
//         readonly key: string;
//         readonly title: string;
//         readonly logEntries: Array<{
//             readonly type: 'error' | 'info' | 'warning';
//             readonly timestamp: number;
//             readonly message: string;
//             readonly icon?: string;
//         }>;
//         readonly inputHistory: {
//             readonly pageKey: string;
//             readonly inputs: Array<string>;
//         };
//         readonly inputEnabled: boolean;
//     }): void {
//         this._libsvc.addPage(model);
//     }

//     constructor() {
//         this._libsvc = new (lib as any)['ShellUiService']();
//     }

//     private readonly _libsvc: any | null = null;
// }