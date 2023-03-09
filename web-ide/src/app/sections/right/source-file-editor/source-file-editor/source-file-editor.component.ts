import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { ContentReference } from 'src/app/view-models/content/content-reference';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { takeUntil, distinctUntilChanged, filter, take, debounceTime, map, withLatestFrom } from 'rxjs/operators';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { ToolbarManagerService } from 'src/app/services/toolbar-manager.service';
import { ToolbarToolGroups } from 'src/app/view-models/toolbar/toolbar-tool-groups';
import { ToolbarButtonKeys } from 'src/app/view-models/toolbar/toolbar-button-keys';
import { FontSizeHelper } from 'src/app/utilities/font-size-helper';
import { AsmMessageClassification, AsmMessageHelper, Assembly } from '@allium/asm';
import { ByteSequenceCreator, NamedRegisterMask, QuadByte, RegisterHelper, VariableRegisterReference } from '@allium/types';
import { SessionService } from 'src/app/services/session.service';
import { createUuid, joinPath, YfsFile, YfsStatus } from 'yfs';
import { ActiveWorkspace, FsList } from '@alliumworks/platform';
import { cm4a_v2 as cm4a_v2_Type } from 'cm4a-v2';
import { TextService } from 'src/app/services/text.service';
import * as objectHash from 'object-hash';
import { AgentService } from 'src/app/services/agent.service';
import { ModalService } from 'src/app/services/modal.service';
import { ChoiceListModalOption } from 'src/app/data-models/modal/choice-list-modal-option';

declare var cm4a_v2: typeof cm4a_v2_Type;

@Component({
  selector: 'aq4w-source-file-editor',
  templateUrl: './source-file-editor.component.html',
  styleUrls: ['./source-file-editor.component.scss']
})
export class SourceFileEditorComponent extends Aq4wComponent implements AfterViewInit, OnDestroy {

  @Input('content')
  public set content(content: ContentReference) {
    this._filePath = content.data.filePath as string;
    this._virtualPath = this._filePath.substring(this._filePath.indexOf(FsList.WorkspaceResourcesDirectory) + FsList.WorkspaceResourcesDirectory.length);
    this._contentKey = content.contentKey;
  }
  
  public view = {
    id: `sf_code_editor_${createUuid()}`,
    isControlLoaded: false
  }

  constructor(private _sessionService: SessionService, private _contentManagerService: ContentManagerService, private _toolbarManagerService: ToolbarManagerService,
    private _textService: TextService, private _agentService: AgentService,
    private _modalService: ModalService) {
    super();
  }

