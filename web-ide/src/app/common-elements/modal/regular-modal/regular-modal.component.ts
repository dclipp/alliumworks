import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ModalLauncher } from '../modal-launcher';
import { RegularModalInput } from 'src/app/data-models/modal/regular-modal-input';
import { RegularModalOutput } from 'src/app/data-models/modal/regular-modal-output';

@Component({
  selector: 'aq4w-regular-modal',
  templateUrl: './regular-modal.component.html',
  styleUrls: ['./regular-modal.component.scss']
})
export class RegularModalComponent implements OnInit, ModalLauncher<RegularModalInput, RegularModalOutput> {

  public view = {
    isOpen: false,
    title: '',
    body: '',
    noButtonCaption: '',
    yesButtonCaption: '',
    hideNoButton: false,
    bodyIsTemplate: false,
    hasInvalidForms: false
  }

  public on = {
    clickedNo: () => {
      this.closeModal(false);
    },
    clickedYes: () => {
      this.closeModal(true);
    },
    backdropClicked: () => {
      //TODO
    }
  }

  public launch(data: RegularModalInput, decision: (output: RegularModalOutput) => void): void {
    this.view.title = data.title;
    // this.view.body = data.bodyIsTemplate === true ? this.parseTemplate(data.body) : data.body;
    this.view.bodyIsTemplate = data.bodyIsTemplate === true;
    this.view.body = data.body;
    this.view.hideNoButton = data.hideNoButton;
    this.view.noButtonCaption = data.noButtonCaption || 'Cancel';
    this.view.yesButtonCaption = data.yesButtonCaption || 'OK';

    if (data.bodyIsTemplate === true) {
      const bodyHtml = this.parseTemplate(data.body);
      this.templatedBody.nativeElement.innerHTML = bodyHtml.markup;
      bodyHtml.docFunctions.forEach(df => {
        df();
      })
    } else {
      this.templatedBody.nativeElement.innerHTML = '';
    }
    
    this._decision = (output) => {
      decision(output);
    }
    this.view.isOpen = true;
  }

  constructor(private _cd: ChangeDetectorRef) { }

  ngOnInit() {
    window['TSTparseTemplate'] = (t) => {
      return this.parseTemplate(t);
    }
    window['TSTextractInputForms'] = (t) => {
      return this.extractInputForms(t);
    }
  }

  private closeModal(affirmative: boolean): void {
    this.view.isOpen = false;
    let formValues: { [formName: string]: string } | undefined = undefined;
    if (affirmative) {
      formValues = {};
      Object.keys(this._forms).forEach(k => {
        if (this._forms[k].isValid) {
          formValues[k] = this._forms[k].value;
        }
      })
    }
    this._decision({ affirmative: affirmative, formValues: formValues });
    this.removeFormValidators();

    this.view.title = '';
    this.view.body = '';
    this.view.bodyIsTemplate = false;
    this.view.hasInvalidForms = false;
    this.view.hideNoButton = false;
    this.view.noButtonCaption = '';
    this.view.yesButtonCaption = '';
    this.view.isOpen = false;
    this._decision = undefined;
  }

  private extractParagraphs(template: string): Array<string> {
    const paragraphs = new Array<string>();
    let escapeSeq = `@@!_${this.random()}`;
    while (template.includes(escapeSeq)) {
      escapeSeq = `@@!_${this.random()}`;
    }

    const escapedTemplate = template.replace(/\\\^/g, escapeSeq);
    let workingTemplate = escapedTemplate;
    let stop = false;
    while (workingTemplate.length > 0 && !stop) {
      const start = workingTemplate.indexOf('^');
      if (start > -1) {
        const end = workingTemplate.indexOf('^', start + 1);
        if (end > -1) {
          paragraphs.push(workingTemplate.substring(start + 1, end));
          workingTemplate = workingTemplate.substring(end + 1);
        } else {

        }
      } else {
        stop = true;
      }
    }

    if (workingTemplate.length > 0) {
      paragraphs.push(workingTemplate);
    }

    return paragraphs.map(p => {
      let s = p;
      while (s.includes(escapeSeq)) {
        s = s.replace(escapeSeq, '^');
      }
      return s;
    });
  }

