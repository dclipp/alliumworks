import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { PanelDescriptor } from 'src/app/view-models/task-bar/panel-descriptor';
import { PanelContainerApi } from './panel-container-controller';
import { DevicePanelDescriptor } from 'src/app/view-models/task-bar/device-panel-descriptor';
import { DomUtility } from 'src/app/utilities/dom-utility';

@Component({
  selector: 'aq4w-panel-container',
  templateUrl: './panel-container.component.html',
  styleUrls: ['./panel-container.component.scss']
})
export class PanelContainerComponent extends Aq4wComponent implements OnInit {

  @Input('panelDescriptor')
  public set panelDescriptor(panelDescriptor: PanelDescriptor) {
    this.view.title = panelDescriptor.title;
    this.view.titleIcon = panelDescriptor.titleIcon;

    if (panelDescriptor.descriptorType === 'device') {
      const dpd = panelDescriptor as DevicePanelDescriptor;
      this.view.preferredDimensions.width = {
        amount: dpd.preferredWidthAmount,
        isRelative: dpd.preferredWidthUnits === 'rel'
      };
      this.view.preferredDimensions.height = {
        amount: dpd.preferredHeightAmount,
        isRelative: dpd.preferredHeightUnits === 'rel'
      };
      this.view.preferredDimensions.has = true;
      this.view.isDevice = true;
    } else {
      this.view.preferredDimensions.has = false;
      this.view.isDevice = false;
    }

    this._descriptorKey = panelDescriptor.key;
  }

  // @Input('triggerExpansion')
  // public set triggerExpansion(triggerExpansion: Observable<boolean>) {
  //   this.setupTriggerExpansionSubscription(triggerExpansion);
  // }

  @Input('detectChangesOnEvent')
  public detectChangesOnEvent = false;
  
  @Input('allowSeparateWindow')
  public set allowSeparateWindow(allowSeparateWindow: boolean) {
    window.setTimeout(() => {
      this.view.allowSeparateWindow = allowSeparateWindow;
    });
  }
  
  @Output('panelIsFloating')
  public readonly panelDockingChanged = new EventEmitter<boolean>();

  @Output('panelIsExpanded')
  public readonly panelIsExpanded = new EventEmitter<boolean>();
  
  @Output('panelIsInSeparateWindow')
  public readonly panelIsInSeparateWindow = new EventEmitter<void>();

  public view = {
    titleIcon: '',
    title: '',
    isExpanded: false,
    isFloating: false,
    allowSeparateWindow: false,
    isForeground: false,
    contentLeftPx: 0,
    contentTopPx: 0,
    panelContentElementId: `panel_content-${Math.random().toString().substring(3)}`,
    panelContainerElementId: `panel_container-${Math.random().toString().substring(3)}`,
    isDocking: false,
    isDevice: false,
    preferredDimensions: {
      has: false,
      width: {
        amount: 0,
        isRelative: true
      },
      height: {
        amount: 0,
        isRelative: true
      }
    }
  }

  public on = {
    titleBarClicked: (event: MouseEvent) => {
      event.stopImmediatePropagation();
      const target = !!event ? event.target as HTMLElement : undefined;
      if (event === undefined || (!this.view.isFloating && !!target && target.getAttribute('data-title-bar') === 'true')) {
        this.view.isExpanded = !this.view.isExpanded;
        this.panelIsExpanded.emit(this.view.isExpanded);
      } else if (!!target && this.view.isFloating) {
        const iconTarget = DomUtility.parentsUntil(
          target,
          (e) => e.classList.contains('panel-minimize-icon'),
          (e) => e.tagName === 'BODY' || e.classList.contains('panel-container'));
        if (!!iconTarget) {
          this.view.isExpanded = !this.view.isExpanded;
          this.panelIsExpanded.emit(this.view.isExpanded);
        }
      }
    },
    dockIconClicked: (event?: MouseEvent) => {
      if (this.view.isFloating) { // floating --> docked
        this.view.isDocking = true;
        window.setTimeout(() => this.view.isDocking = false, 1000);
        this.view.contentLeftPx = 0;
        this.view.contentTopPx = 0;
        this.view.isFloating = false;
        if (!!event) {
          event.stopImmediatePropagation();
        }
      } else { // docked --> floating
        // this.view.contentLeftPx = 0;
        // this.view.contentTopPx = this.calculateDefaultFloatYPosition();
        this.view.isFloating = true;
        if (!!event) {
          event.stopImmediatePropagation();
        }
        this.recenter();
      }
      this.panelDockingChanged.emit(this.view.isFloating);
    },
    dragTopRow: (event: DragEvent) => {
      if (this.view.isFloating) {
        const x = Math.max(0, event.pageX);
        const y = Math.min(window.innerHeight, event.pageY);
        if (x > 0 && y > 0) {
          this.containerElement.style.left = `${x}px`;
          this.containerElement.style.top = `${y}px`;
        }
        // if (event.screenX > 0) {
        //   this.view.contentLeftPx = event.screenX;
        //   this.view.contentTopPx = event.screenY;
        //   if (this.detectChangesOnEvent) {
        //     this._cd.detectChanges();
        //   }
        // }
      }
    },
    moveToSeparateWindowClicked: () => {
      if (this.view.allowSeparateWindow) {
        window.setTimeout(() => {
          this.panelIsInSeparateWindow.emit();
        });
      }
    }
  }

  public get api(): PanelContainerApi {
    return {
      recenterInWindow: () => { this.recenter() },
      setViewState: (expanded) => {
        this.view.isExpanded = expanded;
      },
      changeTitle: (title: string) => {
        this.view.title = title;
      },
      setForegroundPanel: (key: string) => {
        this.view.isForeground = key === this._descriptorKey;
      },
      descriptorKey: this._descriptorKey
    }
  }

  constructor() {
    super();
  }

  ngOnInit() {
  }

  // private calculateDefaultFloatYPosition(): number {
  //   const panelContentElement = document.getElementById(this.view.panelContentElementId);
  //   const height = panelContentElement.getBoundingClientRect().height;

  //   const panelContainerElement = document.getElementById(this.view.panelContainerElementId);
  //   const top = panelContainerElement.getBoundingClientRect().top;

  //   return top - height;
  // }

  // private setupTriggerExpansionSubscription(triggerExpansion: Observable<boolean>): void {
  //   if (!!this._triggerExpansionSubscription) {
  //     this._triggerExpansionSubscription.unsubscribe();
  //     this._triggerExpansionSubscription = null;
  //   }

  //   this._triggerExpansionSubscription = triggerExpansion.pipe(takeUntil(this.destroyed), filter(x => x !== null)).subscribe(shouldExpand => {
  //     this.view.isExpanded = shouldExpand;
  //   })
  // }

  private recenter(): void {
    const xOffset = this.containerElement.clientWidth / 2;
    const yOffset = this.containerElement.clientHeight / 2;
    this.containerElement.style.left = `${(window.innerWidth / 2) - xOffset}px`;
    this.containerElement.style.top = `${(window.innerHeight / 2) - yOffset}px`;
  }

  private get containerElement(): HTMLElement {
    return document.getElementById(this.view.panelContainerElementId);
  }

  private _descriptorKey = '';
  // private _triggerExpansionSubscription: Subscription = null;
}
