declare var wrvFile: {
    write(formatVersion: number, meta: string, producer: string, records: Array<{
        readonly data: string;
        readonly type: string;
    }>, recordTypeMap: { readonly [typeName: string]: number }): string;
    read(s: string, recordTypeMap: { readonly [typeName: string]: number }): {
        formatVersion: any;
        timestamp: number;
        meta: string;
        producer: string;
        records: Array<{
            readonly data: string;
            readonly type: string;
        }>;
    }
}

declare var awGetNavInfo: () => string;

export const WrvTypes: {
    readonly Dynamic: string,
    readonly WorkspaceAsset: string,
    readonly Workspace: string
} = {
    Dynamic: 'Dynamic',
    WorkspaceAsset: 'WorkspaceAsset',
    Workspace: 'Workspace'
}

export class WrvHelper {
    public static write(meta: string, records: Array<{
        readonly data: string;
        readonly type: string;
    }>): string {
        return wrvFile.write(WrvHelper._FORMAT_VERSION, meta + awGetNavInfo(), WrvHelper._PRODUCER, records, WrvHelper.TYPEMAP);
    }

    public static read(s: string): {
        formatVersion: any;
        timestamp: number;
        meta: string;
        producer: string;
        records: Array<{
            readonly data: string;
            readonly type: string;
        }>;
    } {
        return wrvFile.read(s, WrvHelper.TYPEMAP);
    }

    private static get TYPEMAP(): { readonly [typeName: string]: number } {
        // let typemap: { readonly [typeName: string]: number } = {};
        // Object.keys(WrvTypes).forEach((k, i) => {
        //     typemap = Object.defineProperty(typemap, k, {
        //         writable: false,
        //         value: i
        //     })
        // })
        // return typemap;
        let typemap: { [typeName: string]: number } = {};
        Object.keys(WrvTypes).forEach((k, i) => {
            typemap[k] = i;
        })
        return typemap;
        // return {
        //     'Dynamic': 0,
        //     'WorkspaceAsset': 1,
        //     'Workspace': 2
        // }
    }

    private static readonly _FORMAT_VERSION = 1;
    private static readonly _PRODUCER = 'wide1000';

}