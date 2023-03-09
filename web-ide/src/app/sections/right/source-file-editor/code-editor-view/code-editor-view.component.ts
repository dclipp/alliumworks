import { Component, OnInit, ViewChildren, QueryList, ViewChild, Input } from '@angular/core';
import { AlmAssembler, AsmMessageClassification, SourceEntity, AsmMessageHelper, Parser, AssemblySourceMap } from '@allium/asm';
import { FontSizeHelper } from 'src/app/utilities/font-size-helper';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { filter, debounceTime, distinctUntilChanged, takeUntil, take, map } from 'rxjs/operators';
import { CodeEditorTokenPopoverMessage } from 'src/app/view-models/source-file-editor/code-editor/code-editor-token-popover-message';
import { CodeEditorTextHelper } from 'src/app/view-models/source-file-editor/code-editor/code-editor-text-helper';
import { PopperContent } from 'ngx-popper';
import { CodeEditorToken } from 'src/app/view-models/source-file-editor/code-editor/code-editor-token';
// import { CodeEditorTokenHelper } from 'src/app/view-models/source-file-editor/code-editor/code-editor-token-helper';

@Component({
  selector: 'aq4w-code-editor-view',
  templateUrl: './code-editor-view.component.html',
  styleUrls: ['./code-editor-view.component.scss']
})
export class CodeEditorViewComponent extends Aq4wComponent implements OnInit{//, AfterViewInit {

  @Input('sourceCodeText')
  public set sourceCodeText(sourceCodeText: string) {
    this._sourceCode.next(sourceCodeText);
  }

  @Input('referenceName')
  public set referenceName(referenceName: string) {
    this._referenceName.next(referenceName);
  }

  public view = {
    fontSize: FontSizeHelper.DEFAULT_SIZE,
    tokenPopover: {
      entityId: '',
      messages: new Array<CodeEditorTokenPopoverMessage>()
    },
    sourceCodeText: '',
    tokens: new Array<CodeEditorToken>()
  }

  public on = {
    textInput: (event: any) => {// { data: string, target: { value: string, selectionStart: number, selectionEnd: number, selectionDirection?: string } }) => {
      const isEndOfLastTokenInLine = event.target.value.charAt(event.target.selectionStart) === '\n';
      const isStartOfNonWhitespaceToken = this._entities.some(e => e.kind !== 'space-sequence' && e.kind !== 'tab-sequence' && e.startPosition === event.target.selectionStart);
      const isInsertNewline = event.inputType === 'insertLineBreak';
      if (isInsertNewline) {
        // console.log('isInsertNewline');
        let tokenIndex = this.view.tokens.findIndex((t, ti) => t.start <= event.target.selectionStart && t.end >= event.target.selectionStart
          && !this.view.tokens.some((t2, t2i) => t2i > ti && t2.start <= event.target.selectionStart && t2.end >= event.target.selectionStart));
        let lineIndex = this.view.tokens[tokenIndex].lineIndex;
        if (isEndOfLastTokenInLine) {
          lineIndex--;
          tokenIndex--;
        }
        // this.view.tokens.filter((t, ti) => ti > tokenIndex).forEach(t => {
        //   t.lineIndex = t.lineIndex + 1;
        // })
        this.view.tokens = this.view.tokens.map((t, ti) => {
          if (t.lineIndex <= lineIndex) {
            if (ti > tokenIndex) {
              t.lineIndex = t.lineIndex + 1;
            } else {
              return t;
            }
          } else {
            t.lineIndex = t.lineIndex + 1;
            return t;
          }
        })
        // this.view.tokens = this.view.tokens.slice(0, tokenIndex).concat(
        //   []
        // ).concat(this.view.tokens.slice(tokenIndex));
        this._rebuild.next({ timestamp: new Date().valueOf(), rerenderAll: true });
      } else {
        this._textHelper.update(
          event.target.selectionStart,
          event.target.selectionEnd,
          event.data,
          event.target.selectionDirection === 'forward',
          isEndOfLastTokenInLine,
          isStartOfNonWhitespaceToken);
      }
    },
    textAreaMouseMove: (event: MouseEvent) => {
      this._onMouseMove.next([event.clientX, event.clientY]);
    }
  }

  constructor() {
    super();
  }