  private extractLists(template: string): Array<{
    readonly items: Array<string>,
    readonly literal: string
  }> {
    const lists = new Array<{
      readonly items: Array<string>,
      readonly literal: string
    }>();
    let escapeSeq1 = `@@!_${this.random()}`;
    while (template.includes(escapeSeq1)) {
      escapeSeq1 = `@@!_${this.random()}`;
    }
    let escapeSeq2 = `@@!_${this.random()}`;
    while (template.includes(escapeSeq2)) {
      escapeSeq2 = `@@!_${this.random()}`;
    }

    const escapedTemplate = template.replace(/\\~/g, escapeSeq1).replace(/\\\|/g, escapeSeq2);
    let workingTemplate = escapedTemplate;
    let stop = false;
    while (workingTemplate.length > 0 && !stop) {
      const start = workingTemplate.indexOf('~');
      if (start > -1) {
        const end = workingTemplate.indexOf('~', start + 1);
        if (end > -1) {
          const currentList = new Array<string>();
          const literal = workingTemplate.substring(start + 1, end);
          literal.split('|').forEach(item => {
            const ti = item.trim();
            if (!!ti) {
              currentList.push(ti);
            }
          });

          if (currentList.length > 0) {
            lists.push({
              items: currentList,
              literal: literal
            });
          }
          workingTemplate = workingTemplate.substring(end + 1);
        } else {

        }
      } else {
        stop = true;
      }
    }

    return lists.map(list => {
      return {
        items: list.items.map(li => {
          let s = li;
          while (s.includes(escapeSeq1)) {
            s = s.replace(escapeSeq1, '~');
          }
          while (s.includes(escapeSeq2)) {
            s = s.replace(escapeSeq2, '|');
          }
          return s;
        }),
        literal: list.literal
      }
    }).reduce((x, y) => x.concat(y), []);
  }

  private extractInputForms(template: string): Array<{
    readonly markup: string,
    readonly literal: string,
    readonly safeName: string
    readonly defineValidator: () => void;
  }> {
    // >>name,label,required,defaultValue<<
    const inputForms = new Array<{
      readonly name: string;
      readonly label: string;
      readonly pattern: RegExp;
      readonly defaultValue: string;
      readonly literal: string;
      readonly safeName: string;
      readonly defineValidator: () => void;
    }>();
    let escapeSeq1 = `@@!_${this.random()}`;
    while (template.includes(escapeSeq1)) {
      escapeSeq1 = `@@!_${this.random()}`;
    }
    let escapeSeq2 = `@@!_${this.random()}`;
    while (template.includes(escapeSeq2)) {
      escapeSeq2 = `@@!_${this.random()}`;
    }
    let escapeSeq3 = `@@!_${this.random()}`;
    while (template.includes(escapeSeq3)) {
      escapeSeq3 = `@@!_${this.random()}`;
    }
    let escapeSeq4 = `@@!_${this.random()}`;
    while (template.includes(escapeSeq4)) {
      escapeSeq4 = `@@!_${this.random()}`;
    }

    const escapedTemplate = template
      .replace(/\\\>\>/g, escapeSeq1)
      .replace(/\\\<\</g, escapeSeq2)
      .replace(/\\,/g, escapeSeq3)
      .replace(/\\\*/g, escapeSeq4);
    let workingTemplate = escapedTemplate;
    let stop = false;
    while (workingTemplate.length > 0 && !stop) {
      const start = workingTemplate.indexOf('>>');
      if (start > -1) {
        const end = workingTemplate.indexOf('<<', start + 2);
        if (end > -1) {
          // name = 1, label = 2, required = 3, default = 5
          const literal = workingTemplate.substring(start + 2, end)
          const matches = literal.match(/[ \t]{0,}([_\-a-zA-Z0-9]+)[ \t]{0,},[ \t]{0,}([^,]+)[ \t]{0,},[ \t]{0,}\*([^\*]+)\*[ \t]{0,}(,[ \t]{0,}([^\<\<]+)[ \t]{0,}){0,1}/);
          if (!!matches) {
            const safeName = this.getSafeMarkupName(matches[1]
              .replace(RegExp(escapeSeq1, 'g'), '>>')
              .replace(RegExp(escapeSeq2, 'g'), '<<')
              .replace(RegExp(escapeSeq3, 'g'), ',')
              .replace(RegExp(escapeSeq4, 'g'), '*'));
            const pattern = new RegExp('^' + matches[3] + '$', 'g');
            inputForms.push({
              name: matches[1],
              label: matches[2],
              pattern: pattern,
              defaultValue: !!matches[5] ? matches[5] : '',
              literal: literal,
              safeName: safeName,
              defineValidator: () => {
                this.defineFormValidator(pattern, safeName);
              }
            });
            workingTemplate = workingTemplate.substring(end + 2);
          } else {
            throw new Error(`Invalid form markup: "${literal}"`);
          }
        } else {
          throw new Error(`Invalid form markup: missing closing "<<": "${workingTemplate}"`);
        }
      } else {
        stop = true;
      }
    }

    return inputForms.map(form => {
      const ue_name = form.name
        .replace(RegExp(escapeSeq1, 'g'), '>>')
        .replace(RegExp(escapeSeq2, 'g'), '<<')
        .replace(RegExp(escapeSeq3, 'g'), ',');
      const ue_label = form.label
        .replace(RegExp(escapeSeq1, 'g'), '>>')
        .replace(RegExp(escapeSeq2, 'g'), '<<')
        .replace(RegExp(escapeSeq3, 'g'), ',');
      const ue_defaultValue = form.defaultValue
        .replace(RegExp(escapeSeq1, 'g'), '>>')
        .replace(RegExp(escapeSeq2, 'g'), '<<')
        .replace(RegExp(escapeSeq3, 'g'), ',');

      return {
        markup: `<div class="modal-input-form form-section">
          <label for="modal-ifm-${form.safeName}">${ue_label}</label>
          <input type="text" id="modal-ifm-${form.safeName}" value="${ue_defaultValue}" oninput="modal_ifm_validate_${form.safeName}()" spellcheck="false">
          <div class="form-error" id="modal-ifm-error-${form.safeName}">Invalid ${ue_label}</div>
        </div>`,
        literal: form.literal,
        safeName: form.safeName,
        defineValidator: form.defineValidator
      }
    });
  }

