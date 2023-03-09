//TODO separate files
export enum StorageApiStatus {
    OK,
    NotFound,
    Unauthorized,
    BadFormat,
    InsufficientResources,
    InternalError
}

export interface StorageApiResponse {
    readonly success: boolean;
    readonly status: StorageApiStatus;
    readonly message?: string;
}

export interface StorageApiInfo extends StorageApiResponse {
    readonly name: string;
    readonly size: number;
    readonly id: number;
    readonly itemCount: number;
    readonly items: ReadonlyArray<StorageApiInfo>;
}

export interface StorageApiFile extends StorageApiInfo {
    readonly content: string;
    readonly encoding: string;
}

export interface StorageApiDirectory extends StorageApiInfo {
    readonly files: ReadonlyArray<StorageApiFile>;
    readonly directories: ReadonlyArray<StorageApiDirectory>;
}

export interface StorageApiShortInfo {
    readonly id: number;
    readonly absolutePath: string;
    readonly name: string;
    readonly size: number;
}

export interface StorageApiQueryResult extends StorageApiResponse {
    readonly count: number;
    readonly files: ReadonlyArray<StorageApiShortInfo>;
    readonly directories: ReadonlyArray<StorageApiShortInfo>;
}

export interface StorageApiIdentity extends StorageApiResponse {
    readonly id: number;
}