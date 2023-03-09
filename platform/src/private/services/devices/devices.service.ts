import { BehaviorSubject, Observable } from 'rxjs';
import { Byte, ByteSequenceCreator, ByteSequenceLength, DeviceBundle, DeviceProfile, DeviceServiceClass } from '@allium/types';
import { IoPort, IoPortStatus } from '@allium/arch';
import { DeviceInstallationDescriptor } from '../../../models/devices/device-installation-descriptor.model';
import { DeviceBrowserHome } from '../../../models/devices/device-browser-home.model';
import { DeviceInstallationDetails } from '../../../models/devices/device-installation-details.model';
import { DevicesService } from '../../../services/devices.service';
import { DeviceBundleReference } from '../../../models/devices/device-bundle-reference.model';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { DeviceLogsHelper } from './device-logs-helper';
import { joinPath, Yfs, YfsStatus } from 'yfs';
import { FsList } from '../../../fs-list';
import { Utils } from '../../utils';
import { DataUtils } from '../../../data-utils';
import md5 from 'md5';
import { atob, btoa } from 'abab';
import { Debugger } from '@alliumworks/debugger';
import * as AlliumProto from '../../protos/combined';
import { SerializationFormat } from '../../../serialization-format';
import { AlliumWorksDeviceReadme } from '../../../models/devices/aw-device-readme.model';
import { AlliumWorksDeviceMetadata } from '../../../models/devices/aw-device-metadata.model';
import { AlliumWorksDeviceBundle } from '../../../models/devices/aw-device-bundle.model';

export class CDevicesService implements DevicesService {

    public onLogSetAvailable(): Observable<Array<{
        readonly portIndex: Byte;
        readonly key: string;
        readonly installationTitle: string;
        listener(): Observable<Array<{ readonly timestamp: number, readonly entry: string }>>;
    }>> {
        return this._availableDevices.pipe(distinctUntilChanged((x, y) => this.hashObject(x) === this.hashObject(y)), map(ad => {
            return ad
                .filter(ad => !this._previousAvailableDevices.some(d => d.key === ad.key))
                .map(d => {
                    return {
                        portIndex: d.portIndex,
                        key: d.key,
                        installationTitle: d.installationTitle,
                        listener: () => {
                            return this._logsHelper.listen(d.key)
                        }
                    }
                })
        }), filter(x => x.length > 0));
    }

    public onLogSetUnavailable(): Observable<Array<{
        readonly portIndex: Byte;
        readonly key: string;
        readonly installationTitle: string;
    }>> {
        return this._availableDevices.pipe(distinctUntilChanged((x, y) => this.hashObject(x) === this.hashObject(y)), map(ad => {
            return this._previousAvailableDevices
                .filter(pd => !ad.some(d => d.key === pd.key))
                .map(d => {
                    return {
                        portIndex: d.portIndex,
                        key: d.key,
                        installationTitle: d.installationTitle
                    }
                })
        }), filter(x => x.length > 0));
    }

