import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Register, ByteSequenceCreator, QuadByte, DynamicByteSequence } from '@allium/types';
import { BehaviorSubject } from 'rxjs';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { TrapType, RegisterTrap } from '@alliumworks/platform';
import { PopperController } from 'ngx-popper';
import { SessionService } from 'src/app/services/session.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'aq4w-register-explorer',
  templateUrl: './register-explorer.component.html',
  styleUrls: ['./register-explorer.component.scss']
})
export class RegisterExplorerComponent extends Aq4wComponent implements OnInit {

  // @Input('expansionTriggered')
  // public set expansionTriggered(expansionTriggered: Observable<boolean>) {
  //   this.setupExpansionTriggeredSubscription(expansionTriggered);
  // }

  @Input('isExpanded')
  public set isExpanded(isExpanded: boolean) {
    if (!isExpanded) {
      this.view.staticEmphasizeWriteIcons = this.view.emphasizeWriteIcons;
      this.view.emphasizeWriteIcons = [];
      this.view.staticEmphasizeReadIcons = this.view.emphasizeReadIcons;
      this.view.emphasizeReadIcons = [];
    }
  }

  @Output('emphasizeInTaskBar')
  public readonly emphasizeInTaskBar = new EventEmitter<boolean>();

  @ViewChild('editorPopover')
  editorPopover: PopperController;

  public view = {
    registerValues: {
      insptr: ByteSequenceCreator.QuadByte(0),
      accumulator: ByteSequenceCreator.QuadByte(0),
      monday: ByteSequenceCreator.QuadByte(0),
      tuesday: ByteSequenceCreator.QuadByte(0),
      wednesday: ByteSequenceCreator.QuadByte(0),
      thursday: ByteSequenceCreator.QuadByte(0),
      friday: ByteSequenceCreator.QuadByte(0),
      g7: ByteSequenceCreator.QuadByte(0),
      g8: ByteSequenceCreator.QuadByte(0),
      g9: ByteSequenceCreator.QuadByte(0),
      g10: ByteSequenceCreator.QuadByte(0),
      g11: ByteSequenceCreator.QuadByte(0),
      g12: ByteSequenceCreator.QuadByte(0),
      g13: ByteSequenceCreator.QuadByte(0),
      g14: ByteSequenceCreator.QuadByte(0),
      stkptr: ByteSequenceCreator.QuadByte(0)
    },
    isEditable: false,
    editingKeys: new Array<string>(),
    readWatches: new Array<string>(),
    writeWatches: new Array<string>(),
    emphasizeReadIcons: new Array<string>(),
    emphasizeWriteIcons: new Array<string>(),
    staticEmphasizeReadIcons: new Array<string>(),
    staticEmphasizeWriteIcons: new Array<string>(),
    displayRadix: 10,
    editor: {
      show: false,
      radix: 10,
      initialValue: ByteSequenceCreator.QuadByte(0),
      register: Register.InstructionPtr
    }
  }

  public on = {
    readWatchCellClicked: (registerName: string) => {
      if (this.view.readWatches.includes(registerName)) {
        this.view.readWatches = this.view.readWatches.filter(w => w !== registerName);
        this._sessionService.platform.machine.traps.registerReads.remove([this.getRegisterFromKey(registerName)]);
        this.view.emphasizeReadIcons = this.view.emphasizeReadIcons.filter(k => k !== registerName);
      } else {
        this.view.readWatches.push(registerName);
        this._sessionService.platform.machine.traps.registerReads.listen([this.getRegisterFromKey(registerName)]);
      }
    },
    writeWatchCellClicked: (registerName: string) => {
      if (this.view.writeWatches.includes(registerName)) {
        this.view.writeWatches = this.view.writeWatches.filter(w => w !== registerName);
        this._sessionService.platform.machine.traps.registerWrites.remove([this.getRegisterFromKey(registerName)]);
        this.view.emphasizeWriteIcons = this.view.emphasizeWriteIcons.filter(k => k !== registerName);
      } else {
        this.view.writeWatches.push(registerName);
        this._sessionService.platform.machine.traps.registerWrites.listen([this.getRegisterFromKey(registerName)]);
      }
    },
    changeRadix: () => {
      if (this.view.displayRadix === 10) {
        this.view.displayRadix = 16;
      } else if (this.view.displayRadix === 16) {
        this.view.displayRadix = 2;
      } else {
        this.view.displayRadix = 10;
      }
    },
    toggleEditMode: (key: string, context: { show: boolean, setValue?: (value: DynamicByteSequence) => void }) => {//(key: string, event: MouseEvent) => {
      // if (this.view.editor.show) {

      // } else {
      // this.view.editor.initialValue = this.view.registerValues[key].clone();
      this.view.editor.register = this.getRegisterFromKey(key);
      if (context.show) {
        context.setValue(this.view.registerValues[key].clone());
      }
      // this.view.editor.show = true;
      // const offsetHeight = document.getElementById(`register-edit-icon-for-${key}`).offsetHeight;
      // console.log(`${event.pageX} ${event.pageY}; offsetHeight = ${offsetHeight}`)
      // this.tryUpdatePopoverPosition(event.pageX, Math.max(0, event.pageY - offsetHeight));
      // this.changeEditorPopoverVisibility(true);
    },
    editorClosed: () => {
      this.changeEditorPopoverVisibility(false);
    },
    valueEdited: (value: QuadByte) => {
      this._sessionService.platform.machine.registers.updateValue(this.view.editor.register, value);
      // this.changeEditorPopoverVisibility(false);
    }
  }

