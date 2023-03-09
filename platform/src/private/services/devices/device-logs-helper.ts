import { Byte, ByteSequenceCreator } from '@allium/types';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';

export class DeviceLogsHelper {
    public activate(installationKey: string): void {
        this.getLatest(installationKey).then(logSet => {
            if (!!logSet) {
                this._logSets.next(this._logSets.getValue().filter(ls => ls.key !== installationKey).concat([{
                    key: logSet.key,
                    active: true,
                    entries: logSet.entries
                }]))
            } else {
                this._logSets.next(this._logSets.getValue().filter(ls => ls.key !== installationKey).concat([{
                    key: installationKey,
                    active: true,
                    entries: new Array<{ timestamp: number, entry: string }>()
                }]))
            }

            this.checkLogs(installationKey, DeviceLogsHelper.getPortFromKey(installationKey));
        })
    }

    public deactivate(installationKey: string): void {
        this.getLatest(installationKey).then(logSet => {
            if (!!logSet) {
                this._logSets.next(this._logSets.getValue().filter(ls => ls.key !== installationKey).concat([{
                    key: logSet.key,
                    active: false,
                    entries: new Array<{ timestamp: number, entry: string }>()
                }]))
            }
        })
    }

    public listen(installationKey: string): Observable<Array<{ timestamp: number, entry: string }>> {
        return this._logSets.pipe(map(x => {
            const entries = new Array<{ timestamp: number, entry: string }>();
            const installation = x.find(y => y.key === installationKey && y.active);
            if (!!installation) {
                installation.entries.forEach(e => {
                    entries.push(e);
                });
                return entries;
            } else {
                return null;
            }
        }), filter(x => x !== null), map(x => x!));
    }

    public constructor(getLog: (portIndex: Byte) => Array<{ readonly timestamp: number, readonly entry: string }>, checkInterval: number) {
        this._getLog = getLog;
        this._lastUpdateTimestamps = new Map<string, number>();
        this._checkInterval = checkInterval;
        this._logSets = new BehaviorSubject<Array<{ readonly key: string, active: boolean, readonly entries: Array<{ timestamp: number, entry: string }> }>>([]);
    }

    private checkLogs(installationKey: string, portIndex: Byte): void {
        setTimeout(() => {
            const updateTimestamp = Date.now();
            const portLog = this._getLog(portIndex);

            const entries = new Array<{ timestamp: number, entry: string }>();
            const lastUpdate = this._lastUpdateTimestamps.get(installationKey) || 0;
            portLog.filter(le => le.timestamp > lastUpdate).forEach(le => {
                entries.push(le);
            });

            if (entries.length > 0) {
                this.getLatest(installationKey).then(logSet => {
                    if (!!logSet && logSet.active) {
                        this._logSets.next(this._logSets.getValue().filter(ls => ls.key !== installationKey).concat([{
                            key: logSet.key,
                            active: true,
                            entries: logSet.entries.concat(entries.sort((a, b) => b.timestamp - a.timestamp))
                        }]))
                    }
                })
            }

            this._lastUpdateTimestamps.set(installationKey, updateTimestamp);
            this.checkLogs(installationKey, portIndex);
        }, this._checkInterval);
    }

    private getLatest(installationKey: string): Promise<{ readonly key: string, active: boolean, readonly entries: Array<{ timestamp: number, entry: string }> } | undefined> {
        return new Promise((resolve) => {
            this._logSets.pipe(take(1)).subscribe(logSets => {
                resolve(logSets.find(ls => ls.key === installationKey))
            })
        });
    }

    private _logSets: BehaviorSubject<Array<{ readonly key: string, active: boolean, readonly entries: Array<{ timestamp: number, entry: string }> }>>;
    private readonly _checkInterval: number;
    private readonly _lastUpdateTimestamps: Map<string, number>;
    private readonly _getLog: (portIndex: Byte) => Array<{ readonly timestamp: number, readonly entry: string }>;

    public static getPortFromKey(installationKey: string): Byte {
        const indexOfDot = installationKey.indexOf('.');
        const portIndex = Number.parseInt(installationKey.substring(0, indexOfDot), 16);

        if (Number.isInteger(portIndex)) {
            return ByteSequenceCreator.Byte(portIndex);
        } else {
            throw new Error(`unabled to get port index from key: ${installationKey}`);
        }
    }
}