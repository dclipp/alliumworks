import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ButtonBarButtonViewModel } from 'src/app/view-models/left-section/button-bar/button-bar-button-view-model';
import { ButtonBarButton } from 'src/app/view-models/left-section/button-bar/button-bar-button';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { takeUntil } from 'rxjs/operators';
import { ButtonSelectionRequirement } from 'src/app/view-models/left-section/button-bar/button-selection-requirement';
import { PopperContent } from 'ngx-popper';
import { ButtonBarContextMenuItem } from 'src/app/view-models/left-section/button-bar/button-bar-context-menu-item';
import { DomUtility } from 'src/app/utilities/dom-utility';

@Component({
  selector: 'aq4w-browser-button-bar',
  templateUrl: './browser-button-bar.component.html',
  styleUrls: ['./browser-button-bar.component.scss']
})
export class BrowserButtonBarComponent extends Aq4wComponent implements OnInit {

  @Input('buttons')
  public set buttons(buttons: Array<ButtonBarButton>) {
    this._buttons.next(buttons);
  }

  @Input('selectionCount')
  public set selectionCount(selectionCount: number) {
    this._selectionCount.next(selectionCount);
  }

  @Input('disabledButtonKeys')
  public set disabledButtonKeys(disabledButtonKeys: Array<string>) {
    this._disabledButtonKeys.next(disabledButtonKeys);
  }

  @Output('buttonClicked')
  public readonly buttonClicked = new EventEmitter<string>();

  public view = {
    buttons: new Array<ButtonBarButtonViewModel>(),
    moreMenuItemButtons: new Array<ButtonBarButtonViewModel>(),
    moreMenuWidth: 2,
    contextMenuOptions: new Array<ButtonBarContextMenuItem>()
    // moreMenuShowSubOptions: ''
  }

  public on = {
    buttonClicked: (buttonKey: string) => {
      if (buttonKey !== 'MoreMenu') {
        this.buttonClicked.emit(buttonKey);
        if (!!this.morePopper) {
          this.morePopper.hide();
        }
      }
      // if (buttonKey !== 'MoreMenu' && this.view.moreMenuShowSubOptions !== buttonKey) {
      //   const button = this.view.buttons.find(btn => btn.key === buttonKey) || this.view.moreMenuItemButtons.find(btn => btn.key === buttonKey);
      //   if (!!button) {
      //     if (!!button.moreWithSuboptions) {
      //       if (this.view.moreMenuShowSubOptions !== buttonKey) {
      //         this.view.moreMenuShowSubOptions = buttonKey;
      //         // if (!!this.view.moreMenuShowSubOptions) {
  
      //         // } else {
      //         //   this.view.moreMenuShowSubOptions = buttonKey;
      //         // } 
      //       }
      //     } else {
      //       this.view.moreMenuShowSubOptions = '';
      //       this.buttonClicked.emit(buttonKey);
      //       if (!!this.morePopper) {
      //         this.morePopper.hide();
      //       }
      //     }
      //   }
      // }
    },
    subOptionClicked: (buttonKey: string, subOptionValue?: string) => {
      // console.log(`subOptionClicked=${buttonKey}.${subOptionValue}`)
      // if (!!subOptionValue) {

      // } else {
      //   this.view.moreMenuShowSubOptions = '';
      // }
    },
    contextMenuClicked: (event: MouseEvent, buttonKey: string) => {
      event.stopImmediatePropagation();
      this._showContextMenuPopper = !this._showContextMenuPopper;
      if (this._showContextMenuPopper) {
        const button = this.view.buttons.find(b => b.key === buttonKey);
        if (!!button && !!button.contextMenu) {
          this.view.contextMenuOptions = button.contextMenu;
          this.contextMenuPopper.show();
          this.addContextMenuClickWatch();
        }
      } else {
        this.view.contextMenuOptions = [];
        this.contextMenuPopper.hide();
      }
    },
    contextMenuOptionSelected: (optionKey: string) => {
      const cmItem = this.view.contextMenuOptions.find(o => o.key === optionKey);
      this.buttonClicked.emit(cmItem.emitButtonKey);
      this.view.contextMenuOptions = [];
      this.contextMenuPopper.hide();
      this.removeContextMenuClickWatch();
      this._showContextMenuPopper = false;
    }
  }

  constructor() {
    super();
  }

  ngOnInit() {
    combineLatest(this._buttons, this._selectionCount, this._disabledButtonKeys)
      .pipe(takeUntil(this.destroyed))
      .subscribe(([buttons, selectionCount, disabledButtonKeys]) => {
        this.refreshButtonViewModels(buttons, selectionCount, disabledButtonKeys);
      })
  }

  private isDisabledBySelectionCount(selectionCount: number, selectionRequirement: ButtonSelectionRequirement): boolean {
    if (selectionRequirement === 'any') {
      return false;
    } else if (selectionCount === 0) {
      return selectionRequirement !== 'no-selection';
    } else if (selectionCount === 1) {
      return selectionRequirement === 'no-selection' || selectionRequirement === 'many';
    } else {
      return selectionRequirement === 'no-selection' || selectionRequirement === 'one';
    }
  }

