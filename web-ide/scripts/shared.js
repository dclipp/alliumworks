const fs = require('fs');
const path = require('path');
const process = require('process');
const child_process = require('child_process');
const crypto = require('crypto');

const IS_WINDOWS_OS = process.platform.toLowerCase().includes('win32');

const PLUGIN_VERSION = '2.2.0';
const UGLIFY_VERSION = '3.13.4';

const PLUGIN_SIGNATURE = '278d9a2431c71e1e469d0b2dc5cb4232515dd4c55584438c7092fc84b9be2dff';
const UGLIFY_SIGNATURE = '222f0975a272b2c6171fb13515f31967db6d9ce372515bfd7d601ac32dfef7f0';

function rmDir(dirPath) {
    const escapedPath = dirPath.replace(/[^\\]"/g, '\\"');
    const rmCmd = IS_WINDOWS_OS
        ? `rmdir /Q /S "${escapedPath}"`
        : `rm -rf "${escapedPath}"`;
    child_process.execSync(`${rmCmd}`);
}

function hashDirectory(dir) {
    const items = [];
    fs.readdirSync(dir, {
        withFileTypes: true
    }).forEach(f => {
        const fullPath = path.join(dir, f.name);
        if (f.isDirectory()) {// && f.name !== 'node_modules') {
            hashDirectory(fullPath).forEach(i => {
                items.push(i);
            });
        } else if (f.isFile()) {
            items.push({
                fullPath: fullPath,
                hash: crypto.createHash('sha256').update(fs.readFileSync(fullPath).toString()).digest('hex')
            });
        }
    });

    return items;
}

function computeModuleSignature(modulePath) {
    if (fs.existsSync(modulePath)) {
        const items = hashDirectory(modulePath);

        const aggregateHash = items
            .sort((a, b) => a.fullPath.localeCompare(b.fullPath))
            .join('$')
            + items.length.toString();
            
        return crypto.createHash('sha256').update(aggregateHash).digest('hex');
    } else {
        return '';
    }
}

exports.IS_WINDOWS_OS = IS_WINDOWS_OS;
exports.PLUGIN_VERSION = PLUGIN_VERSION;
exports.UGLIFY_VERSION = UGLIFY_VERSION;
exports.PLUGIN_SIGNATURE = PLUGIN_SIGNATURE;
exports.UGLIFY_SIGNATURE = UGLIFY_SIGNATURE;
exports.rmDir = rmDir;
exports.computeModuleSignature = computeModuleSignature;
