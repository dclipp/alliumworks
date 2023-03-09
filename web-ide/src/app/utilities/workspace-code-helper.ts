// import { AssemblySettings, Parser, Assembly } from '@allium/asm';
// import { PathUtility } from './path-utility';
// import { Resource } from '../data-models/resource/resource';

// export class WorkspaceCodeHelper {
//     public static assembleWorkspace(
//         currentSettings: { settings: AssemblySettings, absolutePath: string },
//         resources: Array<Resource>,
//         getAllFileContent: (pathsOrStorageObjectIds: Array<string | number>) => Promise<Array<{ readonly content: string, readonly name: string, readonly absolutePath: string, readonly storageObjectId: number }>>): Promise<Assembly> {
//         return new Promise((resolve, reject) => {
//             const assemblySettings = currentSettings.settings;
//             const workspaceRootPath = PathUtility.getUpPath(currentSettings.absolutePath);
//             getAllFileContent(resources.filter(r => !r.isFolder).map(r => r.storageObjectId)).then(contents => {
//                 const sourceFileMap = contents.filter(c => c.name.toLowerCase().endsWith('.aq')).map(c => {
//                     const sourceImport = assemblySettings.sourceImports.find(si => PathUtility.join(workspaceRootPath, si.filePath) === c.absolutePath);
//                     return {
//                         referenceName: sourceImport.referenceName,
//                         fileContent: c.content
//                     }
//                 })
//                 const ao = Parser.assembleObjects(sourceFileMap);//todo entrypoint
//                 if (ao['FAILED'] === true) {
//                     reject();
//                 } else {
//                     resolve(ao as Assembly);
//                 }
//             });
//         })
//     }
// }