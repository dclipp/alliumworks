import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { ShellUiModule } from './lib/shell-ui.module';

import { AppComponent } from './app.component';
import { IconComponent } from './icon/icon.component';
// import { lib } from './lib-imports';
import { ShellUiComponent, ShellUiModule, ShellUiService } from 'shell-ui';
import { PplNewComponent } from './pplnew/pplnew.component';

@NgModule({
  declarations: [
    AppComponent,
    IconComponent,
    PplNewComponent
  ],
  imports: [
    BrowserModule,
    ShellUiModule
  ],
  providers: [
    ShellUiService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ShellUiComponent]
})
export class AppModule { }
