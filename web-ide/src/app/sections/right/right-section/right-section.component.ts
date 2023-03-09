import { Component, OnInit, ApplicationRef, EmbeddedViewRef, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, filter, takeUntil, take } from 'rxjs/operators';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { ContentDescriptor } from 'src/app/view-models/content/content-descriptor';
import { ContentType } from 'src/app/view-models/content/content-type';
import { ContentReference } from 'src/app/view-models/content/content-reference';
import { SessionService } from 'src/app/services/session.service';
import { YfsStatus } from 'yfs';

type ContentItemViewModel = { readonly elementRefId: string, readonly contentKey: string, readonly contentTypeCode: number }

@Component({
  selector: 'aq4w-right-section',
  templateUrl: './right-section.component.html',
  styleUrls: ['./right-section.component.scss']
})
export class RightSectionComponent extends Aq4wComponent implements OnInit, AfterViewInit {
  
  @ViewChild('sourceFileEditor')
  sourceFileEditor: TemplateRef<{ contentReference: ContentReference }>;

  @ViewChild('genericFileEditor')
  genericFileEditor: TemplateRef<{ contentReference: ContentReference }>;

  @ViewChild('settingsEditor')
  settingsEditor: TemplateRef<{ contentReference: ContentReference }>;

  @ViewChild('computerPresetsManager')
  computerPresetsManager: TemplateRef<{ contentReference: ContentReference }>;

  @ViewChild('deviceHomepage')
  deviceHomepage: TemplateRef<{ contentReference: ContentReference }>;

  public view = {
    contentItems: new Array<ContentItemViewModel>(),
    activeItemKey: ''
  }

  constructor(private _appRef: ApplicationRef, private _contentManagerService: ContentManagerService, private _sessionService: SessionService) {
    super();
  }

  ngOnInit() {
    // window['_Parser'] = () => { return Parser }
    this._contentManagerService.content().pipe(takeUntil(this.destroyed)).subscribe(content => {
      if (content.length > 0) {
        content.filter(c => !this._contentItems.some(ci => ci[0].contentKey === c.contentKey)).forEach(c => {
          this.getViewRefForContent(c.contentKey).then(viewRef => {
            this.loadContentItem(c.contentKey, c.type, viewRef);
          })
        })
        const ciKeysToRemove = new Array<string>();
        this._contentItems.filter(c => !content.some(cc => cc.contentKey === c[0].contentKey)).forEach(c => {
          this.unloadContentItem(c[0].contentKey, c[1], c[0].elementRefId);
          ciKeysToRemove.push(c[0].contentKey);
        })
        ciKeysToRemove.forEach(k => {
          const index = this._contentItems.findIndex(ci => ci[0].contentKey === k);
          this._contentItems.splice(index, 1);
        })
      } else {
        while (this._contentItems.length > 0) {
          const ci = this._contentItems.pop();
          this.unloadContentItem(ci[0].contentKey, ci[1], ci[0].elementRefId);
        }
      }
    })

    this._contentManagerService.onActiveContentChanged().pipe(takeUntil(this.destroyed)).subscribe(contentKey => {
      window.setTimeout(() => {
        this.view.activeItemKey = contentKey;
      })
    })
  }

  ngAfterViewInit(): void {
    this._appendQueue.pipe(takeUntil(this.destroyed), debounceTime(250), filter(x => x.v !== this._lastQueueVersion)).subscribe(queue => {
      this._lastQueueVersion = queue.v;

      if (queue.items.length > 0) {
        const firstItem = queue.items[0];
        const containerEl = document.getElementById(firstItem.id);
        if (!!containerEl) {
          const rootEl = firstItem.viewRef.rootNodes.find(rn => !!rn.nodeName && !rn.nodeName.startsWith('#'));
          if (!!rootEl) {
            containerEl.appendChild(rootEl);
          }
          this._appendQueue.next({
            v: new Date().valueOf(),
            items: queue.items.filter((x, i) => i > 0)
          });
        } else {
          this._appendQueue.next({
            v: new Date().valueOf(),
            items: queue.items
          });
        }
      }
    })
  }

  private unloadContentItem(contentKey: string, viewRef: EmbeddedViewRef<any>, elementRefId: string): void {
    viewRef.destroy();
    this._appRef.detachView(viewRef);
    const contentItemEl = document.getElementById(elementRefId);
    contentItemEl.innerHTML = '';
    contentItemEl.remove();
    window.setTimeout(() => {
      this.view.contentItems = this.view.contentItems.filter(x => x.contentKey !== contentKey);
    })
  }