  ngAfterViewInit(): void {
    this._isDirty.pipe(takeUntil(this.destroyed), withLatestFrom(this._isReady), distinctUntilChanged()).subscribe(([isDirty, isReady]) => {
      if (isReady) {
        this._contentManagerService.changeContentStatus(this._contentKey, isDirty);
        this._toolbarManagerService.setButtonStatesForGroup(ToolbarToolGroups.GroupNames.FILE_OPTIONS, isDirty);
      }
    })

    this._toolbarManagerService.onButtonClicked().pipe(takeUntil(this.destroyed)).subscribe(buttonKey => {
      const acd = this._contentManagerService.getActiveContentDescriptor();
      if (!!acd && !!this._contentKey && acd.contentKey === this._contentKey) {
        if (buttonKey === ToolbarButtonKeys.RevertFile) {
          //TODO modal
          this._isDirty.next(false);
          if (!!this._module) {
            this._module.control.destroy();
            this._module = null;
            this._isReady.next(false);
          }
        } else if (buttonKey === ToolbarButtonKeys.SaveFile) {
          // this._sourceObject.commitLocal();ZTODO
          this._current.pipe(take(1)).subscribe(pendingContent => {
            this._sessionService.platform.assembler.updateSourceFile(this._filePath, pendingContent).then(() => {
              this._savedSourceCode = pendingContent;
              this._isDirty.next(false);
              this._refresh.next(Math.random());
              // this._pendingContent.next(null);
            });
          });
          // this._isDirty.next(false);
        } else if (buttonKey === ToolbarButtonKeys.IncreaseFontSize) {
          this._fontSizeHelper.changeFontSize(true);
        } else if (buttonKey === ToolbarButtonKeys.DecreaseFontSize) {
          this._fontSizeHelper.changeFontSize(false);
        } else if (buttonKey === ToolbarButtonKeys.ToggleComment) {
          this._module.control.toggleComment();
        } else if (buttonKey === ToolbarButtonKeys.FormatSelection) {
          this._module.control.formatSelection();
        } else if (buttonKey === ToolbarButtonKeys.ToggleShowCompiledInstructionValues) {
          // TODO
          // if (this._compiledValueRadix === 'hide') {
          //   this._controller.toggleCompiledValues();
          //   this._compiledValueRadix = 10;
          // } else if (this._compiledValueRadix === 2) {
          //   this._controller.cycleCompiledValueRadix();
          //   this._controller.toggleCompiledValues();
          //   this._compiledValueRadix = 'hide';
          // } else if (this._compiledValueRadix === 10) {
          //   this._controller.cycleCompiledValueRadix();
          //   this._compiledValueRadix = 16;
          // } else if (this._compiledValueRadix === 16) {
          //   this._controller.cycleCompiledValueRadix();
          //   this._compiledValueRadix = 2;
          // }
        } else if (buttonKey === ToolbarButtonKeys.DebugThisFile) {
          this.getEntryPointOptions().then(entryPointOptions => {
            this._modalService.launchChoiceListModal('Debug ' + this._virtualPath, 'Select entry point', entryPointOptions, (affirmative, choice) => {
              if (affirmative) {
                // TODO
              }
            });
          });
        } else if (buttonKey === ToolbarButtonKeys.ToggleSourceEditing) {
          this._module.control.setEditable(!this._isEditable);
        }
      } else if (buttonKey === ToolbarButtonKeys.SaveAllFiles && !!this._contentKey) {
        // this._sourceObject.commitLocal();ZTODO
        this._isDirty.next(false);
      }
    })

    this._sessionService.platform.assembler.settings().pipe(take(1)).subscribe(settings => {
      const sourceImport = settings.sourceImports.find(si => si.filePath === this._virtualPath);
      if (!!sourceImport) {
        this._objectName = sourceImport.referenceName;
        // this.loadView();
      }
      this.loadView();
    })

    combineLatest([
      this._sessionService.platform.workspaceManager.activeWorkspace().pipe(takeUntil(this.destroyed)),
      this._isReady.pipe(takeUntil(this.destroyed), distinctUntilChanged())
    ]).pipe(takeUntil(this.destroyed)).subscribe(([activeWorkspace, isReady]) => {
      this._activeWorkspace = activeWorkspace || null;
      if (!!this._activeWorkspace && isReady) {
        this._activeWorkspace.getAsset(joinPath(FsList.WorkspaceResourcesDirectory, this._virtualPath)).then(file => {
          if (file.status === YfsStatus.OK) {
            const sourceCode = (file.payload as YfsFile).content;
            this._savedSourceCode = sourceCode;
            this._current.next(sourceCode);
            this._module.control.setContent(sourceCode);
          }
        })
      }

      if (!isReady && this._blockAddressCache.size > 0) {
        this._blockAddressCache.clear();
      }

      this.view.isControlLoaded = isReady;
    })

    combineLatest([
      this._sessionService.platform.machine.currentMachineState(),
      this._sessionService.platform.assembler.activeInstruction(),
      this._sessionService.platform.assembler.assembly(),
      this._sessionService.platform.machine.sessionIsDefined(),
      this._isReady
    ]).pipe(takeUntil(this.destroyed)).subscribe(([state, activeInstructionDetails, assembly, sessionIsDefined, isReady]) => {
      // console.log(`sfe state=${state.isComputerRunning}, isRunPaused=${state.isRunPaused}, activeInstructionDetails=${!!activeInstructionDetails ? activeInstructionDetails.lineIndex : ''}`)
      if (!!this._module && isReady) {
        if (!!activeInstructionDetails && activeInstructionDetails.objectName === this._objectName) {
          this._module.control.setActiveInstructionLine(activeInstructionDetails.lineIndex);
        } else if (!!activeInstructionDetails && activeInstructionDetails.objectName !== this._objectName) {
          this._module.control.clearActiveInstructionLine();
        }
      }
    })

    combineLatest([
      this._current,
      this._isReady,
      this._refresh.pipe(distinctUntilChanged())
    ]).pipe(takeUntil(this.destroyed), filter(([c, r]) => r), debounceTime(500), map(([c, r]) => c)).subscribe((current) => {
      this._sessionService.platform.assembler.buildPreview(this._objectName, current).then(previewAssembly => {
        const isDirty = objectHash.MD5(current) !== objectHash.MD5(this._savedSourceCode);
        if (isDirty) {
          // TODO 
        }

        this._module.control.errorRange.clearAll();
        previewAssembly.messages.filter(m => m.objectName === this._objectName && Number.isInteger(m.lineIndex) && !!m.contentCoordinates).forEach(m => {
          const icon = m.classification === AsmMessageClassification.Warning
            ? '<i class="fas fa-exclamation-triangle" aria-hidden="true" style="color: orange;vertical-align: text-top;"></i>&nbsp;'
            : m.classification !== AsmMessageClassification.Info
            ? '<i class="fas fa-times-circle" aria-hidden="true" style="color: red;vertical-align: text-top;"></i>&nbsp;'
            : '';
          const errorText = `${icon}${AsmMessageHelper.stringifyClassification(m.classification)} (${m.code}): ${AsmMessageHelper.localizeMessage(m.code, this._agentService.locale)}`;
          this._module.control.errorRange.mark(m.lineIndex - 1, m.contentCoordinates.startPosition, m.lineIndex - 1, m.contentCoordinates.endPosition, errorText);
        });
        this._currentAssembly.next(previewAssembly);
        this._isDirty.next(isDirty);
      })
    })

    this._fontSizeChanged.pipe(filter(fs => fs > -1), debounceTime(750), takeUntil(this.destroyed)).subscribe(fontSize => {
      if (!!this._module) {
        this._module.control.refresh();
      }
    })
  }

