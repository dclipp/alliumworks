import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, filter, distinctUntilChanged, skip, map, debounceTime } from 'rxjs/operators';
import * as objectHash from 'object-hash';
import { AppEntry } from '../app-entry';
import { Shell } from '@alliumworks/shell';
import { UserPreferencesModel } from '../data-models/user-preferences-model';
import { Platform } from '@alliumworks/platform';
import { LocalStorageKeys } from '../utilities/local-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  public pushData(key: SessionDataKey, json: string): Promise<boolean> {
    return new Promise((resolve) => {
      this._storage.pipe(take(1)).subscribe(currentStorage => {
        const index = currentStorage.data.findIndex(d => d.key === key);
        if (index > -1) {
          currentStorage.data[index] = {
            key: key,
            value: json
          };
        } else {
          currentStorage.data.push({
            key: key,
            value: json
          });
        }

        this._storage.pipe(filter(s => s.signature !== currentStorage.signature), take(1)).subscribe(() => {
          resolve(true);
        })

        this._storage.next({
          data: currentStorage.data,
          signature: this.generateSignature(currentStorage.data)
        })

        if (key === 'user-prefs') {
          this._userPrefsJson.next(json);
        }
      })
    })
  }

  public pullData(key: SessionDataKey): Promise<string | null> {
    return new Promise((resolve) => {
      this._storage.pipe(take(1)).subscribe(currentStorage => {
        const index = currentStorage.data.findIndex(d => d.key === key);
        if (index > -1) {
          resolve(currentStorage.data[index].value);
        } else {
          resolve(null);
        }
      })
    })
  }

  // public clearData(key: SessionDataKey): Promise<boolean> {
  //   return new Promise((resolve) => {
  //     this._storage.pipe(take(1)).subscribe(currentStorage => {
  //       const index = currentStorage.data.findIndex(d => d.key === key);
  //       if (index > -1) {
  //         currentStorage.data.splice(index, 1);

  //         this._storage.pipe(filter(s => s.signature !== currentStorage.signature), take(1)).subscribe(() => {
  //           resolve(true);
  //         })
  
  //         this._storage.next({
  //           data: currentStorage.data,
  //           signature: this.generateSignature(currentStorage.data)
  //         })
  //       } else {
  //         resolve(false);
  //       }
  //     })
  //   })
  // }

  public pullFilesystemData(): Promise<string | null> {
    return new Promise((resolve) => {
      let savedFsJson: string | null = null;
      try {
        savedFsJson = localStorage.getItem(LocalStorageKeys.FilesystemData);
      } catch (ex) {

      }
      resolve(savedFsJson);
    })
  }

  public get shell(): Shell {
    return this._shell;
  }

  public get platform(): Platform {
    return  AppEntry.alliumWorksPlatform;
  }

  public getUserPreferences(): Promise<UserPreferencesModel> {
    return new Promise((resolve) => {
      let model: UserPreferencesModel = {};

      this.pullData('user-prefs').then(json => {
        if (!!json) {
          try {
            const m = JSON.parse(json);
            if (!!m) {
              model = m;
            }
          } catch (err) { }
        }

        resolve(model);
      })
    })
  }

  public onUserPrefsChanged(): Observable<UserPreferencesModel> {
    return this._userPrefsJson.pipe(map(x => !!x ? JSON.parse(x) : {}));
  }

  public serializeSession(): Promise<string> {
    return new Promise((resolve) => {
      // TODO
      throw new Error('Not Implemented')
      // this.devkit.machineService.flags.isFlagRaised
      /*this.devkit.machineService.currentMachineState().pipe(take(1)).subscribe(machineState => {
        const addresses = new Array<QuadByte>();
        for (let i = 0; i < machineState.computerMemorySize; i++) {
          addresses.push(ByteSequenceCreator.QuadByte(i));
        }

        this.devkit.machineService.memoryExplorer.fetchValues(addresses).then(addressValues => {
          const memoryValues = addressValues.filter(av => !av.value.isEqualTo(0)).map(av => {
            return {
              address: av.address.toString({ radix: 16, padZeroes: true }),
              value: av.value.toString({ radix: 16, padZeroes: true })
            }
          });

          combineLatest(
            this.devkit.machineService.registers.values().pipe(take(1)),
            this.devkit.workspaceManagerService.activeWorkspace().pipe(take(1)),
            this.platform.assembler.assembly().pipe(take(1)),
            this.platform.assembler.settings().pipe(take(1)))
          .subscribe(([registers, workspace, assembly, settings]) => {
            const serializedMachine = {
              flags: {
                overflow: this.devkit.machineService.flags.isFlagRaised(FlagName.Overflow),
                underflow: this.devkit.machineService.flags.isFlagRaised(FlagName.Underflow),
                outOfBounds: this.devkit.machineService.flags.isFlagRaised(FlagName.OutOfBounds),
                registerSizeMismatch: this.devkit.machineService.flags.isFlagRaised(FlagName.RegisterSizeMismatch),
                iORejection: this.devkit.machineService.flags.isFlagRaised(FlagName.IORejection),
                illegalInstruction: this.devkit.machineService.flags.isFlagRaised(FlagName.IllegalInstruction),
                illegalArgument: this.devkit.machineService.flags.isFlagRaised(FlagName.IllegalArgument),
              },
              registers: {
                instructionPtr: registers.get(Register.InstructionPtr).toString({ radix: 16, padZeroes: true }),
                accumulator: registers.get(Register.Accumulator).toString({ radix: 16, padZeroes: true }),
                monday: registers.get(Register.Monday).toString({ radix: 16, padZeroes: true }),
                tuesday: registers.get(Register.Tuesday).toString({ radix: 16, padZeroes: true }),
                wednesday: registers.get(Register.Wednesday).toString({ radix: 16, padZeroes: true }),
                thursday: registers.get(Register.Thursday).toString({ radix: 16, padZeroes: true }),
                Friday: registers.get(Register.Friday).toString({ radix: 16, padZeroes: true }),
                g7: registers.get(Register.G7).toString({ radix: 16, padZeroes: true }),
                g8: registers.get(Register.G8).toString({ radix: 16, padZeroes: true }),
                g9: registers.get(Register.G9).toString({ radix: 16, padZeroes: true }),
                g10: registers.get(Register.G10).toString({ radix: 16, padZeroes: true }),
                g11: registers.get(Register.G11).toString({ radix: 16, padZeroes: true }),
                g12: registers.get(Register.G12).toString({ radix: 16, padZeroes: true }),
                g13: registers.get(Register.G13).toString({ radix: 16, padZeroes: true }),
                g14: registers.get(Register.G14).toString({ radix: 16, padZeroes: true }),
                stackPtr: registers.get(Register.StackPtr).toString({ radix: 16, padZeroes: true })
              },
              memory: memoryValues,
              memorySize: machineState.computerMemorySize
            };

            const serializedDebugger = {
              breakMode: machineState.breakpointsEnabled,
              traps: this.devkit.machineService.traps.getAll()
            };

            workspace.filesystem().list().then(filesystem => {
              resolve(JSON.stringify({
                machineState: serializedMachine,
                debugger: serializedDebugger,
                filesystem: filesystem,
                build: {
                  assembly: assembly,
                  settings: settings,
                  //todo options?
                }
              }));
            })
          })
        })
      });*/

  // const d = {
  //   machineState: {
  //       flags: [],
  //       registers: [],
  //       memory: [],
  //       devices: [],
  //       configuration: {}
  //   },
  //   filesystem: {},
  //   debugger: {
  //       breakpoints: [],
  //       breakMode: ''
  //   },

  // }
    });
  }

  constructor() {
    this._isOnline = false;//TODO
    this._shell = AppEntry.shell;
    window['SHELL'] = this._shell;

    this._storage.pipe(skip(1), distinctUntilChanged((x, y) => x.signature === y.signature)).subscribe(currentStorage => {
      this.tryWriteLocalStorage(currentStorage);
      if (this._isOnline) {
        //TODO
      }
    })

    const restoredSessionData = new Array<{ readonly key: SessionDataKey, readonly value: string }>();

    const envSessionDataJson = AppEntry.sessionDataJson;
    if (!!envSessionDataJson) {
      envSessionDataJson.forEach(d => {
        restoredSessionData.push({
          key: d.key as SessionDataKey,
          value: d.content
        })
      })
    }

    const savedStorage = this.tryReadLocalStorage();
    if (!!savedStorage) {
      savedStorage.data.forEach(d => {
        const index = restoredSessionData.findIndex(r => r.key === d.key);
        if (index > -1) {
          restoredSessionData[index] = {
            key: d.key,
            value: d.value
          };
        } else {
          restoredSessionData.push({
            key: d.key,
            value: d.value
          })
        }
      })
    }

    this._filesystemChanged.pipe(distinctUntilChanged(), debounceTime(5000), filter(x => x !== -1)).subscribe(() => {
      this.platform.yfs.serializeAssets().then(sa => {
        try {
          // console.log('serializing FilesystemData')
          localStorage.setItem(LocalStorageKeys.FilesystemData, sa);
        } catch (ex) {
    
        }
      })
    })

    this._storage.next({
      data: restoredSessionData,
      signature: this.generateSignature(restoredSessionData)
    })

    this.platform.yfs.watchAsset('/', () => {
      this._filesystemChanged.next(Math.random());
    })
  }

  private tryWriteLocalStorage(storage: SessionStorage): void {
    try {
      localStorage.setItem(LocalStorageKeys.SessionData, JSON.stringify(storage));
    } catch (ex) {

    }
  }

  private tryReadLocalStorage(): SessionStorage | null {
    let storage: SessionStorage | null = null;
    try {
      storage = JSON.parse(localStorage.getItem(LocalStorageKeys.SessionData));
    } catch (ex) {

    }

    return storage;
  }

  private generateSignature(data: Array<any>): string {
    return `${data.length}:${objectHash.MD5(data)}`;
  }

  private readonly _shell: Shell;
  private readonly _isOnline: boolean;
  private readonly _filesystemChanged = new BehaviorSubject<number>(-1);
  private readonly _userPrefsJson = new BehaviorSubject<string>('');
  private readonly _storage = new BehaviorSubject<SessionStorage>({ data: [], signature: `0:${objectHash.MD5([])}` });
}

export type SessionDataKey = 'device-favorites' | 'top-devices' | 'shell-buffer' | 'user-prefs';
type SessionStorage = { readonly data: Array<{ readonly key: SessionDataKey, readonly value: string }>, readonly signature: string };