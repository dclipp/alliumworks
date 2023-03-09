import { Injectable } from '@angular/core';
import { StorageApiInfo, StorageApiResponse, StorageApiIdentity, StorageApiFile, StorageApiDirectory, StorageApiQueryResult, StorageApiStatus } from '../data-models/storage/storage-api-types';
import { MockStorageApi } from '../external/mock-storage-api';
import { PathUtility } from '../utilities/path-utility';

type MappedObject = { readonly absolutePath: string, readonly objectId: number }

@Injectable({
  providedIn: 'root'
})
export class StorageApiService {

  public info(absolutePath: string, recursive: boolean): Promise<StorageApiInfo> {
    return this._MOCK_API.info(absolutePath, recursive);
    // return new Promise((resolve, reject) => {

    // });
  }
  public rename(absolutePath: string, toName: string): Promise<StorageApiResponse> {
    return new Promise((resolve, reject) => {
      this._MOCK_API.rename(absolutePath, toName).then(result => {
        if (result.success) {
          this.lookupInMap(absolutePath, (map) => {
            this.updateObjectPathMap({ absolutePath: PathUtility.join(PathUtility.getUpPath(absolutePath), toName), storageObjectId: map.objectId });
          });
        }
        resolve(result);
      })
    });
    // return this._MOCK_API.rename(absolutePath, toName);
	//return new Promise((resolve, reject) => {});
  }
  public move(absolutePath: string, toContainerPath: string): Promise<StorageApiResponse> {
    return new Promise((resolve, reject) => {
      this._MOCK_API.move(absolutePath, toContainerPath).then(result => {
        if (result.success) {
          this.lookupInMap(absolutePath, (map) => {
            const newPath = PathUtility.join(toContainerPath, PathUtility.getTargetName(absolutePath));
            this.updateObjectPathMap({ absolutePath: newPath, storageObjectId: map.objectId });
          });
        }
        resolve(result);
      })
    });
    // return this._MOCK_API.move(absolutePath, toContainerPath);
	//return new Promise((resolve, reject) => {});
  }
  public delete(absolutePath: string): Promise<StorageApiResponse> {
    return new Promise((resolve, reject) => {
      this._MOCK_API.delete(absolutePath).then(result => {
        if (result.success) {
          this.removeFromMapAndFileCache(absolutePath);
        }
        resolve(result);
      })
    });
    // return this._MOCK_API.delete(absolutePath);
	//return new Promise((resolve, reject) => {});
  }

  public createDirectory(containerPath: string, name: string): Promise<StorageApiIdentity> {
    return new Promise((resolve, reject) => {
      this._MOCK_API.createDirectory(containerPath, name).then(dir => {
        if (dir.success) {
          this.updateObjectPathMap({ absolutePath: PathUtility.join(containerPath, name), storageObjectId: dir.id });
        }
        resolve(dir);
      })
    });
    // return this._MOCK_API.createDirectory(containerPath, name);
	//return new Promise((resolve, reject) => {});
  }
  public createFile(containerPath: string, filename: string, content?: string): Promise<StorageApiIdentity> {
    return new Promise((resolve, reject) => {
      this._MOCK_API.createFile(containerPath, filename, content).then(file => {
        if (file.success) {
          this.updateObjectPathMap({ absolutePath: PathUtility.join(containerPath, filename), storageObjectId: file.id });
          this._fileCache.set(file.id, content || '');
        }
        resolve(file);
      })
    });
    // return this._MOCK_API.createFile(containerPath, filename, content);
	//return new Promise((resolve, reject) => {});
  }

