import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ByteSequenceCreator, QuadByte, DynamicByteSequence } from '@allium/types';
import { MemoryExplorerItemViewModel } from 'src/app/view-models/memory-explorer/memory-explorer-item-view-model';
import { RadixHelper } from 'src/app/utilities/radix-helper';
import { MemoryExplorerQuadCollection } from 'src/app/view-models/memory-explorer/memory-explorer-quad-collection';
import { FormControl, AbstractControl } from '@angular/forms';
import { map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { emptyMemoryExplorerModel } from 'src/app/view-models/memory-explorer/memory-explorer-model';
import { SessionService } from 'src/app/services/session.service';
// import { MemoryExplorerWatchPayloadOLD } from 'src/app/view-models/memory-explorer/memory-explorer-watch-payloadOLD';

@Component({
  selector: 'aq4w-memory-browser',
  templateUrl: './memory-browser.component.html',
  styleUrls: ['./memory-browser.component.scss']
})
export class MemoryBrowserComponent extends Aq4wComponent implements OnInit {

  // @Input('watches')
  // public set watches(watches: MemoryExplorerWatchPayloadOLD) {
  //   if (!!this._watchUnsubscribe) {
  //     this._watchUnsubscribe();
  //   } else {
  //     this.view.watches = watches;
  //   }

  //   // this.view.watches = watches;
  //   this._watchUnsubscribe = watches.subscribe((payload) => {
  //     this.view.watches.merge(payload);
  //   });
  //   // this.view.watches.merge(watches);
  //   // this.view.watches = new MemoryExplorerWatchPayload(watches);
  // }
  // @Input('writeWatches')
  // public set writeWatches(writeWatches: MemoryExplorerQuadCollection) {
  //   this.view.writeWatches = writeWatches;
  // }

  // @Input('readWatches')
  // public set readWatches(readWatches: MemoryExplorerQuadCollection) {
  //   this.view.readWatches = readWatches;
  // }

  // @Input('writeIcons')
  // public set writeIcons(writeIcons: MemoryExplorerQuadCollection) {
  //   this.view.emphasis.writeIcons = writeIcons;
  // }

  // @Input('readIcons')
  // public set readIcons(readIcons: MemoryExplorerQuadCollection) {
  //   this.view.emphasis.readIcons = readIcons;
  // }

  // @Input('writeIconsStatic')
  // public set writeIconsStatic(writeIconsStatic: MemoryExplorerQuadCollection) {
  //   this.view.emphasis.writeIconsStatic = writeIconsStatic;
  // }

  // @Input('readIconsStatic')
  // public set readIconsStatic(readIconsStatic: MemoryExplorerQuadCollection) {
  //   this.view.emphasis.readIconsStatic = readIconsStatic;
  // }

  @Input('editingAddresses')
  public set editingAddresses(editingAddresses: MemoryExplorerQuadCollection) {
    this.view.editingAddresses = editingAddresses;
  }

  // @Output('toggleReadWatch')
  // public readonly toggleReadWatch = new EventEmitter<QuadByte>();

  // @Output('toggleWriteWatch')
  // public readonly toggleWriteWatch = new EventEmitter<QuadByte>();
  // @Output('watchChanged')
  // public readonly watchChanged = new EventEmitter<MemoryExplorerWatchPayload>();

  public view = {
    // currentOffset: ByteSequenceCreator.Byte(0),
    offsetSlider: new FormControl(),
    offsetBase10: new FormControl(),
    offsetBase16: new FormControl(undefined, (control: AbstractControl) => {
      if (RegExp(/^(0x){0,1}([0-9a-f]+)$/i).test(control.value) && Number.parseInt(control.value, 16) <= this.view.maxMemoryOffset) {
        return null;
      } else {
        return {
          'error': 'Invalid'
        }
      }
    }),
    maxMemoryOffset: 0,
    offsetRadix: 10,
    addressRadix: 10,
    valueRadix: 10,
    currentMemoryItems: new Array<MemoryExplorerItemViewModel>(),
    watches: emptyMemoryExplorerModel(),
    // writeWatches: new MemoryExplorerQuadCollection(),
    // readWatches: new MemoryExplorerQuadCollection(),
    // emphasis: {
    //   writeIcons: new MemoryExplorerQuadCollection(),
    //   readIcons: new MemoryExplorerQuadCollection(),
    //   writeIconsStatic: new MemoryExplorerQuadCollection(),
    //   readIconsStatic: new MemoryExplorerQuadCollection()
    // },
    editingAddresses: new MemoryExplorerQuadCollection(),
    editor: {
      radix: 10,
      initialValue: ByteSequenceCreator.Byte(0)
    },
    canStepBack: false,
    canStepForward: false
  }

  public on = {
    // readWatchCellClicked: (memAddress: QuadByte) => {
    //   this.toggleReadWatch.emit(memAddress);
    // },
    // writeWatchCellClicked: (memAddress: QuadByte) => {
    //   this.toggleWriteWatch.emit(memAddress);
    // },
    changeAddressRadix: () => {
      this.view.addressRadix = this.getNextRadixForNonValue(this.view.addressRadix);
    },
    changeValueRadix: () => {
      this.view.valueRadix = RadixHelper.getNextRadix(this.view.valueRadix as 2 | 10 | 16);
    },
    toggleEditMode: (memAddress: QuadByte, editorContext: { show: boolean, setValue?: (value: DynamicByteSequence) => void }) => {
      this.view.editor.initialValue = this.view.currentMemoryItems.find(x => x.address.isEqualTo(memAddress)).value;
      if (editorContext.show) {
        editorContext.setValue(this.view.editor.initialValue.clone());
      }
    },
    valueEdited: (event: { memAddress: QuadByte, updatedValue: DynamicByteSequence }) => {
      this._sessionService.platform.machine.memory.updateValue(event.memAddress, event.updatedValue.getByte(1));
      // this.refreshViewMemoryValues(this._currentOffset);
    },
    // watchChanged: (payload: MemoryExplorerWatchPayloadOLD) => {
    //   // this.watchChanged.emit(payload);
    // },
    offsetBase16Blurred: () => {
      if (this.view.offsetBase16.invalid) {
        this.view.offsetBase16.setValue(`0x${Number(this.view.offsetBase10.value).toString(16).toUpperCase()}`, { emitEvent: false })
      }
    },
    offsetSliderChanged: () => {
      const nval = Number(this.view.offsetSlider.value);
      // this.view.offsetBase10.setValue(nval, { emitEvent: false });
      // this.view.offsetBase16.setValue(`0x${nval.toString(16).toUpperCase()}`, { emitEvent: false });
      this.updateOffset(nval);
    },
    stepOffset: (step: number) => {
      const valueAfterStep = step > 0
        ? ByteSequenceCreator.Unbox(this._currentOffset.computeSum(1))
        : ByteSequenceCreator.Unbox(this._currentOffset.computeDifference(1));
      this.view.offsetSlider.setValue(valueAfterStep, { emitEvent: false });
      this.view.offsetBase10.setValue(valueAfterStep, { emitEvent: false });
      this.view.offsetBase16.setValue(`0x${valueAfterStep.toString(16).toUpperCase()}`, { emitEvent: false });
      this.updateOffset(valueAfterStep);
    }
  }

  constructor(private _sessionService: SessionService) {
    super();
  }

  ngOnInit() {
    //TESTING
    // this.view.currentMemoryItems = [
    //   { address: ByteSequenceCreator.QuadByte(0), value: ByteSequenceCreator.Byte(0)},
    //   { address: ByteSequenceCreator.QuadByte(1), value: ByteSequenceCreator.Byte(1)},
    //   { address: ByteSequenceCreator.QuadByte(2), value: ByteSequenceCreator.Byte(2)}]

    this.view.offsetSlider.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
      const nval = Number(value);
      this.view.offsetBase10.setValue(nval, { emitEvent: false });
      this.view.offsetBase16.setValue(`0x${nval.toString(16).toUpperCase()}`, { emitEvent: false });
      // this.updateOffset(nval);
    })

    this.view.offsetBase10.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
      const nval = Number(value);
      this.view.offsetSlider.setValue(nval, { emitEvent: false });
      this.view.offsetBase16.setValue(`0x${nval.toString(16).toUpperCase()}`, { emitEvent: false });
      this.updateOffset(nval);
    })

    this.view.offsetBase16.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
      if (this.view.offsetBase16.valid) {
        const nval = Number.parseInt(value, 16);
        this.view.offsetSlider.setValue(nval, { emitEvent: false });
        this.view.offsetBase10.setValue(nval, { emitEvent: false });
        this.updateOffset(nval);
      }
    })

    this._sessionService.platform.machine.currentMachineState().pipe(map(s => s.computerMemorySize), distinctUntilChanged(), takeUntil(this.destroyed)).subscribe(computerMemorySize => {
      if (computerMemorySize > 0) {
        this.view.maxMemoryOffset = computerMemorySize - this._sessionService.platform.machine.memoryExplorer.MAX_VALUES_PER_PAGE;
        this.updateOffset(0);
      } else {
        this._currentOffset = ByteSequenceCreator.QuadByte(0);
        this.view.editor.initialValue = ByteSequenceCreator.Byte(0);
        this.view.offsetSlider.setValue(0, { emitEvent: false });
        this.view.offsetBase10.setValue(0, { emitEvent: false });
        this.view.offsetBase16.setValue('0x0', { emitEvent: false });
        this.view.maxMemoryOffset = 0;
        this.view.currentMemoryItems = new Array<MemoryExplorerItemViewModel>();
        this.view.canStepBack = false;
        this.view.canStepForward = false;
      }
    })

    this._sessionService.platform.machine.memoryExplorer.model().pipe(takeUntil(this.destroyed)).subscribe(model => {
      this.view.watches = model;
      this.refreshViewMemoryValues(this._currentOffset);
    })

    this._sessionService.platform.machine.memory.onValueUpdated().pipe(takeUntil(this.destroyed)).subscribe(address => {
      if (this.view.currentMemoryItems.some(i => i.address.isEqualTo(address))) {
        this.refreshViewMemoryValues(this._currentOffset);
      }
    })
  }

  private getNextRadixForNonValue(current: number): 2 | 10 | 16 {
    return RadixHelper.getNextRadix(current as 2 | 10 | 16, [2]);
  }

  private updateOffset(offsetValue: number): void {
    this._currentOffset = ByteSequenceCreator.QuadByte(offsetValue);
    this.view.editor.initialValue = ByteSequenceCreator.Byte(0);
    this.refreshViewMemoryValues(this._currentOffset);
    this.view.canStepBack = this._currentOffset.isGreaterThan(0);
    this.view.canStepForward = this._currentOffset.isLessThan(this.view.maxMemoryOffset);
  }

  private refreshViewMemoryValues(offset: QuadByte): void {
    this._sessionService.platform.machine.memoryExplorer.getValuesBeginningAt(offset).then(bytes => {
      this.view.currentMemoryItems = bytes.map((v, i) => {
        return {
          address: offset.computeSum(i),
          value: v
        }
      })
    })
  }

  private _watchUnsubscribe: undefined | (() => void) = undefined;
  private _currentOffset = ByteSequenceCreator.QuadByte(0);

}
