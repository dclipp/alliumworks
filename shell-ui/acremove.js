var ac = [
    ['px', 'abcd'],
    ['px', 'abcd', 'alpha'],
    ['px', 'abcd', 'alpha', 'part3'],
    ['px', 'abcd', 'alpha', 'alt'],
    ['px', 'abcd', 'beta'],
    ['px', 'abcd', 'beta' ,'part3'],
    ['px', 'wxyz'],
    ['px', 'wxyz', 'alpha'],
    ['px', 'wxyz', 'alpha', 'part3'],
    ]
    
    var ac2 = [
    { commandName: 'abcd_0', fullCommandText: '!abcd'},
    { commandName: 'abcd_al_1', fullCommandText: '!abcd alpha'},
    { commandName: 'abcd_al_2', fullCommandText: '!abcd alpha part3'},
    { commandName: 'abcd_al_3', fullCommandText: '!abcd alpha alt'},
    { commandName: 'abcd_bt_1', fullCommandText: '!abcd beta'},
    { commandName: 'abcd_bt_2', fullCommandText: '!abcd beta part3'},
    { commandName: 'wxyz_0', fullCommandText: '!wxyz'},
    { commandName: 'wxyz_al_1', fullCommandText: '!wxyz alpha'},
    { commandName: 'wxyz_al_2', fullCommandText: '!wxyz alpha part3'},
    { commandName: 'wxyz_al_2', fullCommandText: '!wxyz delta B1'},
    { commandName: 'wxyz_al_2', fullCommandText: '!wxyz delta B2'}
    ]
    
    var tbuildTree4 = (all) => {
        let tree = {};
        all.forEach(a => {
            a.fullCommandText.split(' ').forEach((w, wi, wa) => {
                const path = wi > 0
                    ? wa.slice(0, wi)
                    : [];
                let root = tree;
                const selector = path.map(p => `['${p}'].words`).reduce((x, y) => x + y, '') + `['${w}']`;
                console.log(`selector=${selector}`)
                const isEndValue = wi === wa.length - 1;
                // const setValue = wi === wa.length - 1
                //     ? 'true'
                //     : '{ words: {}, isEndValue: false }'
                tree = JSON.parse(eval(`const _t = JSON.parse('${JSON.stringify(tree)}' || '{}');
                if(_t${selector} === undefined) {_t${selector} = { words: {}, isEndValue: ${isEndValue} }}
                else if (_t${selector}.isEndValue !== true && ${isEndValue}){_t${selector}.isEndValue = true;}
                JSON.stringify(_t);`))
                // while (path.length > 0) {
                //     const pp = path.splice(0, 1)[0];
                //     if (root[pp] === undefined) {
                //         root[pp] = {};
                //     }
                    
                //     root = root[pp];
                // }
        
                // if (root[w] === undefined) {
                //     root[w] = {}
                // }
            })
        })
        return tree;
    }
    
    var ttonewmodels = (branch, ancestorText, parentId, input) => {
        const models = [];
        Object.keys(branch).forEach(k => {
            let useId = Math.random().toString();
            while (models.some(m => m.id === useId)) {
                useId = Math.random().toString();
            }
    
            const fullText = !!ancestorText
                ? `${ancestorText} ${k}`
                : k;
    
            let iIndex = !!input ? input.length - 1 : -1;
            let kIndex = fullText.length - 1;
            let matchLength = 0;
            let stop = false;
            if (input !== undefined) {
                while (iIndex > -1 && kIndex > -1 && !stop) {
                    const charI = input.charAt(iIndex);
                    const charK = fullText.charAt(kIndex);
                    if (charI === ' ' || charK === ' ') {
                        stop = true;
                    } else if (charI === charK) {
                        iIndex--;
                        kIndex--;
                        matchLength++;
                    } else {
                        stop = true;
                    }
                }
            }
    
            // if (!!input) {
            //     for (let i = 0; i < input.length; i++) {
            //         const element = array[i];
                    
            //     }
            // }
    
            models.push({
                fullText: fullText,
                isEndValue: branch[k].isEndValue === true,
                id: useId,
                parentId: parentId,
    
                matchingText: !!input && fullText.startsWith(input)
                    ? input
                    : '',
                afterMatchText: !!input && fullText.startsWith(input) && input.length < fullText.length
                    ? fullText.substring(input.length)
                    : '',
                // matchingText: matchLength > 0
                //     ? input.substring(0, input.length - matchLength)
                //     : '',
                // afterMatchText: matchLength > 0 && matchLength < k.length
                //     ? fullText.substring(matchLength)
                //     : ''
            })
    
            if (!!branch[k].words) {
                ttonewmodels(branch[k].words, fullText, useId, input).forEach(m => models.push(m))
            }
        })
    
        return models;
    }
    var tsortedtonewmodels = (rootBranch, input) => {
        const models = ttonewmodels(rootBranch, '', '', input);
        return models.sort((a, b) => {
            return a.fullText.localeCompare(b.fullText)
            // if ()
        })
    }
    
    var tgetmodels = (tree, input, parentKey) => {
        const models = [];
        Object.keys(tree).forEach(k => {
            let iIndex = 0;
            let kIndex = 0;
            let matchLength = 0;
            let stop = false;
            while (iIndex < input.length && kIndex < k.length && !stop) {
                if (input.charAt(iIndex) === k.charAt(kIndex)) {
                    iIndex++;
                    kIndex++;
                    matchLength++;
                } else {
                    stop = true;
                }
            }
    
            const hasChildren = !!tree[k].words && Object.keys(tree[k].words).length > 0;
            const useKey = !!parentKey ? `${parentKey}::${k}` : k;
            models.push({
                key: useKey,
                fullText: k,
                matchLength: matchLength,
                childItems: hasChildren
                    ? Object.keys(tree[k].words).map(ck => tgetmodels(tree[k].words[ck], input, useKey)).reduce((x, y) => x.concat(y), [])
                    : [],
                path: useKey,
                parentKey: parentKey || '',
                hasChildren: hasChildren,
                level: parentKey.split('::').length - 1,
                matchingText: matchLength > 0
                    ? input.substring(0, matchLength)
                    : '',
                afterMatchText: matchLength > 0
                    ? k.substring(matchLength)
                    : k
            })
    
            // if (hasChildren) {
            //     Object.keys(tree[k].words).map(ck => tgetmodels(tree[k].words[ck], input, useKey)).reduce((x, y) => x.concat(y), []).forEach(m => models.push(m))
            // }
        })
        return models;
        // {
        //     key: '',
        //     fullText: '',
        //     matchLength: 0,
        //     childItems: [],
        //     path: '',
        //     parentKey: '',
        //     hasChildren: false,
        //     level: 0,
        //     matchingText: '',
        //     afterMatchText: ''
        // }
    }
    
    var tbuildTree3 = (all) => {
        const keyedWords = [];
        all.forEach(a => {
            a.fullCommandText.split(' ').forEach(w => {
                if (!keyedWords.some(kw => kw.word === w)) {
                    let id = Math.random().toString();
                    while (keyedWords.some(kw => kw.id === id)) {
                        id = Math.random().toString();
                    }
    
                    keyedWords.push({
                        id: id,
                        parentId: 'TODO',
                        word: w
                    })
                }
            })
        })
    
        keyedWords.filter(kw => all.some(a => a.fullCommandText === kw.word || a.fullCommandText.startsWith(kw.word + ' '))).forEach(kw => {
            kw.parentId = '';
        })
    
        const iterateSetParentId = (pId, parentText) => {
            const prefix = !!parentText ? `${parentText} ` : '';
            const children = all.filter(a => a.fullCommandText.startsWith(prefix));
            children.forEach(child => {
                keyedWords.push({
                    id: Math.random().toString(),
                    parentId: pId,
                    word: child.fullCommandText.substring(prefix.length),
                })
            })
        }
    
        const usedParentIds = [];
        let nextParent = {
            pId: '',
            parentText: ''
        };
        
        let _ITRC = 0;
        while (!!nextParent && _ITRC < 1200) {
            iterateSetParentId(nextParent.pId, nextParent.parentText);
            usedParentIds.push(nextParent.pId);
    
            const np = keyedWords.find(kw => kw.parentId === 'TODO');
            nextParent = !!np
                ? { pId: np.id, parentText: np.word }
                : null;
    
            if (_ITRC >= 1199) {
                throw new Error(`Infinite loop stopped, len=${keyedWords.length}`)
            }
            _ITRC++;
        }
        // keyedWords.forEach(kw => {
        //     if (!all.some(a => a.fullCommandText === kw.word || a.fullCommandText.startsWith(kw.word + ' '))) {
        //         kw.parentId = '';
        //     }
        // })
        // keyedWords.forEach((kw, kwi, kwa) => {
        //     const fullCmds = all.filter(a => a.fullCommandText.startsWith())
        // })
        return keyedWords.filter(kw => kw.parentId !== 'TODO');
    }
    
    var tbuildTree2 = (all) => {
        const branches = [];
        all.forEach(a => {
            const words = a.fullCommandText.split(' ');
            const w1Index = branches.findIndex(b => b.word === words[0]);
            const indexer = w1Index > -1
                ? w1Index
                : branches.length;
            if (w1Index < 0) {
                branches.push({
                    word: words[0],
                    sub: []
                })
            }
            
            for (let i = 1; i < words.length; i++) {
                let currentBranchRoot = null;
                const workingIndexer = JSON.parse(JSON.stringify(indexer));
                while (workingIndexer.length > 0) {
                    const ix = workingIndexer.splice(0, 1)[0];
                    if (currentBranchRoot === null) {
                        currentBranchRoot = branches[ix];
                    } else {
                        currentBranchRoot = currentBranchRoot[ix];
                    }
                }
    
                const wdIndex = currentBranchRoot.findIndex(b => b.word === words[i]);
                if (wdIndex > -1) {
                    indexer.push(wdIndex);
                } else {
                    indexer.push(currentBranchRoot.length);
                    currentBranchRoot.push({
                        word: words[i],
                        sub: []
                    })
                }
            }
        })
    }
    
    var tbuildTree = (completions) => {
        const branches = [];
        completions.forEach(c => {
          const indexer = [];
          c.fullCommandText.split(' ').forEach((w, wi) => {
            if (indexer.length === 0) {
              const i = branches.findIndex(b => b.fullText === w);
              if (i > -1) {
                indexer.push(i);
              } else {
                branches.push({
                  key: `${wi}~${c.commandName}`,
                  fullText: w,
                  childItems: [],
                  matchLength: w.length
                });
                indexer.push(branches.length - 1);
              }
            } else {
              let subBranch = branches[indexer[0]];
              for (let branchIndex = 1; branchIndex < indexer.length; branchIndex++) {
                subBranch = subBranch[indexer[branchIndex]];
              }
    
              const i = subBranch.childItems.findIndex(b => b.fullText === w);
              if (i > -1) {
                indexer.push(i);
              } else {
                subBranch.childItems.push({
                  key: `${wi}~${c.commandName}`,
                  fullText: w,
                  childItems: [],
                  matchLength: w.length
                });
                indexer.push(subBranch.childItems.length - 1);
              }
            }
          })
        })
    
        return branches;
      }