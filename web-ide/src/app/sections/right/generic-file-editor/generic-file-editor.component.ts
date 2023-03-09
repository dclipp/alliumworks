import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToolbarManagerService } from 'src/app/services/toolbar-manager.service';
import { ToolbarButtonKeys } from 'src/app/view-models/toolbar/toolbar-button-keys';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { takeUntil } from 'rxjs/operators';
import { ContentReference } from 'src/app/view-models/content/content-reference';
import { ToolbarToolGroups } from 'src/app/view-models/toolbar/toolbar-tool-groups';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'aq4w-generic-file-editor',
  templateUrl: './generic-file-editor.component.html',
  styleUrls: ['./generic-file-editor.component.scss']
})
export class GenericFileEditorComponent extends Aq4wComponent implements OnInit {

  @Input('content')
  public set content(content: ContentReference) {
    this._componentContentKey = content.contentKey;
    const contentText: string = content.data.text;
    this._initialContent = contentText;
    this.view.control.setValue(contentText, { emitEvent: false });
  }

  public view = {
    control: new FormControl(),
    isDirty: false,
    fontSize: 13
  }

  constructor(private _toolbarManagerService: ToolbarManagerService, private _contentManagerService: ContentManagerService,
    private _modalService: ModalService) {
    super();
  }

  ngOnInit() {
    this._contentManagerService.onActiveContentChanged().pipe(takeUntil(this.destroyed)).subscribe(activeContentKey => {
      if (!!this._componentContentKey && this._componentContentKey === activeContentKey) {
        this.initialize();
      } else {
        this._componentHidden.next();
        this._componentHidden = new Subject<void>();
      }
    })
  }

  private changeFontSize(increase: boolean): boolean {
    const index = this._FONT_SIZE_MAP.findIndex(x => x === this.view.fontSize);
    if (increase) {
      this.view.fontSize = this._FONT_SIZE_MAP[index + 1];
      return index < this._FONT_SIZE_MAP.length - 2;
    } else {
      this.view.fontSize = this._FONT_SIZE_MAP[index - 1];
      return index > 1;
    }
  }

  private initialize(): void {
    this.view.control.valueChanges.pipe(takeUntil(this._componentHidden)).subscribe(() => {
      if (!this.view.isDirty) {
        this._contentManagerService.changeContentStatus(this._componentContentKey, true);
      }
    })

    this._toolbarManagerService.onButtonClicked().pipe(takeUntil(this._componentHidden)).subscribe(buttonKey => {
      if (buttonKey === ToolbarButtonKeys.IncreaseFontSize) {
        window.setTimeout(() => {
          if (!this.changeFontSize(true)) {
            this._toolbarManagerService.setButtonState(ToolbarButtonKeys.IncreaseFontSize, false);
          }
          this._toolbarManagerService.setButtonState(ToolbarButtonKeys.DecreaseFontSize, true);
        })
      } else if (buttonKey === ToolbarButtonKeys.DecreaseFontSize) {
        window.setTimeout(() => {
          if (!this.changeFontSize(false)) {
            this._toolbarManagerService.setButtonState(ToolbarButtonKeys.DecreaseFontSize, false);
          }
          this._toolbarManagerService.setButtonState(ToolbarButtonKeys.IncreaseFontSize, true);
        })
      } else if (buttonKey === ToolbarButtonKeys.SaveFile) {
        const textareaText: string = this.view.control.value;
        this._contentManagerService.saveUpdatedContent(this._componentContentKey, textareaText).then(result => {
          if (result.success) {
            this._initialContent = textareaText;
          }
        })
      } else if (buttonKey === ToolbarButtonKeys.SaveAllFiles) {
        // this._contentManagerService.saveUpdatedContent(this._componentContentKey, this.view.control.value);
      } else if (buttonKey === ToolbarButtonKeys.RevertFile) {
        this._modalService.launchModal(
          'Discard changes',
          'Are you sure you want to discard the changes you\'ve made to this file?',
          (affirmative) => {
            if (affirmative) {
              this.view.isDirty = false;
              this.view.control.setValue(this._initialContent, { emitEvent: false });
              this._contentManagerService.changeContentStatus(this._componentContentKey, false);
            }
          }, { yes: 'Yes', no: 'No' })
      }
    })

    this._contentManagerService.onContentStatusChanged([this._componentContentKey]).pipe(takeUntil(this._componentHidden)).subscribe(status => {
      this.view.isDirty = status.isDirty;
      this._toolbarManagerService.setButtonStatesForGroup(ToolbarToolGroups.GroupNames.FILE_OPTIONS, status.isDirty);
    })
  }

  private _initialContent = '';
  private _componentHidden = new Subject<void>();
  private _componentContentKey: string = null;
  private readonly _FONT_SIZE_MAP = [6, 8, 11, 13, 16, 18, 21, 24, 28, 32];
}
