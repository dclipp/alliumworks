const fs = require('fs');
const path = require('path');
const sass = require('sass');

function getComponentSelector(dirPath, stylesheetName) {
    const tsFileContent = fs.readFileSync(path.join(dirPath, `${stylesheetName}.ts`)).toString();
    const selectorMatch = tsFileContent.match(/@Component\([ \t\r\n]{0,}\{[ \t\r\n]{0,}selector[ \t\r\n]{0,}:[ \t\r\n]{0,}'([^']+)'/);
    if (!!selectorMatch) {
        return selectorMatch[1];
    } else {
        throw new Error(`failed to get selector for '${stylesheetName}'`);
    }
}

function findStylesheets(dirPath) {
    const stylesheets = [];

    fs.readdirSync(dirPath, {
        withFileTypes: true
    }).forEach(f => {
        if (f.isFile()) {
            if (f.name.toLowerCase().endsWith('.component.scss')) {
                const name = f.name.substring(0, f.name.lastIndexOf('.'));
                stylesheets.push({
                    name: name,
                    src: fs.readFileSync(path.join(dirPath, f.name)).toString(),
                    componentSelector: getComponentSelector(dirPath, name)
                })
            }
        } else if (f.isDirectory()) {
            findStylesheets(path.join(dirPath, f.name)).forEach(ss => stylesheets.push(ss));
        }
    })

    return stylesheets;
}

function toTsIdentifier(name) {
    let tsIdentifier = '';
    let nextWordStart = true;
    for (let i = 0; i < name.length; i++) {
        const char = name.charAt(i);
        if (/[_a-zA-Z\$]/.test(char)) {
            if (i === 0) {
                tsIdentifier += char.toLowerCase();
                nextWordStart = false;
            } else {
                if (nextWordStart) {
                    tsIdentifier += char.toUpperCase();
                    nextWordStart = false;
                } else {
                    tsIdentifier += char;
                }
            }
        } else if (/[0-9]/.test(char)) {
            if (i === 0) {
                tsIdentifier += '$';
            } else {
                tsIdentifier += char;
            }
        } else {
            nextWordStart = true;
        }
    }
    
    return tsIdentifier;
}

function generateCssString(stylesheet, globalStyleVars) {
    let combinedScss = stylesheet.src;
    const globalStyleMatch = combinedScss.match(/[ \t]{0,}@import[ \t]+'([\.\/]{0,})styles'[ \t]{0,};/);
    if (!!globalStyleMatch) {
        combinedScss = combinedScss.replace(globalStyleMatch[0], '');
    }

    globalStyleVars.forEach(sv => {
        combinedScss = combinedScss.replace(RegExp('\\$' + sv.varName, 'g'), sv.value);
    })

    let outputCss = ''

    outputCss = sass.renderSync({
        data: combinedScss
    }).css.toString();

    const cleanedOutput = outputCss
        .replace(/[']/g, '\\\'')
        .replace(/(\r{0,1}\n)/g, '\\n');

    const styleName = stylesheet.name.replace('.component', '');
    return `${toTsIdentifier(styleName)}: '${cleanedOutput}'`
    // return `export const ${styleName} = '${outputCss.replace(/[']/g, '\\\'')}';`
}

function generateGlobalStylesCssString(globalStyles, globalStyleVars) {
    let cleanedScss = globalStyles.split('\n')
        .filter(ln => !ln.trim().startsWith('$') && !ln.trim().startsWith('/*') && !ln.trim().startsWith('//'))
        .reduce((x, y) => !!x ? `${x}\n${y}` : y, '')
    
    globalStyleVars.forEach(sv => {
        const replaceValue = '$' + sv.varName;
        while (cleanedScss.includes(replaceValue)) {
            cleanedScss = cleanedScss.replace(replaceValue, sv.value);
        }
    })

    outputCss = sass.renderSync({
        data: `shell-ui {\n${cleanedScss}\n}`
    }).css.toString();

    const cleanedOutput = outputCss
        .replace(/[']/g, '\\\'')
        .replace(/(\r{0,1}\n)/g, '\\n');

    return `export const GlobalCss = '${cleanedOutput}';`;
}

function extractGlobalStylesVariables(globalStyles) {
    const styleVars = [];

    globalStyles.split('\n')
        .forEach(ln => {
            const svMatch = ln.match(/^[ \t]{0,}\$([_a-zA-Z0-9\-]+)[ \t]{0,}:[ \t]{0,}/);
            if (!!svMatch) {
                let varValue = ln.substring(ln.indexOf(svMatch[0]) + svMatch[0].length);
                while (varValue.length > 0 && (varValue.endsWith('\r') || varValue.endsWith(';'))) {
                    varValue = varValue.substring(0, varValue.length - 1);
                }

                styleVars.push({
                    varName: svMatch[1],
                    value: varValue
                })
            }
        })

    return styleVars;
}

function createTsSourceFile(stylesheets, globalStylesPath) {
    const globalStyles = fs.readFileSync(globalStylesPath).toString();
    const globalStyleVars = extractGlobalStylesVariables(globalStyles);
    const props = stylesheets
        .map(ss => generateCssString(ss, globalStyleVars))
        .reduce((x, y) => !!x ? `${x},\n\t${y}` : `\t${y}`, '');

    const header = '/**\n * \n * NOTICE:\n * This is an auto-generated file\n * Do not modify manually\n * Use the build:styles script to re-generate this file\n * \n */';
    const globalCssString = generateGlobalStylesCssString(globalStyles, globalStyleVars);
    const dynamicIconTemplateFnString = 'export const dynamicIconTemplate = (templateRefAccessor: string, iconNamesAccessor: string, iconName: string, noIconChar: string, ...additionalRequiredIconNames: Array<string>) => {\n\tlet additionalRequiredConditions = additionalRequiredIconNames.length > 0\n\t? additionalRequiredIconNames.map(i => \'!!\' + iconNamesAccessor + \'.\' + i).join(\' && \')\n\t: \'\';\n\t\n\tif (additionalRequiredIconNames.length > 0) {\n\tadditionalRequiredConditions = \' && \' + additionalRequiredConditions;\n\t}\n\t\n\tconst showCondition = \'!!\' + templateRefAccessor + \' && !!\' + iconNamesAccessor + \'.\' + iconName + additionalRequiredConditions;\n\treturn \'<ng-container *ngIf="\' + showCondition + \'">\'\n\t\t+ \'<ng-container *ngTemplateOutlet="\' + templateRefAccessor + \'; context: { iconName: \' + iconNamesAccessor + \'.\' + iconName + \' }">\'\n\t\t+ \'</ng-container>\'\n\t\t+ \'</ng-container>\'\n\t\t+ \'<ng-container *ngIf="!(\' + showCondition + \')">\'\n\t\t+ noIconChar\n\t\t+ \'</ng-container>\';\n}';
    return `${header}\n\n${globalCssString}\n${dynamicIconTemplateFnString}\nexport const STYLES = {\n${props}\n};\n`;
}

const allStylesheets = findStylesheets(path.join(__dirname, '../', 'projects', 'shell-ui', 'src', 'lib'));
const tsSource = createTsSourceFile(allStylesheets, path.join(__dirname, '../', 'projects', 'shell-ui', 'src', 'lib', 'global-styles.scss'));

fs.writeFileSync(path.join(__dirname, '../', 'projects', 'shell-ui', 'src', 'lib', 'styles.ts'), tsSource);
// console.log(toTsIdentifier('abcd'))
// console.log(toTsIdentifier('aBCd'))
// console.log(toTsIdentifier('abcd23_9'))
// console.log(toTsIdentifier('abcd-efgh'))