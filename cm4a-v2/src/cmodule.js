import { Utils } from './utils';
import { Popover } from './popover';
import { DebugInspector } from './debug-inspector';
import { alliumMode } from './allium';
import { VDom } from './vdom';
import { ExternalWrapper } from './external-wrapper';
import * as CodeMirror from '../ext/codemirror';

const GROUP_CLASSIFIERS = [
    (s) => { // reg refs
        const ss = s.join('');
        const rrMatch = ss.match(/[ ]{0,}\[[ ]{0,}([_a-zA-Z0-9]+)[ ]{0,}(.[ ]{0,}([_a-zA-Z0-9]+)[ ]{0,}){0,1}\]/);
        if (!!rrMatch) {

            const regName = rrMatch[1];
            const regMask = rrMatch[2];

            const startIndex = s.findIndex(t => t.trim() === '[');
            return {
                ignoreLengthBefore: ss.indexOf(rrMatch[0]),
                type: 'register-ref',
                data: !!regMask
                    ? `n:${regName};m:${regMask.substring(regMask.indexOf('.') + 1).trim()}`
                    : `n:${regName}`,
                // excludeIndices: s.findIndex(t => t.trim() === '[')
                excludeIndicesBefore: startIndex,
                excludeIndicesAfter: s.findIndex((t, ti) => ti > startIndex && t.trim().includes(']'))
            }
        } else {
            return null;
        }
    },
    (s) => { // constant injectors
        const ss = s.join('');
        const ciMatch = ss.match(/[ ]{0,}@[ ]{0,}([_a-zA-Z0-9]+)[ ]{0,}=[ ]{0,}([_a-zA-Z0-9]+)/);
        if (!!ciMatch) {

            const ciName = ciMatch[1];
            const ciValue = ciMatch[2];

            const startIndex = s.findIndex(t => t.trim() === '@');

            return {
                ignoreLengthBefore: ss.indexOf(ciMatch[0]),
                type: 'constant-injector',
                data: `n:${ciName};v:${ciValue}`,
                excludeIndicesBefore: startIndex,
                excludeIndicesAfter: startIndex > -1 ? s.findIndex((t, ti) => ti > startIndex && !!t && t.trim().includes(ciValue)) : -1
            }
        } else {
            return null;
        }
    }
]

const _LISTENER_TYPES = {
    ready: 'ready',
    contentChanged: 'contentChanged',
    breakpointToggled: 'breakpointToggled',
    viewScrolled: 'viewScrolled',
    editableChanged: 'editableChanged'
}

const _toNumericDisplayString = (n, base10Length, base16Length) => {
    const displayStrs = [];

    if (!!base10Length) {
        displayStrs.push(n.toString().padStart(base10Length, '0'));
    }
    
    if (!!base16Length) {
        displayStrs.push('0x' + n.toString(16).padStart(base16Length, '0').toUpperCase());
    }

    return displayStrs.join(' / ');
}

const _prepareLines = (editor) => {
    document.querySelectorAll('.breakpoint-col-instance').forEach(e => e.remove());
    const lineCount = editor.lineCount();
    for (let li = 0; li < lineCount; li++) {
        if ((editor.getLineTokens(li) || []).some(t => !!t.type && t.type.includes('al-mnemonic'))) {
            const bpCol = document.createElement('div');
            bpCol.classList.add('breakpoint-col-instance');
            bpCol.setAttribute('bp-line-index', li.toString());
            bpCol.innerHTML = '<div class="inner"><span class="indicator">&nbsp;</span></div>';
            editor.doc.setGutterMarker(li, 'breakpoint-col', bpCol);
        }
    }
}