  private loadContentItem(contentKey: string, contentType: ContentType, viewRef: EmbeddedViewRef<any>): void {
    this._appRef.attachView(viewRef);
    const elementRefId = this.createRefId(contentKey);
    const viewModel = { elementRefId: elementRefId, contentKey: contentKey, contentTypeCode: contentType.valueOf() };
    this._contentItems.push([viewModel, viewRef]);
    window.setTimeout(() => {
      this.view.contentItems.push(viewModel);
      const current = this._appendQueue.getValue();
      this._appendQueue.next({
        v: new Date().valueOf(),
        items: current.items.concat({
          id: elementRefId,
          viewRef: viewRef
        })
      });
    })
  }

  private createRefId(contentKey: string): string {
    return `content_item_for_${contentKey}`;
  }

  private getViewRefForContent(contentKey: string): Promise<EmbeddedViewRef<any>> {
    return new Promise((resolve, reject) => {
      const decodedKey = ContentDescriptor.decodeKey(contentKey);
      //TODO
      if (decodedKey.type === ContentType.File) {
        const filePath = decodedKey.contextualId;
        this._sessionService.platform.workspaceManager.activeWorkspace().pipe(take(1)).subscribe(ws => {
          if (!!ws) {
            ws.readFile(filePath.replace(ws.absolutePath, '')).then(file => {
              if (file.status === YfsStatus.OK) {
                if (file.payload.extension === 'aq') {
                  resolve(this.sourceFileEditor.createEmbeddedView({ contentReference: { data: { text: file.payload.content, filePath: filePath }, contentKey: contentKey } }));
                } else if (file.payload.title === 'assembly' && file.payload.extension === 'json') {
                  resolve(this.settingsEditor.createEmbeddedView({ contentReference: { data: { settingsJson: file.payload.content }, contentKey: contentKey } }));
                } else {
                  resolve(this.genericFileEditor.createEmbeddedView({ contentReference: { data: { text: file.payload.content }, contentKey: contentKey } }));
                }
              } else {
                //todo
                console.error('failed to get file content')
              }
            }).catch((err) => {
              //todo
              console.error('failed to get file content')
            })
        }
      })
        // this._storageApiService.getFileContent(decodedKey.contextualId).then(file => {
        //   if (file.success) {
        //     if (file.name.toLowerCase().endsWith('.aq')) {
        //       resolve(this.sourceFileEditor.createEmbeddedView({ contentReference: { data: { text: file.content, fileId: decodedKey.contextualId }, contentKey: contentKey } }));
        //     } else if (file.name === 'assembly.json') {
        //       resolve(this.settingsEditor.createEmbeddedView({ contentReference: { data: { settingsJson: file.content }, contentKey: contentKey } }));
        //     } else {
        //       resolve(this.genericFileEditor.createEmbeddedView({ contentReference: { data: { text: file.content }, contentKey: contentKey } }));
        //     }
        //   } else {
        //     //todo
        //     console.error('failed to get file content')
        //   }
        // })
      } else if (decodedKey.type === ContentType.ComputerPresets) {
        if (!!this._computerPresetsManagerViewRef) {
          this._computerPresetsManagerViewRef.destroy();
        }
        this._computerPresetsManagerViewRef = this.computerPresetsManager.createEmbeddedView({ contentReference: { data: { /*TODO ??? */ }, contentKey: contentKey } });
        resolve(this._computerPresetsManagerViewRef);
      } else if (decodedKey.type === ContentType.Device) {
        // console.log(`DEVICE decodedKey.contextualId=${decodedKey.contextualId}`)
        resolve(this.deviceHomepage.createEmbeddedView({ contentReference: { data: { bundleId: decodedKey.contextualId }, contentKey: contentKey } }));
      }
    })
  }

  private _computerPresetsManagerViewRef: EmbeddedViewRef<{ contentReference: ContentReference }> = null;
  private _lastQueueVersion = 0;

  /** [contentKey, elementRefId, ViewRef] */
  private readonly _contentItems = new Array<[ContentItemViewModel, EmbeddedViewRef<any>]>();

  private readonly _appendQueue = new BehaviorSubject<{ v: number, items: Array<{ id: string, viewRef: EmbeddedViewRef<any> }> }>({ v: 0, items: [] });
}
