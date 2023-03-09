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

function mergeScss(stylesheets, globalStylesPath) {
    const globalStyles = fs.readFileSync(globalStylesPath).toString();
    const combined = stylesheets
        .map(ss => `${ss.componentSelector} { ${ss.src} }`)
        .reduce((x, y) => !!x ? `${x}\n${y}` : y, '')
        .replace(/[ \t]{0,}@import[ \t]+'([\.\/]{0,})styles'[ \t]{0,};/, '');

    return `${globalStyles}\n${combined}`;
}

function createTsSourceFile(css) {
    const tsStringLines = [];
    const lines = css.split('\n');
    lines.forEach((ln, lni) => {
        if (lni > 0) {
            tsStringLines.push('+ \'' + ln.replace(/[']/g, '\\\'') + '\\n\'');
        } else {
            tsStringLines.push('\'' + ln.replace(/[']/g, '\\\'') + '\\n\'');
        }
    })

    const tsStrSrc = tsStringLines.reduce((x, y) => !!x ? `${x}\n${y}` : y, '');
    return `export const CSS = ${tsStrSrc}`;
}

const allStylesheets = findStylesheets(path.join(__dirname, '../', 'projects', 'shell-ui', 'src', 'lib'));
const inputScss = mergeScss(allStylesheets, path.join(__dirname, '../', 'projects', 'shell-ui', 'src', 'lib', 'global-styles.scss'));

const outputCss = sass.renderSync({
    data: inputScss
});

// fs.writeFileSync(path.join(__dirname, '../', 'style.out.css'), outputCss.css.toString());
fs.writeFileSync(path.join(__dirname, '../', 'projects', 'shell-ui', 'src', 'lib', 'style.ts'), createTsSourceFile(outputCss.css.toString()));