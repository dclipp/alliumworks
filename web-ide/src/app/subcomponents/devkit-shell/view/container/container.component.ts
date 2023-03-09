import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { InputAreaModel } from 'src/app/subcomponents/devkit-shell/models/input-area.model';
import { FormControl } from '@angular/forms';
import { OutputLineModel } from 'src/app/subcomponents/devkit-shell/models/output-line.model';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { NgcServiceInitializer } from 'src/app/subcomponents/devkit-shell/objects/ngc-service-initializer';
import { InputBufferCommitEvent } from '../../models/input-buffer-commit-event';
import { OutputAreaModel } from '../../models/output-area.model';
import { InputAreaComponent } from '../input-area/input-area.component';
import { AgentService } from 'src/app/services/agent.service';

@Component({
  selector: 'ngconsole-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit, AfterViewInit {
  
  public view = {
    selectedInstance: new FormControl(),
    inputModel: null as InputAreaModel | null,
    outputData: null as OutputAreaModel | null,
    instances: new Array<{
      readonly name: string,
      readonly value: string,
      updated?: boolean
    }>(),
    emUnitSizePx: 1,
    chUnitSizePx: 1,
    optAltKeyName: ''
  }

  public on = {
    inputUpdated: (model: InputAreaModel) => {
      this._instances.pipe(take(1)).subscribe(instances => {
        const currentKey: string = this.view.selectedInstance.value;
        const index = instances.findIndex(x => x.viewKey === currentKey);
        if (index > -1) {
          const nextInstances = new Array<ConsoleInstance>();
          instances.forEach((i, ii) => {
            if (ii === index) {
              nextInstances.push({
                viewKey: currentKey,
                input: model,
                output: i.output
              });
            } else {
              nextInstances.push(i);
            }
          })

          this._instances.next(nextInstances);
        }
      })
    },
    inputCommitted: (event: InputBufferCommitEvent) => {
      if (!!this._commitInputHandler) {
        this._commitInputHandler(event.viewKey, event.literal);
      }
    },
    inputAreaShowingChanged: (isShowing: boolean) => {
      if (isShowing) {
        this.refreshFloatingListBottomVariable(true);
      }
    },
    clearOutput: () => {
      if (!!this.view.selectedInstance.value) {
        this._instances.pipe(take(1)).subscribe(instances => {
          this._instances.next(instances.map(i => {
            if (i.viewKey === this.view.selectedInstance.value) {
              return {
                input: i.input,
                output: new Array<OutputLineModel>(),
                viewKey: i.viewKey
              }
            } else {
              return i;
            }
          }))
  
          this.view.outputData = {
            lines: [],
            append: false
          }
        })
      }
    },
    emptyBuffer: () => {
      // this._inputBuffer.empty();
      // this._sessionService.clearData('shell-buffer').then(() => {});
      this.inputArea.emptyBuffer();
    },
    downloadOutput: () => {
      this._instances.pipe(take(1)).subscribe(instances => {
        const instance = instances.find(i => i.viewKey === this.view.selectedInstance.value);
        if (!!instance) {
          const name = this.getSafeDownloadName(instance.viewKey);
          const content = instance.output.map(o => `${new Date(o.timestamp).toISOString()}\t${o.content}`).join('\n');
          const blob = new File([content], name, { type: 'text/plain' });
          const downloadUrl = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.id = `dl_${Math.random().toString().split('.')[1]}`;
          downloadLink.href = downloadUrl;
          downloadLink.download = name;
      
          document.body.appendChild(downloadLink);
          window.setTimeout(() => {
            const el = document.getElementById(downloadLink.id);
            el.click();
            el.remove();
            URL.revokeObjectURL(downloadUrl);
          }, 250);
        }
      })
    }
  }
  
  constructor(private _agentService: AgentService) { }

  ngOnInit(): void {
    this.registerHandlers(1);

    this.view.selectedInstance.valueChanges.subscribe(val => {
      this.changeSelectedInstance(val);
    })

    this.view.optAltKeyName = this._agentService.optAltKeyName();
    // this.view.instances = [
    //   {
    //     name: 'A',
    //     value: 'A'
    //   },
    //   {
    //     name: 'B',
    //     value: 'B'
    //   },
    //   {
    //     name: 'C',
    //     value: 'C'
    //   }
    // ]
    // this._instances.next(TESTDATA);
    // this.view.selectedInstance.setValue('A');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.view.emUnitSizePx = this.unitRefEm.nativeElement.clientWidth;
      this.view.chUnitSizePx = this.unitRefCh.nativeElement.clientWidth;
    })

    this._agentService.windowResized().subscribe(() => {
      this.refreshFloatingListBottomVariable(true);
    })
  }

  private changeSelectedInstance(viewKey: string): void {
    this._instances.pipe(take(1)).subscribe(instances => {
      const instance = instances.find(x => x.viewKey === viewKey);
      if (!!instance) {
        this.view.inputModel = instance.input || null;
        this.view.outputData = {
          lines: instance.output,
          append: false
        };
      } else {
        this.view.inputModel = null;
        this.view.outputData = null;
      }
    })
  }

  private registerHandlers(attemptCount: number): void {
    const si = window['_ngc_svc_initializer'] as NgcServiceInitializer;
    if (!!si) {
      const api = si.containerRegistrar({
        onCreateInstance: (viewKey, name, allowInput, makeActive, autocompleter) => {
          this._instances.pipe(take(1)).subscribe(instances => {
            this.view.instances.push({
              name: name,
              value: viewKey
            })

            this._instances.next(instances.concat([
              {
                viewKey: viewKey,
                input: allowInput ? {
                  viewKey: viewKey,
                  latestInput: '',
                  textboxValue: '',
                  historyInputRawBuffer: '',
                  historyInputString: '',
                  autocompleter: autocompleter,
                  view: {
                    showHistory: false,
                    historyQueryMatches: [],
                    historySearch: '',
                    selectedHistoryIndex: 0,
                    suggestedCompletion: ''
                  }
                } : undefined,
                output: []
              }
            ]))

            if (makeActive) {
              setTimeout(() => {
                this.view.selectedInstance.setValue(viewKey);
                this.changeSelectedInstance(viewKey);
              })
            }
          })
        },

        onDeleteInstance: (viewKey) => {
          this._instances.pipe(take(1)).subscribe(instances => {
            const index = instances.findIndex(i => i.viewKey === viewKey);
            if (index > -1) {
              if (this.view.selectedInstance.value === viewKey) {
                if (index > 0) {
                  this.view.selectedInstance.setValue(instances[index - 1].viewKey);
                } else if (instances.length > 1) {
                  this.view.selectedInstance.setValue(instances[index + 1].viewKey);
                } else {
                  this.view.selectedInstance.setValue('');
                }
              }
              this._instances.next(instances.filter((i, ii) => ii !== index));
            }
          })
        },

        onWriteOutput: (viewKey, append, ...lines) => {
          const useLines = new Array<OutputLineModel>();
          lines.forEach(L => {
            L.content.split('\n').filter(ln => !!ln).forEach(ln => {
              useLines.push({
                content: ln,
                timestamp: L.timestamp,
                type: L.type
              })
            })
          })

          this._instances.pipe(take(1)).subscribe(instances => {
            const index = instances.findIndex(i => i.viewKey === viewKey);
            if (index > -1) {
              const nextInstances = instances.map((i ,ii) => {
                if (ii === index) {
                  return {
                    viewKey: viewKey,
                    input: i.input,
                    output: i.output.concat(...useLines)
                  }
                } else {
                  return i;
                }
              })

              this._instances.next(nextInstances);
            }
          })

          if (viewKey === this.view.selectedInstance.value) {
            this.view.outputData = {
              lines: useLines,
              append: append
            }
          }
        }
      })

      this._commitInputHandler = api.commitInput;
    } else if (attemptCount < this._MAX_ATTEMPT_COUNT) {
      setTimeout(() => {
        this.registerHandlers(attemptCount + 1);
      }, 400)
    } else {
      throw new Error(`Failed to obtain ServiceInitializer after ${attemptCount} attempts`);
    }
  }

  private getSafeDownloadName(viewKey: string): string {
    const viewName = this.view.instances.find(i => i.value === viewKey).name;
    const sanitizedViewName = viewName.replace(/[^a-zA-Z0-9_]/g, '') + '_';
    return `shell_${sanitizedViewName}${Date.now()}.txt`;
  }

  private computeFloatingListBottomVariable(floatingLists: HTMLCollectionOf<Element>): void {
      const styleElement = document.getElementById('app-floating-list-styles');
      let maxOverflow = 0;
      for (let i = 0; i < floatingLists.length; i++) {
        const el = floatingLists.item(i);
        const overflow = Math.max(0, el.getBoundingClientRect().bottom - window.innerHeight);
        if (overflow > maxOverflow) {
          maxOverflow = overflow;
        }
      }

      const transform = maxOverflow > 0
        ? `translateY(-${maxOverflow}px)`
        : 'translateY(0)';

      styleElement.innerText = `:root { --floating-list-transform: ${transform}; }`;
  }

  private getFloatingListInners(attemptCount: number, then: (found: boolean) => void): void {
    this._getFloatingListInnersHandle = -1;
      const floatingLists = document.getElementsByClassName('floating-list-inner show');
      if (floatingLists.length > 0) {
        then(true);
      } else if (attemptCount < this._MAX_ATTEMPT_COUNT) {
        this._getFloatingListInnersHandle = window.setTimeout(() => {
          this.getFloatingListInners(attemptCount + 1, then);
        }, 50);
      } else {
        then(false);
      }
  }
  
  private refreshFloatingListBottomVariable(expectShowing: boolean): void {
    if (expectShowing) {
      if (this._getFloatingListInnersHandle > -1) {
        window.clearTimeout(this._getFloatingListInnersHandle);
        this._getFloatingListInnersHandle = -1;
      }

      this.getFloatingListInners(0, (found) => {
        this.computeFloatingListBottomVariable(document.getElementsByClassName('floating-list-inner show'));
      });
    } else {
      this.computeFloatingListBottomVariable(document.getElementsByClassName('floating-list-inner show'));
    }
  }

  @ViewChild('unitRefEm')
  unitRefEm: { nativeElement: HTMLElement }
  
  @ViewChild('unitRefCh')
  unitRefCh: { nativeElement: HTMLElement }
  
  @ViewChild('inputArea')
  inputArea: InputAreaComponent;

  private _getFloatingListInnersHandle = -1;
  private _commitInputHandler: ((viewKey: string, literal: string) => void) | null = null;
  private readonly _instances = new BehaviorSubject<Array<ConsoleInstance>>([]);
  private readonly _MAX_ATTEMPT_COUNT = 15;

}

