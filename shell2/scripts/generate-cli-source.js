// const fs = require('fs');
const path = require('path');
const process = require('process');
const child_process = require('child_process');

const outDir = path.join(process.cwd(), 'src', 'cli', 'generated');
// console.log(outDir);
// console.log(`CMD = npx "../../almworks-devtools/cli-generator" AwCli "${outDir}" --overwrite`)
child_process.execSync(`npx "../../almworks-devtools/cli-generator" AwCli "${outDir}" --overwrite`)