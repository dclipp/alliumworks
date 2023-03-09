import { Component, OnInit, Input } from '@angular/core';
import { ContentReference } from 'src/app/view-models/content/content-reference';
import { FormControl } from '@angular/forms';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { takeUntil, take, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { Assembly, AssemblySettings, BuildOptions, AssemblyEntryPoint, AssemblySourceImport } from '@allium/asm';
import { SourceMapModel } from 'src/app/view-models/settings-editor/source-map-model';
import { TreeSelectMember, TreeSelectMembeNEWr } from 'src/app/view-models/tree-select/tree-select-member';
import { ToolbarManagerService } from 'src/app/services/toolbar-manager.service';
import { ToolbarToolGroups } from 'src/app/view-models/toolbar/toolbar-tool-groups';
import { ToolbarButtonKeys } from 'src/app/view-models/toolbar/toolbar-button-keys';
import { SessionService } from 'src/app/services/session.service';
import { ModalService } from 'src/app/services/modal.service';
import { SourceImportModel } from 'src/app/view-models/settings-editor/source-import-model';
import { ActiveWorkspace, FsList } from '@alliumworks/platform';
import { joinPath, YfsFile, YfsStatus } from 'yfs';

@Component({
  selector: 'aq4w-settings-editor',
  templateUrl: './settings-editor.component.html',
  styleUrls: ['./settings-editor.component.scss']
})
export class SettingsEditorComponent extends Aq4wComponent implements OnInit {

  @Input('content')
  public set content(content: ContentReference) {
    this._componentContentKey = content.contentKey;
  }

  public view = {
    sourceMap: new SourceMapModel([{
      referenceName: 'Foo',
      filePath: '/foo.aq'
    }, {
      referenceName: 'Bar',
      filePath: '/bar.aq'
    }, {
      referenceName: 'Nested1',
      filePath: '/folderA/Nested1.aq'
    }, {
      referenceName: 'Nested2',
      filePath: '/folderB/Nested2.aq'
    }, {
      referenceName: 'Nested3',
      filePath: '/folderB/folderC/Nested3.aq'
    }]),
    binaryBlockMap2: new Array<TreeSelectMembeNEWr>(),
    entryPointMap: new Array<TreeSelectMembeNEWr>(),
    entryPoint: new FormControl(),
    assemblyName: new FormControl(undefined, (abstractControl) => {
      if (abstractControl.pristine || (!!abstractControl.value && !!abstractControl.value.trim())) {
        if (RegExp(/^[_a-zA-Z][_a-zA-Z0-9]{0,}$/).test(abstractControl.value)) {
          return null;
        } else {
          return {
            'message': 'Assembly name contains invalid character(s)'
          }
        }
      } else {
        return {
          'message': 'Assembly name is required'
        }
      }
    }),
    oversizedInlineValueSizing: new FormControl(undefined),
    treatOversizedInlineValuesAsWarnings: new FormControl(),
    isDirty: false,
    assemblyJson: new FormControl('', (abstractControl) => {
      let validationErrors = null;
      try {
        const errors = this.validateAssemblyJson(abstractControl.value);
        if (errors.length > 0) {
          validationErrors = {
            0: errors.join('\n')
          };
        }
      } catch (e) {
        validationErrors = {
          0: 'invalid JSON'
        }
      }

      return validationErrors;
    })
  }

  public show = {
    editor: false,
    rawEditor: false
  }

  public on = {
    addSourceFile: () => {
      this.view.sourceMap.addNew();
    },
    changeEntryPoint: (path: string) => {
      if (!!path) {
        const pathParts = path.split('::').filter(p => !!p);
        if (pathParts[0].startsWith('(')) {
          //::(/foo2.aq)::Foo2
          const sourceFilePath = pathParts[0].substring(1).substring(0, pathParts[0].length - 2);
          const sourceFilePathParts = sourceFilePath.split('/').filter(p => !!p);
          const defaultRefNameBase = sourceFilePathParts[sourceFilePathParts.length - 1].substring(0, sourceFilePathParts[sourceFilePathParts.length - 1].lastIndexOf('.')).replace(/[^a-zA-Z_]/g, '');
          let defaultRefName = defaultRefNameBase;
          let refNameSuffix = 0;
          while (this._currentSettings.sourceImports.some(si => si.referenceName.toLowerCase() === defaultRefName.toLowerCase())) {
            if (refNameSuffix === 0) {
              defaultRefName = `${defaultRefNameBase}1`;
              refNameSuffix++;
            } else {
              refNameSuffix++;
              defaultRefName = `${defaultRefNameBase}${refNameSuffix}`;
            }
          }

          const initialValue = this.view.entryPoint.value;
          this._modalService.launchModal(
            'Map source file',
            `^The file "${sourceFilePath}" is not currently included in the assembly and must be mapped before it can be used.^
            ^Please enter a reference name for "${sourceFilePath}"^
            ^>>referenceName,Reference Name,*[_a-zA-Z][_a-zA-Z0-9]{0,}*,${defaultRefName}<<^`,
            (affirmative, formValues) => {
              if (affirmative) {
                const chosenRefName = formValues['referenceName'];
                this.view.entryPoint.setValue(`${chosenRefName}.${pathParts[1]}`);
              } else {
                this._ignoreNextEntryPointEmission = true;
                this.view.entryPoint.setValue('refresh');
                setTimeout(() => {
                  this.view.entryPoint.setValue(initialValue);
                  setTimeout(() => {
                    this._ignoreNextEntryPointEmission = false;
                  }, 500);
                }, 650)
              }
            },
            { yes: 'Map and set entry point', no: 'Cancel' }, true);
        } else {
          this.view.entryPoint.setValue(`${pathParts[0]}.${pathParts[1]}`);
        }
      } else {
        this.view.entryPoint.setValue('');
      }
    },
    filePathChanged: (mapId: string, source: SourceImportModel) => {
      const bbm = this.view.binaryBlockMap2.find(b => b.id === mapId);
      if (!!bbm) {
        source.changePath(bbm.fullPath);
      }
    }
  }

  constructor(private _contentManagerService: ContentManagerService, private _sessionService: SessionService, private _toolbarService: ToolbarManagerService, private _modalService: ModalService) {
    super();
  }

  ngOnInit() {
    this._contentManagerService.onActiveContentChanged().pipe(takeUntil(this.destroyed)).subscribe(activeContentKey => {
      if (!!activeContentKey && activeContentKey === this._componentContentKey) {
        if (this._initialized) {
          if (!this.show.rawEditor) {
            this._toolbarService.setButtonStatus(ToolbarButtonKeys.ToggleRawEditor, false);
          }
        } else {
          this.initialize();
          this._initialized = true;
        }
      }
    })


    this.view.entryPoint.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(entryPointId => {
      if (!!this._currentAssembly && !!this._currentAssembly.sourceMap && !this._ignoreNextEntryPointEmission) {
        this.view.entryPoint.markAsDirty();
      }
    })

    combineLatest([
      this._sessionService.platform.workspaceManager.hasActiveWorkspace(),
      this._sessionService.platform.workspaceManager.activeWorkspaceUpdated()
    ])
    .pipe(debounceTime(500), takeUntil(this.destroyed))
    .subscribe(() => {
      this._sessionService.platform.workspaceManager.activeWorkspace().pipe(take(1)).subscribe(activeWorkspace => {
        this._activeWorkspace.next(activeWorkspace);
      })
    })

    this._sessionService.platform.workspaceManager.activeWorkspace().pipe(
      takeUntil(this.destroyed),
      debounceTime(350))
      .subscribe(workspace => {
        if (workspace === null) {
          this._currentSettings = undefined;
          this._workspaceRootDirPath = '';
        } else {
          this._workspaceRootDirPath = joinPath(workspace.absolutePath, FsList.WorkspaceResourcesDirectory);
          workspace.readFile(joinPath(FsList.WorkspaceResourcesDirectory, 'assembly.json')).then(settingsFile => {
            if (settingsFile.status === YfsStatus.OK) {
              this._currentSettings = AssemblySettings.fromJson(settingsFile.payload.content);
              this.loadForms();
              this.refreshSourceFileTree(workspace).then(() => {
                this.refreshEntryPointMap(this._currentSettings.sourceImports).then(() => {
                  this.show.editor = !this.show.rawEditor;
                });
              }).catch((err) => {
                console.error(`activeWorkspace pipe ERROR: ${err.message}`)
              });
            } else {
              this._currentSettings = undefined;
            }
          }).catch(() => {
            this._currentSettings = undefined;
          })
        }
      })
  }

  private refreshSourceFileTree(workspace: ActiveWorkspace | null): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!!workspace) {
          workspace.readDirectory(FsList.WorkspaceResourcesDirectory, true).then(fsList => {
            if (fsList.status === YfsStatus.OK) {
              const sourceFiles = new Array<{
                readonly name: string;
                readonly containerPath: string;
              }>();

              fsList.payload.filter(f => !f.isDirectory && (f as YfsFile).extension === 'aq').forEach(f => {
                sourceFiles.push({
                  name: f.publicName,
                  containerPath: f.containerPath
                })
              })

              const items = new Array<TreeSelectMembeNEWr & { parentPath: string }>();
              fsList.payload.forEach(f => {
                if (f.isDirectory || (f as YfsFile).extension === 'aq') {
                  let id = `fs${Math.random().toString().replace('0.', '')}`;
                  while (items.some(i => i.id === id)) {
                    id = `fs${Math.random().toString().replace('0.', '')}`;
                  }

                  items.push({
                    name: f.publicName,
                    isContainer: f.isDirectory,
                    id: `fs${Math.random().toString().replace('0.', '')}`,
                    parentId: undefined,
                    fullPath: joinPath(f.containerPath, f.publicName),
                    parentPath: f.containerPath
                  })
                }
              });

              const keyedItems = items.map(item => {
                return {
                  name: item.name,
                  isContainer: item.isContainer,
                  id: item.id,
                  parentId: item.parentPath === this._workspaceRootDirPath ? undefined : items.find(i => i.fullPath === item.parentPath).id,
                  fullPath: item.fullPath
                }
              })
              this.view.binaryBlockMap2 = keyedItems;
            }

            resolve();
          })
        } else {
          resolve();
        }
      } catch (err) {
        console.error(`refreshSourceFileTree ERROR: ${err.message}`)
        reject(err);
      }
    })
  }

  private refreshEntryPointMap(sourceImports: Array<AssemblySourceImport>): Promise<void> {
    return new Promise((resolve) => {
      this._sessionService.platform.assembler.blocks().pipe(take(1)).subscribe(blocks => {
        const objectItems = new Array<TreeSelectMembeNEWr>();
        const blockItems = blocks.filter(b => b.isIncluded).map(b => {
          const sourceImport = sourceImports.find(si => joinPath(this._workspaceRootDirPath, si.filePath) === b.filePath);
          const objectId = `::${sourceImport.referenceName}`;
          if (!objectItems.some(oi => oi.fullPath === objectId)) {
            objectItems.push({
              name: sourceImport.referenceName,
              isContainer: true,
              id: objectId,
              fullPath: objectId,
              parentId: undefined
            });
          }
          
          return {
            name: b.name,
            isContainer: false,
            id: `${objectId}::${b.name}`,
            fullPath: `${objectId}::${b.name}`,
            parentId: objectId
          }
        })

        this.view.entryPointMap = objectItems.concat(blockItems);
        resolve();
      })
    })
  }

  private loadForms(): void {
    if (this._loadFormsHandle === -1) {
      this._isDirty.next(false);
      console.log(`loadForms attempt:${this._loadFormsAttempt}`)

      if (!!this._currentSettings) {
        this._loadFormsAttempt = 0;
        this._loadFormsHandle = -1;
        this.view.sourceMap = new SourceMapModel(this._currentSettings.sourceImports, (isDirty) => {
          if (isDirty) {
            this._isDirty.next(true);
          }
        });
        this.refreshEntryPointMap(this._currentSettings.sourceImports).then(() => {
          this.view.entryPoint.setValue(this.getEntryPointValue(this._currentSettings), { emitEvent: false });
          this.view.assemblyName.setValue(this._currentSettings.assemblyName, { emitEvent: false });
          this.view.oversizedInlineValueSizing.setValue(this.getValueOfOversizedInlineValueSizing(this._currentOptions), { emitEvent: false });
          this.view.treatOversizedInlineValuesAsWarnings.setValue(!!this._currentOptions && this._currentOptions.treatOversizedInlineValuesAsWarnings === true, { emitEvent: false });

          this.view.assemblyName.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe(() => {
            this._isDirty.next(true);
          })
          this.view.entryPoint.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe(() => {
            if (!this._ignoreNextEntryPointEmission) {
              this._isDirty.next(true);
            }
          })
          this.view.oversizedInlineValueSizing.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe(() => {
            this._isDirty.next(true);
          })
          this.view.treatOversizedInlineValuesAsWarnings.valueChanges.pipe(takeUntil(this._instanceDestroyed)).subscribe(() => {
            this._isDirty.next(true);
          })
        });
        this.view.assemblyJson.setValue(JSON.stringify(JSON.parse(AssemblySettings.serialize(this._currentSettings)), null, 2), { emitEvent: false });
      } else if (this._loadFormsAttempt < 20) {
        this._loadFormsAttempt++;
        this._loadFormsHandle = window.setTimeout(() => { this.loadForms(); }, 500);
      }
    }
  }

  private initialize(): void {
    this._toolbarService.onButtonClicked().pipe(takeUntil(this._instanceDestroyed)).subscribe(buttonKey => {
      if (this._contentManagerService.getActiveContentDescriptor().contentKey === this._componentContentKey) {
        if (buttonKey === ToolbarButtonKeys.RevertFile) {
          this.loadForms();
        } else if (buttonKey === ToolbarButtonKeys.SaveFile) {
          this.saveChanges().then(() => {
            console.log('Saved');
          })
        } else if (buttonKey === ToolbarButtonKeys.ToggleRawEditor) {
          this.show.rawEditor = !this.show.rawEditor;
          this._toolbarService.setButtonState(ToolbarButtonKeys.ToggleRawEditor, true);
          this._toolbarService.setButtonStatus(ToolbarButtonKeys.ToggleRawEditor, this.show.rawEditor);
        }
      } else if (buttonKey === ToolbarButtonKeys.SaveAllFiles) {
        this.saveChanges();
      }
    })

    this._isDirty.pipe(takeUntil(this._instanceDestroyed), distinctUntilChanged()).subscribe(isDirty => {
      this.view.isDirty = isDirty;
      this._contentManagerService.changeContentStatus(this._componentContentKey, isDirty);
      this._toolbarService.setButtonStatesForGroup(ToolbarToolGroups.GroupNames.ASM_SETTINGS_OPTIONS, isDirty);
      this._toolbarService.setButtonState(ToolbarButtonKeys.ToggleRawEditor, true);
      this._toolbarService.setButtonStatus(ToolbarButtonKeys.ToggleRawEditor, this.show.rawEditor);
      if (!isDirty) {
        this.view.assemblyName.markAsPristine();
        this.view.entryPoint.markAsPristine();
        this.view.oversizedInlineValueSizing.markAsPristine();
        this.view.treatOversizedInlineValuesAsWarnings.markAsPristine();
      }
    })
    
    this.view.assemblyJson.valueChanges.subscribe(() => {
      this._isDirty.next(true);
    })
  }

  private extractBinaryBlockMap(assembly: Assembly): Array<TreeSelectMember> {
    const blockMap = new Array<TreeSelectMember>();
    if (!!assembly && !!assembly.sourceMap) {
      assembly.compilation.objects.forEach(o => {
        const objectMemberId = `_mem_${o.objectName}`;
        blockMap.push({
          name: o.objectName,
          isContainer: true,
          id: objectMemberId,
          parent: undefined
        });
        assembly.sourceMap.LINES.filter(ln => ln.objectName === o.objectName).map(ln => {
          const nameEntities = ln.entities.filter(e => e.kind === 'language-construct' && !!e.constructDetails && e.constructDetails !== 'none' && e.constructDetails.kind === 'block-name');
          if (nameEntities.length > 0) {
            return nameEntities.map(ne => {
              return {
                name: ne.text,
                isContainer: false,
                id: ne.id,
                parent: objectMemberId
              }
            })
          } else {
            return null;
          }
        }).filter(x => !!x).reduce((x, y) => x.concat(y), []).forEach(bn => {
          blockMap.push(bn);
        });
      })
    }
    return blockMap;
  }

  private async saveChanges(): Promise<void> {
    if (this.show.rawEditor) {
      if (this.validateAssemblyJson(this.view.assemblyJson.value).length === 0) {
        const o = JSON.parse(this.view.assemblyJson.value);
        const settings = AssemblySettings.build({
          assemblyName: o.assemblyName,
          entryPoint: this.parseEntryPoint(o.entryPoint),
          sourceImports: o.sourceImports,
          treatOversizedInlineValuesAsWarnings: o.treatOversizedInlineValuesAsWarnings,
          oversizedInlineValueSizing: o.treatOversizedInlineValuesAsWarnings === true
            ? this.getValueOfOversizedInlineValueSizing(o.oversizedInlineValueSizing)
            : undefined
        });
  
        this._currentSettings = undefined;
        this._currentAssembly = null;
        this._currentOptions = undefined;
        await this._sessionService.platform.assembler.updateSettings(settings);
      }
    } else if (this._isDirty.getValue() && this.view.assemblyName.valid && this.view.entryPoint.valid
      && this.view.oversizedInlineValueSizing.valid && this.view.treatOversizedInlineValuesAsWarnings.valid
      && this.view.sourceMap.valid) {
      const treatOversizedInlineValuesAsWarnings = this.view.treatOversizedInlineValuesAsWarnings.dirty
        ? this.view.treatOversizedInlineValuesAsWarnings.value === true
        : undefined;

      const settings = AssemblySettings.build({
        assemblyName: this.view.assemblyName.value,
        entryPoint: this.parseEntryPoint(this.view.entryPoint.value),
        sourceImports: this.view.sourceMap.models.filter(m => !m.isDeleted).map(m => {
          return {
            filePath: m.filePath,
            referenceName: m.referenceName
          }
        }),
        treatOversizedInlineValuesAsWarnings: treatOversizedInlineValuesAsWarnings,
        oversizedInlineValueSizing: treatOversizedInlineValuesAsWarnings === true && this.view.oversizedInlineValueSizing.dirty
          ? this.getValueOfOversizedInlineValueSizing(this.view.oversizedInlineValueSizing.value)
          : undefined
      });

      this._currentSettings = undefined;
      this._currentAssembly = null;
      this._currentOptions = undefined;
      await this._sessionService.platform.assembler.updateSettings(settings);
    }
  }

  private getValueOfOversizedInlineValueSizing(o: BuildOptions | string | undefined): 'quad' | 'tri' | 'double' | 'min-required' {
    let value = '';
    let testValue = '';
    if (!!o) {
      if (!!o['charAt']) { // string
        testValue = o as string;
      } else {
        const opts = o as BuildOptions;
        if (!!opts.oversizedInlineValueSizing) {
          testValue = opts.oversizedInlineValueSizing;
        }
      }
    }

    if (!!testValue) {
      value = testValue;
    }

    if (value === 'quad') {
      return 'quad';
    } else if (value === 'tri') {
      return 'tri';
    } else if (value === 'double') {
      return 'double';
    } else {
      return 'min-required';
    }
  }

  private parseEntryPoint(value: string): AssemblyEntryPoint | undefined {
    if (!!value) {
      const segments = value.split('.');
      return {
        objectName: segments[0],
        label: segments[1]
      };
    } else {
      return undefined;
    }
  }

  private getEntryPointValue(settings: AssemblySettings): string {
    if (!!settings.entryPoint) {
      return `::${settings.entryPoint.objectName}::${settings.entryPoint.label}`;
    } else {
      return '';
    }
  }

  private validateAssemblyJson(assemblyJson: string): Array<string> {
    const validationErrors = new Array<string>();
    try {
      const o = JSON.parse(assemblyJson);
      const assemblyName = o.assemblyName;
      if (!(!!assemblyName)) {
        validationErrors.push('assembly name is required');
      } else if (!RegExp(/^[_a-zA-Z][_a-zA-Z0-9]{0,}$/).test(assemblyName)) {
        validationErrors.push('invalid assembly name');
      }

      const oversizedInlineValueSizing = o.oversizedInlineValueSizing;
      if (oversizedInlineValueSizing !== undefined && !['quad', 'tri', 'double', 'min-required'].includes(oversizedInlineValueSizing)) {
        validationErrors.push('invalid value for oversizedInlineValueSizing');
      }

      const treatOversizedInlineValuesAsWarnings = o.treatOversizedInlineValuesAsWarnings;
      if (treatOversizedInlineValuesAsWarnings !== undefined && treatOversizedInlineValuesAsWarnings !== true && treatOversizedInlineValuesAsWarnings !== false) {
        validationErrors.push('invalid value for treatOversizedInlineValuesAsWarnings');
      }

      const sourceImports = o.sourceImports;
      if (!!sourceImports) {
        if (!Array.isArray(sourceImports)) {
          validationErrors.push('source import map must be an array');
        } else if (!(sourceImports.every(si => /^[_a-zA-Z][_a-zA-Z0-9]{0,}$/.test(si.referenceName) && true/*TODO validate path*/))) {
          validationErrors.push('invalid source import map');
        }
      }

      const entryPoint = o.entryPoint;
      if (!!entryPoint && !/^[_a-zA-Z][_a-zA-Z0-9]{0,}[ \t]{0,}\.[ \t]{0,}[_a-zA-Z][_a-zA-Z0-9]{0,}$/.test(entryPoint)) {
        validationErrors.push('invalid entry point');
      }
    } catch (ex) {
      validationErrors.push('invalid JSON');
    }

    return validationErrors;
  }

  private _loadFormsHandle = -1;
  private _loadFormsAttempt = 0;
  
  private _workspaceRootDirPath = '';
  private _initialized = false;
  private _ignoreNextEntryPointEmission = false;
  private _instanceDestroyed = new Subject<number>();
  private _currentOptions: BuildOptions = undefined;
  private _currentSettings: AssemblySettings = undefined;
  private _currentAssembly: Assembly = null;
  private _componentContentKey = '';
  private readonly _activeWorkspace = new BehaviorSubject<ActiveWorkspace | null>(null);
  private readonly _isDirty = new BehaviorSubject<boolean>(false);

}
