const fs = require('fs');
const path = require('path');

function getAlliumComponentVersion(pathToPlatformNodeModules, componentPackageName) {
    const pathToConfig = path.resolve(pathToPlatformNodeModules, '@allium', componentPackageName, 'package.json');
    if (fs.existsSync(pathToConfig)) {
        const content = fs.readFileSync(pathToConfig).toString();
        const matches = content.match(/"version":[ \t\r\n]{0,}"([\._a-zA-Z0-9]+)"/);
        if (!!matches && matches.length > 0) {
            return matches[1];
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

function getAlliumworksComponentVersion(pathToNodeModules, componentPackageName) {
    const pathToConfig = path.resolve(pathToNodeModules, '@alliumworks', componentPackageName, 'package.json');
    if (fs.existsSync(pathToConfig)) {
        const content = fs.readFileSync(pathToConfig).toString();
        const matches = content.match(/"version":[ \t\r\n]{0,}"([\._a-zA-Z0-9]+)"/);
        if (!!matches && matches.length > 0) {
            return matches[1];
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

function getYfsVersion(pathToPlatformNodeModules) {
    const pathToConfig = path.resolve(pathToPlatformNodeModules, 'yfs', 'package.json');
    if (fs.existsSync(pathToConfig)) {
        const content = fs.readFileSync(pathToConfig).toString();
        const matches = content.match(/"version":[ \t\r\n]{0,}"([\._a-zA-Z0-9]+)"/);
        if (!!matches && matches.length > 0) {
            return matches[1];
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

function getSelfVersion() {
    const pathToConfig = path.resolve(__dirname, '..', 'package.json');
    if (fs.existsSync(pathToConfig)) {
        const content = fs.readFileSync(pathToConfig).toString();
        const matches = content.match(/"version":[ \t\r\n]{0,}"([\._a-zA-Z0-9]+)"/);
        if (!!matches && matches.length > 0) {
            return matches[1];
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

function getVersions(pathToNodeModules, pathToPlatformNodeModules, pathToVmNodeModules) {
    const versions = {
        arch: undefined,
        asm: undefined,
        emulator: undefined,
        types: undefined,
        yfs: undefined,
        platform: undefined,
        shell: undefined
    };

    versions.arch = getAlliumComponentVersion(pathToPlatformNodeModules, 'arch');
    versions.asm = getAlliumComponentVersion(pathToPlatformNodeModules, 'asm');
    versions.emulator = getAlliumComponentVersion(pathToVmNodeModules, 'emulator');
    versions.types = getAlliumComponentVersion(pathToPlatformNodeModules, 'types');
    versions.yfs = getYfsVersion(pathToPlatformNodeModules);
    versions.platform = getAlliumworksComponentVersion(pathToNodeModules, 'platform');
    versions.shell = getSelfVersion();

    const missingVersions = Object.keys(versions).filter(k => versions[k] === undefined);
    if (missingVersions.length > 0) {
        throw new Error('Missing versions: ' + missingVersions.join(', '));
    } else {
        return versions;
    }
}

function generateTsSource(versions) {
    const header = '/**\n * \n * NOTICE:\n * This is an auto-generated file\n * Do not modify manually\n * Use the update-versions script to re-generate this file\n * \n */';
    const template = 'export const VERSION_STRINGS: {\n\treadonly arch: string,\n\treadonly asm: string,\n\treadonly emulator: string,\n\treadonly types: string,\n\treadonly yfs: string,\n\treadonly platform: string,\n\treadonly shell: string\n} = {\n\tarch: \'_arch_ver\',\n\tasm: \'_asm_ver\',\n\temulator: \'_emulator_ver\',\n\ttypes: \'_types_ver\',\n\tyfs: \'_yfs_ver\',\n\tplatform: \'_platform_ver\',\n\tshell: \'_shell_ver\'\n}';
    return header + '\n' + template
        .replace('_arch_ver', versions.arch)
        .replace('_asm_ver', versions.asm)
        .replace('_emulator_ver', versions.emulator)
        .replace('_types_ver', versions.types)
        .replace('_yfs_ver', versions.yfs)
        .replace('_platform_ver', versions.platform)
        .replace('_shell_ver', versions.shell);
}

const pathToNodeModules = path.resolve(__dirname, '..', 'node_modules');
const pathToPlatformNodeModules = path.resolve(__dirname, '..', '..', 'platform', 'node_modules');
const pathToVmNodeModules = path.resolve(__dirname, '..', '..', 'vm', 'node_modules');
if (fs.existsSync(pathToNodeModules)) {
    try {
        const versions = getVersions(pathToNodeModules, pathToPlatformNodeModules, pathToVmNodeModules);
        const sourceFilePath = path.resolve(__dirname, '..', 'src', 'version-strings.ts');
        const source = generateTsSource(versions);
        fs.writeFileSync(sourceFilePath, source);
        console.log('version-strings.ts generated successfully');
        console.log(JSON.stringify(versions, null, 2));
    } catch (ex) {
        console.error('Failed to generate version-strings.ts');
        console.error(`\t${ex}`);
    }
} else {

}