  ngOnDestroy(): void {
    try {
      if (!!this._module) {
        this._module.control.destroy();
      }
    } catch (ex) {
      
    }
  }

  private loadView(): void {
    this.awaitTextArea(0, () => {
      this._textService.getCodeEditorStrings().pipe(take(1)).subscribe(codeEditorStrings => {
        this._module = new cm4a_v2.CModule(this.view.id, this._objectName, {
          sourceMap: 'TODO',
          library: codeEditorStrings,
          getNumericValueForRegRef: (rr) => {
            const parts = rr.split('.');
            const regName = RegisterHelper.parseRegisterNameFromString(parts[0]);
            const regMask = parts.length > 1
              ? (/^[ \t]{0,}[0-1]+$/.test(parts[1]) // bit mask
              ? RegisterHelper.parseRegisterMaskFromString(parts[1])
              : RegisterHelper.parseNamedRegisterMaskFromString(parts[1]))
              : NamedRegisterMask.Full;
            if (!!regName) {
              const vrr = VariableRegisterReference.create(regName, regMask as any);
              return RegisterHelper.getNumericFromRegisterReference(vrr);
            } else {
              return null;
            }
          },
          getBlockAddress: (blockName) => {
            let blockAddress: number | null = null; // TODO
            const cached = this._blockAddressCache.get(blockName);
            if (cached === undefined) {
              const asm = this._currentAssembly.getValue();
              if (!!asm && !!asm.sourceMap) {
                const bnEntity = asm.sourceMap.LINES
                  .filter(ln => ln.objectName === this._objectName)
                  .map(ln => ln.entities)
                  .reduce((x, y) => x.concat(y), [])
                  .find(e => e.kind === 'language-construct' && e.constructDetails !== 'none' && e.constructDetails.kind === 'block-name' && e.text === blockName);

                if (!!bnEntity && bnEntity.constructDetails !== 'none' && bnEntity.constructDetails.numericValue !== 'none') {
                  blockAddress = bnEntity.constructDetails.numericValue;
                  this._blockAddressCache.set(blockName, blockAddress);
                }
              }
            } else {
              blockAddress = cached;
            }
            return blockAddress;
          },
        }, this._tracer);

        this._module.control.on.breakpointToggled((objectName, lineIndex, isSet) => {
          console.log(`breakpointToggled: ${lineIndex} ${isSet}`)
          this._currentAssembly.pipe(take(1)).subscribe(currentAssembly => {
            if (!!currentAssembly) {
              this.toggleBreakpoint(currentAssembly, lineIndex, isSet);
            } else {
              this._deferredControllerActions.push(() => {
                this._currentAssembly.pipe(take(1)).subscribe(currentAssembly => {
                  if (!!currentAssembly) {
                    this.toggleBreakpoint(currentAssembly, lineIndex, isSet)
                  }
                });
              });
            }
          });
        });
        this._module.control.on.contentChanged((objectName, changes, fullText) => {
          // console.log(`fullText=${fullText}`)
          this._current.pipe(take(1)).subscribe(current => {
            this._blockAddressCache.clear();
            this._current.next(fullText);
          })
        });
        this._module.control.on.ready(() => {
          this._module.control.setContent(this._current.getValue());
          this._module.control.setBreakpointMode(true);
          this._isReady.next(true);
        });
        this._module.control.on.editableChanged((objectName, isEditable) => {
          this._isEditable = isEditable;
          this._toolbarManagerService.setButtonStatus(ToolbarButtonKeys.ToggleSourceEditing, !isEditable);
        });
      })
    })
  }

