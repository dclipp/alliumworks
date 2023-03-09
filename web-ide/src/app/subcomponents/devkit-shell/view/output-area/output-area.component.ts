import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { OutputLineModel } from 'src/app/subcomponents/devkit-shell/models/output-line.model';
import { AgentService } from 'src/app/services/agent.service';
import { SessionService } from 'src/app/services/session.service';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { OutputAreaModel } from '../../models/output-area.model';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Component({
  selector: 'ngconsole-output-area',
  templateUrl: './output-area.component.html',
  styleUrls: ['./output-area.component.scss']
})
export class OutputAreaComponent extends Aq4wComponent implements OnInit, AfterViewInit {

  @Input('data')
  public set data(data: OutputAreaModel | null) {
    if (!!data) {
      if (data.append) {
        this.appendLines(data.lines);
      } else {
        this.loadLines(data.lines);    
      }
    } else {
      this.loadLines([]);
    }
  }

  @Input('emUnitSizePx')
  public set emUnitSizePx(emUnitSizePx: number) {
    this._emUnitSizePx.next(emUnitSizePx);
  }

  @Input('extendHeight')
  public set extendHeight(extendHeight: boolean) {
    this._extendHeight.next(extendHeight);
    console.log(`extendHeight=${extendHeight}`)
  }
  
  public view = {
    lines: new Array<OutputLineModel & { readonly timestampString: string }>(),
    height: 5
  }

  constructor(private _agentService: AgentService, private _sessionService: SessionService) {
    super();
  }

  ngOnInit(): void {
    this._sessionService.onUserPrefsChanged().pipe(takeUntil(this.destroyed), debounceTime(500)).subscribe(() => {
      this.view.lines = this.view.lines.map(ln => {
        return {
          content: ln.content,
          timestamp: ln.timestamp,
          timestampString: this._agentService.toPreferredDateTimeFormat(ln.timestamp),
          type: ln.type
        }
      })
    })
  }

  ngAfterViewInit(): void {
    combineLatest(this._emUnitSizePx, this._extendHeight, this._agentService.shellTopVarChanged()).subscribe(([emUnitSizePx, extendHeight, shellTopPx]) => {
      let computedHeightEm = (window.innerHeight - shellTopPx - (emUnitSizePx * 4.5)) / 14;
      if (extendHeight) {
        computedHeightEm += 2;
      }
      console.log(`computedHeightEm=${computedHeightEm}`)
      setTimeout(() => {
        this.view.height = Math.max(5, Math.ceil(computedHeightEm));
      })
    })
  }

  private loadLines(lines: Array<OutputLineModel>): void {
    this.view.lines = lines.sort((a, b) => a.timestamp - b.timestamp).map(ln => {
      return {
        content: ln.content,
        timestamp: ln.timestamp,
        timestampString: this._agentService.toPreferredDateTimeFormat(ln.timestamp),
        type: ln.type
      }
    })
  }

  private appendLines(lines: Array<OutputLineModel>): void {
    lines.sort((a, b) => a.timestamp - b.timestamp).forEach(ln => {
      this.view.lines.push({
        content: ln.content,
        timestamp: ln.timestamp,
        timestampString: this._agentService.toPreferredDateTimeFormat(ln.timestamp),
        type: ln.type
      })
    })
  }

  private readonly _extendHeight = new BehaviorSubject<boolean>(false);
  private readonly _emUnitSizePx = new BehaviorSubject<number>(1);

}
