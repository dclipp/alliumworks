const path = require('path');
const process = require('process');
const shared = require('./shared');

const PLUGIN_MODULE_PATH = path.resolve('./', 'node_modules', 'uglifyjs-webpack-plugin');
const installedPluginSignature = shared.computeModuleSignature(PLUGIN_MODULE_PATH);

if (installedPluginSignature === shared.PLUGIN_SIGNATURE) {
    const UGLIFY_MODULE_PATH = path.resolve('./', 'node_modules', 'uglify-js');
    const installedUglifySignature = shared.computeModuleSignature(UGLIFY_MODULE_PATH);
    if (installedUglifySignature === shared.UGLIFY_SIGNATURE) {
        process.exit(0);
    } else {
        console.error(`package not ready: have you called 'npm i' and 'npm run prep:pkg'?\n`);
        process.exit(1);
    }
} else {
    console.error(`package not ready: have you called 'npm i' and 'npm run prep:pkg'?\n`);
    process.exit(1);
}
