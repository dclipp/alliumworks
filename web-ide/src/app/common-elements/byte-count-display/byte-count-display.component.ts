import { Component, Input, OnInit } from '@angular/core';

/**
 * tooltipTemplate:
 *  ^^notbyte Show this if the unit is larger than byte ^^
 *  ^plural --> pluralUnit
 *  ^count --> byteCount
 *  ^unitCount --> the count in units (NN.nn)
 */
@Component({
  selector: 'aq4w-byte-count-display',
  templateUrl: './byte-count-display.component.html',
  styleUrls: ['./byte-count-display.component.scss']
})
export class ByteCountDisplayComponent implements OnInit {

  @Input('count')
  public set count(count: number) {
    this._count = count;
    this.refreshView();
  }

  @Input('additionalClasses')
  public set additionalClasses(additionalClasses: string | Array<string>) {
    const additionalClassesObj: { [cssClassName: string]: true } = {};
    if (Array.isArray(additionalClasses)) {
      additionalClasses.forEach(ac => {
        additionalClassesObj[ac] = true;
      });
    } else {
      additionalClassesObj[additionalClasses] = true;
    }

    setTimeout(() => {
      this.view.additionalClasses = additionalClassesObj;
    });
  }
  
  @Input('tooltipTemplate')
  public set tooltipTemplate(tooltipTemplate: string) {
    this._tooltipTemplate = tooltipTemplate;
    this.refreshView();
  }

  public view = {
    count: '0',
    shortUnit: '',
    pluralUnit: '',
    tooltip: '',
    additionalClasses: {} as { readonly [cssClassName: string]: true }
  }

  constructor() { }

  ngOnInit() {
  }

  private getDisplayData(count: number): {
    readonly countText: string;
    readonly shortUnit: string;
    readonly pluralUnit: string;
  } {
    const gbThreshold = 34359738368;
    const mbThreshold = 33554432;
    const kbThreshold = 32768;

    if (count > gbThreshold) {
      return {
        countText: (count / this._bytesPerGb).toFixed(2),
        shortUnit: 'gb',
        pluralUnit: 'gigabytes'
      };
    } else if (count > mbThreshold) {
      return {
        countText: (count / this._bytesPerMb).toFixed(2),
        shortUnit: 'mb',
        pluralUnit: 'megabytes'
      };
    } else if (count > kbThreshold) {
      return {
        countText: (count / this._bytesPerKb).toFixed(2),
        shortUnit: 'kb',
        pluralUnit: 'kilobytes'
      };
    } else {
      return {
        countText: count.toString(),
        shortUnit: '',
        pluralUnit: 'bytes'
      };
    }
  }

  private resolveTooltip(template: string, byteCount: number, pluralUnit: string, unitCount: string): string {
    let resolvedTooltip = template;

    resolvedTooltip = resolvedTooltip.replace(this._TEMPLATE_PLURAL, pluralUnit);
    resolvedTooltip = resolvedTooltip.replace(this._TEMPLATE_COUNT, byteCount.toString());
    resolvedTooltip = resolvedTooltip.replace(this._TEMPLATE_UNIT_COUNT, unitCount);

    const isByteUnit = byteCount.toString() === unitCount;
    let notbyteIndex = resolvedTooltip.indexOf(this._TEMPLATE_LITERAL_NOTBYTE_START);
    let iterationCount = 0;
    while (notbyteIndex > -1 && iterationCount < this._MAX_ITR) {
      iterationCount++;
      const endIndex = resolvedTooltip.indexOf(this._TEMPLATE_LITERAL_NOTBYTE_END, notbyteIndex + 1);
      if (endIndex > -1) {
        const before = notbyteIndex > 0
          ? resolvedTooltip.substring(0, notbyteIndex)
          : '';
        const after = endIndex < resolvedTooltip.length - 1
          ? resolvedTooltip.substring(endIndex + this._TEMPLATE_LITERAL_NOTBYTE_END.length)
          : '';
        const inner = resolvedTooltip.substring(notbyteIndex + this._TEMPLATE_LITERAL_NOTBYTE_START.length, endIndex);

        resolvedTooltip = before;

        if (!isByteUnit) {
          resolvedTooltip += inner;
        }

        resolvedTooltip += after;
      }

      notbyteIndex = resolvedTooltip.indexOf(this._TEMPLATE_LITERAL_NOTBYTE_START);
    }

    return resolvedTooltip;
  }

  private refreshView(): void {
    const data = this.getDisplayData(this._count);
    const tooltip = this.resolveTooltip(this._tooltipTemplate, this._count, data.pluralUnit, data.countText);

    setTimeout(() => {
      this.view.count = data.countText;
      this.view.shortUnit = data.shortUnit;
      this.view.pluralUnit = data.pluralUnit;
      this.view.tooltip = tooltip;
    });
  }

  private _count = 0;
  private _tooltipTemplate = '';

  private readonly _bytesPerGb = 1073741824;
  private readonly _bytesPerMb = 1048576;
  private readonly _bytesPerKb = 1024;

  private readonly _TEMPLATE_LITERAL_NOTBYTE_START = '^^notbyte';
  private readonly _TEMPLATE_LITERAL_NOTBYTE_END = '^^';
  private readonly _TEMPLATE_PLURAL = /\^plural/g;
  private readonly _TEMPLATE_COUNT = /\^count/g;
  private readonly _TEMPLATE_UNIT_COUNT = /\^unitCount/g;

  private readonly _MAX_ITR = 20;
}
