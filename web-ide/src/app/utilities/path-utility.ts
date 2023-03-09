export class PathUtility {
    public static convertToCompliantPath(path: string): string {
        let compliantPath = '';
        for (let i = 0; i < path.length; i++) {
            const c = path.charAt(i);
            if (PathUtility.COMPLIANT_CHARS.includes(c)) {
                compliantPath += c;
            } else {
                compliantPath += '_';
            }
        }
        return compliantPath;
    }

    public static getUpPath(path: string): string {
        const segments = path.split('/').filter(s => !!s && !!s.trim());
        if (segments.length > 1) {
            return segments.filter((s, i, a) => i < a.length - 1).reduce((x, y) => `${x}/${y}`, '');
        } else {
            return '/';
        }
    }

    public static getTargetName(path: string): string {
        const segments = path.split('/').filter(s => !!s && !!s.trim());
        if (segments.length > 0) {
            return segments[segments.length - 1];
        } else {
            return '/';
        }
    }

    public static join(...parts: Array<string>): string {
        let workingPath = '';
        for (let i = 0; i < parts.length; i++) {
            let current = parts[i];
            while (current.length > 0 && current.startsWith('/')) {
                current = current.substring(1);
            }
            while (current.length > 0 && current.endsWith('/')) {
                current = current.substring(0, current.length - 1);
            }
            
            if (current.length > 0) {
                workingPath = `${workingPath}/${current}`;
            }
        }

        return workingPath;
    }

    public static readonly COMPLIANT_CHARS: ReadonlyArray<string> = [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '-',
        '_',
        '.',
        '/',
        ' ',
        '?',
        '@',
        '!',
        '#',
        '&',
        '(',
        ')',
        '=',
        '+',
        '|',
        '~'
    ]
}