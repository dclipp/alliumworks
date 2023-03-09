import { ArchivedEntity } from '../models/archived-entity';
import { Utils } from '../utils';
import { DeviceBundleApi, initDeviceBundleApi } from './device-bundle-api';
import { initSessionApi, SessionApi } from './session-api';
import { initWorkspaceApi, WorkspaceApi } from './workspace-api';

export interface ArchiverApi {
    readonly workspace: WorkspaceApi;
    readonly session: SessionApi;
    readonly deviceBundle: DeviceBundleApi;
    serializeEntity<T>(entity: ArchivedEntity<T>): string;
}

export function initArchiverApi(): ArchiverApi {
    return {
        workspace: initWorkspaceApi(),
        session: initSessionApi(),
        deviceBundle: initDeviceBundleApi(),
        serializeEntity: (entity) => {
            return Utils.serializeEntity(entity);
        }
    }
}