import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'testapp-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css']
})
export class IconComponent implements AfterViewInit {

  @Input('name')
  public set name(name: string) {
    this._name.next(name);
  }

  @ViewChild('el')
  elementRef: ElementRef<HTMLElement>;

  constructor() { }

  ngAfterViewInit(): void {
    this._name.pipe(distinctUntilChanged()).subscribe(name => {
      this.tryRender(name);
    })
  }

  private extractIconProperties(nameString: string): {
    readonly attributes: Array<{ readonly attrName: string, readonly attrValue: string }>,
    readonly backgroundIconName: string,
    readonly foregroundIconName?: string
  } {
    const attributes = new Array<{ readonly attrName: string, readonly attrValue: string }>();
    let backgroundIconName = '';
    let foregroundIconName: string = undefined;

    //fg:undo,bg:document
    if (RegExp(/^fg:[-a-zA-Z0-9]+,bg:[-a-zA-Z0-9]+$/).test(nameString)) {
      const segments = nameString.split(',').filter(x => !!x);
      foregroundIconName = segments[0].replace('fg:', '').trim();
      backgroundIconName = segments[1].replace('bg:', '').trim();
    } else {
      let ionName = nameString;
      if (nameString.includes('+')) {
        const segments = nameString.split('+');
        ionName = segments[0];
        segments
          .filter((x, i) => i > 0)
          .map(x => x.split(':'))
          .forEach(x => {
            attributes.push({
              attrName: x[0],
              attrValue: x[1]
            });
          })
      }

      const colorAttributeMatch = ionName.match(/::color=([_a-zA-Z\-]+)[ \t]{0,}$/);
      if (!!colorAttributeMatch) {
        attributes.push({
          attrName: 'icon-color',
          attrValue: colorAttributeMatch[1]
        });
        backgroundIconName = ionName.substring(0, ionName.indexOf(colorAttributeMatch[0]));
      } else {
        backgroundIconName = ionName;
      }
    }

    return {
      attributes: attributes,
      backgroundIconName: backgroundIconName,
      foregroundIconName: foregroundIconName
    }
  }

  private tryRender(name: string): void {
    const container = !!this.elementRef ? this.elementRef.nativeElement : null;
    if (!!container) {
      this._attemptCount = 0;
      if (!!name) {
        const iconProps = this.extractIconProperties(name);
        if (iconProps.attributes.length > 0) {
          iconProps.attributes
            .forEach(x => {
              container.setAttribute(x.attrName, x.attrValue);
            })
        } else if (container.hasAttributes()) {
          container['getAttributeNames']().forEach(a => container.removeAttribute(a));
        }
        container.innerHTML = this.getIconHtml(iconProps.backgroundIconName, true);
        if (!!iconProps.foregroundIconName) {
          const fgHtml = this.getIconHtml(iconProps.foregroundIconName, false);
          container.innerHTML += `<div class="foreground-icon">${fgHtml}</div>`;
        }
      } else {
        container.innerHTML = '';
      }
    } else if (this._attemptCount < 10) {
      this._attemptCount++;
      window.setTimeout(() => { this.tryRender(name) }, 100);
    }
  }

  private getIonHtml(iconName: string, alignMiddle: boolean): string {
    if (window['_wide_use_ionicons'] === true) { // TODO remove
      const style = alignMiddle ? ' style="vertical-align: middle;"' : '';
      return `<ion-icon name="${iconName}"${style}></ion-icon>`
    } else {
      return this.getFontAwesomeHtml('far.square').replace('<i', `<i title="IconName=${iconName}"`);
    }
  }

  private getFontAwesomeHtml(iconName: string): string {
    const dotIndex = iconName.indexOf('.');
    const style: 'far' | 'fas' = dotIndex > -1
      ? iconName.substring(0, dotIndex).trim() === 'fas'
      ? 'fas'
      : 'far'
      : 'far';
    const name = dotIndex > -1 ? iconName.substring(dotIndex + 1) : iconName;
    return `<i class="${style} fa-${name}" aria-hidden="true"></i>`
  }

  private getCustomHtml(iconName: string): string {
    return `<span class="cheapicons ${iconName}"></span>`;
  }

  private parsePack(packName: string): 'ion' | 'fa' | 'custom' {
    if (packName === 'fa') {
      return 'fa';
    } else if (packName === 'c') {
      return 'custom';
    } else {
      return 'ion';
    }
  }

  private getIconHtml(name: string, alignMiddle: boolean): string {
    if (name === this._LOADING_ICON_NAME) {
      return this.getLoadingIcon();
    } else {
      const packStartIndex = name.indexOf('(');
      const packEndIndex = packStartIndex > -1 ? name.indexOf(')') : -1;
      const pack: 'ion' | 'fa' | 'custom' = packStartIndex > -1 ? this.parsePack(name.substring(packStartIndex + 1, packEndIndex)) : 'ion';
      const iconName = packStartIndex > -1 ? name.substring(packEndIndex + 1) : name;
      if (pack === 'fa') {
        return this.getFontAwesomeHtml(iconName);
      } else if (pack === 'custom') {
        return this.getCustomHtml(iconName);
      } else {
        return this.getIonHtml(iconName, alignMiddle);
      }
    }
  }

  private getLoadingIcon(): string {
    return '<div class="ide-loading-icon">L</div>'
  }

  private _attemptCount = 0;
  private readonly _name = new BehaviorSubject<string>(null);
  private readonly _LOADING_ICON_NAME = '(loading)';

}