export class CModule {
    classifyGroups() {
        const lineElements = [];
        const cmLines = this._vdom.getElementsByClassName('CodeMirror-line');
        for (let i = 0; i < cmLines.length; i++) {
            const element = cmLines.item(i);
            if (element.childElementCount === 1 && element.firstElementChild.tagName === 'SPAN') {
                lineElements.push(element.firstElementChild.firstElementChild);
            }
        }
        lineElements.forEach(el => {
            // [ MONDAY ]
            const sequence = [];
            const groups = [];
            let current = el;
            while (!!current) {
                sequence.push({
                    element: current,
                    text: current.innerText
                });

                if (sequence.length > 0) {
                    const textSequence = sequence.map(s => s.text);

                    let oc = null;
                    const candidates = [];
                    // for (let i = 0; i < GROUP_CLASSIFIERS.length && !(!!oc); i++) {
                    for (let i = 0; i < GROUP_CLASSIFIERS.length; i++) {
                        const currentOc = GROUP_CLASSIFIERS[i](textSequence);
                        if (!!currentOc) {
                            candidates.push(currentOc);
                        }
                    }

                    if (candidates.length > 1) {
                        oc = candidates.sort((a, b) => a.ignoreLengthBefore - b.ignoreLengthBefore)[0];
                    } else if (candidates.length === 1) {
                        oc = candidates[0];
                    }

                    if (!!oc) {
                        groups.push({
                            type: oc.type,
                            data: oc.data,
                            elements: sequence
                                .splice(0, sequence.length)
                                // .filter((s, si) => !oc.excludeIndices.includes(si))
                                .filter((s, si) => si >= oc.excludeIndicesBefore && (oc.excludeIndicesAfter === -1 || si <= oc.excludeIndicesAfter))
                                .map(s => s.element)
                        })
                    }
                }

                current = current.nextElementSibling;
            }

            groups.forEach(g => {
                g.elements.forEach(e => {
                    e.setAttribute('cln-group-type', g.type);
                    e.setAttribute('cln-group-data', g.data);
                })
            })
        })
    }

    getPopoverHtml(langContext, externals) {
        let html = '';
        if (langContext.langType === 'mnemonic' && !!externals.library) {
            // html = externals.library.mnemonics[langContext.text];
            const info = externals.library.mnemonics[langContext.text];
            if (!!info) {
                html = `<div class="text-title">${langContext.text}</div>`
                    + `<div class="text-main">${info.description}</div>`;

                info.args.forEach((a, ai) => {
                    html += `<div class="text-sub">
                    <strong>arg ${ai}</strong> (${a.dataType}) <strong class="ff-monospace fs-italic">${a.name}</strong>: ${a.description}
                    </div>`;
                })

                const flagKeys = Object.keys(info.flags);
                if (flagKeys.length > 0) {
                    html += '<hr><div class="text-main">Flags</div>';
                    flagKeys.forEach((k) => {
                        html += `<div class="text-sub">
                        <strong>${k}</strong>: ${info.flags[k]}
                        </div>`;
                    })
                }
            }
            // + `<div class="text-main">${}</div>`
        } else if (langContext.langType === 'address-ref-target-block') {
            html = `<div class="text-main">(block reference) <strong>${langContext.text}</strong></div>`;

            ExternalWrapper.getBlockAddress(externals, langContext.text, (nv) => {
                html += `<div class="text-sub">&rarr; ${_toNumericDisplayString(nv, 3, 2)}</div>`;
            });
        } else if (langContext.langType === 'block-name') {
            html = `<div class="text-main">(block) <strong class="ff-monospace">${langContext.text}</strong></div>`;

            ExternalWrapper.getBlockAddress(externals, langContext.text, (nv) => {
                html += `<div class="text-sub"><strong>address</strong> <span class="ff-monospace">${_toNumericDisplayString(nv, 3, 2)}</span></div>`;
            });
        } else if (langContext.langType === 'alias-ref') {
            html = `<div class="text-main">(alias) <strong>${langContext.text}</strong> <span class="symbol-rarr"></span> <span>TODOvalue</span></div>`;

            if (!!externals.sourceMap) {
                // TODO
                // html += `<div class="text-sub">&rarr; 005 / 0x05</div>`;
            }
        } else if (langContext.langType === 'register-ref') {
            const parts = langContext.text.split(';');
            const rrData = {
                regName: parts[0].substring(2),
                regMask: parts.length > 1 ? parts[1].substring(2) : null
            };

            const rrText = `${rrData.regName}${!!rrData.regMask ? `.${rrData.regMask}` : ''}`;
            html = `<div class="text-main">(${!!rrData.regMask ? 'masked ' : ''}register) ${rrText}</div>`;

            ExternalWrapper.getNumericValueForRegRef(externals, rrText, (nv) => {
                html += `<div class="text-sub">(constant) ${_toNumericDisplayString(nv, 3, 2)}</div>`;
            });
        } else if (langContext.langType === 'constant-injector') {
            const parts = langContext.text.split(';');
            const ciData = {
                ciName: parts[0].substring(2),
                ciValue: parts[1].substring(2)
            };

            html = `<div class="text-main">(constant) ${ciData.ciName} <span class="symbol-rarr"></span> ${ciData.ciValue}</div>`;
        }

        return html;
    }