type ConsoleInstance = {
  readonly viewKey: string;
  input?: InputAreaModel;
  output: Array<OutputLineModel>;
}

// const TESTDATA: Array<InstanceModel> = [
//   {
//     viewKey: 'A',
//     input: {
//       viewKey: 'A',
//       latestInput: '',
//       textboxValue: '',
//       historyInputRawBuffer: '',
//       historyInputString: '',
//       view: {
//         showHistory: false,
//         historyQueryMatches: [],
//         historySearch: '',
//         selectedHistoryIndex: 0,
//         suggestedCompletion: {
//           whitespaceBefore: false,
//           literal: ''
//         }
//       },
//       styles: {
//         textboxInput: {
//           width: 2
//         },
//         suggestedCompletion: {
//           marginLeft: 0
//         }
//       }
//     },
//     output: [
//       {
//         content: 'line 0 abcdefg'
//       },
//       {
//         content: 'line 1 abcdefg'
//       },
//       {
//         content: 'line 2 abcdefg'
//       }
//     ]
//   },
//   {
//     viewKey: 'B',
//     input: {
//       viewKey: 'B',
//       latestInput: '',
//       textboxValue: '',
//       historyInputRawBuffer: '',
//       historyInputString: '',
//       view: {
//         showHistory: false,
//         historyQueryMatches: [],
//         historySearch: '',
//         selectedHistoryIndex: 0,
//         suggestedCompletion: {
//           whitespaceBefore: false,
//           literal: ''
//         }
//       },
//       styles: {
//         textboxInput: {
//           width: 2
//         },
//         suggestedCompletion: {
//           marginLeft: 0
//         }
//       }
//     },
//     output: [
//       {
//         content: 'key b, line 0 rtfyg'
//       },
//       {
//         content: 'key b, line 1 cnjs'
//       },
//       {
//         content: 'key b, line 2 sod8yh'
//       }
//     ]
//   },
//   {
//     viewKey: 'C',
//     output: [
//       {
//         content: 'key b, line 0 rtfyg'
//       },
//       {
//         content: 'key b, line 1 cnjs'
//       },
//       {
//         content: 'key b, line 2 sod8yh'
//       }
//     ]
//   }
// ]
