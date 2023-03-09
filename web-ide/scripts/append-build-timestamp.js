const fs = require('fs');
const constants = require('constants');
const path = require('path');
const process = require('process');

const CWD_ARG = process.argv[2];
if (!!CWD_ARG) {
    const indexPath = path.join(CWD_ARG, './dist/web-ide/index.html');
    if (fs.existsSync(indexPath)) {
        const originalContent = fs.readFileSync(indexPath).toString();
        const updatedContent = originalContent.replace('</html>', `<!-- build ${new Date().toISOString().replace(/^([0-9]{2})([0-9]{2})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/, '$3/$4/$2 $5:$6:$7').substring(0, 17)} -->`+ '\n</html>');
        fs.writeFileSync(indexPath, updatedContent);
        process.exit(0);
    } else {
        console.error('no index.html was found');
        process.exit(constants.ENOENT);
    }
} else {
    console.error('no arg was provided for CWD');
    process.exit(1);
}