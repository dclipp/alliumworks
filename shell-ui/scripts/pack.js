const process = require('process');
const fs = require('fs');
const path = require('path');
const tar = require('tar');

const outputDirArgIndex = process.argv.findIndex(a => a.startsWith('--outdir='));
const outputDir = outputDirArgIndex > -1
    ? process.argv[outputDirArgIndex].substring(process.argv[outputDirArgIndex].indexOf('=') + 1)
    : __dirname;
const target = process.argv.find((a, ai) => ai > 1 && ai !== outputDirArgIndex);
const invalidArgs = outputDirArgIndex > -1 ? process.argv.length > 4 : process.argv.length > 3;

if (!!target && !invalidArgs) {
    if (fs.existsSync(target)) {
        if (fs.existsSync(outputDir)) {
            if (fs.readdirSync(path.dirname(target), {
                withFileTypes: true
            }).some(f => f.name === path.basename(target) && f.isDirectory())) {
                if (fs.readdirSync(path.dirname(outputDir), {
                    withFileTypes: true
                }).some(f => f.name === path.basename(outputDir) && f.isDirectory())) {
                    const pkgJsonPath = path.join(target, 'package.json');
                    if (fs.existsSync(pkgJsonPath)) {
                        const pkgJson = fs.readFileSync(pkgJsonPath).toString();
                        const nameMatch = pkgJson.match(/"[ \t]{0,}name[ \t]{0,}"[ \t]{0,}:[ \t]{0,}"[ \t]{0,}([^"]+)"/);
                        const versionMatch = pkgJson.match(/"[ \t]{0,}version[ \t]{0,}"[ \t]{0,}:[ \t]{0,}"[ \t]{0,}([^"]+)"/);

                        if (!(!!nameMatch)) {
                            console.error('failed to get package name');
                        } else if (!(!!versionMatch)) {
                            console.error('failed to get package version');
                        } else {
                            const contents = fs.readdirSync(target, {
                                withFileTypes: true
                            }).map(t => t.name);
                            const outputName = `${nameMatch[1].trim()}-${versionMatch[1].trim()}.tgz`;
                            const fullOutputPath = path.join(outputDir, outputName);
                            // console.log(JSON.stringify(contents, null, 2))
                            tar.c(
                                {
                                    gzip: true,
                                    file: fullOutputPath,
                                    prefix: 'package',
                                    cwd: target
                                },
                                contents
                            ).then(() => {
                                console.log(`successfully wrote pack to ${fullOutputPath}`);
                                process.exit();
                            })
                        }
                    } else {
                        console.error('The specified target directory does not contain a package.json file');
                        process.exit(1);
                    }
                } else {
                    console.error('The specified output path is not a directory');
                    process.exit(1);
                }
            } else {
                console.error('The specified target is not a directory');
                process.exit(1);
            }
        } else {
            console.error('The specified output directory could not be found');
            process.exit(1);
        }
    } else {
        console.error('The specified target could not be found');
        process.exit(1);
    }
} else {
    console.log('Usage: <path to package directory> ?--outdir=<output directory>');
}