import { Injectable } from '@angular/core';
import { OutputLineModel } from '../subcomponents/devkit-shell/models/output-line.model';
import { NgcServiceInitializer } from '../subcomponents/devkit-shell/objects/ngc-service-initializer';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, filter, debounceTime } from 'rxjs/operators';
import { Autocompleter } from '../subcomponents/devkit-shell/models/autocompleter.model';
import { LogEntryModel, ShellUiService } from 'shell-ui';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ShellService {

  public createInstance(viewKey: string, name: string, allowInput: boolean, makeActive: boolean, autocompleter?: Autocompleter): void {
    this._shellUiService.addPage({
      key: viewKey,
      title: name,
      logEntries: [],
      inputHistory: {
        pageKey: viewKey,
        inputs: new Array<string>()
      },
      inputEnabled: allowInput
    })

    this._instanceNameMap.set(viewKey, name);

    if (makeActive) {
      this._shellUiService.setActivePageKey(viewKey);
    }

    this.enqueueInstanceAction(() => {
      this._instanceKeys.push(viewKey);
      this._createInstance(viewKey, name, allowInput, makeActive, autocompleter);
    });
  }

  public deleteInstance(viewKey: string): void {
    this._shellUiService.removePage(viewKey);
    this._instanceNameMap.delete(viewKey);
    
    this.enqueueInstanceAction(() => {
      const index = this._instanceKeys.indexOf(viewKey);
      if (index > -1) {
        this._instanceKeys.splice(index, 1);
        this._deleteInstance(viewKey);
      }
    });
  }

  public writeOutput(viewKey: string, append: boolean, ...lines: Array<OutputLineModel>): void {
    lines.forEach(ln => {
      this.mapOutputLineModelToLogEntry(ln).forEach(m => {
        this._shellUiService.pushOutput(viewKey, m);
      })
    })
    this.enqueueInstanceAction(() => {
      this._writeOutput(viewKey, append, ...lines);
    });
  }

  public instances(): Array<string> {
    return this._instanceKeys.map(i => i);
  }
  
  public hasInstance(instanceKey: string): boolean {
    return this._instanceKeys.includes(instanceKey);
  }

  public onInput(): Observable<{ readonly viewKey: string, readonly literal: string }> {
    return this._committedInput.pipe(filter(x => x !== null));
  }

  constructor(private _shellUiService: ShellUiService, private _sessionService: SessionService) {
    window['_ngc_svc_initializer'] = new NgcServiceInitializer(
      (createInstanceHandler) => {
        this._createInstance = createInstanceHandler;
      },
      (deleteInstanceHandler) => {
        this._deleteInstance = deleteInstanceHandler;
      },
      (writeOutputHandler) => {
        this._writeOutput = writeOutputHandler;
      },
      (viewKey, literal) => {
        this._committedInput.next({ viewKey, literal });
      },
      () => {
        this._instanceReady = true;
        delete window['_ngc_svc_initializer'];
        setTimeout(() => {
          while (this._instanceActions.length > 0) {
            const a = this._instanceActions.splice(0, 1)[0];
            setTimeout(() => {
              try {
                a();
              } catch (ex) { }
            })
          }
        }, 400)
      }
    )

    // key: string;
    // fullText: string;
    // matchText: string;
    // matchLength: number;
    // isFullLengthMatch: boolean;
    // childItems: Array<InputCompletionModel>;
    this._shellUiService.provideCompleter('assembler', (inputText) => {
      const suggestedCompletions = this._sessionService.shell.assembler.getSuggestedCompletions(inputText);
      if (suggestedCompletions.length > 0) {
        //HTODO return suggestedCompletions.map(sc => {
        //   return {
        //     key: sc.fullCommandText,
        //     fullText: sc.fullCommandText,
        //     matchText: sc.match || '',
        //     matchLength: this.computeMatchLength(sc.fullCommandText, sc.match || ''),
        //     isFullLengthMatch: sc.isFullMatch === true,
        //     childItems: []// TODO ??
        //   }
        // })
      } else {
        return [];
      }
    })

    this._shellUiService.onBufferCommitted().subscribe(buffer => {
      console.log('onBufferCommitted')
      this._committedInput.next({
        viewKey: buffer.key,
        literal: buffer.value
      })
      // buffer.key
    })

    this._sessionService.onUserPrefsChanged().pipe(debounceTime(500)).subscribe(userPrefs => {
      this._shellUiService.setPreferUtcTimestamps(userPrefs.preferTimestampsInUTC === true);
    })

    this._shellUiService.onOutputDownloaded().subscribe(download => {
      this._shellUiService.getActivePageKey().then(activePageKey => {
        // const name = this.getSafeDownloadName(download.key);
        const name = this.getSafeDownloadName(activePageKey);
        const content = download.logEntries.map(le => `${new Date(le.timestamp).toISOString()}\t${le.message}`).join('\n');
        const blob = new File([content], name, { type: 'text/plain' });
        // const blob = new File([download], name, { type: 'text/plain' });
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
      })
    })
  }

  private enqueueInstanceAction(action: () => void): void {
    if (this._instanceReady) {
      try {
        action();
      } catch (ex) { }
    } else {
      this._instanceActions.push(action);
    }
  }

  private mapOutputLineModelToLogEntry(model: OutputLineModel): Array<LogEntryModel> {
    const successIcon: string | undefined = model.type === 'success'
      ? '(fa)fas.check-circle::color=success'//TODO ??
      : undefined;

    const lines = model.content.split('\n').map(ln => ln.trim()).filter(ln => !!ln);

    return lines.map((ln, lni) => {
      return {
        type: model.type === 'success'
          ? 'info'
          : model.type,
        timestamp: model.timestamp,
        message: ln,
        icon: lni === 0
          ? successIcon
          : undefined
      }
    })
  }

  private getSafeDownloadName(viewKey: string): string {
    const viewName = this._instanceNameMap.get(viewKey);
    const sanitizedViewName = viewName.replace(/[^a-zA-Z0-9_]/g, '') + '_';
    return `shell_${sanitizedViewName}${Date.now()}.txt`;
  }

  private _instanceReady = false;
  private _createInstance: (viewKey: string, name: string, allowInput: boolean, makeActive: boolean, autocompleter?: Autocompleter) => void;
  private _deleteInstance: (viewKey: string) => void;
  private _writeOutput: (viewKey: string, append: boolean, ...lines: Array<OutputLineModel>) => void; 

  private readonly _instanceNameMap = new Map<string, string>();
  private readonly _committedInput = new BehaviorSubject<{ readonly viewKey: string, readonly literal: string } | null>(null);
  private readonly _instanceActions = new Array<() => void>();
  private readonly _instanceKeys = new Array<string>();
}
