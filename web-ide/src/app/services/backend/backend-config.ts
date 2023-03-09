export type EnvDeviceBundle = {
    readonly bundleId: string;
    readonly profile: {
        readonly primaryDeviceIdentifier: string;
        readonly secondaryDeviceIdentifier: string;
        readonly outputBytesPerPacket: string;
        readonly inputBytesPerPacket: string;
    };
    readonly html: string;
    readonly script: string;
    readonly stylesheet: string;
}

export type EnvDeviceCategoryDetail = {
    readonly name: string;
    readonly iconName: string;
    readonly order: number;
}

export type EnvDeviceCategoryLocalizations = {
    readonly locale: string;
    readonly vocabs: { [key: string]: string };
}

export type EnvDeviceReadme = {
    readonly appliesTo: Array<string>;
    readonly readmeVersion: string;
    readonly deviceCategory: string;
    readonly humanReadableDeviceName: string;
    readonly humanReadableDeviceDeveloperName: string;
    readonly descriptionParagraphs: Array<string>;
    readonly sections: Array<{
        readonly title: string;
        readonly order: number;
        readonly paragraphs: Array<string>;
    }>;
    readonly embeddedResources: Array<{
        readonly name: string;
        readonly blob: string;
    }>;
}

export type EnvDevices = {
    bundles: Array<EnvDeviceBundle>,
    categoryDetails: Array<EnvDeviceCategoryDetail>,
    categoryLocalizations: {
        readonly defaultLocale?: EnvDeviceCategoryLocalizations;
        readonly locales: Array<EnvDeviceCategoryLocalizations>;
    },
    topDevicesByCategory: {
        [key: string]: Array<string>;
    },
    favorites: Array<string>,
    readmes: Array<EnvDeviceReadme>
}

export type Env = {
    readonly isPlaygroundOnly: boolean,
    readonly devices: EnvDevices;
}

const DEFAULT_RESOLUTION: Env = {
    isPlaygroundOnly: false,
    devices: {
        bundles: [],
        categoryDetails: [],
        categoryLocalizations: {
            defaultLocale: undefined,
            locales: []
        },
        topDevicesByCategory: {},
        favorites: [],
        readmes: []
    }
}

export class BackendConfig {
    public static get isPlaygroundOnly(): boolean {
        return BackendConfig._playgroundOnly === true;
    }

    public static loadOLD(): Promise<string> {
        return new Promise((rs) => {
            try {
                fetch(`assets/env.json?v=${Date.now()}`).then(res => {
                    res.text().then(json => {//ZZTODO
                        fetch(`assets/env2.json?v=${Date.now()}`).then(res2 => {
                            res2.text().then(json2 => {
                        rs(json + '#$%^&$%^&*$%^&sep!!' + json2);
                    })
                        })
                    }).catch(() => {
                        rs('');
                    })
                }).catch(() => {
                    rs('');
                })
            } catch {
                rs('');
            }
        })
    }
    public static load(parsedParams?: { readonly [key: string]: string | undefined }): Promise<string> {
        return new Promise((rs) => {
            try {
                // let dataPath = `assets/env.minimal.json?v=${Date.now()}`;
                // if (!!parsedParams) {
                //     if (parsedParams['bootstrap'] === 'playground') {
                //         dataPath = `assets/env2.json?v=${Date.now()}`;
                //     } else if (!!parsedParams['bootstrap'] && parsedParams['bootstrap'] !== 'min') {
                //         // dataPath = `assets/env.minimal.json?v=${Date.now()}`;
                //     }
                // }

                // fetch(dataPath).then(res2 => {
                fetch(`assets/env2.json?v=${Date.now()}`).then(res2 => {
                    res2.text().then(json2 => {
                        rs(json2);
                    })
                })
            } catch {
                rs('');
            }
        })
    }
    // public static load(): Promise<{e: Env, json: string}> {
    //     return new Promise((rs) => {
    //         if (BackendConfig._playgroundOnly === null) {
    //             let playgroundOnly = false;

    //             try {
    //                 fetch(`/assets/env.json?v=${Date.now()}`).then(res => {
    //                     res.text().then(json => {
    //                         const env = JSON.parse(json) as { playground_only: boolean, devices: EnvDevices };
    //                         playgroundOnly = env.playground_only;

    //                         BackendConfig._playgroundOnly = playgroundOnly;
    //                         rs({e:{ isPlaygroundOnly: playgroundOnly, devices: env.devices }, json: json});
    //                     }).catch(() => {
    //                         BackendConfig._playgroundOnly = false;
    //                         rs({e:DEFAULT_RESOLUTION, json: ''});
    //                     })
    //                 }).catch(() => {
    //                     BackendConfig._playgroundOnly = false;
    //                     rs({e:DEFAULT_RESOLUTION, json: ''});
    //                 })
    //             } catch {
    //                 BackendConfig._playgroundOnly = false;
    //                 rs({e:DEFAULT_RESOLUTION, json: ''});
    //             }
    //         } else {
    //             rs({e:DEFAULT_RESOLUTION, json: ''});
    //         }
    //     })
    // }

    private static _playgroundOnly: boolean | null = null;
}