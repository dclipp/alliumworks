const process = require('process');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

console.error('Do not use');
// const relativePath = process.argv[2];
// const sourceRootPath = process.argv[3];
// const outPath = process.argv[4];
// if (!!relativePath && !!sourceRootPath && !!outPath) {
//     const sources = child_process.execSync(`node scripts/enumerate-lib-sources.js "${relativePath}" "${path.join(sourceRootPath, 'app', 'lib')}"`);
//     const json = `{
//         "extends": "../../tsconfig.json",
//         "compilerOptions": {
//           "outDir": "../../out-tsc/app",
//           "types": []
//         },
//         "exclude": [
//           "test.ts",
//           "**/*.spec.ts"
//         ],
//         "files": ${sources.toString().replace(/\n /g, '\n' + ' '.repeat(8)).replace(']', ' '.repeat(4) + ']')}
//     }`;
//     fs.writeFileSync(outPath, json);
// } else {
//     console.log('Usage: <relative path> <source root path> <output path>');
// }