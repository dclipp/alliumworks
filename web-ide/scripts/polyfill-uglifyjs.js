const fs = require('fs');
const path = require('path');
const process = require('process');
const child_process = require('child_process');
const shared = require('./shared');

const npmPkgConfig = {
    name: 'polyfilltmp',
    version: '1.0.0',
    description: '',
    scripts: {},
    author: '',
    license: 'ISC',
    dependencies: {
        'uglifyjs-webpack-plugin': shared.PLUGIN_VERSION,
        'uglify-js': shared.UGLIFY_VERSION
    }
}

const TMP_DIR_PATH = `__tmp_polyfillpkg_${Date.now()}_`;

let exitCode = 0;
let hasChanges = false;
try {
    fs.mkdirSync(TMP_DIR_PATH);
    
    fs.writeFileSync(path.join(TMP_DIR_PATH, 'package.json'), JSON.stringify(npmPkgConfig, null, 2));
    
    child_process.execSync('npm i', {
        cwd: TMP_DIR_PATH,
        stdio: 'ignore'
    });

    const forceUpdate = process.argv.some(a => a === '--force');

    const PLUGIN_MODULE_PATH = path.resolve('./', 'node_modules', 'uglifyjs-webpack-plugin');
    const PLUGIN_MODULE_DIR_EXISTS = fs.existsSync(PLUGIN_MODULE_PATH);
    const TMP_PLUGIN_MODULE_PATH = path.resolve(TMP_DIR_PATH, 'node_modules', 'uglifyjs-webpack-plugin');
    const installedPluginSignature = PLUGIN_MODULE_DIR_EXISTS
        ? shared.computeModuleSignature(PLUGIN_MODULE_PATH)
        : '';
    if (forceUpdate || installedPluginSignature !== shared.PLUGIN_SIGNATURE) {
        hasChanges = true;
        if (PLUGIN_MODULE_DIR_EXISTS) {
            shared.rmDir(PLUGIN_MODULE_PATH);
        }
        fs.renameSync(TMP_PLUGIN_MODULE_PATH, PLUGIN_MODULE_PATH);
    }

    const UGLIFY_MODULE_PATH = path.resolve('./', 'node_modules', 'uglify-js');
    const UGLIFY_MODULE_DIR_EXISTS = fs.existsSync(UGLIFY_MODULE_PATH);
    const TMP_UGLIFY_MODULE_PATH = path.resolve(TMP_DIR_PATH, 'node_modules', 'uglify-js');
    const installedUglifySignature = UGLIFY_MODULE_DIR_EXISTS
        ? shared.computeModuleSignature(UGLIFY_MODULE_PATH)
        : '';
    if (forceUpdate || installedUglifySignature !== shared.UGLIFY_SIGNATURE) {
        hasChanges = true;
        if (UGLIFY_MODULE_DIR_EXISTS) {
            shared.rmDir(UGLIFY_MODULE_PATH);
        }
        fs.renameSync(TMP_UGLIFY_MODULE_PATH, UGLIFY_MODULE_PATH);
    }

    if (hasChanges) {
        console.log('successfully replaced module(s)');
    } else {
        console.log('all installed modules match polyfill modules; no replacement is necessary');
    }
} catch (ex) {
    console.error(ex);
    exitCode = 1;
} finally {
    if (fs.existsSync(TMP_DIR_PATH)) {
        shared.rmDir(TMP_DIR_PATH);
    }

    process.exit(exitCode);
}