  private parseTemplate(template: string): {
    readonly markup: string;
    readonly docFunctions: Array<() => void>;
  } {
    // ^ paragraph ^
    // ~ list item 1 | list item 2 ~
    const docFunctions = new Array<() => void>();
    let parsedHtml = '';
    this.extractParagraphs(template).forEach(p => {
      const lists = this.extractLists(p);
      let workingParagraph = `<p>${p}`;
      // let lastIndex = 0;
      lists.forEach(L => {
        const listHtml = L.items.map(item => `<li>${item}</li>`).reduce((x, y) => x + y, '<ul>') + '</ul>';
        workingParagraph = workingParagraph.replace(`~${L.literal}~`, listHtml);
      });

      this.extractInputForms(p).forEach(form => {
        workingParagraph = workingParagraph.replace(`>>${form.literal}<<`, form.markup);
        docFunctions.push(() => {
          form.defineValidator();
        });
      });

      workingParagraph += '</p>';
      parsedHtml += workingParagraph;
    });

    return {
      markup: parsedHtml,
      docFunctions: docFunctions
    };
  }

  private getSafeMarkupName(name: string): string {
    let safeName = '';
    for (let i = 0; i < name.length; i++) {
      const char = name.charAt(i);
      if (/^[\-_a-zA-Z0-9]$/.test(char)) {
        safeName += char;
      } else {
        safeName += '_';
      }
    }
    return safeName;
  }

  private defineFormValidator(pattern: RegExp, safeName: string): void {
    window[`modal_ifm_validate_${safeName}`] = () => {
      const inputElement = document.getElementById(`modal-ifm-${safeName}`) as HTMLInputElement;
      if (!pattern.test(inputElement.value)) {
        inputElement.setCustomValidity('invalid');
        this._forms[safeName] = {
          isValid: false,
          value: ''
        };
      } else {
        inputElement.setCustomValidity('');
        this._forms[safeName] = {
          isValid: true,
          value: inputElement.value
        };
      }
      this.refreshHasInvalidForms();
    };

    window[`modal_ifm_validate_${safeName}`]();
  }

  private removeFormValidators(): void {
    Object.keys(window).filter(k => k.startsWith('modal_ifm_validate_')).forEach(k => {
      delete window[k];
    });

    Object.keys(this._forms).forEach(k => {
      delete this._forms[k];
    });
  }

  private refreshHasInvalidForms(): void {
    this.view.hasInvalidForms = Object.keys(this._forms).some(k => this._forms[k].isValid === false);
    this._cd.detectChanges();
  }

  private random(): string {
    return Math.random().toString().split('.')[1];
  }

  @ViewChild('templatedBody')
  templatedBody: { nativeElement: HTMLDivElement }

  private _decision: ((output: RegularModalOutput) => void) | undefined = undefined;
  private readonly _forms: { [safeName: string]: {
    isValid: boolean;
    value: string;
  } } = {};

}
