import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ContentManagerService } from './content-manager.service';
import { ToolGroup } from '../view-models/toolbar/tool-group';
import { ToolbarToolGroups } from '../view-models/toolbar/toolbar-tool-groups';
import { ToolbarButton } from '../view-models/toolbar/toolbar-button';

@Injectable({
  providedIn: 'root'
})
export class ToolbarManagerService {

  public onButtonClicked(): Observable<string> {
    return this._buttonClicked;
  }

  public buttonClicked(buttonKey: string): void {
    this._buttonClicked.next(buttonKey);
    window.setTimeout(() => {
      this._buttonClicked.next('');
    })
  }

  public onButtonStateChanged(): Observable<{ readonly buttonKey: string, readonly isEnabled: boolean }> {
    return this._buttonStateChanged;
  }

  public setButtonState(buttonKey: string, isEnabled: boolean): void {
    const toolGroupsIndex = this._toolGroupsByContentKey.findIndex(x => x.contentKey === this._activeContentKey);
    this.updateButtonState(toolGroupsIndex, buttonKey, isEnabled, true);
  }

  public setButtonStatesForGroup(groupName: string, isEnabled: boolean): void {
    const toolGroupsIndex = this._toolGroupsByContentKey.findIndex(x => x.contentKey === this._activeContentKey);
    ToolbarToolGroups.getButtonKeysForGroup(groupName).forEach((buttonKey, i, a) => {
      this.updateButtonState(toolGroupsIndex, buttonKey, isEnabled, i === a.length - 1);
    })
  }

  public onToolGroupsChanged(): Observable<Array<ToolGroup>> {
    return this._toolGroupsChanged;
  }

  public setButtonStatus(buttonKey: string, isActive: boolean): void {
    const current = this._buttonStatuses.getValue();
    const next = { buttonKey: buttonKey, isActive: isActive }; 
    if (ToolbarToolGroups.doesButtonSupportStatus(buttonKey)) {
      this._buttonStatuses.next(current.filter(x => x.buttonKey !== buttonKey).concat([next]));
    }
  }

  public buttonStatuses(): Observable<Array<{ readonly buttonKey: string, readonly isActive: boolean }>> {
    return this._buttonStatuses;
  }

  constructor(private _contentManagerService: ContentManagerService) {
    this._contentManagerService.onActiveContentChanged().subscribe(contentKey => {
      this.saveCurrentToolGroups();
      const descriptor = this._contentManagerService.getActiveContentDescriptor();
      if (!!descriptor && !!descriptor.toolGroups && descriptor.toolGroups.length > 0) {
        const savedGroups = this._toolGroupsByContentKey.find(x => x.contentKey === contentKey);
        if (!!savedGroups) {
          this._toolGroupsChanged.next(savedGroups.toolGroups);
        } else {
          const groups = ToolbarToolGroups.getGroupsByName(descriptor.toolGroups);
          this._toolGroupsByContentKey.push({ contentKey: contentKey, toolGroups: groups });
          this._toolGroupsChanged.next(groups);
        }
      } else {
        this._toolGroupsChanged.next([]);
      }
      this._activeContentKey = contentKey;
    })

    this._contentManagerService.content().subscribe(content => {
      const keysToRemove = this._toolGroupsByContentKey.filter(x => !content.some(y => y.contentKey === x.contentKey)).map(x => x.contentKey);
      if (keysToRemove.length > 0) {
        keysToRemove.forEach(k => {
          const index = this._toolGroupsByContentKey.findIndex(x => x.contentKey === k);
          this._toolGroupsByContentKey.splice(index, 1);
        })
      }
    })
  }

  private updateToolbarButton(toolGroups: Array<ToolGroup>, buttonKey: string, updates: Partial<ToolbarButton>): Array<ToolGroup> {
    let indexOfGroup = -1;
    let indexOfButton = -1;
    for (let i = 0; i < toolGroups.length && indexOfGroup === -1 && indexOfButton === -1; i++) {
      indexOfButton = toolGroups[i].buttons.findIndex(b => b.buttonKey === buttonKey);
      if (indexOfButton > -1) {
        indexOfGroup = i;
        Object.keys(updates).forEach(k => {
          toolGroups[indexOfGroup].buttons[indexOfButton][k] = updates[k];
        })
      }
    }
    return toolGroups;
  }

  private saveCurrentToolGroups(): void {
    const toolGroups = this._toolGroupsChanged.getValue();
    const index = this._toolGroupsByContentKey.findIndex(x => x.contentKey === this._activeContentKey);
    if (index > -1) {
      this._toolGroupsByContentKey[index] = {
        contentKey: this._activeContentKey,
        toolGroups: toolGroups
      };
    } else {
      this._toolGroupsByContentKey.push({
        contentKey: this._activeContentKey,
        toolGroups: toolGroups
      });
    }
  }
  
  private updateButtonState(toolGroupsIndex: number, buttonKey: string, isEnabled: boolean, emitNullAfter: boolean): void {
    if (toolGroupsIndex > -1) {
      this._toolGroupsByContentKey[toolGroupsIndex].toolGroups = this.updateToolbarButton(
        this._toolGroupsByContentKey[toolGroupsIndex].toolGroups,
        buttonKey,
        { disabled: !isEnabled }
      );
      this._buttonStateChanged.next({ buttonKey: buttonKey, isEnabled: isEnabled });
      if (emitNullAfter) {
        window.setTimeout(() => {
          this._buttonStateChanged.next(NULL_BUTTON_STATE);
        })
      }
    }
  }

  private _activeContentKey = '';
  private readonly _buttonClicked = new BehaviorSubject<string>('');
  private readonly _buttonStateChanged = new BehaviorSubject<{ readonly buttonKey: string, readonly isEnabled: boolean }>(NULL_BUTTON_STATE);
  private readonly _toolGroupsChanged = new BehaviorSubject<Array<ToolGroup>>([]);
  private readonly _toolGroupsByContentKey = new Array<{ contentKey: string, toolGroups: Array<ToolGroup> }>();
  private readonly _buttonStatuses = new BehaviorSubject<Array<{ readonly buttonKey: string, readonly isActive: boolean }>>([]);
}

const NULL_BUTTON_STATE = { buttonKey: '', isEnabled: false };