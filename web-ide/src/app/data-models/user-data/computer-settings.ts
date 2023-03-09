// export class ComputerSettings {
//     public readonly assemblyName: string;
//     public readonly sourceImports: Array<AssemblySourceImport>;

//     public update(values: Partial<ComputerSettings>): ComputerSettings {
//         let constructorObject: AssemblySettingsConstructorParams = {
//             assemblyName: '',
//             sourceImports: new Array<AssemblySourceImport>()
//         };

//         Object.keys(constructorObject).forEach(k => {
//             if (values[k] === undefined) {
//                 constructorObject[k] = this[k];
//             } else {
//                 constructorObject[k] = values[k];
//             }
//         })


//         return new ComputerSettings(constructorObject);
//     }

//     private constructor(values: AssemblySettingsConstructorParams) {
//         this.assemblyName = values.assemblyName;
//         this.sourceImports = values.sourceImports || [];
//     }

//     public static fromJson(json: string): ComputerSettings {
//         return new ComputerSettings(JSON.parse(json) as AssemblySettingsConstructorParams);
//     }

//     public static default(): ComputerSettings {
//         return new ComputerSettings({
//             assemblyName: ''
//         })
//     }

//     public static serialize(assemblySettings: ComputerSettings): string {
//         return JSON.stringify(assemblySettings);
//     }

//     // public constructor(from?: string) {
//     //     if (!!from) {
//     //         const jsonObject = JSON.parse(from);
//     //         this.assemblyName = jsonObject.assemblyName;
//     //         this.sourceImports = jsonObject.sourceImports;
//     //     }
//     // }
// }