  ngOnInit() {
    combineLatest(this._sourceCode, this._referenceName)
      .pipe(filter(([sourceCode, referenceName]) => sourceCode !== null && referenceName !== null), takeUntil(this.destroyed))
      .subscribe(([sourceCode, referenceName]) => {
        this.view.sourceCodeText = sourceCode;
        const TESTbuild = this.build(referenceName, sourceCode);

        TESTbuild.forEach(t => {
          this.view.tokens.push(t);
        });

        this._rebuild.pipe(filter(x => x !== null), debounceTime(500), distinctUntilChanged(), map(x => x.rerenderAll), takeUntil(this.destroyed)).subscribe((rerenderAll) => {
          let fileContent = '';
          let currentLineIndex = 0;
          this.view.tokens.forEach(token => {
            while (token.lineIndex !== currentLineIndex) {
              currentLineIndex = token.lineIndex;
              fileContent += '\n';
            }
            fileContent += token.text;
          })

          const tokenModels = this.build(referenceName, fileContent);
          if (rerenderAll) {
            this.view.tokens = tokenModels;
          } else {
            this.view.tokens.forEach(t => {
              const model = tokenModels.find(tm => tm.persistentIdentifier === t.persistentIdentifier);
              if (!!model) {
                if (model.hasFailures !== t.hasFailures) {
                  t.hasFailures = model.hasFailures;
                }
                if (model.underline !== t.underline) {
                  t.underline = model.underline;
                }
                if (model.entityId !== t.entityId) {
                  t.entityId = model.entityId;
                }
              }
            })
          }
        })
      });

    // const TESTreferenceName = 'test';
    // const TESTCODE = '?alias BLOCK2 = b_2\nMain:\nLOAD_MONDAY 91\nADD [MONDAY]\nFLAG_ACK [TUESDAY.hh] @flag=OVERFLOW\nJMPI BLOCK2\nb_2:\nCOPY [TUESDAY] [WEDNESDAY]\nNO_OP';

    // this.view.sourceCodeText = TESTCODE;
    // const TESTbuild = this.build(TESTreferenceName, TESTCODE);
    
    // TESTbuild.forEach(t => {
    //   this.view.tokens.push(t);
    // });

    // this._rebuild.pipe(filter(x => x > 0), debounceTime(500), distinctUntilChanged(), takeUntil(this.destroyed)).subscribe(() => {
    //   let fileContent = '';
    //   let currentLineIndex = 0;
    //   this.view.tokens.forEach(token => {
    //     if (token.lineIndex !== currentLineIndex) {
    //       currentLineIndex = token.lineIndex;
    //       fileContent += '\n';
    //     }
    //     fileContent += token.text;
    //   })

    //   const tokenModels = this.build(TESTreferenceName, fileContent);
    //   this.view.tokens.forEach(t => {
    //     const model = tokenModels.find(tm => tm.persistentIdentifier === t.persistentIdentifier);
    //     if (!!model) {
    //       if (model.hasFailures !== t.hasFailures) {
    //         t.hasFailures = model.hasFailures;
    //       }
    //       if (model.underline !== t.underline) {
    //         t.underline = model.underline;
    //       }
    //       if (model.entityId !== t.entityId) {
    //         t.entityId = model.entityId;
    //       }
    //     }
    //   })
    // })

    this._onMouseMove.pipe(filter(x => x[0] > -1 && x[1] > -1), debounceTime(500), takeUntil(this.destroyed)).subscribe(([x, y]) => {
      const btElement = this.bottomTokenElements.find(el => {
        const rect = el.nativeElement.getClientRects()[0] as DOMRect;
        return rect.x <= x && rect.x + rect.width >= x
        && rect.y <= y && rect.y + rect.height >= y;
      });
      if (!!btElement) {
        const entityId = btElement.nativeElement.getAttribute('data-token-entity-id');
        console.log(`token=${entityId} => ${btElement.nativeElement.innerText.trim()}`);
        const entity = this._entities.find(e => e.id === entityId);
        if (this.view.tokenPopover.entityId !== entityId) {
          if (entity.messages.filter(m => m.classification === AsmMessageClassification.Critical || m.classification === AsmMessageClassification.Fatal).length > 0) {
            this.view.tokenPopover.entityId = entity.id;
            this.view.tokenPopover.messages = entity.messages.map(m => {
              const classificationText = m.classification === AsmMessageClassification.Fatal
                ? 'fatal'
                : 'critical';
              const localizedMessage = AsmMessageHelper.localizeMessage(m.code, 'default_default');//TODO
              return {
                classificationText: classificationText,
                messageCode: m.code,
                localizedMessage: localizedMessage
              }
            })
            this.tokenPopoverRef.show();
          } else {
            this.view.tokenPopover.entityId = '';
            this.view.tokenPopover.messages = new Array<CodeEditorTokenPopoverMessage>();
            this.tokenPopoverRef.hide();
          }
        }
      } else {
        console.log('no entity');
        this.view.tokenPopover.entityId = '';
        this.view.tokenPopover.messages = new Array<CodeEditorTokenPopoverMessage>();
        this.tokenPopoverRef.hide();
      }
    })
  }

