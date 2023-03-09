import { AfterViewInit, Component } from '@angular/core';
// import { ShellUiService } from './svcShellUi.service';
import { ShellUiService } from 'shell-ui';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'test-app';

  get shellUiOptions() {
    return {
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
    }
  }

  get shellCompleter(): ((input: string) => Array<any/*InputCompletionModel2*/>) | null {
    return null;
  }

  public constructor(private _shellUiService: ShellUiService) { }

  ngAfterViewInit() {
    const candidates = JSON.parse('[{"fullCommandText":"mac reg ?","commandName":""},{"fullCommandText":"mac reg set ? = ?","commandName":"WriteReg"},{"fullCommandText":"mac flag ?","commandName":"ReadFlag"},{"fullCommandText":"mac flag raise ?","commandName":"RaiseFlag"},{"fullCommandText":"mac flag clear","commandName":"ClearFlag"},{"fullCommandText":"mac mem ?","commandName":"ReadMemBase10"},{"fullCommandText":"mac mem ?","commandName":"ReadMemBase16"},{"fullCommandText":"mac mem set ? = ?","commandName":"WriteMemBase10"},{"fullCommandText":"mac mem set --hex ? = ?","commandName":"WriteMemBase16"},{"fullCommandText":"mac bp add ?","commandName":"BreakpointAdd"},{"fullCommandText":"mac bp rm ?","commandName":"BreakpointRemove"},{"fullCommandText":"mac bp on","commandName":"BreakpointsEnable"},{"fullCommandText":"mac bp off","commandName":"BreakpointsDisable"},{"fullCommandText":"mac ctl state","commandName":"ControlGetState"},{"fullCommandText":"mac ctl state ?","commandName":"ControlSetState"},{"fullCommandText":"mac ctl step","commandName":"ControlStep"},{"fullCommandText":"mac ctl step ?","commandName":"ControlStepMulti"},{"fullCommandText":"mac ctl cycle","commandName":"ControlCycle"},{"fullCommandText":"mac ctl cycle ?","commandName":"ControlCycleMulti"},{"fullCommandText":"mac ctl continue","commandName":"ControlContinue"},{"fullCommandText":"mac ctl pause","commandName":"ControlPause"},{"fullCommandText":"mac pwr","commandName":"GetPowerState"},{"fullCommandText":"mac pwr on","commandName":"PowerOn"},{"fullCommandText":"mac pwr off","commandName":"PowerOff"},{"fullCommandText":"mac pwr restart","commandName":"Restart"},{"fullCommandText":"env --version","commandName":"EnvVersion"},{"fullCommandText":"env ?","commandName":"EnvGetVar"},{"fullCommandText":"env set ? = ?","commandName":"EnvSetVar"},{"fullCommandText":"env echo ?","commandName":"EnvEcho"},{"fullCommandText":"asm inline ?","commandName":"Inline"}]');
    this._shellUiService.setAllCommands(candidates.filter(c=>!c.fullCommandText.startsWith('mac mem') && !!c.commandName));// ['mac reg', 'mac reg set'])
    this._shellUiService.addPage({
      key: 'p1',
      title: 'Page A',
      logEntries: [],
      inputHistory: {
        pageKey: 'p1',
        inputs: []
      },
      inputEnabled: true
    })
  }

  // private initShell(): void {
  //   this._shellCompleter = (input) => {
  //     return this._sessionService.shell.assembler.getSuggestedCompletions(input);
  //   };
  //   this.createConsole();
  //   this.createAssemblerTerminal();

  //   this._sessionService.platform.devices.onLogSetAvailable().subscribe(logSets => {
  //     logSets.forEach(ls => {
  //       if (!this._shellService.hasInstance(ls.key)) {
  //         const deviceShellKey = `dev_${ls.key}`;
  //         this._shellService.createInstance(deviceShellKey, ls.installationTitle, false, false);
  //         ls.listener().subscribe(entries => {
  //           this._shellService.writeOutput(deviceShellKey, false, ...entries.map(e => {
  //             return {
  //               content: e.entry,
  //               timestamp: e.timestamp
  //             }
  //           }));
  //         })
  //       }
  //     })
  //   });

  //   this._sessionService.platform.devices.onLogSetUnavailable().subscribe(logSets => {
  //     logSets.forEach(ls => {
  //       const deviceShellKey = `dev_${ls.key}`;
  //       if (this._shellService.hasInstance(deviceShellKey)) {
  //         this._shellService.deleteInstance(deviceShellKey);
  //       }
  //     })
  //   })

  //   window.setTimeout(() => {
  //     this._sessionService.getUserPreferences().then(userPrefs => {
  //       this._shellUiService.setPreferUtcTimestamps(userPrefs.preferTimestampsInUTC === true);
  //     })
  //   }, 1000)
  // }
}
