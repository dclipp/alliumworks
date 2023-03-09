import { Component, AfterViewInit, OnInit, ElementRef } from '@angular/core';
import { ToolbarManagerService } from './services/toolbar-manager.service';
import { StorageApiService } from './services/storage-api.service';
import { StartupService } from './services/startup.service';
import { take, filter, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ResponsiveViewService } from './services/responsive-view.service';
import { SessionService } from './services/session.service';
import { AppEntry } from './app-entry';
import { ShellService } from './services/shell.service';
import { AgentService } from './services/agent.service';
import { InputCompletionModel2, ShellUiOptionsModel, ShellUiService } from 'shell-ui';
import { CommandDefinitions } from '@alliumworks/shell'
// import { serializeDeltas, YfsDiffUtil } from 'yfs';
// import { BackendClient } from './services/working_client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'web-ide';

  public view = {
    isLeftSectionCollapsed: false,
    ready: false,
    shellUiOptions: {
      iconSet: {
        clearInput: '(c)empty',
        clearOutput: '(c)clear',
        downloadOutput: '(c)download',
        scrollLockEnabled: '(fa)fas.lock',
        scrollLockDisabled: '(fa)fas.lock-open',
        completionsActive: '(c)complete::color=secondary',
        completionsInactive: '(c)complete',
        historyActive: '(fa)fas.history::color=secondary',
        historyInactive: '(fa)fas.history',
        caretCollapsed: '(fa)fas.caret-right',
        caretExpanded: '(fa)fas.caret-down'
      }
    } as ShellUiOptionsModel,
    shellCompleter: null as ((input: string) => Array<InputCompletionModel2>) | null
  }

  public on = {
    leftCollapseToggled: (isCollapsed: boolean) => {
      this.view.isLeftSectionCollapsed = isCollapsed;
    },
    mobileToggleSidebar: () => {
      this.view.isLeftSectionCollapsed = !this.view.isLeftSectionCollapsed;
    },
    beginShellResize: () => {
      document.getElementById('aq4w-app-base').classList.add('dragging');
    },
    shellResized: (event: DragEvent) => {
      // console.log(`pageY=${event.pageY}`);
      const emHeightPx = Math.round(document.getElementById('em-reference-size').getBoundingClientRect().height);
      const maxPosition = Math.round(Math.min(event.pageY, window.innerHeight - (2 * emHeightPx)));
      const resizeToPx = Math.max(emHeightPx, maxPosition);
      // const resizeToPercent = Math.floor(window.innerHeight / resizeToPx);
      // console.log(`resizeto=${resizeToPx}px / ${resizeToPercent}%`);

      this.setShellTopVariable(`${resizeToPx}px`);
      this._agentService.setShellTopVar(resizeToPx);
      setTimeout(() => {
        document.getElementById('aq4w-app-base').classList.remove('dragging');
      }, 1000);
    }
  }

  constructor(private _toolbarManagerService: ToolbarManagerService, private dl: StorageApiService, private _startupService: StartupService,
    private _sessionService: SessionService, private _shellService: ShellService, private _agentService: AgentService,
    private _shellUiService: ShellUiService) { }

  ngOnInit(): void {
    // BackendClient.init('http://localhost:4200', () => { return this._http });
  }

  ngAfterViewInit() {
    window['sAPI'] = () => { return this.dl }
    // window['TSTDumpYfsDeltas'] = () => { return this._sessionService.platform.yfs.getDeltas() }
    // window['TSTserializeDeltas'] = (deltas) => { return serializeDeltas(...deltas) }
    // window['TSTserializeAssets'] = () => { return this._sessionService.platform.yfs.serializeAssets() }
    // window['TSTcreateSerializedPatch'] = (p, b4, after) => { return YfsDiffUtil.createSerializedPatch(p, b4, after) }
    // window['TSTapplyPatch'] = (sp,original) => { return YfsDiffUtil.applyPatch(sp, original) }
    this._startupService.isPlayground().subscribe(isPlayground => {//TODO remove?
      document.body.setAttribute('data-app-mode', isPlayground ? 'playground' : 'tenant');
      window.setTimeout(() => { this.view.ready = true; });
    })
    window['DPR'] = () => { this.doPostRender() }

    this._agentService.windowResized().subscribe((dimensions) => {
      if (dimensions.w >= 1050) {
        ResponsiveViewService.setType('full');
      } else if (dimensions.w >= 600) {//todo height??
        ResponsiveViewService.setType('compact');
      } else {
        ResponsiveViewService.setType('tiny');
      }

      const presentationDimX = Math.floor(dimensions.w / 4);
      const presentationDimY = Math.floor(dimensions.h / 3);
      const appPresentationDimStyles = document.getElementById('app-presentation-dim-styles');

      if (!!appPresentationDimStyles) {
        const css = `:root { --presentation-dim-x: ${presentationDimX}px; --presentation-dim-y: ${presentationDimY}px; }`;
        appPresentationDimStyles.innerText = css;
      }

      console.log(`viewType=${ResponsiveViewService.CURRENT_TYPE}`)

      if (!this._shellInitialized) {
        this._shellInitialized = true;
        this.initShell();
        const candidates = new Array<{
          readonly fullCommandText: string;
          readonly commandName: string;
        }>();
        CommandDefinitions.forEach(cd => {
          if (!candidates.some(c => c.commandName.trim() === cd.name.trim())) {
            candidates.push({
              fullCommandText: cd.templateWords.join(' '),
              commandName: cd.name
            })
          }
        });
window['_candidates'] = candidates
        this._shellUiService.setAllCommands(candidates.filter(c=>!c.fullCommandText.startsWith('mac mem') && !!c.commandName));// ['mac reg', 'mac reg set'])
        // this._shellUiService.setAllCommands(candidates.map(c => c.fullCommandText));// ['mac reg', 'mac reg set'])
        // this._shellUiService.setAllCommands([{ fullCommandText: 'mac reg', commandName: 'mreg1' }, { fullCommandText: 'mac reg set', commandName: 'mreg2' }])// ['mac reg', 'mac reg set'])

        this._shellUiService.onShellResized().subscribe(px => {
          console.log(`onShellResized ${px}`)
          const emHeightPx = Math.round(document.getElementById('em-reference-size').getBoundingClientRect().height);
          const maxPosition = Math.round(Math.min(px, window.innerHeight - (2 * emHeightPx)));
          const resizeToPx = Math.max(emHeightPx, maxPosition);

          this.setShellTopVariable(`${resizeToPx}px`);
          this._agentService.setShellTopVar(resizeToPx);
          // setTimeout(() => {
          //   document.getElementById('aq4w-app-base').classList.remove('dragging');
          // }, 1000);
        })
      }
    })

    // window.addEventListener('resize', () => {
    //   this._resized.next({
    //     w: window.innerWidth,
    //     h: window.innerHeight
    //   })
    // })

    // this._resized.next({
    //   w: window.innerWidth,
    //   h: window.innerHeight
    // })

    this.setShellTopVariable(`${window.innerHeight * this._DEFAULT_SHELL_HEIGHT_PCT}px`);
    this._agentService.setShellTopVar(window.innerHeight * this._DEFAULT_SHELL_HEIGHT_PCT);
    // this.initShell();

    window.addEventListener('focus', () => {
      const mwFocusGainedEvt = new CustomEvent(AgentService.CSTEVT_MAIN_WINDOW_FOCUS_GAINED);
      window.dispatchEvent(mwFocusGainedEvt);
    });
  }

  private _newmodalcb: ((modalContext: {
    readonly title: string,
    readonly body: ElementRef<any>,
    // readonly footer?: TemplateRef<HTMLElement>,
    pushDecision: (affirmative: boolean, data: { readonly [key: string]: any }) => void
  }) => void) | null = null;

  private doPostRender(): void {
    //TODO remove??
    const els = document.getElementsByTagName('ion-icon');
    const srs = new Array<ShadowRoot>();
    for (let i = 0; i < els.length; i++) {
      const element = els.item(i);
      if (!!element.shadowRoot) {
        srs.push(element.shadowRoot);
      }
    }
    
    if (srs.length > 0) {
      console.log(`srs=${srs.length}`);
      srs.forEach(sr => {
        (sr.querySelectorAll('title') as any).forEach(el => el.remove())
      })
    }
  }

  private setShellTopVariable(value: string): void {
    let el = document.getElementById('app-presentation-variables');
    if (!(!!el)) {
      el = document.createElement('style');
      el.id = 'app-presentation-variables';
      document.body.appendChild(el);
    }
    el.innerText = `:root { --shell-top: ${value}; --shell-ui-max-height: ${value}; }`;
  }

  private createConsole(): void {
    const shellConsoleKey = 'console';
    this._shellService.createInstance(shellConsoleKey, 'Console', true, true, {
      getSuggestedCompletion: (input) => {
        return this._sessionService.shell.platform.getSuggestedCompletions(input);
      },
      getBestCompletion: (input) => {
        return this._sessionService.shell.platform.getBestCompletion(input);
      }
    });

    this._sessionService.shell.platform.stdout().subscribe(output => {
      this._shellService.writeOutput(shellConsoleKey, true, {
        content: output.text,
        timestamp: Date.now(),
        type: output.type
      });
    });

    this._shellService.onInput().pipe(filter(x => x.viewKey === shellConsoleKey), map(x => x.literal)).subscribe(literal => {
      this._sessionService.shell.platform.stdin(literal);
    })
  }

  private createAssemblerTerminal(): void {
    const shellAssemblerKey = 'assembler';
    this._shellService.createInstance(shellAssemblerKey, 'Assembler', true, false, {
      getSuggestedCompletion: (input) => {
        return this._sessionService.shell.assembler.getSuggestedCompletions(input);
      },
      getBestCompletion: (input) => {
        return this._sessionService.shell.assembler.getBestCompletion(input);
      }
    });

    this._sessionService.shell.assembler.stdout().subscribe(output => {
      this._shellService.writeOutput(shellAssemblerKey, true, {
        content: output.text,
        timestamp: Date.now(),
        type: output.type
      });
    });

    this._shellService.onInput().pipe(filter(x => x.viewKey === shellAssemblerKey), map(x => x.literal)).subscribe(literal => {
      this._sessionService.shell.assembler.stdin(literal);
    })

    window['TSTShellConsoleAsm'] = (txt: string) => {
      this._shellService.writeOutput(shellAssemblerKey, true, {
        timestamp: Date.now(),
        type: 'info',
        content: txt
      })
    }
  }

  private initShell(): void {
    this.view.shellCompleter = (input) => {
      return this._sessionService.shell.assembler.getSuggestedCompletions(input);
    };
    this.createConsole();
    this.createAssemblerTerminal();

    this._sessionService.platform.devices.onLogSetAvailable().subscribe(logSets => {
      logSets.forEach(ls => {
        if (!this._shellService.hasInstance(ls.key)) {
          const deviceShellKey = `dev_${ls.key}`;
          this._shellService.createInstance(deviceShellKey, ls.installationTitle, false, false);
          ls.listener().subscribe(entries => {
            this._shellService.writeOutput(deviceShellKey, false, ...entries.map(e => {
              return {
                content: e.entry,
                timestamp: e.timestamp
              }
            }));
          })
        }
      })
    });

    this._sessionService.platform.devices.onLogSetUnavailable().subscribe(logSets => {
      logSets.forEach(ls => {
        const deviceShellKey = `dev_${ls.key}`;
        if (this._shellService.hasInstance(deviceShellKey)) {
          this._shellService.deleteInstance(deviceShellKey);
        }
      })
    })

    window.setTimeout(() => {
      this._sessionService.getUserPreferences().then(userPrefs => {
        this._shellUiService.setPreferUtcTimestamps(userPrefs.preferTimestampsInUTC === true);
      })
    }, 1000)
  }


  private _shellInitialized = false;
  private readonly _DEFAULT_SHELL_HEIGHT_PCT = 0.80;
  // private readonly _resized = new BehaviorSubject<{ readonly w: number, readonly h: number }>(null);
}