    public async install(bundleId: string, descriptor: DeviceInstallationDescriptor, profile: DeviceProfile): Promise<boolean> {
        const ioBus = this._debugger().getIoBus();
        const portIndex = ByteSequenceCreator.Unbox(descriptor.portIndex);
        if (ioBus.getPortStatus(portIndex) === IoPortStatus.Null) {
            const bundle = await this.getBundle(bundleId);
            if (!!bundle) {
                const uniqueKey = `${bundleId}${new Date().valueOf().toString().substring(6)}`;
                const current = this._installedDevices.getValue();
                current.push({
                    bundleId: bundleId,
                    instanceId: uniqueKey,
                    clientToHostBufferSize: descriptor.clientToHostBufferSize,
                    hostToClientBufferSize: descriptor.hostToClientBufferSize,
                    metadata: bundle.metadata,
                    installationTitle: descriptor.installationTitle || bundleId,
                    portIndex: portIndex
                });
                this._debugger().getIoBus().usePort(
                    ByteSequenceCreator.Unbox(descriptor.portIndex),
                    descriptor.clientToHostBufferSize,
                    descriptor.hostToClientBufferSize,
                    profile,
                    true);

                
                this._installedDevices.next(current);
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error(`I/O port already in use: ${portIndex}`);
        }
    }

    public uninstall(portIndex: Byte): void {
        this._debugger().getIoBus().freePort(ByteSequenceCreator.Unbox(portIndex));
    }

    public write(portIndex: Byte, data: Array<Byte>): boolean {
        const port = this.getIoPortOrThrow(ByteSequenceCreator.Unbox(portIndex));
        if (data.length > port.getHostWritableLength()) {
            return false;
        } else {
            let failed = false;
            for (let i = 0; i < data.length && !failed; i++) {
                failed = !port.writeAsHost(data[i]);
            }

            return !failed;
        }
    }
    
    public testWriteToMachine(portIndex: Byte, data: Array<Byte>): boolean {
        const port = this.getIoPortOrThrow(portIndex);
        if (port.getClientWritableLength() < data.length) {
            return false;
        } else {
            let failed = false;
            for (let i = 0; i < data.length && !failed; i++) {
                failed = !port.writeAsClient(data[i]);
            }

            return !failed;
        }
    }

    public flush(portIndex: Byte): void {
        this.getIoPortOrThrow(ByteSequenceCreator.Unbox(portIndex)).flushAsHost();
    }

    public readableLength(portIndex: Byte): number {
        return this.getIoPortOrThrow(portIndex).getHostReadableLength();
    }

    public read(portIndex: Byte, count: ByteSequenceLength): Array<Byte> {
        const port = this.getIoPortOrThrow(portIndex);
        const readableLength = port.getHostReadableLength();
        if (count > readableLength) {
            throw new Error(`count exceeds readable length: (${count}, ${readableLength})`);
        } else {
            const bytes = new Array<Byte>();
            while (bytes.length < count) {
                bytes.push(port.readAsHost());
            }
            return bytes;
        }
    }

    public getStatus(portIndex: Byte): { readonly status: IoPortStatus; readonly installationKey: string; readonly installationTitle: string; } | null {
        const pi = ByteSequenceCreator.Unbox(portIndex);
        const installation = this._installedDevices.getValue().find(d => d.portIndex === pi);
        if (!!installation) {
            return {
                status: this._debugger().getIoBus().getPortStatus(pi),
                installationKey: `${ByteSequenceCreator.Byte(installation.portIndex).toString({ radix: 16, padZeroes: true })}.${installation.bundleId}`,
                installationTitle: installation.installationTitle,

            }
        } else {
            return null;
        }
    }

    public getStatuses(): Array<{ readonly status: IoPortStatus; readonly installationKey: string; readonly installationTitle: string; }> {
        return this._debugger().getIoBus().getActiveIndices().map(i => {
            return this.getStatus(ByteSequenceCreator.Byte(i));
        }).filter(s => s !== null) as any;
    }

    public writeToLog(portIndex: Byte, s: string): boolean {
        try {
            const ioBus = this._debugger().getIoBus();
            const pi = ByteSequenceCreator.Unbox(portIndex);
            if (ioBus.getPortStatus(pi) === IoPortStatus.Null) {
                return false;
            } else {
                ioBus.getLog().appendMessage(pi, s);
                return true;
            }
        } catch (ex) {
            return false;
        }
    }

    public getLog(portIndex: Byte): Array<{ readonly timestamp: number, readonly entry: string }> {
        return this._debugger()
            .getIoBus()
            .getLog()
            .getMessages(undefined, ByteSequenceCreator.Unbox(portIndex))
            .map(m => {
                return {
                    timestamp: m.timestamp,
                    entry: m.value
                }
            });
    }

    public clearLog(portIndex: Byte): boolean {
        try {
            this._debugger()
                .getIoBus()
                .getLog()
                .clear(ByteSequenceCreator.Unbox(portIndex));
            return true;
        } catch (ex) {
            return false;
        }
    }

    public deviceInstalled(): Observable<DeviceInstallationDetails> {
        return this._installedDevices.pipe(filter(x => x.length > 0), map(x => x[x.length - 1]), distinctUntilChanged((x, y) => x.instanceId === y.instanceId));
    }

    public getDeveloperName(developerId: string): Promise<string | null> {
        return new Promise((resolve) => {
            if (developerId === CDevicesService._DEV_ID_ALM) {
                resolve('@allium');
            } else {
                //TODO
                resolve(null);
            }
        })
    }

    public async getBundle(bundleId: string): Promise<AlliumWorksDeviceBundle | null> {
        let bundle: AlliumWorksDeviceBundle | null = null;

        let bundleDirPath: string;
        // check imported devices first
        const importedBundleDirPath = joinPath(`/${FsList.DevicesDirectory}`, FsList.ImportedDevicesDirectory, bundleId);
        const importedBundleExists = await this._yfs.assetExists(importedBundleDirPath);
        if (importedBundleExists.status === YfsStatus.OK && importedBundleExists.payload === true) {
            bundleDirPath = importedBundleDirPath;
        } else {
            bundleDirPath = joinPath(`/${FsList.DevicesDirectory}`, bundleId);
            const bundleExistsLocally = await Utils.getPayloadOrFailAsync(this._yfs.assetExists(bundleDirPath));
            if (!bundleExistsLocally) {
                // TODO call api to load
            }
        }

        const bundleAssets = await this._yfs.readDirectory(bundleDirPath, true);
        if (bundleAssets.status === YfsStatus.OK) {
            const profileFile = Utils.getFileOrNull(FsList.DeviceBundleFiles.Profile.title, FsList.DeviceBundleFiles.Profile.extension, bundleAssets.payload);
            const metadataFile = Utils.getFileOrNull(FsList.DeviceBundleFiles.Metadata.title, FsList.DeviceBundleFiles.Metadata.extension, bundleAssets.payload);
            const htmlFile = Utils.getFileOrNull(FsList.DeviceBundleFiles.Html.title, FsList.DeviceBundleFiles.Html.extension, bundleAssets.payload);
            const scriptFile = Utils.getFileOrNull(FsList.DeviceBundleFiles.Script.title, FsList.DeviceBundleFiles.Script.extension, bundleAssets.payload);
            const stylesheetFile = Utils.getFileOrNull(FsList.DeviceBundleFiles.Stylesheet.title, FsList.DeviceBundleFiles.Stylesheet.extension, bundleAssets.payload);
            const readmeFile = Utils.getFileOrNull(FsList.DeviceBundleFiles.Readme.title, FsList.DeviceBundleFiles.Readme.extension, bundleAssets.payload);

            if (!!profileFile && !!metadataFile && !!htmlFile && !!scriptFile && !!stylesheetFile && !!readmeFile) {
                const decodedProfileFile = DataUtils.decodeSerializationFile(profileFile);
                const decodedMetadataFile = DataUtils.decodeSerializationFile(metadataFile);
                const profile = this.deserializeDeviceProfile(decodedProfileFile.content, decodedProfileFile.format);
                const metadata = this.deserializeDeviceMetadata(decodedMetadataFile.content, decodedMetadataFile.format);
                const html = htmlFile.content || '';
                const script = scriptFile.content || '';
                const stylesheet = stylesheetFile.content || '';
                let readme: AlliumWorksDeviceReadme | undefined = undefined;
                if (readmeFile.content.length > 1) {
                    const decodedReadmeFile = DataUtils.decodeSerializationFile(readmeFile);
                    readme = this.deserializeDeviceReadme(decodedReadmeFile.content, decodedReadmeFile.format);
                }

                bundle = {
                    bundleId: bundleId,
                    profile: profile,
                    metadata: metadata,
                    html: html,
                    script: script,
                    stylesheet: stylesheet,
                    readme: readme
                }
            }
        }

        return bundle;
    }

    public async getBrowserHome(): Promise<DeviceBrowserHome> {
        const importedDevices = await this.getCurrentImportedDevices();
        const model: DeviceBrowserHome = {
            favorites: [],//TODO
            importedDevices: importedDevices,
            topDevicesByCategory: {
                'input': [
                    {
                        bundleId: 'asd-99',
                        name: 'simple-console'
                    }
                ]
            },//TODO
            categoryLocalizations: {},//TODO
            categoryDetails: [
                {
                    name: 'input',
                    iconName: '(fa)far.keyboard',
                    order: 0
                },
                {
                    name: 'output',
                    iconName: '(fa)fas.desktop',
                    order: 1
                }
            ]//TODO
        };

        return model;
    }

    public async importDeviceBundles(serializedList: string, serializationFormat: SerializationFormat, includeBundleIds?: Array<string>): Promise<Array<AlliumWorksDeviceBundle>> {
        const transaction = await this._yfs.createTransaction();

        // let success = false;
        let failed = false;
        // const errors = new Array<string>();
        const parsedBundles = new Array<AlliumWorksDeviceBundle>();

        try {
            const decodedList = AlliumProto.AlliumArchive.decode(DataUtils.stringToUint8Array(serializationFormat === 'base64' ? atob(serializedList)! : serializedList));
            for (let i = 0; i < decodedList.devices.length; i++) {
                if (!!decodedList.devices[i].awBundle) {
                    const bundle = this.convertProtoBundleToTypedBundle(decodedList.devices[i].awBundle!);
                    if (includeBundleIds === undefined || (!!bundle.bundleId && includeBundleIds.includes(bundle.bundleId))) {
                        try {
                            const importsDirPath = joinPath(`/${FsList.DevicesDirectory}`, FsList.ImportedDevicesDirectory);
                            const createBundleDir = await transaction.createDirectory(importsDirPath, bundle.bundleId);
                            if (createBundleDir === YfsStatus.OK) {
                                const bundleDirPath = joinPath(importsDirPath, bundle.bundleId);
                                const bundleDir = await transaction.openDirectory(bundleDirPath);
                                if (bundleDir.status === YfsStatus.OK) {
                                    const profileContent = DataUtils.encodeSerializationFile(AlliumProto.BaseDeviceProfile.encode({
                                        primaryDeviceIdentifier: ByteSequenceCreator.Unbox(bundle.profile.primaryDeviceIdentifier),
                                        secondaryDeviceIdentifier: ByteSequenceCreator.Unbox(bundle.profile.secondaryDeviceIdentifier),
                                        clientToHostBufferSize: bundle.profile.clientToHostBufferSize,
                                        hostToClientBufferSize: bundle.profile.hostToClientBufferSize,
                                        serviceClass: (bundle.profile.serviceClass.valueOf() as number) as AlliumProto.DeviceServiceClass,
                                        extendedServiceClass: bundle.profile.extendedServiceClass
                                    }), serializationFormat);
                                    const metadataContent = DataUtils.encodeSerializationFile(AlliumProto.AlliumWorksDeviceMetadata.encode({
                                        developerId: bundle.metadata.developerId,
                                        categoryKey: bundle.metadata.categoryKey,
                                        humanReadableDeviceName: bundle.metadata.humanReadableDeviceName,
                                        preferredWidth: {
                                            amount: bundle.metadata.preferredWidth.amount,
                                            units: bundle.metadata.preferredWidth.units === 'rel'
                                                ? AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
                                                : AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Px
                                        },
                                        preferredHeight: {
                                            amount: bundle.metadata.preferredHeight.amount,
                                            units: bundle.metadata.preferredHeight.units === 'rel'
                                                ? AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
                                                : AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Px
                                        }
                                    }), serializationFormat);
                                    const readmeContent = !!bundle.readme ? DataUtils.encodeSerializationFile(AlliumProto.AlliumWorksDeviceReadme.encode({
                                        descriptionParagraphs: bundle.readme!.descriptionParagraphs,
                                        sections: !!bundle.readme!.sections ? bundle.readme!.sections.map(s => {
                                            return {
                                                title: s.title,
                                                order: s.order,
                                                paragraphs: s.paragraphs
                                            }
                                        }) : [],
                                        embeddedResources: !!bundle.readme!.embeddedResources ? bundle.readme!.embeddedResources.map(er => {
                                            return {
                                                name: er.name,
                                                blob: DataUtils.stringToUint8Array(er.blob)
                                            }
                                        }) : []
                                    }), serializationFormat) : ''
                                    
                                    const createFiles = [
                                        { title: FsList.DeviceBundleFiles.Profile.title, extension: FsList.DeviceBundleFiles.Profile.extension, content: profileContent },
                                        { title: FsList.DeviceBundleFiles.Metadata.title, extension: FsList.DeviceBundleFiles.Metadata.extension, content: metadataContent },
                                        { title: FsList.DeviceBundleFiles.Html.title, extension: FsList.DeviceBundleFiles.Html.extension, content: btoa(bundle.html)! },
                                        { title: FsList.DeviceBundleFiles.Script.title, extension: FsList.DeviceBundleFiles.Script.extension, content: btoa(bundle.script)! },
                                        { title: FsList.DeviceBundleFiles.Stylesheet.title, extension: FsList.DeviceBundleFiles.Stylesheet.extension, content: btoa(bundle.stylesheet)! },
                                        { title: FsList.DeviceBundleFiles.Readme.title, extension: FsList.DeviceBundleFiles.Readme.extension, content: readmeContent }
                                    ];

                                    let status = YfsStatus.OK;
                                    for (let i = 0; i < createFiles.length && status === YfsStatus.OK; i++) {
                                        status = await bundleDir.payload.createFile('/', createFiles[i].title, createFiles[i].extension, createFiles[i].content);
                                    }

                                    if (status === YfsStatus.OK) {
                                        parsedBundles.push(bundle);
                                    } else {
                                        failed = true;
                                        throw new Error(`Import bundle failed: ${bundle.bundleId}`);
                                    }
                                }
                            } else {
                                throw new Error(`Import bundle failed; status = ${status}`);
                            }
                        } catch (e) {
                            failed = true;
                            throw e;
                        }



                        // try {
                        //     const readme: AlliumWorksDeviceReadme | undefined = undefined;//TODO
                        //     // const readme = !!bundle.readme.descriptionParagraphs || !!o.bundle.readme.sections || !!o.bundle.readme.embeddedResources
                        //     //     ? {
                        //     //         descriptionParagraphs: o.bundle.readme.descriptionParagraphs || [],
                        //     //         sections: o.bundle.readme.sections || [],
                        //     //         embeddedResources: o.bundle.readme.embeddedResources || []
                        //     //     }
                        //     //     : undefined;

                        //     const isValidEntity = !!bundle.bundleId
                        //         && !!bundle.metadata
                        //         && !!bundle.metadata.developerId
                        //         && !!bundle.metadata.deviceCategory
                        //         && !!bundle.metadata.humanReadableDeviceName
                        //         && !!bundle.html
                        //         && !!bundle.profile
                        //         && bundle.profile.primaryDeviceIdentifier !== undefined//TODO validate fmt
                        //         && bundle.profile.secondaryDeviceIdentifier !== undefined
                        //         && (bundle.profile.input === undefined || (bundle.profile.input!.supported === true ? !!((bundle.profile.input as any).preferredBufferLength) : true))
                        //         && (bundle.profile.output === undefined || (bundle.profile.output!.supported === true ? !!((bundle.profile.output as any).preferredBufferLength) : true));
                        //     // && (bundle.readme === undefined || (!!bundle.readme..sections))TODO

                        //     if (isValidEntity) {
                        //         const parsedBundle: AlliumWorksDeviceBundle = {
                        //             // bundleId: bundle.bundleId!,
                        //             // profile: {
                        //             //     primaryDeviceIdentifier: ByteSequenceCreator.QuadByte(Number.parseInt(bundle.profile!.primaryDeviceIdentifier!)),
                        //             //     secondaryDeviceIdentifier: ByteSequenceCreator.QuadByte(Number.parseInt(bundle.profile!.secondaryDeviceIdentifier!)),
                        //             //     clientToHostBufferSize: !!bundle.profile.
                        //             //     input: !!bundle.profile!.input && bundle.profile!.input.supported === true
                        //             //         ? { supported: true, preferredBufferLength: Number(bundle.profile!.input.preferredBufferLength || 16) }
                        //             //         : { supported: false },
                        //             //     output: !!bundle.profile!.output && bundle.profile!.output.supported === true
                        //             //         ? { supported: true, preferredBufferLength: Number(bundle.profile!.output.preferredBufferLength || 16) }
                        //             //         : { supported: false },
                        //             // } as DeviceProfile,
                        //             // metadata: {
                        //             //     developerId: bundle.metadata!.developerId!,
                        //             //     categoryKey: bundle.metadata!.deviceCategory!,
                        //             //     humanReadableDeviceName: bundle.metadata!.humanReadableDeviceName!,
                        //             //     preferredWidth: this.tryParsePreferredDimension(bundle.metadata!.preferredWidth),
                        //             //     preferredHeight: this.tryParsePreferredDimension(bundle.metadata!.preferredHeight)
                        //             // },
                        //             // html: atob(bundle.html!) || '',
                        //             // script: !!bundle.script ? atob(bundle.script) || '' : '',
                        //             // stylesheet: !!bundle.stylesheet ? atob(bundle.stylesheet) || '' : '',
                        //             // readme: undefined//TODO!!bundle.readme
                        //             // // ? {
                        //             // //     sections: bundle.readme.sections
                        //             // // }
                        //             // // : undefined
                        //         }

                        //         const profileContent = JSON.stringify({
                        //             primaryDeviceIdentifier: parsedBundle.profile.primaryDeviceIdentifier.toString(),
                        //             secondaryDeviceIdentifier: parsedBundle.profile.secondaryDeviceIdentifier.toString(),
                        //             inputProfile: parsedBundle.profile.input.supported && !!parsedBundle.profile.input.preferredBufferLength
                        //                 ? {
                        //                     supported: true,
                        //                     value: parsedBundle.profile.input.preferredBufferLength.toString()
                        //                 } : {
                        //                     supported: false
                        //                 },
                        //             outputProfile: parsedBundle.profile.output.supported && !!parsedBundle.profile.output.preferredBufferLength
                        //                 ? {
                        //                     supported: true,
                        //                     value: parsedBundle.profile.output.preferredBufferLength.toString()
                        //                 } : {
                        //                     supported: false
                        //                 },
                        //             syncInterval: parsedBundle.profile.syncInterval.toString()
                        //         });

                        //         const metadataContent = JSON.stringify({
                        //             developerId: parsedBundle.metadata.developerId,
                        //             categoryKey: parsedBundle.metadata.categoryKey,
                        //             humanReadableDeviceName: parsedBundle.metadata.humanReadableDeviceName,
                        //             deviceWidth: `${parsedBundle.metadata.preferredWidth.amount};${parsedBundle.metadata.preferredWidth.units}`,
                        //             deviceHeight: `${parsedBundle.metadata.preferredHeight.amount};${parsedBundle.metadata.preferredHeight.units}`,
                        //         });

                        //         const readmeContent = !!parsedBundle.readme
                        //             ? JSON.stringify({
                        //                 descriptionParagraphs: parsedBundle.readme.descriptionParagraphs,
                        //                 sections: parsedBundle.readme.sections,
                        //                 embeddedResources: parsedBundle.readme.embeddedResources
                        //             })
                        //             : JSON.stringify({});

                        //         const importsDirPath = joinPath(`/${FsList.DevicesDirectory}`, FsList.ImportedDevicesDirectory);
                        //         const createBundleDir = await transaction.createDirectory(importsDirPath, parsedBundle.bundleId);
                        //         if (createBundleDir === YfsStatus.OK) {
                        //             const bundleDirPath = joinPath(importsDirPath, parsedBundle.bundleId);
                        //             const bundleDir = await transaction.openDirectory(bundleDirPath);
                        //             if (bundleDir.status === YfsStatus.OK) {
                        //                 const createFiles = [
                        //                     { title: FsList.DeviceBundleFiles.Profile.title, extension: FsList.DeviceBundleFiles.Profile.extension, content: profileContent },
                        //                     { title: FsList.DeviceBundleFiles.Metadata.title, extension: FsList.DeviceBundleFiles.Metadata.extension, content: metadataContent },
                        //                     { title: FsList.DeviceBundleFiles.Html.title, extension: FsList.DeviceBundleFiles.Html.extension, content: parsedBundle.html },
                        //                     { title: FsList.DeviceBundleFiles.Script.title, extension: FsList.DeviceBundleFiles.Script.extension, content: parsedBundle.script },
                        //                     { title: FsList.DeviceBundleFiles.Stylesheet.title, extension: FsList.DeviceBundleFiles.Stylesheet.extension, content: parsedBundle.stylesheet },
                        //                     { title: FsList.DeviceBundleFiles.Readme.title, extension: FsList.DeviceBundleFiles.Readme.extension, content: readmeContent }
                        //                 ];

                        //                 let status = YfsStatus.OK;
                        //                 for (let i = 0; i < createFiles.length && status === YfsStatus.OK; i++) {
                        //                     status = await bundleDir.payload.createFile('/', createFiles[i].title, createFiles[i].extension, createFiles[i].content);
                        //                 }

                        //                 if (status === YfsStatus.OK) {
                        //                     parsedBundles.push(parsedBundle);
                        //                 } else {
                        //                     failed = true;
                        //                     throw new Error(`Import bundle failed: ${parsedBundle.bundleId}`);
                        //                 }
                        //             }
                        //         }
                        //     } else {
                        //         failed = true;
                        //         throw new Error('Import bundle failed: data is invalid');
                        //     }
                        // } catch (e) {
                        //     failed = true;
                        //     throw e;
                        // }
                    }
                }
            }
        } catch (err) {
            failed = true;
        } finally {
            if (failed) {
                transaction.cancel();
                return [];
            } else {
                await transaction.commit();

                const concatBundles = parsedBundles.map(pb => {
                    return {
                        bundleId: pb.bundleId,
                        name: pb.metadata.humanReadableDeviceName,
                        categoryKey: pb.metadata.categoryKey
                    }
                })
                this._importedDeviceBundles.next(this._importedDeviceBundles.getValue().concat(...concatBundles));

                return parsedBundles;
            }
        }
    }

    // public async importDeviceBundle(bundle: {
    //     readonly bundleId: string,
    //     readonly profile: DeviceProfile,
    //     readonly metadata: DeviceMetadata,
    //     readonly html: string,
    //     readonly script: string,
    //     readonly stylesheet: string,
    //     readonly readme?: DeviceReadme
    // }): Promise<DeviceBundle | null> {
    //     const transaction = await this._yfs.createTransaction();

    //     let success = false;

    //     try {
    //         const profileContent = JSON.stringify({
    //             primaryDeviceIdentifier: bundle.profile.primaryDeviceIdentifier.toString(),
    //             secondaryDeviceIdentifier: bundle.profile.secondaryDeviceIdentifier.toString(),
    //             inputProfile: bundle.profile.input.supported
    //                 ?  {
    //                     supported: true,
    //                     value: bundle.profile.input.preferredBufferLength.toString()
    //                 } : {
    //                     supported: false
    //                 },
    //             outputProfile: bundle.profile.output.supported
    //             ?  {
    //                 supported: true,
    //                 value: bundle.profile.output.preferredBufferLength.toString()
    //             } : {
    //                 supported: false
    //             },
    //             syncInterval: bundle.profile.syncInterval.toString()
    //         });

    //         const metadataContent = JSON.stringify({
    //             developerId: bundle.metadata.developerId,
    //             categoryKey: bundle.metadata.categoryKey,
    //             humanReadableDeviceName: bundle.metadata.humanReadableDeviceName,
    //             deviceWidth: `${bundle.metadata.preferredWidth.amount};${bundle.metadata.preferredWidth.units}`,
    //             deviceHeight: `${bundle.metadata.preferredHeight.amount};${bundle.metadata.preferredHeight.units}`,
    //         });

    //         const readmeContent = !!bundle.readme
    //             ? JSON.stringify({
    //                 descriptionParagraphs: bundle.readme.descriptionParagraphs,
    //                 sections: bundle.readme.sections,
    //                 embeddedResources: bundle.readme.embeddedResources
    //             })
    //             : JSON.stringify({});

    //         const importsDirPath = joinPath(`/${FsList.DevicesDirectory}`, FsList.ImportedDevicesDirectory);
    //         const createBundleDir = await transaction.createDirectory(importsDirPath, bundle.bundleId);
    //         if (createBundleDir === YfsStatus.OK) {
    //             const bundleDirPath = joinPath(importsDirPath, bundle.bundleId);
    //             const bundleDir = await transaction.openDirectory(bundleDirPath);
    //             if (bundleDir.status === YfsStatus.OK) {
    //                 const createFiles = [
    //                     { title: FsList.DeviceBundleFiles.Profile.title, extension: FsList.DeviceBundleFiles.Profile.extension, content: profileContent },
    //                     { title: FsList.DeviceBundleFiles.Metadata.title, extension: FsList.DeviceBundleFiles.Metadata.extension, content: metadataContent },
    //                     { title: FsList.DeviceBundleFiles.Html.title, extension: FsList.DeviceBundleFiles.Html.extension, content: bundle.html },
    //                     { title: FsList.DeviceBundleFiles.Script.title, extension: FsList.DeviceBundleFiles.Script.extension, content: bundle.script },
    //                     { title: FsList.DeviceBundleFiles.Stylesheet.title, extension: FsList.DeviceBundleFiles.Stylesheet.extension, content: bundle.stylesheet },
    //                     { title: FsList.DeviceBundleFiles.Readme.title, extension: FsList.DeviceBundleFiles.Readme.extension, content: readmeContent }
    //                 ];

    //                 let status = YfsStatus.OK;
    //                 for (let i = 0; i < createFiles.length && status === YfsStatus.OK; i++) {
    //                     status = await bundleDir.payload.createFile('/', createFiles[i].title, createFiles[i].extension, createFiles[i].content);   
    //                 }

    //                 success = status === YfsStatus.OK;
    //             }
    //         }
    //     } catch (ex) {
            
    //     }

    //     if (success) {
    //         await transaction.commit();

    //         this._importedDeviceBundles.next(this._importedDeviceBundles.getValue().concat([{
    //             bundleId: bundle.bundleId,
    //             name: bundle.metadata.humanReadableDeviceName,
    //             categoryKey: bundle.metadata.categoryKey
    //         }]));
            
    //         return {
    //             bundleId: bundle.bundleId,
    //             profile: JSON.parse(JSON.stringify(bundle.profile)),
    //             metadata: JSON.parse(JSON.stringify(bundle.metadata)),
    //             html: bundle.html,
    //             script: bundle.script,
    //             stylesheet: bundle.stylesheet,
    //             readme: !!bundle.readme ? JSON.parse(JSON.stringify(bundle.readme)) : undefined
    //         }
    //     } else {
    //         transaction.cancel();
    //         return null;
    //     }
    // }

    public constructor(rootYfs: Yfs, alliumDebugger: () => Debugger) {
        this._yfs = rootYfs;
        this._debugger = () => {
            return alliumDebugger();
        };
        this._logsHelper = new DeviceLogsHelper((portIndex) => {
            return this.getLog(portIndex);
        }, 2000);
        this._installedDevices = new BehaviorSubject<Array<DeviceInstallationDetails>>([]);
        this._importedDeviceBundles = new BehaviorSubject<Array<DeviceBundleReference>>([]);
        this._availableDevices = new BehaviorSubject<Array<{
            readonly portIndex: Byte;
            readonly key: string;
            readonly installationTitle: string;
        }>>([]);
        this._previousAvailableDevices = new Array<{
            readonly portIndex: Byte;
            readonly key: string;
            readonly installationTitle: string;
        }>();

        this.checkStatuses();

        this.onLogSetAvailable().subscribe(logSets => {
            logSets.forEach(ls => {
                this._logsHelper.activate(ls.key);
            })
        });
        this.onLogSetUnavailable().subscribe(logSets => {
            logSets.forEach(ls => {
                this._logsHelper.deactivate(ls.key);
            })
        });
    }

    private checkStatuses(): void {
        setTimeout(() => {
            this._availableDevices.pipe(take(1)).subscribe(ad => {
                this._previousAvailableDevices = ad;
                const latest = this.getStatuses();
                const nextDevices = new Array<{
                    portIndex: Byte;
                    readonly key: string;
                    readonly installationTitle: string;
                }>();
                latest.forEach(lt => {
                    try {
                        const portIndex = DeviceLogsHelper.getPortFromKey(lt.installationKey);
                        const ndi = nextDevices.findIndex(nd => nd.key === lt.installationKey);

                        if (ndi > -1) {
                            nextDevices[ndi].portIndex = portIndex;
                        } else {
                            nextDevices.push({
                                portIndex: portIndex,
                                key: lt.installationKey,
                                installationTitle: lt.installationTitle
                            });
                        }
                    } catch (ex) { }
                })
                this._availableDevices.next(nextDevices);
                this.checkStatuses();
            })
        }, this._RECHECK_INTERVAL);
    }

    private deserializeDeviceReadme(fileContent: string, format: SerializationFormat): AlliumWorksDeviceReadme {
        try {
            const decodedReadme = AlliumProto.AlliumWorksDeviceReadme.decode(DataUtils.stringToUint8Array(format === 'base64' ? atob(fileContent)! : fileContent));
            return this.convertProtoReadmeToTypedReadme(decodedReadme);
        } catch (ex) {
            throw new Error(`failed to deserialize readme: ${ex.message}`);
        }
    }

    private convertProtoReadmeToTypedReadme(readme: AlliumProto.AlliumWorksDeviceReadme): AlliumWorksDeviceReadme {
        return {
            descriptionParagraphs: readme.descriptionParagraphs,
            sections: !!readme.sections && readme.sections.length > 0
                ? readme.sections.map(s => {
                    return {
                        title: s.title,
                        order: s.order,
                        paragraphs: s.paragraphs
                    }
                })
                : [],
            embeddedResources: !!readme.embeddedResources && readme.embeddedResources.length > 0
                ? readme.embeddedResources.map(er => {
                    return {
                        name: er.name,
                        blob: er.blob.toString()
                    }
                })
                : []
        }
    }
   
    private deserializeDeviceMetadata(fileContent: string, format: SerializationFormat): AlliumWorksDeviceMetadata {
        try {
            return this.deserializeAwDeviceMetadata(fileContent, format);
        } catch (ex) {
            try {
                return this.deserializeBaseDeviceMetadata(fileContent, format);
            } catch (ex2) {
                throw new Error(`failed to deserialize metadata: ${ex2.message}`);
            }
        }
    }

    private deserializeAwDeviceMetadata(fileContent: string, format: SerializationFormat): AlliumWorksDeviceMetadata {
        try {
            const decodedMetadata = AlliumProto.AlliumWorksDeviceMetadata.decode(DataUtils.stringToUint8Array(format === 'base64' ? atob(fileContent)! : fileContent));
            return this.convertProtoMetadataToTypedAwMetadata(decodedMetadata);
        } catch (ex) {
            throw new Error(`failed to deserialize AlliumWorks metadata: ${ex.message}`);
        }
    }

    private convertProtoMetadataToTypedAwMetadata(metadata: AlliumProto.AlliumWorksDeviceMetadata): AlliumWorksDeviceMetadata {
        if (!!metadata.preferredWidth
            && (metadata.preferredWidth.units !== AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
                && metadata.preferredWidth.units !== AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Px)) {
            throw new Error('missing or invalid unit for: preferredWidth');
        }

        if (!!metadata.preferredHeight
            && (metadata.preferredHeight.units !== AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
                && metadata.preferredHeight.units !== AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Px)) {
            throw new Error('missing or invalid unit for: preferredHeight');
        }

        return {
            developerId: metadata.developerId,
            categoryKey: metadata.categoryKey,
            humanReadableDeviceName: metadata.humanReadableDeviceName,
            preferredWidth: !!metadata.preferredWidth
                ? {
                    amount: metadata.preferredWidth.amount,
                    units: metadata.preferredWidth.units === AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
                        ? 'rel'
                        : 'px'
                }
                : {
                    amount: 1,
                    units: 'rel'
                },
            preferredHeight: !!metadata.preferredHeight
                ? {
                    amount: metadata.preferredHeight.amount,
                    units: metadata.preferredHeight.units === AlliumProto.AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel
                        ? 'rel'
                        : 'px'
                }
                : {
                    amount: 1,
                    units: 'rel'
                }
        }
    }

    private deserializeBaseDeviceMetadata(fileContent: string, format: SerializationFormat): AlliumWorksDeviceMetadata {
        try {
            const decodedMetadata = AlliumProto.BaseDeviceMetadata.decode(DataUtils.stringToUint8Array(format === 'base64' ? atob(fileContent)! : fileContent));

            return {
                developerId: decodedMetadata.developerId,
                categoryKey: decodedMetadata.categoryKey,
                humanReadableDeviceName: decodedMetadata.humanReadableDeviceName,
                preferredWidth: {
                    amount: 1,
                    units: 'rel'
                },
                preferredHeight: {
                    amount: 1,
                    units: 'rel'
                }
            }
        } catch (ex) {
            throw new Error(`failed to deserialize base metadata: ${ex.message}`);
        }
    }

    // private convertProtoMetadataToTypedMetadata(metadata: AlliumProto.BaseDeviceMetadata): DeviceMetadata {
    // }

    private deserializeDeviceProfile(fileContent: string, format: SerializationFormat): DeviceProfile {
        try {
            const decodedProfile = AlliumProto.BaseDeviceProfile.decode(DataUtils.stringToUint8Array(format === 'base64' ? atob(fileContent)! : fileContent));
            return this.convertProtoProfileToTypedProfile(decodedProfile);
        } catch (ex) {
            throw new Error(`failed to deserialize profile: ${ex.message}`);
        }
    }

    private convertProtoProfileServiceClassToTypedServiceClass(serviceClass: AlliumProto.DeviceServiceClass): DeviceServiceClass {
        switch (serviceClass) {
            case AlliumProto.DeviceServiceClass.DevSvcCls_Generic:
                return DeviceServiceClass.Generic;
            case AlliumProto.DeviceServiceClass.DevSvcCls_CommunicationsBus:
                return DeviceServiceClass.CommunicationsBus;
            case AlliumProto.DeviceServiceClass.DevSvcCls_HID:
                return DeviceServiceClass.HID;
            case AlliumProto.DeviceServiceClass.DevSvcCls_Network:
                return DeviceServiceClass.Network;
            case AlliumProto.DeviceServiceClass.DevSvcCls_NonVolatileStorage:
                return DeviceServiceClass.NonVolatileStorage;
            case AlliumProto.DeviceServiceClass.DevSvcCls_PeripheralInput:
                return DeviceServiceClass.PeripheralInput;
            case AlliumProto.DeviceServiceClass.DevSvcCls_PeripheralOutput:
                return DeviceServiceClass.PeripheralOutput;
            case AlliumProto.DeviceServiceClass.DevSvcCls_SystemControlAndManagement:
                return DeviceServiceClass.SystemControlAndManagement;
            default:
                throw new Error(`failed to convert device service class: ${serviceClass}`);
        }
    }

    private convertProtoProfileToTypedProfile(profile: AlliumProto.BaseDeviceProfile): DeviceProfile {
        const errorMessages = new Array<string>();

        if (!Number.isInteger(profile.primaryDeviceIdentifier) || profile.primaryDeviceIdentifier < 0) {
            errorMessages.push('invalid primaryDeviceIdentifier');
        }

        if (!Number.isInteger(profile.secondaryDeviceIdentifier) || profile.secondaryDeviceIdentifier < 0) {
            errorMessages.push('invalid secondaryDeviceIdentifier');
        }

        if (!Number.isInteger(profile.clientToHostBufferSize) || profile.clientToHostBufferSize < 0 || profile.clientToHostBufferSize > 256) {
            errorMessages.push('invalid clientToHostBufferSize');
        }

        if (!Number.isInteger(profile.hostToClientBufferSize) || profile.hostToClientBufferSize < 0 || profile.hostToClientBufferSize > 256) {
            errorMessages.push('invalid hostToClientBufferSize');
        }

        if (profile.clientToHostBufferSize + profile.hostToClientBufferSize > 256) {
            errorMessages.push('invalid total buffer size (client + host)');
        }

        if (errorMessages.length > 0) {
            throw new Error(errorMessages.join(';'));
        } else {
            return {
                primaryDeviceIdentifier: ByteSequenceCreator.QuadByte(profile.primaryDeviceIdentifier),
                secondaryDeviceIdentifier: ByteSequenceCreator.QuadByte(profile.secondaryDeviceIdentifier),
                clientToHostBufferSize: profile.clientToHostBufferSize,
                hostToClientBufferSize: profile.hostToClientBufferSize,
                serviceClass: this.convertProtoProfileServiceClassToTypedServiceClass(profile.serviceClass),
                extendedServiceClass: profile.extendedServiceClass
            }
        }
    }

    private deserializeDeviceBundle(fileContent: string, format: SerializationFormat): AlliumWorksDeviceBundle {
        try {
            return this.deserializeAwDeviceBundle(fileContent, format);
        } catch (ex) {
            try {
                const baseBundle = this.deserializeBaseDeviceBundle(fileContent, format);
                return {
                    bundleId: baseBundle.bundleId,
                    profile: baseBundle.profile,
                    metadata: {
                        developerId: baseBundle.metadata.developerId,
                        categoryKey: baseBundle.metadata.categoryKey,
                        humanReadableDeviceName: baseBundle.metadata.humanReadableDeviceName,
                        preferredWidth: {
                            amount: 1,
                            units: 'rel'
                        },
                        preferredHeight: {
                            amount: 1,
                            units: 'rel'
                        }
                    },
                    html: '',
                    script: '',
                    stylesheet: '',
                    readme: undefined
                };
            } catch (ex2) {
                throw new Error(`failed to deserialize bundle: ${ex2.message}`);
            }
        }
    }

    private convertProtoBundleToTypedBundle(bundle: AlliumProto.AlliumWorksDeviceBundle): AlliumWorksDeviceBundle {
        try {
            const errorMessages = new Array<string>();

            if (!(!!bundle.profile)) {
                errorMessages.push('invalid profile');
            }

            if (!(!!bundle.metadata)) {
                errorMessages.push('invalid metadata');
            }

            if (errorMessages.length > 0) {
                throw new Error(errorMessages.join(';'));
            } else {
                return {
                    bundleId: bundle.bundleId,
                    profile: this.convertProtoProfileToTypedProfile(bundle.profile!),
                    metadata: this.convertProtoMetadataToTypedAwMetadata(bundle.metadata!),
                    html: bundle.html,
                    script: bundle.script,
                    stylesheet: bundle.stylesheet,
                    readme: !!bundle.readme
                        ? this.convertProtoReadmeToTypedReadme(bundle.readme)
                        : undefined
                }
            }
        } catch (ex) {
            throw new Error(`failed to convert bundle: ${ex.message}`);
        }
    }

    private deserializeBaseDeviceBundle(fileContent: string, format: SerializationFormat): DeviceBundle {
        try {
            const decodedBundle = AlliumProto.BaseDeviceBundle.decode(DataUtils.stringToUint8Array(format === 'base64' ? atob(fileContent)! : fileContent));
            const errorMessages = new Array<string>();

            if (!(!!decodedBundle.profile)) {
                errorMessages.push('invalid profile');
            }

            if (!(!!decodedBundle.metadata)) {
                errorMessages.push('invalid metadata');
            }

            if (errorMessages.length > 0) {
                throw new Error(errorMessages.join(';'));
            } else {
                return {
                    bundleId: decodedBundle.bundleId,
                    profile: this.convertProtoProfileToTypedProfile(decodedBundle.profile!),
                    metadata: {
                        developerId: decodedBundle.metadata!.developerId,
                        categoryKey: decodedBundle.metadata!.categoryKey,
                        humanReadableDeviceName: decodedBundle.metadata!.humanReadableDeviceName,
                    }
                }
            }
        } catch (ex) {
            throw new Error(`failed to deserialize AlliumWorks bundle: ${ex.message}`);
        }
    }

    private deserializeAwDeviceBundle(fileContent: string, format: SerializationFormat): AlliumWorksDeviceBundle {
        try {
            const decodedBundle = AlliumProto.AlliumWorksDeviceBundle.decode(DataUtils.stringToUint8Array(format === 'base64' ? atob(fileContent)! : fileContent));
            return this.convertProtoBundleToTypedBundle(decodedBundle);
        } catch (ex) {
            throw new Error(`failed to deserialize base bundle: ${ex.message}`);
        }
    }

    private tryParsePreferredDimension(s: any): {
        readonly amount: number,
        readonly units: 'rel' | 'px'
    } {
        // let useAmount: number = DEVICE_DEFAULT_PREFERRED_DIMENSION;//TODO ??
        let useAmount = 1;
        let useUnit: 'rel' | 'px' = 'rel';

        const relMatch = `${s}`.match(/^[ ]{0,}([0-9]+)[ ]{0,}rel$/);
        const pxMatch = !!relMatch ? null : `${s}`.match(/^[ ]{0,}([0-9]+)([ ]{0,}px[ ]{0,})[ ]{0,}$/);
        if (!!relMatch) {
            const amount = Number.parseInt(relMatch[1]);
            if (Number.isInteger(amount) && amount <= 4 && amount > 0) {
                useAmount = amount;
                useUnit = 'rel';
            }
        } else if (!!pxMatch) {
            const amount = Number.parseInt(pxMatch[1]);
            if (Number.isInteger(amount)) {
                useAmount = amount;
                useUnit = 'px';
            }
        }

        return {
            amount: useAmount,
            units: useUnit
        }
    }

    private getCurrentImportedDevices(): Promise<Array<DeviceBundleReference>> {
        return new Promise((resolve) => {
            this._importedDeviceBundles.pipe(take(1)).subscribe(importedDeviceBundles => {
                resolve(importedDeviceBundles);
            })
        })
    }

    private hashObject(o: any): string {
        const input = o === null || o === undefined
            ? ''
            : Array.isArray(o)
            ? o
            : typeof o === 'object'
            ? JSON.stringify(o)
            : `${o}`;
        return md5(input);
    }

    private getIoPortOrThrow(portIndex: number | Byte): IoPort {
        const pi = typeof portIndex === 'number' ? portIndex : ByteSequenceCreator.Unbox(portIndex);
        const port = this._debugger().getIoBus().getPort(pi);
        if (!!port) {
            return port;
        } else {
            throw new Error(`no device is installed on the provided port: ${portIndex}`);
        }
    }

    private _previousAvailableDevices: Array<{
        readonly portIndex: Byte;
        readonly key: string;
        readonly installationTitle: string;
    }>;
    private _availableDevices: BehaviorSubject<Array<{
        readonly portIndex: Byte;
        readonly key: string;
        readonly installationTitle: string;
    }>>;
    private _importedDeviceBundles: BehaviorSubject<Array<DeviceBundleReference>>;
    private readonly _installedDevices: BehaviorSubject<Array<DeviceInstallationDetails>>;
    private readonly _logsHelper: DeviceLogsHelper;
    private readonly _debugger: () => Debugger;
    private readonly _yfs: Yfs;
    private readonly _RECHECK_INTERVAL = 4000;

    private static readonly _DEV_ID_ALM = '111111devdvid00000000000000000000001';
}