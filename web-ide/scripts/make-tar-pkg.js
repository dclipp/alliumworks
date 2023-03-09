const fs = require('fs');
const constants = require('constants');
const path = require('path');
const process = require('process');
const child_process = require('child_process');
const tar = require('tar');

const distDirPath = './dist/web-ide';
const distOutputTarPath = '../wide.tar';

if (process.argv[2] === '_internal_') {
    function iterateDirItems() {
        return fs.readdirSync('.', {
            withFileTypes: true
        }).filter(f => f.isFile() || f.isDirectory())
        .map(f => f.name);
    }

    tar.create({
        gzip: false,
        file: distOutputTarPath
    }, iterateDirItems()).then(() => {
        console.log(`generated TAR file at ${path.join(process.cwd(), distOutputTarPath)}`);
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    })
} else {
    if (fs.existsSync(distDirPath)) {
        const scriptPath = path.resolve(process.cwd(), 'scripts', __filename);
        child_process.fork(scriptPath, {
            execArgv: [scriptPath, '_internal_'],
            cwd: distDirPath
        }).on('exit', (code) => {
            process.exit(code);
        });
    } else {
        console.log(`dist build not found at ${path.join(process.cwd(), distDirPath)}`);
        process.exit(constants.ENOENT);
    }
}