  private _fontSizeHelper = new FontSizeHelper((enabled) => {
    this._toolbarManagerService.setButtonState(ToolbarButtonKeys.IncreaseFontSize, enabled);
  }, (enabled) => {
    this._toolbarManagerService.setButtonState(ToolbarButtonKeys.DecreaseFontSize, enabled);
  }, (fontSize) => {
    // this._module.control.setFontSize(fontSize);
    const viewStyleContainer: HTMLElement = document.getElementById(`${this.view.id}_style`);
    viewStyleContainer.innerHTML = `<style>:root { --sfe-instance-font-size: ${fontSize}px !important }</style>`;
    this._fontSizeChanged.next(fontSize);
  })

  private awaitTextArea(attempt: number, action: () => void): void {
    const exists = !!document.getElementById(this.view.id);
    if (exists) {
      action();
    } else if (attempt < this._MAX_ATTEMPTS) {
      window.setTimeout(() => {
        this.awaitTextArea(attempt + 1, action);
      }, 200);
    } else {
      throw new Error('TextArea not rendered');
    }
  }

  private toggleBreakpoint(currentAssembly: Assembly, lineIndex: number, isSet: boolean): void {
    const bpAddress = currentAssembly.sourceMap.getAddressForLine(this._objectName, lineIndex);
    if (bpAddress !== 'not-an-instruction') {
      if (isSet) {
        this._sessionService.platform.machine.addBreakpoint(bpAddress);
      } else {
        this._sessionService.platform.machine.removeBreakpoint(bpAddress);
      }
    }
  }

  private getEntryPointOptions(): Promise<Array<ChoiceListModalOption>> {
    return new Promise((resolve) => {
      this._currentAssembly.pipe(take(1)).subscribe(currentAssembly => {
        const options = new Array<ChoiceListModalOption>();
        if (!!currentAssembly && !!currentAssembly.sourceMap) {
          for (let i = 0; i < currentAssembly.sourceMap.LINES.length; i++) {
            const line = currentAssembly.sourceMap.LINES[i];
            if (line.objectName === this._objectName) {
              const entity = line.entities.find(e => e.kind === 'language-construct' && e.constructDetails !== 'none' && e.constructDetails.kind === 'block-name');
              if (!!entity) {
                options.push({
                  caption: entity.text,
                  value: ByteSequenceCreator.Unbox(currentAssembly.sourceMap.getAddressForLine(this._objectName, entity.lineIndex) as QuadByte).toString(),
                  iconName: '(c)lightningbolt'
                });
              }
            }
          }
        }
        resolve(options);
      });
    });
  }

  private _isEditable = true;
  private _savedSourceCode = '';
  private _activeWorkspace: ActiveWorkspace | null = null;
  private _virtualPath = '';
  private _module: cm4a_v2_Type.CModule | null = null;
  private readonly _currentAssembly = new BehaviorSubject<Assembly | null>(null);
  private readonly _current = new BehaviorSubject<string>('')
  private readonly _blockAddressCache = new Map<string, number>();
  private readonly _refresh = new BehaviorSubject<number>(-1);
  private readonly _isReady = new BehaviorSubject<boolean>(false);
  private readonly _fontSizeChanged = new BehaviorSubject<number>(-1);
  private readonly _tracer = new cm4a_v2.Tracer(true, true, false);
  private readonly _MAX_ATTEMPTS = 20;

  private _objectName: string = generateRandomObjectName();
  private _filePath = '';
  private _contentKey = '';
  private readonly _deferredControllerActions = new Array<() => void>();
  private readonly _isDirty = new BehaviorSubject<boolean>(false);
}

function generateRandomObjectName(): string {
  return `_inline${Math.random().toString().split('.')[1]}`;
}