  constructor(private _sessionService: SessionService) {
    super();
  }

  ngOnInit() {
    this._sessionService.platform.machine.registers.values().subscribe(registerValues => {
      this.view.registerValues.insptr = registerValues.get(Register.InstructionPtr);
      this.view.registerValues.accumulator = registerValues.get(Register.Accumulator);
      this.view.registerValues.monday = registerValues.get(Register.Monday);
      this.view.registerValues.tuesday = registerValues.get(Register.Tuesday);
      this.view.registerValues.wednesday = registerValues.get(Register.Wednesday);
      this.view.registerValues.thursday = registerValues.get(Register.Thursday);
      this.view.registerValues.friday = registerValues.get(Register.Friday);
      this.view.registerValues.g7 = registerValues.get(Register.G7);
      this.view.registerValues.g8 = registerValues.get(Register.G8);
      this.view.registerValues.g9 = registerValues.get(Register.G9);
      this.view.registerValues.g10 = registerValues.get(Register.G10);
      this.view.registerValues.g11 = registerValues.get(Register.G11);
      this.view.registerValues.g12 = registerValues.get(Register.G12);
      this.view.registerValues.g13 = registerValues.get(Register.G13);
      this.view.registerValues.g14 = registerValues.get(Register.G14);
      this.view.registerValues.stkptr = registerValues.get(Register.StackPtr);
    })

    this._sessionService.platform.machine.traps.onCaught().subscribe(trapsCaught => {
      const regWrites = trapsCaught
        .filter(t => t.type === TrapType.RegisterWrite)
        .map(t => (t as RegisterTrap).registers)
        .reduce((x, y) => x.concat(y), []);
      this.view.staticEmphasizeWriteIcons = [];
      this.view.emphasizeWriteIcons = regWrites.map(rw => this.getRegisterKeyFromValue(rw));
      if (this.view.emphasizeWriteIcons.length > 0) {
        this.emphasizeInTaskBar.emit(true);
        console.log(`regwritewatch:`)
      }

      const regReads = trapsCaught
        .filter(t => t.type === TrapType.RegisterRead)
        .map(t => (t as RegisterTrap).registers)
        .reduce((x, y) => x.concat(y), []);
      this.view.staticEmphasizeReadIcons = [];
      this.view.emphasizeReadIcons = regReads.map(rr => this.getRegisterKeyFromValue(rr));
      if (this.view.emphasizeReadIcons.length > 0) {
        this.emphasizeInTaskBar.emit(true);
      }
    })

    this._registerWriteNotifications.subscribe(regWrites => {
      this.view.staticEmphasizeWriteIcons = [];
      this.view.emphasizeWriteIcons = regWrites.map(rw => this.getRegisterKeyFromValue(rw));
      if (this.view.emphasizeWriteIcons.length > 0) {
        this.emphasizeInTaskBar.emit(true);
      }
    })
    this._registerReadNotifications.subscribe(regReads => {
      this.view.staticEmphasizeReadIcons = [];
      this.view.emphasizeReadIcons = regReads.map(rr => this.getRegisterKeyFromValue(rr));
      if (this.view.emphasizeReadIcons.length > 0) {
        this.emphasizeInTaskBar.emit(true);
      }
    })

    this._sessionService.platform.machine.currentMachineState().subscribe(state => {
      this.view.isEditable = !state.isComputerRunning && Number.isInteger(state.computerMemorySize) && state.computerMemorySize > 0;
    })

    this._sessionService.platform.machine.traps.onSet()
      .pipe(filter(t => t.type === TrapType.RegisterRead || t.type === TrapType.RegisterWrite))
      .subscribe(trap => {
        window.setTimeout(() => {
          const registerNames = (trap as RegisterTrap).registers.map(r => this._registerKeyNameMap.find(k => k.register === r).key);
          registerNames.forEach(registerName => {
            if (trap.type === TrapType.RegisterRead) {
              this.view.readWatches.push(registerName);
            } else {
              this.view.writeWatches.push(registerName);
            }
          })
        }, 500)
      })

    this._sessionService.platform.machine.traps.onUnset()
      .pipe(filter(t => t.type === TrapType.RegisterRead || t.type === TrapType.RegisterWrite))
      .subscribe(trap => {
        window.setTimeout(() => {
          const registerNames = (trap as RegisterTrap).registers.map(r => this._registerKeyNameMap.find(k => k.register === r).key);
          registerNames.forEach(registerName => {
            if (trap.type === TrapType.RegisterRead) {
              this.view.readWatches = this.view.readWatches.filter(w => w !== registerName);
            } else {
              this.view.writeWatches = this.view.writeWatches.filter(w => w !== registerName);
            }
          })
        }, 500)
      })
  }

