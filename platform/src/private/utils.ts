import { YfsAsset, YfsFile, YfsOutput } from 'yfs';

export class Utils {
    public static getPayloadOrFail<T>(output: YfsOutput<T>): T {
        if (output.payload === null) {
            throw new Error('Payload is null');
        } else {
            return output.payload!;
        }
    }

    public static async getPayloadOrFailAsync<T>(output: Promise<YfsOutput<T>>): Promise<T> {
        const o = await output;
        if (o.payload === null) {
            throw new Error('Payload is null');
        } else {
            return o.payload!;
        }
    }

    public static async fetchFilesOrFailAsync<T>(output: Promise<YfsOutput<Array<YfsFile>>>, deserializer: (json: string) => T, ignoreDeletedFiles?: boolean): Promise<Array<T>> {
        const o = await output;
        if (o.payload === null) {
            throw new Error('Payload is null');
        } else {
            return o.payload!.filter(f => ignoreDeletedFiles === true ? !f.isDeleted : true).map(f => deserializer(f.content));
        }
    }

    public static getFileOrNull(title: string, extension: string, assets: Array<YfsAsset>): YfsFile | null {
        const asset = assets.find(a => !a.isDirectory && (a as YfsFile).title.toLowerCase() === title.toLowerCase() && (a as YfsFile).extension.toLowerCase() === extension.toLowerCase());
        return !!asset ? (asset as YfsFile) : null;
    }
}