import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { BackendConfig } from './app/services/backend/backend-config';
// import { EntryAssets } from './app/data-models/asset/entry-assets';
import { AppEntry } from './app/app-entry';

if (environment.production) {
  enableProdMode();
}

const validatedParams: { [key: string]: string } = {};
// if (!!window.location.search) {
//   const params = window.location.search.substring(1).split('&').map(qp => {
//     const kvp = qp.split('=');
//     return {
//       key: kvp[0].toLowerCase(),
//       value: kvp[1]
//     }
//   });

//   let foundInvalid = false;
//   for (let pi = 0; pi < params.length && !foundInvalid; pi++) {
//     const p = params[pi];
//     const qDef = environment.allowedQueries.find(aq => aq.name.toLowerCase() === p.key);
//     if (!!qDef) {
//       if (qDef.richText) {
//         validatedParams[p.key] = decodeURIComponent(p.value);
//       } else if (p.value.match(/([a-zA-Z0-9_]+)/)) {
//         validatedParams[p.key] = p.value;
//       } else {
//         foundInvalid = true;
//       }
//     } else {
//       foundInvalid = true;
//     }
//   }

//   if (foundInvalid) {
//     window.location.assign('/');
//   }
// }

BackendConfig.load(validatedParams).then((envJson) => {
  const userAuth: string | undefined = undefined; //TODO
  AppEntry.loadEnv(envJson);
  AppEntry.initializeAlliumWorks(envJson, userAuth).then(() => {
    window['TSTgetPlatform'] = () => AppEntry.alliumWorksPlatform;
    if (!!document.location.search && document.location.search.includes('use_ionicons')) {
      window['_wide_use_ionicons'] = true;
    } else {
      console.warn('Not using ionicons (WIP: replace all icons). Add query "use_ionicons" to enable ionicons.');
    }

    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));
  })
})

