import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPopperModule } from 'ngx-popper';
import { ShellUiModule, ShellUiService } from 'shell-ui';

import { AppComponent } from './app.component';
import { IconComponent } from './common-elements/icon/icon.component';
import { ModalComponent } from './common-elements/modal/modal.component';
import { TabBarComponent } from './sections/right/tab-bar/tab-bar.component';
import { RightSectionComponent } from './sections/right/right-section/right-section.component';
import { GenericFileEditorComponent } from './sections/right/generic-file-editor/generic-file-editor.component';
import { ToolbarComponent } from './sections/top/toolbar/toolbar.component';
import { TopSectionComponent } from './sections/top/top-section/top-section.component';
import { ComputerControlsComponent } from './sections/top/computer-controls/computer-controls.component';
import { ComputerPresetsManagerComponent } from './sections/right/computer-presets-manager/computer-presets-manager.component';
import { RegisterExplorerComponent } from './sections/bottom/register-explorer/register-explorer.component';
import { TaskBarComponent } from './sections/bottom/task-bar/task-bar.component';
import { PanelContainerComponent } from './sections/bottom/panel-container/panel-container.component';
import { ByteSequencePipe } from './common-elements/pipes/byte-sequence.pipe';
import { DeviceBrowserComponent } from './sections/left/device-browser/device-browser.component';
import { DeviceHomepageComponent } from './sections/right/device-homepage/device-homepage.component';
import { RadixPrefixPipe } from './common-elements/pipes/radix-prefix-pipe';
import { ByteSequenceEditorComponent } from './common-elements/byte-sequence-editor/byte-sequence-editor.component';
import { LeftSectionComponent } from './sections/left/left-section/left-section.component';
import { WorkspaceBrowserComponent } from './sections/left/workspace-browser/workspace-browser/workspace-browser.component';
import { BrowserButtonBarComponent } from './sections/left/browser-button-bar/browser-button-bar.component';
import { WorkspacesListComponent } from './sections/left/workspace-browser/workspaces-list/workspaces-list.component';
import { DeletedWorkspacesListComponent } from './sections/left/workspace-browser/deleted-workspaces-list/deleted-workspaces-list.component';
import { HistoriesListComponent } from './sections/left/workspace-browser/histories-list/histories-list.component';
import { MemoryExplorerContainerComponent } from './sections/bottom/memory-explorer/memory-explorer-container/memory-explorer-container.component';
import { MemoryExplorerSidebarComponent } from './sections/bottom/memory-explorer/memory-explorer-sidebar/memory-explorer-sidebar.component';
import { MemoryBrowserComponent } from './sections/bottom/memory-explorer/memory-browser/memory-browser.component';
import { MemoryWatchBrowserComponent } from './sections/bottom/memory-explorer/memory-watch-browser/memory-watch-browser.component';
import { MemorySearcherComponent } from './sections/bottom/memory-explorer/memory-searcher/memory-searcher.component';
import { CodeEditorViewComponent } from './sections/right/source-file-editor/code-editor-view/code-editor-view.component';
import { TactileSelectorComponent } from './common-elements/tactile-selector/tactile-selector.component';
import { SettingsEditorComponent } from './sections/right/settings-editor/settings-editor.component';
import { TreeSelectComponent } from './common-elements/tree-select/tree-select.component';
import { TreeSelectNEWComponent } from './common-elements/tree-selectnew/tree-select.component';
import { NoteComponent } from './common-elements/note/note.component';
import { MemoryTableComponent } from './sections/bottom/memory-explorer/memory-table/memory-table.component';
import { SourceFileEditorComponent } from './sections/right/source-file-editor/source-file-editor/source-file-editor.component';
import { ResponsiveCompactDirective } from './responsive-view/responsive-compact.directive';
import { ResponsiveTinyDirective } from './responsive-view/responsive-tiny.directive';
import { UserPreferencesManagerComponent } from './sections/left/user-preferences-manager/user-preferences-manager.component';
import { DeviceInstanceContainerNEWComponent } from './sections/bottom/device-instance-container-new/device-instance-container-new.component';
import { DeviceInstallationModalComponent } from './common-elements/modal/device-installation-modal/device-installation-modal.component';
import { FileUploadModalComponent } from './common-elements/modal/file-upload-modal/file-upload-modal.component';
import { RegularModalComponent } from './common-elements/modal/regular-modal/regular-modal.component';
import { ContextualToolbarComponent } from './sections/right/contextual-toolbar/contextual-toolbar.component';
import { InputAreaComponent as ShellInputAreaComponent } from './subcomponents/devkit-shell/view/input-area/input-area.component';
import { OutputAreaComponent as ShellOutputAreaComponent } from './subcomponents/devkit-shell/view/output-area/output-area.component';
import { ContainerComponent as ShellContainerComponent } from './subcomponents/devkit-shell/view/container/container.component';
import { CheckboxComponent } from './common-elements/checkbox/checkbox.component';
import { ChoiceListModalComponent } from './common-elements/modal/choice-list-modal/choice-list-modal.component';
import { ByteInputComponent } from './common-elements/byte-input/byte-input.component';
import { ResourceBrowserComponent } from './sections/left/resource-browser/resource-browser.component';
import { FloatingListComponent } from './subcomponents/devkit-shell/view/floating-list/floating-list.component';
import { CommonModule } from '@angular/common';
import { PackageEntitySelectionModalComponent } from './common-elements/modal/package-entity-selection-modal/package-entity-selection-modal.component';
import { ByteCountDisplayComponent } from './common-elements/byte-count-display/byte-count-display.component';

@NgModule({
  declarations: [
    AppComponent,
    IconComponent,
    ModalComponent,
    TabBarComponent,
    RightSectionComponent,
    GenericFileEditorComponent,
    ToolbarComponent,
    TopSectionComponent,
    ComputerControlsComponent,
    ComputerPresetsManagerComponent,
    RegisterExplorerComponent,
    TaskBarComponent,
    PanelContainerComponent,
    ByteSequencePipe,
    RadixPrefixPipe,
    DeviceBrowserComponent,
    DeviceHomepageComponent,
    ByteSequenceEditorComponent,
    LeftSectionComponent,
    WorkspaceBrowserComponent,
    BrowserButtonBarComponent,
    WorkspacesListComponent,
    DeletedWorkspacesListComponent,
    HistoriesListComponent,
    MemoryExplorerContainerComponent,
    MemoryExplorerSidebarComponent,
    MemoryBrowserComponent,
    MemoryWatchBrowserComponent,
    MemorySearcherComponent,
    CodeEditorViewComponent,
    TactileSelectorComponent,
    SettingsEditorComponent,
    TreeSelectComponent,
    TreeSelectNEWComponent,
    NoteComponent,
    MemoryTableComponent,
    SourceFileEditorComponent,
    ResponsiveCompactDirective,
    ResponsiveTinyDirective,
    UserPreferencesManagerComponent,
    DeviceInstanceContainerNEWComponent,
    DeviceInstallationModalComponent,
    FileUploadModalComponent,
    RegularModalComponent,
    ContextualToolbarComponent,
    ShellInputAreaComponent,
    ShellOutputAreaComponent,
    ShellContainerComponent,
    CheckboxComponent,
    ChoiceListModalComponent,
    ByteInputComponent,
    ResourceBrowserComponent,
    FloatingListComponent,
    PackageEntitySelectionModalComponent,
    ByteCountDisplayComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxPopperModule.forRoot(),
    CommonModule,
    ShellUiModule
  ],
  providers: [CommonModule, ShellUiService],
  bootstrap: [AppComponent],
  entryComponents: [IconComponent]
})
export class AppModule { }