  private refreshButtonViewModels(buttons: Array<ButtonBarButton>, selectionCount: number, disabledButtonKeys: Array<string>): void {
    const mainButtons = new Array<ButtonBarButtonViewModel>();
    const moreMenuButtons = new Array<ButtonBarButtonViewModel>();
    buttons.forEach(btn => {
      const isDisabled = disabledButtonKeys.includes(btn.key) || this.isDisabledBySelectionCount(selectionCount, btn.selectionRequirement);
      const viewModel: ButtonBarButtonViewModel = {
        iconName: btn.iconName,
        key: btn.key,
        selectionRequirement: btn.selectionRequirement,
        additionalClass: btn.additionalClass,
        tooltip: btn.tooltip,
        disabledAttr: isDisabled ? 'disabled' as 'disabled' | null : null,
        additionalClassAttr: !!btn.additionalClass ? btn.additionalClass : null,
        tooltipAttr: !!btn.tooltip ? btn.tooltip : null,
        contextMenu: btn.contextMenu
      };
      if (btn.additionalClass === 'more-menu-item') {
        moreMenuButtons.push(viewModel);
      } else {
        mainButtons.push(viewModel);
      }
      // if (!!btn.additionalClass && btn.additionalClass.startsWith('more-menu-item')) {
      //   const dotIndex = btn.additionalClass.indexOf('.');
      //   const subAdditionalClass = dotIndex > -1 ? btn.additionalClass.substring(dotIndex + 1) : '';
      //   const moreWithSuboptions = this.parseMoreMenuItemSuboptions(subAdditionalClass);
      //   if (!!moreWithSuboptions) {
      //     viewModel.moreWithSuboptions = {
      //       caption: moreWithSuboptions.majorCaption,
      //       suboptions: moreWithSuboptions.subopts
      //     };
      //   }
      //   // viewModel.additionalClassAttr = btn.additionalClass.split('.')[1] || null;
      //   moreMenuButtons.push(viewModel);
      // } else {
      //   mainButtons.push(viewModel);
      // }
    })

    this.view.buttons = mainButtons;
    this.view.moreMenuItemButtons = moreMenuButtons;
    let moreMenuWidth = 2;
    if (moreMenuButtons.length > 0) {
      moreMenuWidth += moreMenuButtons.find((b, bi, ba) => !ba.some(b2 => b2.tooltipAttr.length > b.tooltipAttr.length)).tooltipAttr.length;
    }
    this.view.moreMenuWidth = moreMenuWidth;
  }

  // private parseMoreMenuItemSuboptions(additionalClass: string): {
  //   majorCaption: string,
  //   subopts: Array<{ readonly iconName: string, readonly value: string, readonly caption: string }>
  // } | null {
  //   //.suboptions:"ddd"[{(fa)fas.trash-alt,bin,Bin},{(fa)fas.trash-alt,hex,Hex},{(fa)fas.trash-alt,dec,Dec}]

  //   const suboptionsMatch = additionalClass.match(/^[ \t]{0,}suboptions[ \t]{0,}:[ \t]{0,}"([^"]+)"[ \t]{0,}\[/);
  //   if (!!suboptionsMatch) {
  //     let workingFeed = additionalClass.substring(suboptionsMatch[0].length);
  //     const majorCaption = suboptionsMatch[1];
  //     const subopts = new Array<{ readonly iconName: string, readonly value: string, readonly caption: string }>();
  //     let optMatch = workingFeed.match(/\{[ \t]{0,}([^,]+),[ \t]{0,}([^,]+),[ \t]{0,}([^\}]+)[ \t]{0,}\}/);
  //     while (!!optMatch && workingFeed.length > 0) {
  //       subopts.push({
  //         iconName: optMatch[1],
  //         value: optMatch[2],
  //         caption: optMatch[3]
  //       });

  //       workingFeed = workingFeed.substring(optMatch[0].length);
  //       const separatorMatch = workingFeed.match(/^[ \t]{0,},/);
  //       if (!!separatorMatch) {
  //         workingFeed = workingFeed.substring(separatorMatch[0].length);
  //         optMatch = workingFeed.match(/\{[ \t]{0,}([^,]+),[ \t]{0,}([^,]+),[ \t]{0,}([^\}]+)[ \t]{0,}\}/);
  //       } else {
  //         optMatch = null;
  //       }
  //     }

  //     return {
  //       majorCaption: majorCaption,
  //       subopts: subopts
  //     }
  //   } else {
  //     return null;
  //   }
  // }

  // private isElementInScope(element: HTMLElement, scopeChecker: (e: HTMLElement) => boolean): boolean {
  //   let isInScope = false;
  //   try {
  //     isInScope = scopeChecker(element);
  //     if (!isInScope && !!element.parentElement && element.nodeName.toLowerCase() !== 'body') {
  //       isInScope = this.isElementInScope(element.parentElement, scopeChecker);
  //     }
  //   } catch (ex) { }

  //   return isInScope;
  // }

  private checkContextMenuClick(event: MouseEvent): void {
    const contextMenuElement = DomUtility.parentsUntil(
      event.target as HTMLElement,
      (el) => el.classList.contains('context-menu-toggle') || el.classList.contains('context-menu'),
      (el) => el.tagName === 'AQ4W-BROWSER-BUTTON-BAR');

    if (!(!!contextMenuElement)) {
      this.contextMenuPopper.hide();
      this._showContextMenuPopper = false;
      this.view.contextMenuOptions = [];
      this.removeContextMenuClickWatch();
    }
  }

  private addContextMenuClickWatch(): void {
    window.addEventListener('click', (event) => {
      this.checkContextMenuClick(event);
    })
  }

  private removeContextMenuClickWatch(): void {
    window.removeEventListener('click', (event) => {
      this.checkContextMenuClick(event);
    })
  }

  @ViewChild('morePopper')
  morePopper: PopperContent;
  
  @ViewChild('contextMenuPopper')
  contextMenuPopper: PopperContent;

  private _showContextMenuPopper = false;
  private readonly _buttons = new BehaviorSubject<Array<ButtonBarButton>>([]);
  private readonly _selectionCount = new BehaviorSubject<number>(0);
  private readonly _disabledButtonKeys = new BehaviorSubject<Array<string>>([]);

}