  private build(referenceName: string, fileContent: string): Array<CodeEditorToken> {
    const b = AlmAssembler.build([
      {
        referenceName: referenceName,
        fileContent: fileContent
      }
    ], {
      treatOversizedInlineValuesAsWarnings: false,
      oversizedInlineValueSizing: 'min-required',
      generateSourceMap: true
    })
    const entities = new Array<SourceEntity>();
    const tokens = new Array<CodeEditorToken>();
    b.sourceMap.LINES.forEach((ln, lni) => ln.entities.forEach((e, ei) => {
      entities.push(e);
      const underlineType = this.getUnderlineType(e);
      const model: CodeEditorToken = {
        entityId: e.id,
        text: e.text,
        kind: e.constructDetails === 'none' ? e.kind : e.constructDetails.kind,
        underline: underlineType,
        top: ln.lineIndex,
        left: ln.entities.filter(t => t.endPosition <= e.startPosition).map(t => t.text.length).reduce((x,y) => x + y, 0),
        hasFailures: underlineType !== 'none',
        start: e.startPosition,
        end: e.endPosition,
        lineIndex: ln.lineIndex,
        persistentIdentifier: `${lni}_${ei}`
      };
      tokens.push(model);
    }))
    

    this._entities = entities;

    b.sourceMap.LINES.forEach((ln, lni) => {
      ln.entities.forEach((e, ei) => {
        if (e.constructDetails !== 'none') {
          this._knownTokenKinds.set(`${lni}_${ei}`, e.constructDetails.kind);
        }
      });
    })

    window['bld'] = b;
    // this.TESTHELPER(b.sourceMap, referenceName, fileContent);
    return tokens;
  }

  private getUnderlineType(entity: SourceEntity): 'error' | 'warning' | 'none' {
    if (entity.messages.some(m => m.classification === AsmMessageClassification.Warning)) {
      return 'warning';
    } else if (entity.messages.some(m => m.classification === AsmMessageClassification.Fatal
      || m.classification === AsmMessageClassification.Critical)) {
      return 'error';
    } else {
      return 'none';
    }
  }

  // private TESTHELPER(sourceMap: AssemblySourceMap, referenceName: string, fileContent: string): void {
  //   const pa = Parser.parse([
  //     {
  //       referenceName: referenceName,
  //       fileContent: fileContent
  //     }
  //   ], {
  //     treatOversizedInlineValuesAsWarnings: false,
  //     oversizedInlineValueSizing: 'min-required'
  //   })
  //   window['hBuild'] = pa.globalPasses.map((gp, gpi) => gp.preliminaryView.instructionLines.map(
  //     (il, ili) => CodeEditorTokenHelper.tokenizeInstructionLine(pa, sourceMap, gpi, ili)).reduce((x, y) => x.concat(y), [])).reduce((x, y) => x.concat(y), [])
  // }

  // private kfg(referenceName: string, fileContent: string) {
  //   const tokenModels = new Array<CodeEditorTokenNEW>();
  //   const parsedAssembly = Parser.parse([{ referenceName: referenceName, fileContent: fileContent}], {});
  //   if (parsedAssembly.globalPasses.length > 0) {
  //     parsedAssembly.globalPasses[0].immediateView.instructionLines.forEach(il => {
        
  //     })
  //   }
  // }

  @ViewChildren('tokenInputEl')
  tokenInputElements: QueryList<HTMLInputElement>;

  @ViewChildren('bottomToken')
  bottomTokenElements: QueryList<{ nativeElement: HTMLElement }>;

  @ViewChild('tokenPopover')
  tokenPopoverRef: PopperContent;

  private _entities = new Array<SourceEntity>();
  private readonly _rebuild = new BehaviorSubject<{ timestamp: number, rerenderAll: boolean }>(null);
  private readonly _knownTokenKinds = new Map<string, string>();
  private readonly _onMouseMove = new BehaviorSubject<[number, number]>([-1, -1]);
  private readonly _sourceCode = new BehaviorSubject<string>(null);
  private readonly _referenceName = new BehaviorSubject<string>(null);
  private readonly _textHelper = new CodeEditorTextHelper(
    () => { return this.view.tokens },
    (persistentIdentifier, updatedText) => {
      const index = this.view.tokens.findIndex(t => t.persistentIdentifier === persistentIdentifier);
      this.view.tokens[index].text = updatedText;
      this._rebuild.next({ timestamp: new Date().valueOf(), rerenderAll: false });
    },
    (afterIndex, top, delta) => {
      this.view.tokens.filter((t, ti) => ti > afterIndex && t.top === top).forEach(t => {
        t.left += delta;
      })
    },
    (index) => {
      const deletedTop = this.view.tokens[index].top;
      const deletedLength = this.view.tokens[index].text.length;
      this.view.tokens.splice(index, 1);
      this.view.tokens.filter((t, ti) => ti >= index && t.top === deletedTop).forEach(t => {
        t.left -= deletedLength;
      })
    }
  );

}