  public readFile(absolutePath: string): Promise<StorageApiFile> {
    return new Promise((resolve, reject) => {
      this._MOCK_API.readFile(absolutePath).then(file => {
        if (file.success) {
          this.updateObjectPathMap({ absolutePath: absolutePath, storageObjectId: file.id });
          this._fileCache.set(file.id, file.content);
        }
        resolve(file);
      })
    });
    // return this._MOCK_API.readFile(absolutePath);
	//return new Promise((resolve, reject) => {});
  }
  // public overwriteFile(absolutePath: string, content: string): Promise<StorageApiResponse> {
  //   return new Promise((resolve, reject) => {
  //     this._MOCK_API.overwriteFile(absolutePath, content).then(result => {
  //       if (result.success) {
  //         this.lookupInMap(absolutePath, (map) => {
  //           this._fileCache.set(map.objectId, content);
  //         });
  //       }
  //       resolve(result);
  //     })
  //   });
  //   // return this._MOCK_API.overwriteFile(absolutePath, content);
	// //return new Promise((resolve, reject) => {});
  // }
  public overwriteFile(pathOrStorageObjectId: string | number, content: string): Promise<StorageApiResponse> {
    return new Promise((resolve, reject) => {
      this.lookupInMap(pathOrStorageObjectId, (map) => {
        this._MOCK_API.overwriteFile(map.absolutePath, content).then(result => {
          if (result.success) {
            this._fileCache.set(map.objectId, content);
          }
          resolve(result);
        })
      }, () => {
        resolve({
          success: false,
          status: StorageApiStatus.NotFound
        });
      })
    });
    // return this._MOCK_API.overwriteFile(absolutePath, content);
	//return new Promise((resolve, reject) => {});
  }
  public appendToFile(pathOrStorageObjectId: string | number, content: string): Promise<StorageApiResponse> {
    return new Promise((resolve, reject) => {
      this.lookupInMap(pathOrStorageObjectId, (map) => {
        this._MOCK_API.appendToFile(map.absolutePath, content).then(result => {
          if (result.success) {
            const contentBefore = this._fileCache.get(map.objectId);
            this._fileCache.set(map.objectId, contentBefore + content);
          }
          resolve(result);
        })
      }, () => {
        resolve({
          success: false,
          status: StorageApiStatus.NotFound
        });
      })
    });
    // return new Promise((resolve, reject) => {
    //   this._MOCK_API.appendToFile(absolutePath, content).then(result => {
    //     if (result.success) {
    //       this.lookupInMap(absolutePath, (map) => {
    //         const contentBefore = this._fileCache.get(map.objectId);
    //         this._fileCache.set(map.objectId, contentBefore + content);
    //       });
    //     }
    //     resolve(result);
    //   })
    // });
    // return this._MOCK_API.appendToFile(absolutePath, content);
	//return new Promise((resolve, reject) => {});
  }

  public readDirectory(absolutePath: string): Promise<StorageApiDirectory> {
    return new Promise((resolve, reject) => {
      this._MOCK_API.readDirectory(absolutePath).then(dir => {
        if (dir.success) {
          this.updateObjectPathMapFromDirectory(dir, absolutePath);
          this.extractAllFiles(dir).forEach(f => {
            this._fileCache.set(f.id, f.content);
          })
        }
        resolve(dir);
      })
    });
    // return this._MOCK_API.readDirectory(absolutePath);
	//return new Promise((resolve, reject) => {});
  }

  public findInfo(baseContainerPath: string, recursive: boolean, query: string, includeDirectories: boolean, includeFiles: boolean): Promise<StorageApiQueryResult> {
    return new Promise((resolve, reject) => {
      this._MOCK_API.findInfo(baseContainerPath, recursive, query, includeDirectories, includeFiles).then(queryResult => {
        if (queryResult.success) {
          this.updateObjectPathMap(queryResult);
        }
        resolve(queryResult);
      })
    });
    // return this._MOCK_API.findInfo(baseContainerPath, recursive, query, includeDirectories, includeFiles);
	//return new Promise((resolve, reject) => {});
  }

  public getFileContent(pathOrStorageObjectId: string | number): Promise<{ readonly success: boolean, readonly content: string, readonly name: string, readonly absolutePath: string, readonly storageObjectId: number }> {
    return new Promise((resolve, reject) => {
      this.lookupInMap(pathOrStorageObjectId, (map) => {
        const filename = PathUtility.getTargetName(map.absolutePath);
        if (this._fileCache.has(map.objectId)) {
          resolve({
            success: true,
            content: this._fileCache.get(map.objectId),
            name: filename,
            absolutePath: map.absolutePath,
            storageObjectId: map.objectId
          });
        } else {
          this.readFile(map.absolutePath).then(file => {
            if (file.success) {
              resolve({
                success: true,
                content: file.content,
                name: filename,
                absolutePath: map.absolutePath,
                storageObjectId: map.objectId
              });
            } else {
              resolve({
                success: false,
                content: '',
                name: filename,
                absolutePath: '',
                storageObjectId: map.objectId
              });
            }
          })
        }
      }, () => {
        resolve({
          success: false,
          content: '',
          name: '',
          absolutePath: '',
          storageObjectId: Number.NaN
        });
      })
    })
  }