  private getRegisterFromKey(key: string): Register {
    const mapItem = this._registerKeyNameMap.find(x => x.key === key);
    return !!mapItem ? mapItem.register : null;
  }

  private getRegisterKeyFromValue(value: Register): string {
    const mapItem = this._registerKeyNameMap.find(x => x.register === value);
    return !!mapItem ? mapItem.key : null;
  }

  // private setupExpansionTriggeredSubscription(expansionTriggered: Observable<boolean>): void {
  //   if (!!this._triggerExpansionSubscription) {
  //     this._triggerExpansionSubscription.unsubscribe();
  //     this._triggerExpansionSubscription = null;
  //   }

  //   this._triggerExpansionSubscription = expansionTriggered.pipe(takeUntil(this.destroyed), distinctUntilChanged()).subscribe(isExpanded => {
  //     // this._isExpanded = isExpanded;
  //     if (!isExpanded) {
  //       this.view.staticEmphasizeWriteIcons = this.view.emphasizeWriteIcons;
  //       this.view.emphasizeWriteIcons = [];
  //       this.view.staticEmphasizeReadIcons = this.view.emphasizeReadIcons;
  //       this.view.emphasizeReadIcons = [];
  //     }
  //   })
  // }

  private changeEditorPopoverVisibility(show: boolean): void {
    if (show) {
      this.editorPopover.show();
    } else {
      this.editorPopover.hide();
    }
  }

  // private updatePopoverYOffset(x: number, y: number): void {
  //   const el = document.getElementById('register-explorer-value-editor-popover');
  //   const contentEl = el.children.item(0);
  //   (contentEl as HTMLElement).style.top = `${y}px`;
  //   (contentEl as HTMLElement).style.left = `${x}px`;
  // }

  private tryUpdatePopoverPosition(x: number, y: number): void {
    const el = document.getElementById('register-explorer-value-editor-popover');
    const contentEl = el.children.item(0) as HTMLElement;
    if (contentEl.style.display !== 'none' && !!contentEl.style.left && contentEl.style.left === '0px') {
      contentEl.style.top = `${y}px`;
      contentEl.style.left = `${x}px`;
      this._popoverUpdateAttemptCount = 0;
    } else {
      if (this._popoverUpdateAttemptCount > 10) {
        this._popoverUpdateAttemptCount = 0;
        // window.setTimeout(() => { this.tryUpdatePopoverPosition(x, y) }, 200);
      } else {
        this._popoverUpdateAttemptCount++;
        window.setTimeout(() => { this.tryUpdatePopoverPosition(x, y) }, 200);
      }
    }
  }

  // private _isExpanded = false;
  private _popoverUpdateAttemptCount = 0;
  // private _triggerExpansionSubscription: Subscription = null;
  private readonly _registerWriteNotifications = new BehaviorSubject<Array<Register>>([]);
  private readonly _registerReadNotifications = new BehaviorSubject<Array<Register>>([]);
  private readonly _registerKeyNameMap = [{
    key: 'insptr',
    register: Register.InstructionPtr
  }, {
    key: 'accumulator',
    register: Register.Accumulator
  }, {
    key: 'monday',
    register: Register.Monday
  }, {
    key: 'tuesday',
    register: Register.Tuesday
  }, {
    key: 'wednesday',
    register: Register.Wednesday
  }, {
    key: 'thursday',
    register: Register.Thursday
  }, {
    key: 'friday',
    register: Register.Friday
  }, {
    key: 'g7',
    register: Register.G7
  }, {
    key: 'g8',
    register: Register.G8
  }, {
    key: 'g9',
    register: Register.G9
  }, {
    key: 'g10',
    register: Register.G10
  }, {
    key: 'g11',
    register: Register.G11
  }, {
    key: 'g12',
    register: Register.G12
  }, {
    key: 'g13',
    register: Register.G13
  }, {
    key: 'g14',
    register: Register.G14
  }, {
    key: 'stkptr',
    register: Register.StackPtr
  }]
}
