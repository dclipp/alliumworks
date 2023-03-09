import { StorageApiStatus, StorageApiInfo, StorageApiResponse, StorageApiFile, StorageApiDirectory, StorageApiShortInfo, StorageApiQueryResult, StorageApiIdentity } from '../data-models/storage/storage-api-types';

interface MockItem {
    readonly name: string;
    readonly content: string;
    readonly size: number;
    readonly id: number;
    readonly parentId: number;
    readonly isDirectory: boolean;
}

class MockFs {
    private readonly _items = new Array<MockItem>();
    private readonly _code1Txt = 'Main:\n?alias my_var=[ACCUMULATOR]\nMEMWRITE my_var [TUESDAY]\nJMPI $OtherBlock\nOtherBlock:\nLOAD_MONDAY 398\nFLAG_ACK [TUESDAY] @FLAG=UNDERFLOW\nNO_OP\n\'<End of program>';
    private readonly _stdout1Txt = "TestProc1:\n'Write the string \"foo\" to STDOUT\n'char f = 73\n'char o = 82\nLOAD_ACCUMULATOR 3000\nLOAD_TUESDAY 73\nMEMWRITE [ACCUMULATOR] [TUESDAY]\nLOAD_MONDAY 1\nADD [MONDAY]\nLOAD_TUESDAY 82\nMEMWRITE [ACCUMULATOR] [TUESDAY]\nADD [MONDAY]\nMEMWRITE [ACCUMULATOR] [TUESDAY]\n'Next, write save the address of TestProc1After as the return address\nLOAD_MONDAY $TestProc1After\nLOAD_TUESDAY 2048\nMEMWRITE [TUESDAY] [MONDAY]\n'Now, invoke the push routine, where:\n'[WEDNESDAY] is Starting memory address of characters to be written\n'[THURSDAY.h] is Number of characters to be written\n'The return address is stored in memory at ADDR_SYSCALL_RETURN_ADDRESS\nLOAD_WEDNESDAY 3000\nLOAD_THURSDAY 3\nJMPI $PushToStdOut\n\nTestProc1After:\nNO_OP\n\nReturnToAddress:\nLOAD_MONDAY 2048\nJMP [MONDAY]\n\nPerformWrite_Actual:\n'[ACCUMULATOR.h] --> Number of characters to be copied\n'[WEDNESDAY] --> Starting memory address of characters to be written\n'[THURSDAY] --> Current address in STDOUT buffer to be written to\nLOAD_TUESDAY 0\nMEMREAD [WEDNESDAY] [TUESDAY]\nMEMWRITE [THURSDAY] [TUESDAY]\n'save off [ACCUMULATOR] first, then increment [WEDNESDAY]\nLOAD_FRIDAY 0\nCOPY [ACCUMULATOR] [FRIDAY]\nLOAD_ACCUMULATOR 0\nCOPY [WEDNESDAY] [ACCUMULATOR]\nLOAD_WEDNESDAY 1\nADD [WEDNESDAY]\nCOPY [ACCUMULATOR] [WEDNESDAY]\n\n'increment [THURSDAY]\nLOAD_ACCUMULATOR 0\nCOPY [THURSDAY] [ACCUMULATOR]\nLOAD_THURSDAY 1\nADD [THURSDAY]\nCOPY [ACCUMULATOR] [THURSDAY]\n\n'decrement [ACCUMULATOR]\nLOAD_ACCUMULATOR 0\nCOPY [FRIDAY] [ACCUMULATOR]\nLOAD_FRIDAY 1\nSUB [FRIDAY]\nJMPI $PerformWrite_CheckIteration\n\nPerformWrite_CheckIteration:\n'[ACCUMULATOR.h] --> Number of remaining characters to be copied\nLOAD_MONDAY 0\nLOAD_TUESDAY 0\nGT [ACCUMULATOR] [TUESDAY] [MONDAY]\nJNZI [MONDAY] $PerformWrite_Actual\nJMPI $ReturnToAddress\n\nGetAddressOfBufferStart_Finish:\n'Reload character count into [ACCUMULATOR.h]\nLOAD_ACCUMULATOR 0\nCOPY [FRIDAY] [ACCUMULATOR]\nJMPI $PerformWrite_CheckIteration\n\nGetAddressOfBufferStart_Iterate:\n'[ACCUMULATOR.h] --> Number of characters to be copied\n'[THURSDAY] --> Current start address\n'If [ACCUMULATOR] > 0, add 1 to the current start address and decrement [ACCUMULATOR]\n'Else, DONE\nLOAD_MONDAY 0\nLOAD_TUESDAY 0\nGT [ACCUMULATOR] [MONDAY] [TUESDAY]\nJZI $GetAddressOfBufferStart_Finish\nLOAD_TUESDAY 1\nSUB [TUESDAY]\nLOAD_WEDNESDAY 0\nCOPY [ACCUMULATOR] [WEDNESDAY]\nLOAD_ACCUMULATOR 0\nCOPY [THURSDAY] [ACCUMULATOR]\nADD [TUESDAY]\nLOAD_THURSDAY 0\nCOPY [ACCUMULATOR] [THURSDAY]\nLOAD_ACCUMULATOR 0\nCOPY [WEDNESDAY] [ACCUMULATOR]\nJMPI $GetAddressOfBufferStart_Iterate\n\nGetAddressOfBufferStart:\n'[ACCUMULATOR.h] --> Number of characters to be copied\n'save off [ACCUMULATOR] value\nLOAD_FRIDAY 0\nCOPY [ACCUMULATOR] [FRIDAY]\n\n\nPerformWrite:\n'[ACCUMULATOR.h] --> Number of characters to be copied\n'[WEDNESDAY] --> Starting memory address of characters to be written\nJMPI $GetAddressOfBufferStart_Iterate\n\nAssignRemainingBufferLength:\n'Buffer cannot fit all of the input characters, so only take the max\n'[ACCUMULATOR] --> Number of characters remaining in buffer\n'[WEDNESDAY] --> Starting memory address of characters to be written\n'[THURSDAY.h] --> Number of characters to be written\nLOAD_ACCUMULATOR 0\nCOPY [THURSDAY.h] [ACCUMULATOR.h]\nJMPI $PerformWrite\n\n\nGetNumberOfCharactersToAdd:\n'[ACCUMULATOR] --> Number of characters remaining in buffer\n'[WEDNESDAY] --> Starting memory address of characters to be written\n'[THURSDAY.h] --> Number of characters to be written\nLOAD_FRIDAY 0\nGT [ACCUMULATOR.h] [THURSDAY.h] [FRIDAY]\nJNZI [FRIDAY] $PerformWrite\nJMPI $AssignRemainingBufferLength\n\n'STDOUT Buffer\nPushToStdOut:\n'bytes 0 & 1 --> Max Length (2049)\n'bytes 2 & 3 --> Current Length\n'bytes 4 ... n --> characters\n'[WEDNESDAY] --> Starting memory address of characters to be written\n'[THURSDAY.h] --> Number of characters to be written\n'1. Check if fit\n'1. Load address of buffer <-- max length\n'2. Add 1 to address of buffer\n'3. Load that address <-- current length\n'4. Subtract max-current <-- remaining length\n'5. If remaining > num to be written,\nLOAD_MONDAY 2049\nLOAD_TUESDAY 0\nMEMREAD [MONDAY] [TUESDAY]\n'max length is now in TUESDAY\n\nLOAD_ACCUMULATOR 0\nCOPY [MONDAY] [ACCUMULATOR]\nLOAD_MONDAY 1\nADD [MONDAY]\nLOAD_MONDAY 0\nMEMREAD [ACCUMULATOR] [MONDAY]\n'current length is now in MONDAY\n\nLOAD_ACCUMULATOR 0\nCOPY [MONDAY] [ACCUMULATOR]\nSUB [MONDAY]\n\n'check if the UNDERFLOW flag was set, i.e. buffer is full\nFLAG_ACK [TUESDAY] @FLAG=UNDERFLOW\nLOAD_MONDAY 1\nLOAD_FRIDAY 0\nEQ [MONDAY] [TUESDAY] [FRIDAY]\nJNZI [FRIDAY] $ReturnToAddress\nJMPI $GetNumberOfCharactersToAdd\n";
    private readonly _fooTxt = 'Hello, world!';
    private readonly _asmJsonTxt = '{"workspaceName": "SampleSpace1", "assemblyName": "SampleSpace1Asm", "sourceImports": [{"referenceName": "code1", "filePath": "/code1.aq"}]}';
    private _nextId: number;
    public getItems(): ReadonlyArray<MockItem> {
        return this._items;
    }
    public addItem(id: number, name: string, parentId: number, incrementNextId: boolean, isDirectory: boolean, content?: string): 'invalid-name' | 'ok' {
        if (name.trim().length > 0 && RegExp(/^[-_.+ !@~#=;|a-zA-Z0-9]+$/).test(name)) {
            this._items.push({
                name: name,
                content: content || '',
                size: !!content ? content.length : 0,
                isDirectory: isDirectory,
                id: id,
                parentId: parentId
            });
            if (incrementNextId) {
                this._nextId += 1;
            }
            return 'ok';
        } else {
            return 'invalid-name';
        }
    }
    public removeItem(id: number): void {
        this._items.splice(this._items.findIndex(x => x.id === id), 1);
    }
    public getNextId(): number {
        return this._nextId;
    }
    public getItem(absolutePath: string): MockItem | 'not-found' {
        if (absolutePath.startsWith('/')) {
            if (absolutePath.trim() === '/') {
                return {
                    name: name,
                    content: '',
                    size: this._items.map(i => i.size).reduce((x, y) => x + y, 0),
                    isDirectory: true,
                    id: 0,
                    parentId: Number.NaN
                };
            } else {
                const segments = absolutePath.split('/').filter(s => !!s);
                let currentParentId = 0;
                let currentItem = this._items.find(i => i.parentId === currentParentId && i.name === segments[0]);
                let index = 1;
                while (index < segments.length && !!currentItem) {
                    currentParentId = currentItem.id;
                    currentItem = this._items.find(i => i.parentId === currentParentId && i.name === segments[index]);
                    index++;
                }
                if (!!currentItem) {
                    return currentItem;
                } else {
                    return 'not-found';
                }
            }
        } else {
            return 'not-found';
        }
    }
    public constructor() {
        const w1Id = 9;
        let runningId = 10;
        this._items.push({
            name: 'code1.aq',
            content: this._code1Txt,
            size: this._code1Txt.length,
            id: runningId,
            parentId: w1Id,
            isDirectory: false
        });
        runningId++;
        this._items.push({
            name: 'stdout1.aq',
            content: this._stdout1Txt,
            size: this._stdout1Txt.length,
            id: runningId,
            parentId: w1Id,
            isDirectory: false
        })
        runningId++;
        this._items.push({
            name: 'folder1',
            content: '',
            size: this._code1Txt.length + this._stdout1Txt.length,
            id: runningId,
            parentId: w1Id,
            isDirectory: true
        })
        runningId++;
        this._items.push({
            name: 'f1_code1.aq',
            content: this._code1Txt,
            size: this._code1Txt.length,
            id: runningId,
            parentId: this._items[this._items.length - 1].id,
            isDirectory: false
        })
        runningId++;
        this._items.push({
            name: 'f1_stdout1.aq',
            content: this._stdout1Txt,
            size: this._stdout1Txt.length,
            id: runningId,
            parentId: this._items[this._items.length - 2].id,
            isDirectory: false
        })
        runningId++;
        this._items.push({
            name: 'folder2',
            content: '',
            size: this._fooTxt.length,
            id: runningId,
            parentId: w1Id,
            isDirectory: true
        })
        runningId++;
        this._items.push({
            name: 'fooTxt.txt',
            content: this._fooTxt,
            size: this._fooTxt.length,
            id: runningId,
            parentId: this._items[this._items.length - 1].id,
            isDirectory: false
        })
        runningId++;
        /*Test many*/
        const pid = this._items[this._items.length - 1].parentId;
        for (let index = 0; index < 7; index++) {
            this._items.push({
                name: 'fooTxt' + index.toString() + '.txt',
                content: this._fooTxt,
                size: this._fooTxt.length,
                id: runningId,
                parentId: pid,
                isDirectory: false
            })
            runningId++;
            
        }
        /*End Test many*/
        const asmJson = `{"workspaceName": "SampleSpace1", "assemblyName": "SampleSpace1Asm", "sourceImports": ${this.getSourceImportsJson(this._items, w1Id)}}`;
        this._items.push({
            name: 'assembly.json',
            content: asmJson,//this._asmJsonTxt,
            size: asmJson.length,//this._asmJsonTxt.length,
            id: runningId,
            parentId: w1Id,
            isDirectory: false
        })
        runningId++;
        this._nextId = runningId;

        this._items.push({
            name: 'w1',
            content: '',
            size: this._items.filter(x => x.parentId === w1Id).map(x => x.size).reduce((x, y) => x + y, 0),
            id: w1Id,
            parentId: 0,
            isDirectory: true
        });

        // w2
        const w2Id = runningId + 25;
        this._items.push({
            name: 'code1.aq',
            content: 'Block01:\nLOAD_MONDAY 100\nLOAD_TUESDAY 6\nMEMWRITE [MONDAY] [TUESDAY.hh]\nADD [MONDAY]\nADD [TUESDAY]\nFLAG_ACK [WEDNESDAY] @FLAG=OVERFLOW\nADD [MONDAY]\nNO_OP\n',
            size: 'Block01:\nLOAD_MONDAY 100\nLOAD_TUESDAY 6\nMEMWRITE [MONDAY] [TUESDAY.hh]\nADD [MONDAY]\nADD [TUESDAY]\nFLAG_ACK [WEDNESDAY] @FLAG=OVERFLOW\nADD [MONDAY]\nNO_OP\n'.length,
            id: w2Id + 1,
            parentId: w2Id,
            isDirectory: false
        });
        this._items.push({
            name: 'assembly.json',
            content: `{"workspaceName": "WORKSPACE2", "assemblyName": "W2", "sourceImports": [{"referenceName": "Main", "filePath": "/code1.aq"}]}`,
            size: `{"workspaceName": "WORKSPACE2", "assemblyName": "W2", "sourceImports": [{"referenceName": "Main", "filePath": "/code1.aq"}]}`.length,
            id: w2Id + 2,
            parentId: w2Id,
            isDirectory: false
        });
        this._items.push({
            name: 'w2',
            content: '',
            size: this._items.filter(x => x.parentId === w2Id).map(x => x.size).reduce((x, y) => x + y, 0),
            id: w2Id,
            parentId: 0,
            isDirectory: true
        });
        // w2

        // w3
        const w3Id = runningId + 45;
        this._items.push({
            name: 'code2.aq',
            content: 'Block02:\nLOAD_MONDAY 6\nLOAD_TUESDAY 1\nIOWRITE_B [TUESDAY.ll] [TUESDAY.hh]\nIOFLUSH [WEDNESDAY.hh]\nIOWRITE_B [TUESDAY.ll] [TUESDAY.ll]\nIOFLUSH [WEDNESDAY.hh]\nLOAD_TUESDAY 2\nIOWRITE_B [TUESDAY.ll] [TUESDAY.hh]\nIOFLUSH [WEDNESDAY.hh]\nNO_OP\n',
            size: 'Block02:\nLOAD_MONDAY 6\nLOAD_TUESDAY 1\nIOWRITE_B [TUESDAY.ll] [TUESDAY.hh]\nIOFLUSH [WEDNESDAY.hh]\nIOWRITE_B [TUESDAY.ll] [TUESDAY.ll]\nIOFLUSH [WEDNESDAY.hh]\nLOAD_TUESDAY 2\nIOWRITE_B [TUESDAY.ll] [TUESDAY.hh]\nIOFLUSH [WEDNESDAY.hh]\nNO_OP\n'.length,
            id: w3Id + 1,
            parentId: w3Id,
            isDirectory: false
        });
        this._items.push({
            name: 'code1.aq',
            content: 'Block01:\n?import c2=code2\n?alias c2_b2=c2:Block02\nLOAD_MONDAY 6\nLOAD_TUESDAY 10\nADD [MONDAY]\nADD [TUESDAY]\nADD [MONDAY]\nJMPI $c2_b2\n',
            size: 'Block01:\n?import c2=code2\n?alias c2_b2=c2:Block02\nLOAD_MONDAY 6\nLOAD_TUESDAY 10\nADD [MONDAY]\nADD [TUESDAY]\nADD [MONDAY]\nJMPI $c2_b2\n'.length,
            id: w3Id + 2,
            parentId: w3Id,
            isDirectory: false
        });
        this._items.push({
            name: 'ALL_MNEMONICS.aq',
            content: "b:\nADD [MONDAY]\nSUB [MONDAY]\nMULT [MONDAY]\nDIV [MONDAY]\nMOD [MONDAY]\nMEMREAD [MONDAY] [TUESDAY.hh]\nMEMWRITE [MONDAY] [TUESDAY.hh]\nLOAD_MONDAY 100\nLOAD_TUESDAY 100\nLOAD_WEDNESDAY 100\nLOAD_THURSDAY 100\nLOAD_FRIDAY 100\nLOAD_ACCUMULATOR 100\nLOAD_INSPTR 100\nCOPY [MONDAY] [TUESDAY]\nBITAND [MONDAY]\nBITOR [MONDAY]\nBITXOR [MONDAY]\nBITLSHIFT [MONDAY]\nBITRSHIFT [MONDAY]\nBITNOT\nEQ [MONDAY] [TUESDAY] [WEDNESDAY]\nGT [MONDAY] [TUESDAY] [WEDNESDAY]\nLT [MONDAY] [TUESDAY] [WEDNESDAY]\nJMP [MONDAY]\nJNZ [MONDAY] [TUESDAY]\nJZ [MONDAY] [TUESDAY]\nJMPI 0\nJNZI [MONDAY.lx] 0\nJZI [MONDAY.lx] 1\nADDF [MONDAY]\nSUBF [MONDAY]\nMULTF [MONDAY]\nDIVF [MONDAY]\nFLOORF [MONDAY] [TUESDAY]\nCEILF [MONDAY] [TUESDAY]\nROUNDF [MONDAY] [TUESDAY]\nFLAG_ACK [MONDAY] [TUESDAY.hh]\nADDV [MONDAY]\nSUBV [MONDAY]\nMULTV [MONDAY]\nDIVV [MONDAY]\nMODV [MONDAY]\nEQV [MONDAY] [TUESDAY] [WEDNESDAY]\nGTV [MONDAY] [TUESDAY] [WEDNESDAY]\nLTV [MONDAY] [TUESDAY] [WEDNESDAY]\n'ABSV\n'NEGV\n'VEC\n'VEC_NEG\n'MAG\n'LOAD_D\n'LOAD_B\n'LOAD_X\nNO_OP\nIOSCAN [MONDAY.hh] [TUESDAY.hh]\nIOSTAT [MONDAY.hh] [TUESDAY.hh]\nIOMAN [MONDAY.hh] [TUESDAY.hh]\n'IOREAD_B\n'IOREAD_D\n'IOREAD_X\n'IOREAD_Q\n'IOWRITE_B\n'IOWRITE_D\n'IOWRITE_X\n'IOWRITE_Q\nIOFLUSH [MONDAY.hh]\n",
            size: "b:\nADD [MONDAY]\nSUB [MONDAY]\nMULT [MONDAY]\nDIV [MONDAY]\nMOD [MONDAY]\nMEMREAD [MONDAY] [TUESDAY.hh]\nMEMWRITE [MONDAY] [TUESDAY.hh]\nLOAD_MONDAY 100\nLOAD_TUESDAY 100\nLOAD_WEDNESDAY 100\nLOAD_THURSDAY 100\nLOAD_FRIDAY 100\nLOAD_ACCUMULATOR 100\nLOAD_INSPTR 100\nCOPY [MONDAY] [TUESDAY]\nBITAND [MONDAY]\nBITOR [MONDAY]\nBITXOR [MONDAY]\nBITLSHIFT [MONDAY]\nBITRSHIFT [MONDAY]\nBITNOT\nEQ [MONDAY] [TUESDAY] [WEDNESDAY]\nGT [MONDAY] [TUESDAY] [WEDNESDAY]\nLT [MONDAY] [TUESDAY] [WEDNESDAY]\nJMP [MONDAY]\nJNZ [MONDAY] [TUESDAY]\nJZ [MONDAY] [TUESDAY]\nJMPI 0\nJNZI [MONDAY.lx] 0\nJZI [MONDAY.lx] 1\nADDF [MONDAY]\nSUBF [MONDAY]\nMULTF [MONDAY]\nDIVF [MONDAY]\nFLOORF [MONDAY] [TUESDAY]\nCEILF [MONDAY] [TUESDAY]\nROUNDF [MONDAY] [TUESDAY]\nFLAG_ACK [MONDAY] [TUESDAY.hh]\nADDV [MONDAY]\nSUBV [MONDAY]\nMULTV [MONDAY]\nDIVV [MONDAY]\nMODV [MONDAY]\nEQV [MONDAY] [TUESDAY] [WEDNESDAY]\nGTV [MONDAY] [TUESDAY] [WEDNESDAY]\nLTV [MONDAY] [TUESDAY] [WEDNESDAY]\n'ABSV\n'NEGV\n'VEC\n'VEC_NEG\n'MAG\n'LOAD_D\n'LOAD_B\n'LOAD_X\nNO_OP\nIOSCAN [MONDAY.hh] [TUESDAY.hh]\nIOSTAT [MONDAY.hh] [TUESDAY.hh]\nIOMAN [MONDAY.hh] [TUESDAY.hh]\n'IOREAD_B\n'IOREAD_D\n'IOREAD_X\n'IOREAD_Q\n'IOWRITE_B\n'IOWRITE_D\n'IOWRITE_X\n'IOWRITE_Q\nIOFLUSH [MONDAY.hh]\n".length,
            id: w3Id + 3,
            parentId: w3Id,
            isDirectory: false
        });
        this._items.push({
            name: 'assembly.json',
            content: `{"workspaceName": "WORKSPACE3", "assemblyName": "W3", "sourceImports": [{"referenceName": "Main", "filePath": "/code1.aq"},{"referenceName": "code2", "filePath": "/code2.aq"}]}`,
            size: `{"workspaceName": "WORKSPACE3", "assemblyName": "W3", "sourceImports": [{"referenceName": "Main", "filePath": "/code1.aq"},{"referenceName": "code2", "filePath": "/code2.aq"}]}`.length,
            id: w3Id + 4,
            parentId: w3Id,
            isDirectory: false
        });
        this._items.push({
            name: 'w3',
            content: '',
            size: this._items.filter(x => x.parentId === w3Id).map(x => x.size).reduce((x, y) => x + y, 0),
            id: w3Id,
            parentId: 0,
            isDirectory: true
        });
        // w3
    }
    private getSourceImportsJson(mockItems: Array<MockItem>, baseId: number): string {
        const getPath = (id: number) => {
            let itm = mockItems.find(x => x.id === id);
            let p = `/${itm.name}`;
            while (!!itm && itm.id !== baseId && itm.parentId !== baseId) {
                itm = mockItems.find(x => x.id === itm.parentId);
                p = `/${itm.name}${p}`;
            }
            return p;
        }
        return JSON.stringify(mockItems.map(x => [x, x.name.toLowerCase()] as [MockItem, string]).filter(x => x[1].endsWith('.aq')).map(x => {
            return {
                referenceName: x[1].replace('.aq', ''),
                filePath: getPath(x[0].id)
            }
        }))
    }
}

// function WRAP_PROMISE<T>(process: (resolve: (v: T) => void, reject: (v: any) => void)=>void): Promise<T> {
//     return new Promise((rs, rj) => {
//         try {
//             process(rs, rj);
//         } catch (err) {
//             console.log(`ERROR: ${err}`);
//             rj(err);
//         }
//     })
// }

export class MockStorageApi {
    private readonly _code1Txt = '';
    private readonly _stdout1Txt = '';
    private readonly _fooTxt = 'Hello, world!';
    private readonly _asmJsonTxt = '';
    private readonly _MOCK_FS = {
        code1_file: {
            success: true,
            status: StorageApiStatus.OK,
            name: 'code1.aq',
            size: this._code1Txt.length,
            id: 0,
            itemCount: 0,
            items: []
        },
        stdout1_file: {
            success: true,
            status: StorageApiStatus.OK,
            name: 'stdout1.aq',
            size: this._stdout1Txt.length,
            id: 1,
            itemCount: 0,
            items: []
        },
        folder1_folder: {
            success: true,
            status: StorageApiStatus.OK,
            name: 'folder1',
            size: this._stdout1Txt.length + this._code1Txt.length,
            id: 2,
            itemCount: 2,
            items: [{
                success: true,
                status: StorageApiStatus.OK,
                name: 'f1_code1.aq',
                size: this._code1Txt.length,
                id: 3,
                itemCount: 0,
                items: []
            }, {
                success: true,
                status: StorageApiStatus.OK,
                name: 'f1_stdout1.aq',
                size: this._stdout1Txt.length,
                id: 4,
                itemCount: 0,
                items: []
            }]
        },
        folder2_folder: {
            success: true,
            status: StorageApiStatus.OK,
            name: 'folder2',
            size: this._fooTxt.length,
            id: 5,
            itemCount: 1,
            items: [{
                success: true,
                status: StorageApiStatus.OK,
                name: 'fooTxt.txt',
                size: this._fooTxt.length,
                id: 6,
                itemCount: 0,
                items: []
            }]
        },
        settings_file: {
            success: true,
            status: StorageApiStatus.OK,
            name: 'assembly.json',
            size: this._asmJsonTxt.length,
            id: 7,
            itemCount: 0,
            items: []
        }
    }

    // private _fsObject: {
    //     success: boolean,
    //     status: StorageApiStatus,
    //     name: string,
    //     size: number,
    //     id: number,
    //     itemCount: number,
    //     items: []
    // };
    private readonly _mockObject: MockFs;

    public info(absolutePath: string, recursive: boolean): Promise<StorageApiInfo> {
        return new Promise((resolve, reject) => {
            const item = this._mockObject.getItem(absolutePath);
            if (item === 'not-found') {
                resolve({
                    success: false,
                    status: StorageApiStatus.NotFound,
                    name: null,
                    size: Number.NaN,
                    id: Number.NaN,
                    itemCount: Number.NaN,
                    items: []
                })
            } else {
                if (recursive) {
                    const ri = this.recursivelyGetInfo_Internal(item);
                    resolve(ri);
                } else {
                    resolve({
                        success: true,
                        status: StorageApiStatus.OK,
                        name: item.name,
                        size: item.size,
                        id: item.id,
                        itemCount: !!item.content
                            ? 0
                            : this._mockObject.getItems().filter(i => i.parentId === item.id).length,
                        items: []
                    })
                }
            }
        });
    }
    public rename(absolutePath: string, toName: string): Promise<StorageApiResponse> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(absolutePath);
            if (mo === 'not-found') {
                resolve(this.failure(StorageApiStatus.NotFound));
            } else {
                this._mockObject.removeItem(mo.id);
                if (this._mockObject.addItem(mo.id, toName, mo.parentId, false, mo.isDirectory, mo.content) === 'ok') {
                    resolve(this.success());
                } else {
                    resolve(this.failure(StorageApiStatus.BadFormat, 'Name contains invalid character(s)'));
                }
            }
        });
    }
    public move(absolutePath: string, toContainerPath: string): Promise<StorageApiResponse> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(absolutePath);
            if (mo === 'not-found') {
                resolve(this.failure(StorageApiStatus.NotFound));
            } else {
                const toMo = this._mockObject.getItem(toContainerPath);
                if (toMo === 'not-found') {
                    resolve(this.failure(StorageApiStatus.NotFound));
                } else if (!!toMo.content) {
                    resolve(this.failure(StorageApiStatus.BadFormat, 'Destination is not a directory'));
                } else {
                    this._mockObject.removeItem(mo.id);
                    if (this._mockObject.addItem(mo.id, mo.name, toMo.id, false, mo.isDirectory, mo.content) === 'ok') {
                        resolve(this.success());
                    } else {
                        resolve(this.failure(StorageApiStatus.BadFormat, 'Name contains invalid character(s)'));
                    }
                }
            }
        });
    }
    public delete(absolutePath: string): Promise<StorageApiResponse> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(absolutePath);
            if (mo === 'not-found') {
                resolve(this.failure(StorageApiStatus.NotFound));
            } else {
                this._mockObject.removeItem(mo.id);
                resolve(this.success());
            }
        });
    }

    public createDirectory(containerPath: string, name: string): Promise<StorageApiIdentity> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(containerPath);
            if (mo === 'not-found') {
                resolve({
                    id: Number.NaN,
                    success: false,
                    status: StorageApiStatus.NotFound
                });
            } else if (!!mo.content) {
                resolve({
                    id: Number.NaN,
                    success: false,
                    status: StorageApiStatus.BadFormat,
                    message: 'Destination is not a directory'
                });
            } else {
                const nextId = this._mockObject.getNextId();
                if (this._mockObject.addItem(nextId, name, mo.id, true, true) === 'ok') {
                    resolve({
                        id: nextId,
                        success: true,
                        status: StorageApiStatus.OK
                    });
                } else {
                    resolve({
                        id: Number.NaN,
                        success: false,
                        status: StorageApiStatus.BadFormat,
                        message: 'Name contains invalid character(s)'
                    });
                }
            }
        });
    }
    public createFile(containerPath: string, filename: string, content?: string): Promise<StorageApiIdentity> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(containerPath);
            if (mo === 'not-found') {
                resolve({
                    id: Number.NaN,
                    success: false,
                    status: StorageApiStatus.NotFound
                });
            } else if (!!mo.content) {
                resolve({
                    id: Number.NaN,
                    success: false,
                    status: StorageApiStatus.BadFormat,
                    message: 'Destination is not a directory'
                });
            } else {
                const nextId = this._mockObject.getNextId();
                if (this._mockObject.addItem(nextId, filename, mo.id, true, false, content || '') === 'ok') {
                    resolve({
                        id: nextId,
                        success: true,
                        status: StorageApiStatus.OK
                    });
                } else {
                    resolve({
                        id: Number.NaN,
                        success: false,
                        status: StorageApiStatus.BadFormat,
                        message: 'Name contains invalid character(s)'
                    });
                }
            }
        });
    }

    public readFile(absolutePath: string): Promise<StorageApiFile> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(absolutePath);
            if (mo === 'not-found') {
                const response = this.failure(StorageApiStatus.NotFound);
                response['content'] = null;
                response['encoding'] = null;
                resolve(response as StorageApiFile);
            } else {
                const response = this.success();
                response['content'] = mo.content;
                response['encoding'] = 'utf8';
                resolve(response as StorageApiFile);
            }
        });
    }
    public overwriteFile(absolutePath: string, content: string): Promise<StorageApiResponse> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(absolutePath);
            if (mo === 'not-found') {
                resolve(this.failure(StorageApiStatus.NotFound));
            } else {
                this._mockObject.removeItem(mo.id);
                if (this._mockObject.addItem(mo.id, mo.name, mo.parentId, false, false, content) === 'ok') {
                    resolve(this.success());
                } else {
                    resolve(this.failure(StorageApiStatus.BadFormat, 'Name contains invalid character(s)'));
                }
            }
        });
    }
    public appendToFile(absolutePath: string, content: string): Promise<StorageApiResponse> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(absolutePath);
            if (mo === 'not-found') {
                resolve(this.failure(StorageApiStatus.NotFound));
            } else {
                this._mockObject.removeItem(mo.id);
                if (this._mockObject.addItem(mo.id, mo.name, mo.parentId, false, false, mo.content + content) === 'ok') {
                    resolve(this.success());
                } else {
                    resolve(this.failure(StorageApiStatus.BadFormat, 'Name contains invalid character(s)'));
                }
            }
        });
    }

    public readDirectory(absolutePath: string): Promise<StorageApiDirectory> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(absolutePath);
            if (mo === 'not-found') {
                const response = this.failure(StorageApiStatus.NotFound);
                response['files'] = [];
                response['directories'] = [];
                resolve(response as StorageApiDirectory);
            } else {
                resolve(this.readDir_Internal(mo.id, mo.name));
            }
        });
    }

    public findInfo(baseContainerPath: string, recursive: boolean, query: string, includeDirectories: boolean, includeFiles: boolean): Promise<StorageApiQueryResult> {
        return new Promise((resolve, reject) => {
            const mo = this._mockObject.getItem(baseContainerPath);
            if (mo === 'not-found') {
                resolve({
                    count: Number.NaN,
                    files: [],
                    directories: [],
                    success: false,
                    status: StorageApiStatus.NotFound
                });
            } else {
                const getShortInfoIteration = (id: number, name: string, path: string, recurse: boolean) => {
                    const files = new Array<StorageApiShortInfo>();
                    const directories = new Array<StorageApiShortInfo>();

                    let currentResult = this.getShortInfo_Internal(id, name, path, query);
                    currentResult.files.forEach(f => files.push(f));
                    currentResult.directories.forEach(d => directories.push(d));

                    if (recurse) {
                        this._mockObject.getItems()
                            .filter(i => i.isDirectory && i.parentId === id)
                            .forEach(i => {
                                const deepPath = `${path}/${i.name}`.replace('//', '/');
                                const deep = getShortInfoIteration(i.id, i.name, deepPath, recurse);
                                if (deep.length > 0) {
                                    deep[0].forEach(d => files.push(d));
                                    deep[1].forEach(d => directories.push(d));
                                }
                            })
                    }

                    return [files, directories];
                }

                const allMatchingFiles = new Array<StorageApiShortInfo>();
                const allMatchingDirectories = new Array<StorageApiShortInfo>();                
                const all = getShortInfoIteration(mo.id, mo.name, baseContainerPath, recursive);
                if (includeFiles) {
                    all[0].forEach(a => allMatchingFiles.push(a));
                }
                if (includeDirectories) {
                    all[1].forEach(a => allMatchingDirectories.push(a));
                }
                resolve({
                    count: allMatchingDirectories.length + allMatchingFiles.length,
                    files: allMatchingFiles,
                    directories: allMatchingDirectories,
                    success: true,
                    status: StorageApiStatus.OK
                });
            }
        });
    }

    public constructor() {
        this._mockObject = new MockFs();
    }

    private readDir_Internal(dirId: number, name: string): StorageApiDirectory {
        const files = this._mockObject.getItems()
        .filter(i => i.parentId === dirId && !i.isDirectory)
        .map(sf => {
            return {
                success: true,
                status: StorageApiStatus.OK,
                name: sf.name,
                size: sf.size,
                id: sf.id,
                itemCount: 0,
                items: [],
                content: sf.content,
                encoding: 'utf8'
            }
        });
        const subdirectories = this._mockObject.getItems()
            .filter(i => i.parentId === dirId && i.isDirectory)
            .map(sf => this.readDir_Internal(sf.id, sf.name));
       
        return {
            files: files,
            directories: subdirectories,
            success: true,
            status: StorageApiStatus.OK,
            name: name,
            size: subdirectories.map(sd => sd.size).reduce((x, y) => x + y, 0)
                + files.map(f => f.size).reduce((x, y) => x + y, 0),
            id: dirId,
            itemCount: subdirectories.map(sd => sd.itemCount).reduce((x, y) => x + y, 0)
                + files.map(f => f.itemCount).reduce((x, y) => x + y, 0),
            items: this._mockObject.getItems()
                .filter(i => i.parentId === dirId)
                .map(i => this.recursivelyGetInfo_Internal(i))
                .reduce((x, y) => x.concat(y), [])
        };
    }
    
    private recursivelyGetInfo_Internal(self: MockItem): StorageApiInfo {
        let children = new Array<StorageApiInfo>();
        if (this._mockObject.getItems().some(i => i.parentId === self.id)) {
            children = this._mockObject.getItems()
                .filter(x => x.parentId === self.id)
                .map(x => this.recursivelyGetInfo_Internal(x))
                .reduce((x, y) => x.concat(y), []);
        }
        return {
            success: true,
            status: StorageApiStatus.OK,
            name: self.name,
            size: self.size,
            id: self.id,
            itemCount: children.length,
            items: children
        }
    }

    private getShortInfo_Internal(dirId: number, dirName: string, containerPath: string, query: string): StorageApiQueryResult {
        const nameTestFn = (s: string) => {
            const sLC = s.toLowerCase();
            const queryLC = query.toLowerCase();
            if (query.startsWith('*')) {
                return sLC.endsWith(queryLC.replace('*', ''));
            } else if (query.endsWith('*')) {
                return sLC.startsWith(queryLC.replace('*', ''));
            } else {
                return sLC === queryLC;
            }
        }

        const foundFiles = new Array<StorageApiShortInfo>();
        const foundDirectories = new Array<StorageApiShortInfo>();

        let currentPath = containerPath;
        let item = this.readDir_Internal(dirId, dirName);
        item.files.filter(f => nameTestFn(f.name)).forEach(f => {
            foundFiles.push({
                id: f.id,
                absolutePath: `${currentPath}/${f.name}`.replace('//', '/'),
                name: f.name,
                size: f.size
            })
        })
        item.directories.filter(d => nameTestFn(d.name)).forEach(d => {
            foundDirectories.push({
                id: d.id,
                absolutePath: `${currentPath}/${d.name}`.replace('//', '/'),
                name: d.name,
                size: d.size
            })
        })

        return {
            count: foundFiles.length + foundDirectories.length,
            files: foundFiles,
            directories: foundDirectories,
            success: true,
            status: StorageApiStatus.OK
        }
    }

    private success(): StorageApiResponse {
        return {
            success: true,
            status: StorageApiStatus.OK
        }
    }

    private failure(status: StorageApiStatus, message?: string): StorageApiResponse {
        return {
            success: false,
            status: status,
            message: message
        }
    }
}