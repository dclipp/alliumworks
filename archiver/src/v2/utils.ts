import { ArchivedEntity } from './models/archived-entity';
import { ArchivedFile } from './models/archived-file';

export class Utils {
    public static findIndexOfArchivedFile(files: Array<ArchivedFile>, search: {
        readonly containerPath: string;
        readonly title: string;
        readonly extension: string;
    } | ArchivedFile): number {
        const matchContainerPath = search.containerPath.toLowerCase();
        const matchTitle = search.title.toLowerCase();
        const matchExtension = search.extension.toLowerCase();

        return files.findIndex(f => f.containerPath.toLowerCase() === matchContainerPath && f.title.toLowerCase() === matchTitle && f.extension.toLowerCase() === matchExtension);
    }

    public static isArchivedFile(o: any): o is ArchivedFile {
        return !!o && Object.getOwnPropertyNames(o).includes('content');
    }

    public static serializeEntity<T>(entity: ArchivedEntity<T>): string {
        return JSON.stringify(entity).replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    }

    public static deserializeEntity(serializedEntity: string): ArchivedEntity<any> {
        const o: Partial<ArchivedEntity<any>> = JSON.parse(serializedEntity);
        if (o.creator !== undefined && o.producer !== undefined && o.timestamp !== undefined && o.payloadType !== undefined && o.schemaVersion !== undefined) {
            return o as ArchivedEntity<any>;
        } else {
            throw new Error('invalid serialized entity');
        }
    }
}