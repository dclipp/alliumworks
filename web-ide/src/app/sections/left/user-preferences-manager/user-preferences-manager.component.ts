import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { UserPreferencesModel } from 'src/app/data-models/user-preferences-model';
import { LocalStorageKeys } from 'src/app/utilities/local-storage-keys';

@Component({
  selector: 'aq4w-user-preferences-manager',
  templateUrl: './user-preferences-manager.component.html',
  styleUrls: ['./user-preferences-manager.component.scss']
})
export class UserPreferencesManagerComponent implements OnInit {

  public on = {
    clickedBackdrop: () => {
      document.getElementById('user-preferences-manager').classList.remove('show');
      this.view.localStorageClearResult = '';
    },
    clearLocalStorage: () => {
      try {
        if (!!localStorage) {
          localStorage.removeItem(LocalStorageKeys.SessionData);
          localStorage.removeItem(LocalStorageKeys.FilesystemData);
          this.view.localStorageClearResult = `Cleared at ${new Date().toLocaleTimeString()}`;
        } else {
          this.view.localStorageClearResult = `Not available (${new Date().toLocaleTimeString()})`;
        }
      } catch (ex) {
        this.view.localStorageClearResult = `Not available (${new Date().toLocaleTimeString()})`;
      }
    },
    close: () => {
      document.getElementById('user-preferences-manager').classList.remove('show');
      this.view.localStorageClearResult = '';
    },
    preferTimestampsInUtcChanged: (value: boolean) => {
      console.log(`preferTimestampsInUtcChanged to=${value}`);
      this._sessionService.pushData('user-prefs', JSON.stringify(this.getUpdatedModel({
        preferTimestampsInUTC: value
      })))
    }
  }

  public view = {
    localStorageClearResult: '',
    preferTimestampsInUTC: false
  }

  constructor(private _sessionService: SessionService) { }

  ngOnInit() {
    this._sessionService.getUserPreferences().then((up) => {
      this.view.preferTimestampsInUTC = up.preferTimestampsInUTC === true;
    })
  }

  private getUpdatedModel(changes: Partial<UserPreferencesModel>): UserPreferencesModel {
    return {
      preferTimestampsInUTC: changes.preferTimestampsInUTC === undefined ? this.view.preferTimestampsInUTC : changes.preferTimestampsInUTC === true
    }
  }

}