    maybeGetErrorText(errorElementHover) {
        let errorText = null;
        if (!!errorElementHover) {
            const edt = errorElementHover.getAttribute('error-detail-text') || '';
            if (!!edt) {
                errorText = atob(edt);
            }
        }

        return errorText;
    }
    
    get control() {
        return {
            setBreakpointMode: (breakpointsEnabled) => {
                this._breakpointsEnabled = breakpointsEnabled === true;
                const cmElement = this._vdom.getCodeMirrorElement(this._textareaId);
                if (!!cmElement) {
                    if (this._breakpointsEnabled) {
                        cmElement.classList.add('breakpoints-enabled');
                    } else {
                        cmElement.classList.remove('breakpoints-enabled');
                    }
                }
            },
            getBreakpointMode: () => {
                return this._breakpointsEnabled === true;
            },
            setActiveInstructionLine: (lineIndex) => {
                this._activeInstructionLineIndex = lineIndex;
                document.querySelectorAll('.active-instruction').forEach(a => a.classList.remove('active-instruction'));
                const bp = document.querySelector(`[bp-line-index="${lineIndex}"]`);
                if (!!bp) {
                    bp.parentElement.parentElement.classList.add('active-instruction');
                }
            },
            getActiveInstructionLine: () => {
                return this._activeInstructionLineIndex;
            },
            clearActiveInstructionLine: () => {
                this._activeInstructionLineIndex = -1;
                document.querySelectorAll('.active-instruction').forEach(a => a.classList.remove('active-instruction'));
            },
            setFontSize: (sizeInPx) => {
                // const cmElement = document.getElementById(this._textareaId).nextElementSibling;
                // if (!!cmElement) {
                //     cmElement.setAttribute('style', )
                // }
            },
            formatSelection: () => {
                const selectionStart = this._editor.doc.getCursor('from');
                const selectionEnd = this._editor.doc.getCursor('to');

                const startLineIndex = selectionStart.line;
                const endLineIndex = selectionEnd.line;

                for (let i = startLineIndex; i <= endLineIndex; i++) {
                    this._editor.indentLine(i, 'smart');
                }
            },
            toggleComment: () => {
                const selectionStart = this._editor.doc.getCursor('from');
                const selectionEnd = this._editor.doc.getCursor('to');

                const startLineIndex = selectionStart.line;
                const endLineIndex = selectionEnd.line;

                const lineUpdates = [];
                if (this._editor.doc.getLine(startLineIndex).trim().startsWith('\'')) { // commented --> uncommented
                    for (let i = startLineIndex; i <= endLineIndex; i++) {
                        const lineContent = this._editor.doc.getLine(i);
                        const startSegmentMatch = lineContent.match(/^[ \t]{0,}'/);
                        if (!!startSegmentMatch) {
                            lineUpdates.push([i, lineContent.length, lineContent.replace(startSegmentMatch[0], startSegmentMatch[0].substring(0, startSegmentMatch[0].length - 1))]);
                        }
                    }
                } else { // uncommented --> commented
                    for (let i = startLineIndex; i <= endLineIndex; i++) {
                        const lineContent = this._editor.doc.getLine(i);
                        const leadingWhitespaceMatch = lineContent.match(/^([ \t]{0,})/);
                        const leadingWhitespace = !!leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : '';
                        lineUpdates.push([i, lineContent.length, leadingWhitespace + '\'' + lineContent.trimStart()]);
                    }
                }

                lineUpdates.forEach(lu => {
                    this._editor.doc.replaceRange(lu[2], {
                        line: lu[0],
                        ch: 0
                    }, {
                        line: lu[0],
                        ch: lu[1]
                    }, 'toggleComment');
                })
            },
            setContent: (content) => {
                this._editor.doc.setValue(content);
                _prepareLines(this._editor);
            },
            setEditable: (editable) => {
                this._editor.setOption('readOnly', editable !== true);
            },
            errorRange: {
                mark: (startLineIndex, startCharIndex, endLineIndex, endCharIndex, errorText) => {
                    const markingKey = `${startLineIndex}:${startCharIndex}:${endLineIndex}:${endCharIndex}`;
                    
                    // let markingKey3 = '';
                    // const allLines = this._editor.doc.getValue().split('\n');


                    // let markingKey2 = '';
                    // markingKey2 += 'L'.repeat(startLineIndex - 1);
                    // // Line #6, Char #10 --> Line #8, Char #3
                    // // LLLLL<10L>3

                    // // Line #7, Char #4 --> Line #7, Char #6
                    // // LLLLLL<4>6

                    // // Line #6, Char #10 --> Line #8, Char #3
                    // // *****:10*3
                    // // Line #7, Char #4 --> Line #7, Char #6
                    // // ******:4+6

                    // // const SELFRG = '******:4+6';
                    // // const OTHERRG = '*****:10*3';
                    // // const dfk = [];
                    // // for (let i = 0; i < SELFRG.length; i++) {
                    // //     if (SELFRG.charAt(i) === '*') {
                    // //         dfk.push('*');
                    // //     } else if (SELFRG.charAt(i) === ':')
                    // // }


                    // const markingKey = {
                    //     equals: (other) => {},
                    //     isContainedWithin: (_startLineIndex, _startCharIndex, _endLineIndex, _endCharIndex) => {
                    //         const iX = _startCharIndex;
                    //         const iY = _startLineIndex;
                    //         const fX = _endCharIndex;
                    //         const fY = _endLineIndex;
                            
                    //         let inStart = false;
                    //         let isInRange = false;
                    //         const rangeDiffs = [];
                    //         if (startLineIndex > _startLineIndex) {

                    //         } else if (startLineIndex === _startLineIndex) {
                    //             if (startCharIndex <= _startCharIndex) {
                    //                 if (endLineIndex === _endLineIndex) {
                    //                     if (endCharIndex > _endCharIndex) {
                    //                         isInRange = true;
                    //                         rangeDiffs.push([startLineIndex, endCharIndex, endCharIndex - _endCharIndex]);
                    //                     } else if (endCharIndex === _endCharIndex) {
                    //                         isInRange = true;
                    //                     }
                    //                 } else {

                    //                 }
                    //             } else {
                                    
                    //             }
                    //         } else {

                    //         }
                    //         return startLineIndex >= _startLineIndex && startCharIndex >= 
                    //     }
                    // }
                    // const overwriteMarkingIndices = [];
                    // this._markings.forEach((m, mi) => {
                    //     if (m[0].isContainedWithin(startLineIndex, startCharIndex, endLineIndex, endCharIndex)) {
                    //         overwriteMarkingIndices.push(mi);
                    //     }
                    // })
                    this._markings.push([markingKey, this._editor.doc.markText({ line: startLineIndex, ch: startCharIndex }, { line: endLineIndex, ch: endCharIndex }, {
                        className: 'cm-error',
                        attributes: {
                            'error-detail-text': btoa(errorText)
                        }
                    })]);
                },
                clear: (startLineIndex, startCharIndex, endLineIndex, endCharIndex) => {
                    const markingKey = `${startLineIndex}:${startCharIndex}:${endLineIndex}:${endCharIndex}`;
                    const mIndex = this._markings.findIndex(m => m[0] === markingKey);
                    if (mIndex > -1) {
                        this._markings.splice(mIndex, 1)[0][1].clear();
                    }
                },
                clearAll: () => {
                    if (this._markings.length > 0) {
                        this._markings.splice(0, this._markings.length).forEach(m => m[1].clear());
                    }
                }
            },
            on: {
                ready: (callback) => {
                    const handle = 'cmod_' + Math.random().toString().split('.')[1];

                    if (this._isReady === true) {
                        callback();
                    } else {
                        this._listeners.push([handle, _LISTENER_TYPES.ready, callback]);
                    }

                    return handle;
                },
                contentChanged: (callback) => {
                    const handle = 'cmod_' + Math.random().toString().split('.')[1];
                    this._listeners.push([handle, _LISTENER_TYPES.contentChanged, callback]);
                    return handle;
                },
                breakpointToggled: (callback) => {
                    const handle = 'cmod_' + Math.random().toString().split('.')[1];
                    this._listeners.push([handle, _LISTENER_TYPES.breakpointToggled, callback]);
                    return handle;
                },
                viewScrolled: (callback) => {
                    const handle = 'cmod_' + Math.random().toString().split('.')[1];
                    this._listeners.push([handle, _LISTENER_TYPES.viewScrolled, callback]);
                    return handle;
                },
                editableChanged: (callback) => {
                    const handle = 'cmod_' + Math.random().toString().split('.')[1];
                    this._listeners.push([handle, _LISTENER_TYPES.editableChanged, callback]);
                    return handle;
                }
            },
            off: (handle) => {
                const hIndex = this._listeners.findIndex(L => L[0] === handle);
                if (hIndex > -1) {
                    this._listeners.splice(hIndex, 1);
                }
            },
            destroy: () => {
                this._editor.getWrapperElement().remove();
            },
            refresh: () => {
                this._editor.refresh();
            }
        }
    }

    constructor(textareaId, objectName, externals, tracer) {
        this._tracer = tracer;

        const vdom = new VDom(textareaId);
        this._vdom = vdom;
        this._isReady = false;
        Utils.beginElementReadyListener(`${Utils.SIBLING_ID_PREFIX}${textareaId}`, 'CodeMirror-line', 200, 25, 4, (isReady) => {
            this._isReady = isReady;
            if (isReady) {
                this._tracer.info('READY');
                this.classifyGroups();

                // initialize breakpoints
                _prepareLines(this._editor);

                this._listeners.filter(L => L[1] === _LISTENER_TYPES.ready).forEach(L => {
                    window.setTimeout(() => L[2]());
                })
            } else {
                throw new Error('Element init timed out');
            }
        });

        this._textareaId = textareaId;
        this._objectName = objectName;
        this._breakpointsEnabled = false;
        this._activeInstructionLineIndex = -1;
        this._debouncedUpdateActions = {};
        this._listeners = [];

        this._debugInspector = new DebugInspector(vdom);
        this._debugInspector.init();

        this._popover = new Popover(vdom, tracer);
        this._popover.init();

        alliumMode(CodeMirror, tracer);
        this._editor = CodeMirror.fromTextArea(vdom.getTextAreaElement(textareaId), {
            mode: 'text/allium',
            lineNumbers: true,
            gutters: ['breakpoint-col']
        });
        window.editor = this._editor;// TODO remove ??
        this._markings = [];

        document.addEventListener('mouseover', (event) => {
            const clnGroupElementHover = Utils.parentsUntil(event.target, (e) => e.hasAttribute('cln-group-type'), (e) => e.tagName === 'BODY');
            const maybeErrorText = this.maybeGetErrorText(Utils.parentsUntil(event.target, (e) => e.hasAttribute('error-detail-text'), (e) => e.tagName === 'BODY'));
            if (!!clnGroupElementHover) {
                const groupType = clnGroupElementHover.getAttribute('cln-group-type');
                if (groupType === 'register-ref') {
                    const popoverHtml = this.getPopoverHtml({
                        langType: 'register-ref',
                        text: clnGroupElementHover.getAttribute('cln-group-data')
                    }, externals);

                    this._popover.showPopover(event.x, event.y, popoverHtml || '', maybeErrorText);
                } else if (groupType === 'constant-injector') {
                    const popoverHtml = this.getPopoverHtml({
                        langType: 'constant-injector',
                        text: clnGroupElementHover.getAttribute('cln-group-data')
                    }, externals);

                    this._popover.showPopover(event.x, event.y, popoverHtml || '', maybeErrorText);
                }
            } else {
                const langElementHover = Utils.parentsUntil(event.target, (e) => /cm-al-([-_a-zA-Z0-9]+)/.test(e.className), (e) => e.tagName === 'BODY');
                if (!!langElementHover) {
                    const langType = langElementHover.className.match(/cm-al-([-_a-zA-Z0-9]+)/)[1];
                    const langContext = {
                        langType: langType,
                        text: langElementHover.innerText.trim()
                    }

                    //   this._tracer.info('langContext=' + JSON.stringify(langContext, null, 2))
                    this._tracer.info('langContext.Type=' + langType)

                    const popoverHtml = this.getPopoverHtml(langContext, externals);
                    this._tracer.info('popoverHtml=' + popoverHtml)

                    this._popover.showPopover(event.x, event.y, popoverHtml || '', maybeErrorText);
                } else if (!!maybeErrorText) {
                    this._popover.showPopover(event.x, event.y, '', maybeErrorText);
                }
            }
        });

        document.addEventListener('click', (event) => {
            const gutterWrapperElement = Utils.parentsUntil(
                event.target,
                // (e) => e.classList.contains('breakpoint-col-instance'),
                (e) => e.classList.contains('CodeMirror-gutter-wrapper'),
                (e) => e.classList.contains('CodeMirror') || e.tagName === 'BODY');
          
            if (!!gutterWrapperElement) {
                const breakpointElementHover = gutterWrapperElement.getElementsByClassName('breakpoint-col-instance');
                if (breakpointElementHover.length > 0) {
                    const bpElement = breakpointElementHover.item(0);
                    bpElement.classList.toggle('breakpoint-set');
                    const bpLineIndex = Number.parseInt(bpElement.getAttribute('bp-line-index'));
                    if (Number.isInteger(bpLineIndex)) {
                        const isBpSet = bpElement.classList.contains('breakpoint-set');
                        this._listeners.filter(L => L[1] === _LISTENER_TYPES.breakpointToggled).forEach(L => {
                            window.setTimeout(() => L[2](this._objectName, bpLineIndex, isBpSet));
                        })
                    }
                }
            }
        });

        this._editor.on('update', (cm) => {
            Utils.debounce('clsGroups', 500, this._debouncedUpdateActions, () => {
                this.classifyGroups();
            });
        })

        // this._editor.on('change', (instance, changeObj) => {
        //     const lineIndex = changeObj.from.line;
        //     this._tracer.info(`CHG before=${JSON.stringify(changeObj.from)}, lineIndex=${lineIndex}`)
        //     const bpCol = document.createElement('div');
        //     bpCol.classList.add('breakpoint-col-instance');
        //     bpCol.innerHTML = '<div class="inner"><span class="indicator">&nbsp;</span></div>';
        //     this._editor.doc.setGutterMarker(lineIndex, 'breakpoint-col', bpCol);
        // })
        this._editor.on('changes', (instance, changes) => {
            const changesDuplicate = JSON.parse(JSON.stringify(changes));
            Utils.debounce('notifyOnChangeListeners', 750, this._debouncedUpdateActions, () => {
                this._listeners.filter(L => L[1] === _LISTENER_TYPES.contentChanged).forEach(L => {
                    window.setTimeout(() => L[2](this._objectName, changesDuplicate, this._editor.doc.getValue()));
                })
            })
        })
        
        this._editor.on('scroll', (instance) => {
            Utils.debounce('notifyOnChangeListeners', 500, this._debouncedUpdateActions, () => {
                let firstVisibleLineIndex = Number.NaN;
                try {
                    const lines = document.getElementsByClassName('CodeMirror-line');
                    let foundTop = false;
                    for (let i = 0; i < lines.length && !foundTop; i++) {
                        const element = lines.item(i);
                        if (element.getBoundingClientRect().bottom < 0) {
                            if (i + 1 < lines.length && lines.item(i + 1).getBoundingClientRect().bottom >= 0) {
                                foundTop = true;
                                if (!!element.previousSibling && element.previousSibling.firstChild) {
                                    firstVisibleLineIndex = Number.parseInt(element.previousSibling.firstChild.innerText) + 1;
                                }
                            }
                        }
                    }
                } catch (e) { }

                if (!Number.isInteger(firstVisibleLineIndex)) {
                    firstVisibleLineIndex = 0;
                }

                this._listeners.filter(L => L[1] === _LISTENER_TYPES.viewScrolled).forEach(L => {
                    window.setTimeout(() => L[2](this._objectName, firstVisibleLineIndex));
                })
            })
        })

        this._editor.on('optionChange', (instance, option) => {
            if (option === 'readOnly') {
                this._listeners.filter(L => L[1] === _LISTENER_TYPES.editableChanged).forEach(L => {
                    window.setTimeout(() => L[2](this._objectName, !this._editor.isReadOnly()));
                })
            }
        })


        // initializations
        // this.classifyGroups();

        // // initialize breakpoints
        // const lineCount = this._editor.lineCount();
        // for (let li = 0; li < lineCount; li++) {
        //     this._tracer.info(`CHG before=${JSON.stringify(changeObj.from)}, lineIndex=${li}`)
        //     const bpCol = document.createElement('div');
        //     bpCol.classList.add('breakpoint-col-instance');
        //     bpCol.innerHTML = '<div class="inner"><span class="indicator">&nbsp;</span></div>';
        //     this._editor.doc.setGutterMarker(li, 'breakpoint-col', bpCol);
        // }
        //   function btnIndentLine() {
        //     const lines = [];
        //     editor.doc.sel.ranges
        //       .map(r => [r.anchor.line, r.head.line])
        //       .reduce((x, y) => x.concat(y), [])
        //       .forEach(x => {
        //         if (lines.indexOf(x) < 0) {
        //           lines.push(x);
        //         }
        //       })
        //     lines.sort((a, b) => a - b).forEach(x => editor.indentLine(x))
        //   }
    }
}

export { Tracer } from './tracer';
