import { Injectable, EmbeddedViewRef } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, take, withLatestFrom, map, last, skipUntil } from 'rxjs/operators';
import { ContentDescriptor } from '../view-models/content/content-descriptor';
import { ContentType } from '../view-models/content/content-type';
import { ContentStatus } from '../view-models/content/content-status';
import { StorageApiService } from './storage-api.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ContentManagerService {

  public onActiveContentChanged(): Observable<string> {
    return this._activeContent.pipe(filter(x => x !== null));
  }

  public changeActiveContent(contentKey: string): void {
    this._activeContent.next(contentKey);
  }

  public content(): Observable<Array<ContentDescriptor>> {
    return this._content;
  }

  public getActiveContentDescriptor(): ContentDescriptor {
    const currentActiveContentKey = this._activeContent.getValue();
    if (!!currentActiveContentKey) {
      return this._content.getValue().find(x => x.contentKey === currentActiveContentKey) || null;
    } else {
      return null;
    }
  }

  public addContent(contextualId: string, type: ContentType, label: string, iconName: string, toolGroups?: Array<string>, activate?: boolean): void {
    this.content().pipe(take(1)).subscribe(current => {
      const descriptor = new ContentDescriptor({
        contextualId: contextualId,
        type: type,
        label: label,
        iconName: iconName,
        toolGroups: toolGroups || []
      });
      current.push(descriptor);
      if (type === ContentType.File) {
        this._workspaceDependentContentKeys.push(descriptor.contentKey);
      }
      this._content.next(current);
      if (activate === true) {
        window.setTimeout(() => {
          this.changeActiveContent(descriptor.contentKey);
        }, 100);
      }
    })
  }

  public removeContent(contentKey: string): void {
    this.content().pipe(take(1), withLatestFrom(this.onActiveContentChanged().pipe(take(1)), this.overrideLabels().pipe(take(1)))).subscribe(([current, activeContentKey, overrideLabels]) => {
      const updatedContent = current.filter(x => x.contentKey !== contentKey);
      this._content.next(updatedContent);

      const olIndex = overrideLabels.findIndex(ol => ol.key === contentKey);
      if (olIndex > -1) {
        overrideLabels.splice(olIndex, 1);
        this._overrideLabels.next(overrideLabels);
      }
      
      if (activeContentKey === contentKey) {
        if (updatedContent.length > 0) {
          this.changeActiveContent(updatedContent[0].contentKey);
        } else {
          this.changeActiveContent('');
        }
      }
    })
  }

  public removeAllContent(): void {
    this.content().pipe(take(1)).subscribe((content) => {
      this._content.next([]);
      this._contentStatuses.next([]);
      this._overrideLabels.next([]);
      this.changeActiveContent('');
    })
  }

  public onContentStatusChanged(contentKeys?: Array<string>): Observable<ContentStatus> {
    return this._contentStatuses.pipe(map(x => {
      let status: ContentStatus = x.length > 0 ? x[x.length - 1] : null;
      const isLatestStatusMatch = !!status && (contentKeys === undefined || contentKeys.length === 0 || contentKeys.includes(status.contentKey));
      if (!isLatestStatusMatch) {
        status = null;
      }
      return status;
    }), filter(x => !!x));
  }

  public changeContentStatus(contentKey: string, isDirty: boolean): void {
    let changed = false;
    const current = this._contentStatuses.getValue();
    const index = current.findIndex(x => x.contentKey === contentKey);
    if (index > -1) {
      const target = current.splice(index, 1);
      if (target[0].isDirty !== isDirty) {
        changed = true;
      }
    } else {
      changed = true;
    }
    
    if (changed) {
      current.push({
        contentKey: contentKey,
        isDirty: isDirty
      });
      this._contentStatuses.next(current);
    }
  }

  public saveUpdatedContent(contentKey: string, updatedContent: string): Promise<{ readonly success: boolean, readonly message?: string }> {
    return new Promise((resolve, reject) => {
      const current = this._contentStatuses.getValue();
      const index = current.findIndex(x => x.contentKey === contentKey);
      if (index > -1) {
        this.pushUpdatedContent(current[index].contentKey, updatedContent).then(success => {
          if (success) {
            current.splice(index, 1);
            current.push({
              contentKey: contentKey,
              isDirty: false
            });
            this._contentStatuses.next(current);
            resolve({
              success: true
            });
          } else {
            resolve({
              success: false
            });
          }
        })
      } else {
        resolve({
          success: false,
          message: `Content not found "${contentKey}"`
        });
      }
    })
  }

  public isAnyContentDirty(): Promise<boolean> {
    return new Promise((resolve) => {
      this._contentStatuses.pipe(take(1)).subscribe(contentStatuses => {
        resolve(contentStatuses.some(cs => cs.isDirty));
      })
    });
  }

  public contentExists(contentKey: string): boolean {
    return this._content.getValue().some(c => c.contentKey === contentKey);
  }

  public renamedContentExists(renamedContentKey: string): boolean {
    return this._overrideLabels.getValue().some(ol => ol.updatedContentKey === renamedContentKey);
  }

  public publishDescriptor(descriptor: ContentDescriptor): void {
    this._publications.next(descriptor);
  }

  public registerPublicationListener(type: ContentType): Observable<ContentDescriptor> {
    if (this._publicationTypeListeners.includes(type)) {
      throw new Error('A listener is already registered type ' + type);
    } else {
      const ob = this._publications.pipe(filter(p => p !== null && p.type === type));
      const onClosed = new Subject<boolean>();
      ob.pipe(last(), (take(1))).subscribe(() => {
        onClosed.next(true);
      });
      onClosed.pipe(take(1)).subscribe(() => {
        const index = this._publicationTypeListeners.indexOf(type);
        if (index > -1) {
          this._publicationTypeListeners.splice(index, 1);
        }
      });
      return ob;
    }
  }

  public overrideLabels(): Observable<Array<{ readonly key: string; readonly label: string; readonly updatedContentKey: string; }>> {
    return this._overrideLabels;
  }

  public updateDescriptorLabel(contentKey: string, updatedContentKey: string, newLabel: string): Promise<boolean> {
    return new Promise((resolve) => {
      this._content.pipe(take(1)).subscribe(descriptors => {
        this._overrideLabels.pipe(take(1)).subscribe(overrideLabels => {
          const index = descriptors.findIndex(d => d.contentKey === contentKey);
          if (index > -1) {
            const olIndex = overrideLabels.findIndex(x => x.key === contentKey);
            if (olIndex > -1) {
              overrideLabels[olIndex] = {
                key: contentKey,
                label: newLabel,
                updatedContentKey: updatedContentKey
              };
            } else {
              overrideLabels.push({
                key: contentKey,
                label: newLabel,
                updatedContentKey: updatedContentKey
              });
            }
            this._overrideLabels.next(overrideLabels);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      })
    });
  }

  constructor(private _storageApiService: StorageApiService, private _sessionService: SessionService) {
    this._sessionService.platform.workspaceManager.activeWorkspace().subscribe(activeWorkspace => {
      if (!!activeWorkspace && this._workspaceDependentContentKeys.length > 0) {
        while (this._workspaceDependentContentKeys.length > 0) {
          const key = this._workspaceDependentContentKeys.pop();
          this.removeContent(key);
        }
      }
    })
  }

  private pushUpdatedContent(contentKey: string, data: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const descriptor = ContentDescriptor.decodeKey(contentKey);
      if (descriptor.type === ContentType.File) {
        this._storageApiService.overwriteFile(descriptor.contextualId, data).then(response => {
          resolve(response.success);
        })
      } else {
        throw new Error('pushUpdatedContent: Type not implemented!');
      }
    })
  }

  private readonly _publicationTypeListeners = new Array<ContentType>();
  private readonly _overrideLabels = new BehaviorSubject<Array<{ readonly key: string; readonly label: string; readonly updatedContentKey: string; }>>([]);
  private readonly _publications = new BehaviorSubject<ContentDescriptor | null>(null);
  private readonly _content = new BehaviorSubject<Array<ContentDescriptor>>([]);
  private readonly _activeContent = new BehaviorSubject<string>(null);
  private readonly _contentStatuses = new BehaviorSubject<Array<ContentStatus>>([]);
  private readonly _workspaceDependentContentKeys = new Array<string>();
}
