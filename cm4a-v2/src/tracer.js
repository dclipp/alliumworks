export class Tracer {
    info(line) {
        this._write('info', line);
    }
    
    error(line) {
        this._write('error', line);
    }
    
    warn(line) {
        this._write('warn', line);
    }

    constructor(enable, writeToBuffer, echoToConsole) {
        this._buffer = [];
        
        if (enable === true) {
            this._write = (type, line) => {
                if (writeToBuffer === true) {
                    this._buffer.push([Date.now(), type, line]);
                }

                if (echoToConsole === true) {
                    if (type === 'error') {
                        console.error(line);
                    } else if (type === 'warn') {
                        console.warn(line);
                    } else {
                        console.log(line);
                    }
                }
            }
        } else {
            this._write = () => {}
        }
    }
}