import { FunctionScheduler } from '@allium/emulator';

export function createAsyncScheduler(): FunctionScheduler {
    return {
        _funs: 1,
        timeout: (ms, fn) => {
            return 't' + setTimeout(() => { fn() }, ms).toString();
        },
        interval: (ms, fn) => {
            return 'i' + setInterval(() => { fn() }, ms).toString();
        },
        immediate: (fn) => {
            setTimeout(() => { fn() });
        },
        cancel: (handle) => {
            if (handle.startsWith('t')) {
                clearTimeout(Number.parseInt(handle.substring(1)));
            } else if (handle.startsWith('i')) {
                clearInterval(Number.parseInt(handle.substring(1)));
            }
        }
    }
}