  public getAllFileContent(pathsOrStorageObjectIds: Array<string | number>): Promise<Array<{ readonly content: string, readonly name: string, readonly absolutePath: string, readonly storageObjectId: number }>> {
    return new Promise((resolve, reject) => {
      Promise.all(pathsOrStorageObjectIds.map(x => this.getFileContent(x))).then(contents => {
        resolve(contents)
      })
    });
  }
  
  constructor() { }

  private extractAllFiles(directory: StorageApiDirectory): Array<StorageApiFile> {
    const files = new Array<StorageApiFile>();
    directory.files.forEach(f => files.push(f));
    if (directory.directories.length > 0) {
      directory.directories.forEach(d => {
        this.extractAllFiles(d).forEach(f => files.push(f));
      });
    }
    return files;
  }

  private updateObjectPathMap(data: StorageApiQueryResult | { absolutePath: string, storageObjectId: number }): void {
    if (data['absolutePath'] !== undefined) {
      const d = data as { absolutePath: string, storageObjectId: number };
      this.addOrUpdatePathMap(d.storageObjectId, d.absolutePath);
    } else {
      const d = data as StorageApiQueryResult;
      d.files.forEach(f => {
        this.addOrUpdatePathMap(f.id, f.absolutePath);
      });
      d.directories.forEach(d => {
        this.addOrUpdatePathMap(d.id, d.absolutePath);
      });
    }
  }

  private updateObjectPathMapFromDirectory(directory: StorageApiDirectory, absolutePath: string): void {
    this.updateObjectPathMap({ absolutePath: absolutePath, storageObjectId: directory.id });
    directory.files.forEach(f => {
      this.updateObjectPathMap({ absolutePath: PathUtility.join(absolutePath, f.name), storageObjectId: f.id });
    });
    directory.directories.forEach(d => {
      this.updateObjectPathMapFromDirectory(d, PathUtility.join(absolutePath, d.name));
    })
  }

  private addOrUpdatePathMap(storageObjectId: number, absolutePath: string): void {
    const index = this._objectPathMap.findIndex(x => x.objectId === storageObjectId);
    if (index > -1) {
      this._objectPathMap[index] = {
        objectId: storageObjectId,
        absolutePath: absolutePath
      };
    } else {
      this._objectPathMap.push({
        objectId: storageObjectId,
        absolutePath: absolutePath
      });
    }
  }

  private removeFromMapAndFileCache(query: string | number): void {
    this.lookupInMap(query, (map) => {
      const mapIndex = this._objectPathMap.findIndex(x => x.objectId === map.objectId);
      this._objectPathMap.splice(mapIndex, 1);
      if (this._fileCache.has(map.objectId)) {
        this._fileCache.delete(map.objectId);
      }
      this._objectPathMap.filter(x => x.absolutePath.startsWith(map.absolutePath)).forEach(x => this.removeFromMapAndFileCache(x.objectId));
    });
  }

  private lookupInMap(query: string | number, ifFoundThen?: (map: MappedObject) => void, ifNotFoundThen?: () => void): MappedObject {
    let index = -1;
    if (Object.getOwnPropertyNames(query).includes('length')) { // string
      index = this._objectPathMap.findIndex(x => x.absolutePath === (query as string));
    } else { // number
      index = this._objectPathMap.findIndex(x => x.objectId === (query as number));
    }
    if (index > -1) {
      const o: MappedObject = {
        objectId: this._objectPathMap[index].objectId,
        absolutePath: this._objectPathMap[index].absolutePath
      };
      if (!!ifFoundThen) {
        ifFoundThen(o);
      }
      return o;
    } else {
      if (!!ifNotFoundThen) {
        ifNotFoundThen();
      }
      return null;
    }
  }

  private readonly _objectPathMap = new Array<MappedObject>();
  private readonly _fileCache = new Map<number, string>();
  private readonly _MOCK_API = new MockStorageApi();
}
