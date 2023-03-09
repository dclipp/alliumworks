function initWrv() {
    function getBytes(code) {
        const bytes = [];
        do {
            const b = code & 255;
            code = code >> 8;
            bytes.push(b);
        } while (code !== 0);
        return bytes;
    }

    function encode(data) {
        const bytes = [];
        for (let i = 0; i < data.length; i++) {
            const code = data.charCodeAt(i);
            const codeBytes = getBytes(code);
            if (codeBytes.length > 1) {
                bytes.push(255);
                codeBytes.forEach(cb => bytes.push(cb));
            } else if (codeBytes[0] === 255) {
                bytes.push(255);
                bytes.push(codeBytes[0]);
            } else {
                bytes.push(codeBytes[0]);
            }
        }
        return bytes;
    }

    function decode(bytes) {
        let str = '';
        let bi = 0;
        while (bi < bytes.length) {
            const b = bytes[bi];
            if (b === 255) {
                if (bi === bytes.length - 1 || bytes[bi + 1] === 255) {
                    str += String.fromCharCode(255);
                    bi += 2;
                } else {
                    str += String.fromCharCode(decodeInt([
                        bytes[bi + 1],
                        bytes[bi + 2]
                    ]));
                    bi += 3;
                }
            } else {
                str += String.fromCharCode(b);
                bi++;
            }
        }

        return str;
    }

    function encodeInt(value, width) {
        const bytes = [];
        for (let i = 0; i < width; i++) {
            bytes.push(value & 255);
            if (value !== 0) {
                value = value >> 8;
            }
        }
        return bytes;
    }

    function decodeInt(bytes) {
        let value = 0;
        bytes.forEach((b, bi) => {
            value += (b << (bi * 8));
        })
        return value;
    }

    function timestamp() {
        const now = new Date();
        const bytes = [];
        encodeInt(Number.parseInt(now.getUTCFullYear().toString()), 2)
            .forEach(b => bytes.push(b));

        encodeInt(Number.parseInt(now.getUTCMonth().toString()), 1)
            .forEach(b => bytes.push(b));

        encodeInt(Number.parseInt(now.getUTCDate().toString()), 1)
            .forEach(b => bytes.push(b));

        encodeInt(Number.parseInt(now.getUTCHours().toString()), 1)
            .forEach(b => bytes.push(b));

        encodeInt(Number.parseInt(now.getUTCMinutes().toString()), 1)
            .forEach(b => bytes.push(b));

        encodeInt(Number.parseInt(now.getUTCSeconds().toString()), 1)
            .forEach(b => bytes.push(b));

        encodeInt(Number.parseInt(now.getUTCMilliseconds().toString()), 1)
            .forEach(b => bytes.push(b));

        return bytes;
    }

    function compress(records, recordTypeMap) {
        const useRecords = records.map(r => {
            return {
                data: encode(r.data).map(er => String.fromCharCode(er)).reduce((x, y) => x + y, ''),
                type: r.type
            }
        });
        let table = [];

        for (let ri = 0; ri < useRecords.length; ri++) {
            for (let i = 0; i < useRecords[ri].data.length - 6; i++) {
                const s = useRecords[ri].data.substring(i, i + 6);
                const index = table.findIndex(t => t.value === s);
                if (index > -1) {
                    table[index].occurrences++;
                } else {
                    table.push({
                        occurrences: 1,
                        value: s
                    })
                }
            }
        }

        table = table
            .sort((a, b) => b.occurrences - a.occurrences)
            .map(t => t.value)
            .filter((t, ti) => ti < 255);

        const compressedRecords = [];
        for (let ri = 0; ri < useRecords.length; ri++) {
            const currentRecord = useRecords[ri].data;
            let compressedRecord = '';

            let pos = 0;
            while (pos < currentRecord.length) {
                if (pos < currentRecord.length - 6) {
                    const segment = currentRecord.substring(pos, pos + 6);
                    const tableIndex = table.indexOf(segment);
                    if (tableIndex > -1) {
                        compressedRecord += String.fromCharCode(1);
                        compressedRecord += String.fromCharCode(encodeInt(tableIndex, 1)[0]);
                    } else {
                        compressedRecord += String.fromCharCode(0);
                        compressedRecord += segment;
                    }
                    pos += 6;
                } else {
                    compressedRecord += String.fromCharCode(2);
                    const end = currentRecord.substring(pos);
                    compressedRecord += String.fromCharCode(encodeInt(end.length, 1)[0]);
                    compressedRecord += end;
                    pos = currentRecord.length;
                }
            }

            const encodedTypeCode = Number.isInteger(useRecords[ri].type)
                ? useRecords[ri].type
                : recordTypeMap[useRecords[ri].type];
            if (encodedTypeCode === undefined) {
                throw new Error(`Unknown record type: ${useRecords[ri].type}`);
            } else {
                const recordType = encodeInt(encodedTypeCode, 1)[0];
                compressedRecord = String.fromCharCode(recordType) + compressedRecord;
                compressedRecords.push(compressedRecord);
            }
        }

        return {
            table,
            records: compressedRecords
        }
    }

    function writeFile(formatVersion, meta, producer, records, recordTypeMap) {
        if (meta.length > 256) {
            throw new Error('Meta value cannot exceed 256 characters')
        } else {
            const bytes = [];

            bytes.push(encodeInt(formatVersion, 1)[0]);

            timestamp().forEach(b => bytes.push(b));

            bytes.push(encodeInt(meta.length, 1)[0]);
            encode(meta).forEach(b => bytes.push(b));
            let pc = producer;
            while (pc.length < 8) {
                pc += '/';
            }
            if (pc.length > 8) {
                pc = pc.substring(0, 8);
            }
            encode(pc).forEach(b => bytes.push(b));

            const compressedRecords = compress(records, recordTypeMap);
            bytes.push(encodeInt(compressedRecords.table.length, 1)[0]);
            if (compressedRecords.table.length > 0) {
                compressedRecords.table.forEach((t, ti) => {
                    for (let i = 0; i < t.length; i++) {
                        bytes.push(t.charCodeAt(i));
                    }
                })
            }

            compressedRecords.records.forEach(r => {
                for (let i = 0; i < r.length; i++) {
                    bytes.push(r.charCodeAt(i));
                }
            })

            return bytes;
        }
    }

    function streamify(bytes) {
        let itr = 0;
        return {
            take: (count) => {
                if (count + itr > bytes.length) {
                    throw new Error(`Count exceeds remaining stream length (count=${count}, itr=${itr})`);
                } else {
                    const b = bytes.slice(itr, itr + count);
                    itr += count;
                    return b;
                }
            },
            endOfStream: () => {
                return itr >= bytes.length;
            },
            remainingCount: () => {
                return bytes.length - itr;
            }
        }
    }

    function readFile(bytes, recordTypeMap) {
        const stream = streamify(bytes);
        const formatVersion = stream.take(1)[0];

        const tsYear = decodeInt(stream.take(2));
        const tsMonth = decodeInt(stream.take(1));
        const tsDay = decodeInt(stream.take(1));
        const tsHour = decodeInt(stream.take(1));
        const tsMin = decodeInt(stream.take(1));
        const tsSecond = decodeInt(stream.take(1));
        const tsMillisecond = decodeInt(stream.take(1));
        const timestamp = Date.UTC(tsYear, tsMonth, tsDay, tsHour, tsMin, tsSecond, tsMillisecond);

        const metaLength = decodeInt(stream.take(1));
        const meta = decode(stream.take(metaLength));

        const producer = decode(stream.take(8));

        const tableSize = decodeInt(stream.take(1));
        const records = [];
        const table = [];
        for (let i = 0; i < tableSize; i++) {
            table.push(decode(stream.take(6)));
        }

        let recordBuffer = '';
        let recordType = undefined;
        while (!stream.endOfStream()) {
            if (recordType === undefined) {
                const typeCode = stream.take(1)[0];
                recordType = Object.keys(recordTypeMap).find(k => recordTypeMap[k] === typeCode);
            }
            const fieldType = stream.take(1)[0];
            if (fieldType === 0) { // Inline
                recordBuffer += stream.take(6)
                    .map(x => String.fromCharCode(x))
                    .reduce((x, y) => x + y, '');
            } else if (fieldType === 1) { // Indexed
                const recordIndex = stream.take(1)[0];
                recordBuffer += table[recordIndex];
            } else if (fieldType === 2) { // End segment of record
                const segmentLength = stream.take(1)[0];
                recordBuffer += stream.take(segmentLength)
                    .map(x => String.fromCharCode(x))
                    .reduce((x, y) => x + y, '');
                records.push({
                    data: recordBuffer,
                    type: recordType
                });
                recordBuffer = '';
                recordType = undefined;
            } else { // Invalid
                throw new Error('Invalid value in stream');
            }
        }

        records.forEach((r, ri) => {
            const recordBytes = [];
            for (let i = 0; i < r.data.length; i++) {
                recordBytes.push(r.data.charCodeAt(i));
            }

            records[ri] = {
                data: decode(recordBytes),
                type: r.type
            };
        })

        return {
            formatVersion,
            timestamp,
            meta,
            producer,
            records
        }
    }

    return {
        write: function (formatVersion, meta, producer, records, recordTypeMap) {
            let s = '';
			writeFile(formatVersion, meta, producer, records, recordTypeMap).forEach(b => {
				s += String.fromCharCode(b);
			});
            return s;
        },
        read: function(s, recordTypeMap) {
            const bytes = [];
            for (let i = 0; i < s.length; i++) {
                bytes.push(s.charCodeAt(i));
            }
            return readFile(bytes, recordTypeMap);
        }
    }
}

var wrvFile = initWrv();