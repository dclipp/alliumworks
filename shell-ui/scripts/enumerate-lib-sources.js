const process = require('process');
const fs = require('fs');
const path = require('path');

console.error('Do not use');
/*
function iterate(dir) {
    const tsFiles = [];
    fs.readdirSync(dir, {
        withFileTypes: true
    }).map(f => {
        if (f.isDirectory()) {
            iterate(path.join(dir, f.name)).forEach(tsf => tsFiles.push(tsf));
        } else if (f.isFile()) {
            if (f.name.toLowerCase().endsWith('.ts')) {
                tsFiles.push(path.join(dir, f.name));
            }
        }
    })
    return tsFiles;
}

let relativePath = process.argv[2];
const sourceRootPath = process.argv[3];
const excludePatterns = !!process.argv[4]
    ? process.argv[4].split('##').map(a => RegExp(a))
    : [/\.spec/i];

if (!!relativePath && !!sourceRootPath) {
    while ((relativePath.endsWith('\\') || relativePath.endsWith('/')) && relativePath.length > 0) {
        relativePath = relativePath.substring(0, relativePath.length - 1);
    }
    const separatorRegex = path.sep === '\\'
        ? /\\/g
        : /\//g;
    const sources = iterate(sourceRootPath)
        .map(f => f.replace(sourceRootPath, relativePath).replace(separatorRegex, '/'))
        .filter(f => !excludePatterns.some(ep => f.match(ep)));
    console.log(JSON.stringify(sources,null,2))
} else {
    console.log('Usage: <relative path> <source root path> ?<exclude patterns = RegExp patterns separated by ##>');
}
*/