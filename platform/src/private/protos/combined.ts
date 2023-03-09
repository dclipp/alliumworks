/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = "awdxc";

export enum OversizedInlineValueSizing {
  OversizedInlineValueSizing_Quad = 0,
  OversizedInlineValueSizing_Tri = 1,
  OversizedInlineValueSizing_Double = 2,
  OversizedInlineValueSizing_MinRequired = 3,
  UNRECOGNIZED = -1,
}

export function oversizedInlineValueSizingFromJSON(
  object: any
): OversizedInlineValueSizing {
  switch (object) {
    case 0:
    case "OversizedInlineValueSizing_Quad":
      return OversizedInlineValueSizing.OversizedInlineValueSizing_Quad;
    case 1:
    case "OversizedInlineValueSizing_Tri":
      return OversizedInlineValueSizing.OversizedInlineValueSizing_Tri;
    case 2:
    case "OversizedInlineValueSizing_Double":
      return OversizedInlineValueSizing.OversizedInlineValueSizing_Double;
    case 3:
    case "OversizedInlineValueSizing_MinRequired":
      return OversizedInlineValueSizing.OversizedInlineValueSizing_MinRequired;
    case -1:
    case "UNRECOGNIZED":
    default:
      return OversizedInlineValueSizing.UNRECOGNIZED;
  }
}

export function oversizedInlineValueSizingToJSON(
  object: OversizedInlineValueSizing
): string {
  switch (object) {
    case OversizedInlineValueSizing.OversizedInlineValueSizing_Quad:
      return "OversizedInlineValueSizing_Quad";
    case OversizedInlineValueSizing.OversizedInlineValueSizing_Tri:
      return "OversizedInlineValueSizing_Tri";
    case OversizedInlineValueSizing.OversizedInlineValueSizing_Double:
      return "OversizedInlineValueSizing_Double";
    case OversizedInlineValueSizing.OversizedInlineValueSizing_MinRequired:
      return "OversizedInlineValueSizing_MinRequired";
    default:
      return "UNKNOWN";
  }
}

export enum AsmMessageClassification {
  AsmMessageClassification_Info = 0,
  AsmMessageClassification_Warning = 1,
  AsmMessageClassification_Critical = 2,
  AsmMessageClassification_Fatal = 3,
  UNRECOGNIZED = -1,
}

export function asmMessageClassificationFromJSON(
  object: any
): AsmMessageClassification {
  switch (object) {
    case 0:
    case "AsmMessageClassification_Info":
      return AsmMessageClassification.AsmMessageClassification_Info;
    case 1:
    case "AsmMessageClassification_Warning":
      return AsmMessageClassification.AsmMessageClassification_Warning;
    case 2:
    case "AsmMessageClassification_Critical":
      return AsmMessageClassification.AsmMessageClassification_Critical;
    case 3:
    case "AsmMessageClassification_Fatal":
      return AsmMessageClassification.AsmMessageClassification_Fatal;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AsmMessageClassification.UNRECOGNIZED;
  }
}

export function asmMessageClassificationToJSON(
  object: AsmMessageClassification
): string {
  switch (object) {
    case AsmMessageClassification.AsmMessageClassification_Info:
      return "AsmMessageClassification_Info";
    case AsmMessageClassification.AsmMessageClassification_Warning:
      return "AsmMessageClassification_Warning";
    case AsmMessageClassification.AsmMessageClassification_Critical:
      return "AsmMessageClassification_Critical";
    case AsmMessageClassification.AsmMessageClassification_Fatal:
      return "AsmMessageClassification_Fatal";
    default:
      return "UNKNOWN";
  }
}

export enum SourceEntityKind {
  SourceEntityKind_SpaceSequence = 0,
  SourceEntityKind_TabSequence = 1,
  SourceEntityKind_Punctuation = 2,
  SourceEntityKind_LanguageConstruct = 3,
  SourceEntityKind_Newline = 4,
  SourceEntityKind_Comment = 5,
  SourceEntityKind_Garbage = 6,
  UNRECOGNIZED = -1,
}

export function sourceEntityKindFromJSON(object: any): SourceEntityKind {
  switch (object) {
    case 0:
    case "SourceEntityKind_SpaceSequence":
      return SourceEntityKind.SourceEntityKind_SpaceSequence;
    case 1:
    case "SourceEntityKind_TabSequence":
      return SourceEntityKind.SourceEntityKind_TabSequence;
    case 2:
    case "SourceEntityKind_Punctuation":
      return SourceEntityKind.SourceEntityKind_Punctuation;
    case 3:
    case "SourceEntityKind_LanguageConstruct":
      return SourceEntityKind.SourceEntityKind_LanguageConstruct;
    case 4:
    case "SourceEntityKind_Newline":
      return SourceEntityKind.SourceEntityKind_Newline;
    case 5:
    case "SourceEntityKind_Comment":
      return SourceEntityKind.SourceEntityKind_Comment;
    case 6:
    case "SourceEntityKind_Garbage":
      return SourceEntityKind.SourceEntityKind_Garbage;
    case -1:
    case "UNRECOGNIZED":
    default:
      return SourceEntityKind.UNRECOGNIZED;
  }
}

export function sourceEntityKindToJSON(object: SourceEntityKind): string {
  switch (object) {
    case SourceEntityKind.SourceEntityKind_SpaceSequence:
      return "SourceEntityKind_SpaceSequence";
    case SourceEntityKind.SourceEntityKind_TabSequence:
      return "SourceEntityKind_TabSequence";
    case SourceEntityKind.SourceEntityKind_Punctuation:
      return "SourceEntityKind_Punctuation";
    case SourceEntityKind.SourceEntityKind_LanguageConstruct:
      return "SourceEntityKind_LanguageConstruct";
    case SourceEntityKind.SourceEntityKind_Newline:
      return "SourceEntityKind_Newline";
    case SourceEntityKind.SourceEntityKind_Comment:
      return "SourceEntityKind_Comment";
    case SourceEntityKind.SourceEntityKind_Garbage:
      return "SourceEntityKind_Garbage";
    default:
      return "UNKNOWN";
  }
}

export enum LanguageConstructKind {
  LanguageConstructKind_blockname = 0,
  LanguageConstructKind_mnemonic = 1,
  LanguageConstructKind_constantinjectorkey = 2,
  LanguageConstructKind_constantinjectorvalue = 3,
  LanguageConstructKind_registername = 4,
  LanguageConstructKind_namedregistermask = 5,
  LanguageConstructKind_unnamedregistermask = 6,
  LanguageConstructKind_autoaddressreftargetlocallabel = 7,
  LanguageConstructKind_autoaddressreftargetexternallabel = 8,
  LanguageConstructKind_autoaddressrefdirectivelineindex = 9,
  LanguageConstructKind_autoaddressreftargetaddress = 10,
  LanguageConstructKind_autoaddressref = 11,
  LanguageConstructKind_inlineunsignednumber = 12,
  LanguageConstructKind_inlinesignednumber = 13,
  LanguageConstructKind_inlinefloatnumber = 14,
  LanguageConstructKind_directivecommand = 15,
  LanguageConstructKind_directivereceiver = 16,
  LanguageConstructKind_directiveparameter = 17,
  LanguageConstructKind_aliasreference = 18,
  LanguageConstructKind_comment = 19,
  UNRECOGNIZED = -1,
}

export function languageConstructKindFromJSON(
  object: any
): LanguageConstructKind {
  switch (object) {
    case 0:
    case "LanguageConstructKind_blockname":
      return LanguageConstructKind.LanguageConstructKind_blockname;
    case 1:
    case "LanguageConstructKind_mnemonic":
      return LanguageConstructKind.LanguageConstructKind_mnemonic;
    case 2:
    case "LanguageConstructKind_constantinjectorkey":
      return LanguageConstructKind.LanguageConstructKind_constantinjectorkey;
    case 3:
    case "LanguageConstructKind_constantinjectorvalue":
      return LanguageConstructKind.LanguageConstructKind_constantinjectorvalue;
    case 4:
    case "LanguageConstructKind_registername":
      return LanguageConstructKind.LanguageConstructKind_registername;
    case 5:
    case "LanguageConstructKind_namedregistermask":
      return LanguageConstructKind.LanguageConstructKind_namedregistermask;
    case 6:
    case "LanguageConstructKind_unnamedregistermask":
      return LanguageConstructKind.LanguageConstructKind_unnamedregistermask;
    case 7:
    case "LanguageConstructKind_autoaddressreftargetlocallabel":
      return LanguageConstructKind.LanguageConstructKind_autoaddressreftargetlocallabel;
    case 8:
    case "LanguageConstructKind_autoaddressreftargetexternallabel":
      return LanguageConstructKind.LanguageConstructKind_autoaddressreftargetexternallabel;
    case 9:
    case "LanguageConstructKind_autoaddressrefdirectivelineindex":
      return LanguageConstructKind.LanguageConstructKind_autoaddressrefdirectivelineindex;
    case 10:
    case "LanguageConstructKind_autoaddressreftargetaddress":
      return LanguageConstructKind.LanguageConstructKind_autoaddressreftargetaddress;
    case 11:
    case "LanguageConstructKind_autoaddressref":
      return LanguageConstructKind.LanguageConstructKind_autoaddressref;
    case 12:
    case "LanguageConstructKind_inlineunsignednumber":
      return LanguageConstructKind.LanguageConstructKind_inlineunsignednumber;
    case 13:
    case "LanguageConstructKind_inlinesignednumber":
      return LanguageConstructKind.LanguageConstructKind_inlinesignednumber;
    case 14:
    case "LanguageConstructKind_inlinefloatnumber":
      return LanguageConstructKind.LanguageConstructKind_inlinefloatnumber;
    case 15:
    case "LanguageConstructKind_directivecommand":
      return LanguageConstructKind.LanguageConstructKind_directivecommand;
    case 16:
    case "LanguageConstructKind_directivereceiver":
      return LanguageConstructKind.LanguageConstructKind_directivereceiver;
    case 17:
    case "LanguageConstructKind_directiveparameter":
      return LanguageConstructKind.LanguageConstructKind_directiveparameter;
    case 18:
    case "LanguageConstructKind_aliasreference":
      return LanguageConstructKind.LanguageConstructKind_aliasreference;
    case 19:
    case "LanguageConstructKind_comment":
      return LanguageConstructKind.LanguageConstructKind_comment;
    case -1:
    case "UNRECOGNIZED":
    default:
      return LanguageConstructKind.UNRECOGNIZED;
  }
}

export function languageConstructKindToJSON(
  object: LanguageConstructKind
): string {
  switch (object) {
    case LanguageConstructKind.LanguageConstructKind_blockname:
      return "LanguageConstructKind_blockname";
    case LanguageConstructKind.LanguageConstructKind_mnemonic:
      return "LanguageConstructKind_mnemonic";
    case LanguageConstructKind.LanguageConstructKind_constantinjectorkey:
      return "LanguageConstructKind_constantinjectorkey";
    case LanguageConstructKind.LanguageConstructKind_constantinjectorvalue:
      return "LanguageConstructKind_constantinjectorvalue";
    case LanguageConstructKind.LanguageConstructKind_registername:
      return "LanguageConstructKind_registername";
    case LanguageConstructKind.LanguageConstructKind_namedregistermask:
      return "LanguageConstructKind_namedregistermask";
    case LanguageConstructKind.LanguageConstructKind_unnamedregistermask:
      return "LanguageConstructKind_unnamedregistermask";
    case LanguageConstructKind.LanguageConstructKind_autoaddressreftargetlocallabel:
      return "LanguageConstructKind_autoaddressreftargetlocallabel";
    case LanguageConstructKind.LanguageConstructKind_autoaddressreftargetexternallabel:
      return "LanguageConstructKind_autoaddressreftargetexternallabel";
    case LanguageConstructKind.LanguageConstructKind_autoaddressrefdirectivelineindex:
      return "LanguageConstructKind_autoaddressrefdirectivelineindex";
    case LanguageConstructKind.LanguageConstructKind_autoaddressreftargetaddress:
      return "LanguageConstructKind_autoaddressreftargetaddress";
    case LanguageConstructKind.LanguageConstructKind_autoaddressref:
      return "LanguageConstructKind_autoaddressref";
    case LanguageConstructKind.LanguageConstructKind_inlineunsignednumber:
      return "LanguageConstructKind_inlineunsignednumber";
    case LanguageConstructKind.LanguageConstructKind_inlinesignednumber:
      return "LanguageConstructKind_inlinesignednumber";
    case LanguageConstructKind.LanguageConstructKind_inlinefloatnumber:
      return "LanguageConstructKind_inlinefloatnumber";
    case LanguageConstructKind.LanguageConstructKind_directivecommand:
      return "LanguageConstructKind_directivecommand";
    case LanguageConstructKind.LanguageConstructKind_directivereceiver:
      return "LanguageConstructKind_directivereceiver";
    case LanguageConstructKind.LanguageConstructKind_directiveparameter:
      return "LanguageConstructKind_directiveparameter";
    case LanguageConstructKind.LanguageConstructKind_aliasreference:
      return "LanguageConstructKind_aliasreference";
    case LanguageConstructKind.LanguageConstructKind_comment:
      return "LanguageConstructKind_comment";
    default:
      return "UNKNOWN";
  }
}

export enum NativeDataType {
  NativeDataType_none = 0,
  NativeDataType_inlineunsignednumber = 1,
  NativeDataType_inlinesignednumber = 2,
  NativeDataType_inlinefloatnumber = 3,
  NativeDataType_flagcode = 4,
  NativeDataType_memoryaddress = 5,
  NativeDataType_registername = 6,
  NativeDataType_registermask = 7,
  NativeDataType_ioport = 8,
  NativeDataType_iocommand = 9,
  NativeDataType_mnemonic = 10,
  UNRECOGNIZED = -1,
}

export function nativeDataTypeFromJSON(object: any): NativeDataType {
  switch (object) {
    case 0:
    case "NativeDataType_none":
      return NativeDataType.NativeDataType_none;
    case 1:
    case "NativeDataType_inlineunsignednumber":
      return NativeDataType.NativeDataType_inlineunsignednumber;
    case 2:
    case "NativeDataType_inlinesignednumber":
      return NativeDataType.NativeDataType_inlinesignednumber;
    case 3:
    case "NativeDataType_inlinefloatnumber":
      return NativeDataType.NativeDataType_inlinefloatnumber;
    case 4:
    case "NativeDataType_flagcode":
      return NativeDataType.NativeDataType_flagcode;
    case 5:
    case "NativeDataType_memoryaddress":
      return NativeDataType.NativeDataType_memoryaddress;
    case 6:
    case "NativeDataType_registername":
      return NativeDataType.NativeDataType_registername;
    case 7:
    case "NativeDataType_registermask":
      return NativeDataType.NativeDataType_registermask;
    case 8:
    case "NativeDataType_ioport":
      return NativeDataType.NativeDataType_ioport;
    case 9:
    case "NativeDataType_iocommand":
      return NativeDataType.NativeDataType_iocommand;
    case 10:
    case "NativeDataType_mnemonic":
      return NativeDataType.NativeDataType_mnemonic;
    case -1:
    case "UNRECOGNIZED":
    default:
      return NativeDataType.UNRECOGNIZED;
  }
}

export function nativeDataTypeToJSON(object: NativeDataType): string {
  switch (object) {
    case NativeDataType.NativeDataType_none:
      return "NativeDataType_none";
    case NativeDataType.NativeDataType_inlineunsignednumber:
      return "NativeDataType_inlineunsignednumber";
    case NativeDataType.NativeDataType_inlinesignednumber:
      return "NativeDataType_inlinesignednumber";
    case NativeDataType.NativeDataType_inlinefloatnumber:
      return "NativeDataType_inlinefloatnumber";
    case NativeDataType.NativeDataType_flagcode:
      return "NativeDataType_flagcode";
    case NativeDataType.NativeDataType_memoryaddress:
      return "NativeDataType_memoryaddress";
    case NativeDataType.NativeDataType_registername:
      return "NativeDataType_registername";
    case NativeDataType.NativeDataType_registermask:
      return "NativeDataType_registermask";
    case NativeDataType.NativeDataType_ioport:
      return "NativeDataType_ioport";
    case NativeDataType.NativeDataType_iocommand:
      return "NativeDataType_iocommand";
    case NativeDataType.NativeDataType_mnemonic:
      return "NativeDataType_mnemonic";
    default:
      return "UNKNOWN";
  }
}

/**
 * end allium.alliumAssembler
 * begin allium.device [version 3
]
 */
export enum DeviceServiceClass {
  DevSvcCls_Generic = 0,
  DevSvcCls_CommunicationsBus = 1,
  DevSvcCls_HID = 2,
  DevSvcCls_Network = 3,
  DevSvcCls_NonVolatileStorage = 4,
  DevSvcCls_PeripheralInput = 5,
  DevSvcCls_PeripheralOutput = 6,
  DevSvcCls_SystemControlAndManagement = 7,
  UNRECOGNIZED = -1,
}

export function deviceServiceClassFromJSON(object: any): DeviceServiceClass {
  switch (object) {
    case 0:
    case "DevSvcCls_Generic":
      return DeviceServiceClass.DevSvcCls_Generic;
    case 1:
    case "DevSvcCls_CommunicationsBus":
      return DeviceServiceClass.DevSvcCls_CommunicationsBus;
    case 2:
    case "DevSvcCls_HID":
      return DeviceServiceClass.DevSvcCls_HID;
    case 3:
    case "DevSvcCls_Network":
      return DeviceServiceClass.DevSvcCls_Network;
    case 4:
    case "DevSvcCls_NonVolatileStorage":
      return DeviceServiceClass.DevSvcCls_NonVolatileStorage;
    case 5:
    case "DevSvcCls_PeripheralInput":
      return DeviceServiceClass.DevSvcCls_PeripheralInput;
    case 6:
    case "DevSvcCls_PeripheralOutput":
      return DeviceServiceClass.DevSvcCls_PeripheralOutput;
    case 7:
    case "DevSvcCls_SystemControlAndManagement":
      return DeviceServiceClass.DevSvcCls_SystemControlAndManagement;
    case -1:
    case "UNRECOGNIZED":
    default:
      return DeviceServiceClass.UNRECOGNIZED;
  }
}

export function deviceServiceClassToJSON(object: DeviceServiceClass): string {
  switch (object) {
    case DeviceServiceClass.DevSvcCls_Generic:
      return "DevSvcCls_Generic";
    case DeviceServiceClass.DevSvcCls_CommunicationsBus:
      return "DevSvcCls_CommunicationsBus";
    case DeviceServiceClass.DevSvcCls_HID:
      return "DevSvcCls_HID";
    case DeviceServiceClass.DevSvcCls_Network:
      return "DevSvcCls_Network";
    case DeviceServiceClass.DevSvcCls_NonVolatileStorage:
      return "DevSvcCls_NonVolatileStorage";
    case DeviceServiceClass.DevSvcCls_PeripheralInput:
      return "DevSvcCls_PeripheralInput";
    case DeviceServiceClass.DevSvcCls_PeripheralOutput:
      return "DevSvcCls_PeripheralOutput";
    case DeviceServiceClass.DevSvcCls_SystemControlAndManagement:
      return "DevSvcCls_SystemControlAndManagement";
    default:
      return "UNKNOWN";
  }
}

export enum AlliumWorksDeviceSizePreferenceUnit {
  SizePrefUnit_Rel = 0,
  SizePrefUnit_Px = 1,
  UNRECOGNIZED = -1,
}

export function alliumWorksDeviceSizePreferenceUnitFromJSON(
  object: any
): AlliumWorksDeviceSizePreferenceUnit {
  switch (object) {
    case 0:
    case "SizePrefUnit_Rel":
      return AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel;
    case 1:
    case "SizePrefUnit_Px":
      return AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Px;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AlliumWorksDeviceSizePreferenceUnit.UNRECOGNIZED;
  }
}

export function alliumWorksDeviceSizePreferenceUnitToJSON(
  object: AlliumWorksDeviceSizePreferenceUnit
): string {
  switch (object) {
    case AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Rel:
      return "SizePrefUnit_Rel";
    case AlliumWorksDeviceSizePreferenceUnit.SizePrefUnit_Px:
      return "SizePrefUnit_Px";
    default:
      return "UNKNOWN";
  }
}

/** begin allium.alliumAssembler [version 3
] */
export interface FileMapItem {
  referenceName: string;
  fileContent: string;
}

export interface FileMap {
  items: FileMapItem[];
}

export interface AssemblyEntryPoint {
  objectName: string;
  label: string;
}

export interface ParseOptions {
  treatOversizedInlineValuesAsWarnings: boolean;
  oversizedInlineValueSizing?: OversizedInlineValueSizing | undefined;
  useMockForExternalAddresses: boolean;
  entryPoint?: AssemblyEntryPoint | undefined;
  baseAddressOffset?: number | undefined;
}

export interface ExtendedAsmMessageContentExcerpt {
  before: string;
  target: string;
  after: string;
}

export interface AsmMessageContentCoordinates {
  startPosition: number;
  endPosition: number;
}

export interface ExtendedAsmMessage {
  code: number;
  classification: AsmMessageClassification;
  contentCoordinates?: AsmMessageContentCoordinates | undefined;
  objectName: string;
  lineIndex?: number | undefined;
  contentExcerpt?: ExtendedAsmMessageContentExcerpt | undefined;
  /** optional repeated string details = 7; */
  details: string[];
}

export interface ParserOutput {
  messages: ExtendedAsmMessage[];
  succeeded: boolean;
  parserOptionsUsed: ParseOptions | undefined;
}

export interface ParseRequest {
  fileMap: FileMap | undefined;
  options?: ParseOptions | undefined;
}

export interface CompiledObject {
  succeeded: boolean;
  objectName: string;
  xbytes: Uint8Array;
}

export interface CompiledAssembly {
  succeeded: boolean;
  messages: ExtendedAsmMessage[];
  programBytes: Uint8Array;
  objects: CompiledObject[];
}

export interface CompileRequest {
  fileMap: FileMap | undefined;
  options?: ParseOptions | undefined;
  entryPoint?: AssemblyEntryPoint | undefined;
}

export interface BuildOptionsInput {
  treatOversizedInlineValuesAsWarnings?: boolean | undefined;
  oversizedInlineValueSizing?: OversizedInlineValueSizing | undefined;
  useMockForExternalAddresses?: boolean | undefined;
  entryPoint?: AssemblyEntryPoint | undefined;
  baseAddressOffset?: number | undefined;
  generateSourceMap?: boolean | undefined;
}

export interface AssemblyConstructDetails {
  kind: LanguageConstructKind;
  dataType: NativeDataType;
  nativeByteLength: number;
  numericValue: number;
}

export interface AssemblySourceEntity {
  objectName: string;
  id: string;
  lineIndex?: number | undefined;
  startPosition?: number | undefined;
  endPosition?: number | undefined;
  kind: SourceEntityKind;
  text: string;
  constructDetails?: AssemblyConstructDetails | undefined;
  group?: string | undefined;
  referencesToThis: string[];
  messages: ExtendedAsmMessage[];
}

export interface AssemblySourceLine {
  objectName: string;
  lineIndex: number;
  entities: AssemblySourceEntity[];
}

export interface AssemblySourceMap {
  LINES: AssemblySourceLine[];
  HasErrors: boolean;
  MESSAGES: ExtendedAsmMessage[];
}

export interface AlliumAssembly {
  buildSucceeded: boolean;
  messages: ExtendedAsmMessage[];
  totalByteCount: number;
  compilation: CompiledAssembly | undefined;
  sourceMap?: AssemblySourceMap | undefined;
}

export interface BuildRequest {
  fileMap: FileMap | undefined;
  options?: BuildOptionsInput | undefined;
}

export interface BaseDeviceProfile {
  primaryDeviceIdentifier: number;
  secondaryDeviceIdentifier: number;
  clientToHostBufferSize: number;
  hostToClientBufferSize: number;
  serviceClass: DeviceServiceClass;
  extendedServiceClass: number;
}

export interface BaseDeviceMetadata {
  developerId: string;
  categoryKey: string;
  humanReadableDeviceName: string;
}

export interface BaseDeviceBundle {
  bundleId: string;
  profile: BaseDeviceProfile | undefined;
  metadata: BaseDeviceMetadata | undefined;
}

export interface AlliumWorksDeviceSizePreference {
  amount: number;
  units: AlliumWorksDeviceSizePreferenceUnit;
}

export interface AlliumWorksDeviceMetadata {
  developerId: string;
  categoryKey: string;
  humanReadableDeviceName: string;
  preferredWidth: AlliumWorksDeviceSizePreference | undefined;
  preferredHeight: AlliumWorksDeviceSizePreference | undefined;
}

export interface AlliumWorksDeviceReadmeSection {
  title: string;
  order: number;
  paragraphs: string[];
}

export interface AlliumWorksDeviceReadmeEmbeddedResource {
  name: string;
  blob: Uint8Array;
}

export interface AlliumWorksDeviceReadme {
  descriptionParagraphs: string[];
  sections: AlliumWorksDeviceReadmeSection[];
  embeddedResources: AlliumWorksDeviceReadmeEmbeddedResource[];
}

export interface AlliumWorksDeviceBundle {
  bundleId: string;
  profile: BaseDeviceProfile | undefined;
  metadata: AlliumWorksDeviceMetadata | undefined;
  html: string;
  script: string;
  stylesheet: string;
  readme?: AlliumWorksDeviceReadme | undefined;
}

export interface DeviceBundle {
  baseBundle: BaseDeviceBundle | undefined;
  awBundle: AlliumWorksDeviceBundle | undefined;
}

/**
 * end allium.device
 * begin allium.archive [version 3
]
 */
export interface AlliumArchive {
  schemaVersion: number;
  creator: string;
  producer: string;
  timestamp: number;
  devices: DeviceBundle[];
}

const baseFileMapItem: object = { referenceName: "", fileContent: "" };

export const FileMapItem = {
  encode(
    message: FileMapItem,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.referenceName !== "") {
      writer.uint32(10).string(message.referenceName);
    }
    if (message.fileContent !== "") {
      writer.uint32(18).string(message.fileContent);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FileMapItem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseFileMapItem } as FileMapItem;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.referenceName = reader.string();
          break;
        case 2:
          message.fileContent = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FileMapItem {
    const message = { ...baseFileMapItem } as FileMapItem;
    if (object.referenceName !== undefined && object.referenceName !== null) {
      message.referenceName = String(object.referenceName);
    } else {
      message.referenceName = "";
    }
    if (object.fileContent !== undefined && object.fileContent !== null) {
      message.fileContent = String(object.fileContent);
    } else {
      message.fileContent = "";
    }
    return message;
  },

  toJSON(message: FileMapItem): unknown {
    const obj: any = {};
    message.referenceName !== undefined &&
      (obj.referenceName = message.referenceName);
    message.fileContent !== undefined &&
      (obj.fileContent = message.fileContent);
    return obj;
  },

  fromPartial(object: DeepPartial<FileMapItem>): FileMapItem {
    const message = { ...baseFileMapItem } as FileMapItem;
    if (object.referenceName !== undefined && object.referenceName !== null) {
      message.referenceName = object.referenceName;
    } else {
      message.referenceName = "";
    }
    if (object.fileContent !== undefined && object.fileContent !== null) {
      message.fileContent = object.fileContent;
    } else {
      message.fileContent = "";
    }
    return message;
  },
};

const baseFileMap: object = {};

export const FileMap = {
  encode(
    message: FileMap,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.items) {
      FileMapItem.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FileMap {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseFileMap } as FileMap;
    message.items = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.items.push(FileMapItem.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FileMap {
    const message = { ...baseFileMap } as FileMap;
    message.items = [];
    if (object.items !== undefined && object.items !== null) {
      for (const e of object.items) {
        message.items.push(FileMapItem.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: FileMap): unknown {
    const obj: any = {};
    if (message.items) {
      obj.items = message.items.map((e) =>
        e ? FileMapItem.toJSON(e) : undefined
      );
    } else {
      obj.items = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<FileMap>): FileMap {
    const message = { ...baseFileMap } as FileMap;
    message.items = [];
    if (object.items !== undefined && object.items !== null) {
      for (const e of object.items) {
        message.items.push(FileMapItem.fromPartial(e));
      }
    }
    return message;
  },
};

const baseAssemblyEntryPoint: object = { objectName: "", label: "" };

export const AssemblyEntryPoint = {
  encode(
    message: AssemblyEntryPoint,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.objectName !== "") {
      writer.uint32(10).string(message.objectName);
    }
    if (message.label !== "") {
      writer.uint32(18).string(message.label);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AssemblyEntryPoint {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseAssemblyEntryPoint } as AssemblyEntryPoint;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.objectName = reader.string();
          break;
        case 2:
          message.label = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssemblyEntryPoint {
    const message = { ...baseAssemblyEntryPoint } as AssemblyEntryPoint;
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = String(object.objectName);
    } else {
      message.objectName = "";
    }
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    return message;
  },

  toJSON(message: AssemblyEntryPoint): unknown {
    const obj: any = {};
    message.objectName !== undefined && (obj.objectName = message.objectName);
    message.label !== undefined && (obj.label = message.label);
    return obj;
  },

  fromPartial(object: DeepPartial<AssemblyEntryPoint>): AssemblyEntryPoint {
    const message = { ...baseAssemblyEntryPoint } as AssemblyEntryPoint;
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = object.objectName;
    } else {
      message.objectName = "";
    }
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    return message;
  },
};

const baseParseOptions: object = {
  treatOversizedInlineValuesAsWarnings: false,
  useMockForExternalAddresses: false,
};

export const ParseOptions = {
  encode(
    message: ParseOptions,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.treatOversizedInlineValuesAsWarnings === true) {
      writer.uint32(8).bool(message.treatOversizedInlineValuesAsWarnings);
    }
    if (message.oversizedInlineValueSizing !== undefined) {
      writer.uint32(16).int32(message.oversizedInlineValueSizing);
    }
    if (message.useMockForExternalAddresses === true) {
      writer.uint32(24).bool(message.useMockForExternalAddresses);
    }
    if (message.entryPoint !== undefined) {
      AssemblyEntryPoint.encode(
        message.entryPoint,
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.baseAddressOffset !== undefined) {
      writer.uint32(40).uint32(message.baseAddressOffset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ParseOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseParseOptions } as ParseOptions;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.treatOversizedInlineValuesAsWarnings = reader.bool();
          break;
        case 2:
          message.oversizedInlineValueSizing = reader.int32() as any;
          break;
        case 3:
          message.useMockForExternalAddresses = reader.bool();
          break;
        case 4:
          message.entryPoint = AssemblyEntryPoint.decode(
            reader,
            reader.uint32()
          );
          break;
        case 5:
          message.baseAddressOffset = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ParseOptions {
    const message = { ...baseParseOptions } as ParseOptions;
    if (
      object.treatOversizedInlineValuesAsWarnings !== undefined &&
      object.treatOversizedInlineValuesAsWarnings !== null
    ) {
      message.treatOversizedInlineValuesAsWarnings = Boolean(
        object.treatOversizedInlineValuesAsWarnings
      );
    } else {
      message.treatOversizedInlineValuesAsWarnings = false;
    }
    if (
      object.oversizedInlineValueSizing !== undefined &&
      object.oversizedInlineValueSizing !== null
    ) {
      message.oversizedInlineValueSizing = oversizedInlineValueSizingFromJSON(
        object.oversizedInlineValueSizing
      );
    } else {
      message.oversizedInlineValueSizing = undefined;
    }
    if (
      object.useMockForExternalAddresses !== undefined &&
      object.useMockForExternalAddresses !== null
    ) {
      message.useMockForExternalAddresses = Boolean(
        object.useMockForExternalAddresses
      );
    } else {
      message.useMockForExternalAddresses = false;
    }
    if (object.entryPoint !== undefined && object.entryPoint !== null) {
      message.entryPoint = AssemblyEntryPoint.fromJSON(object.entryPoint);
    } else {
      message.entryPoint = undefined;
    }
    if (
      object.baseAddressOffset !== undefined &&
      object.baseAddressOffset !== null
    ) {
      message.baseAddressOffset = Number(object.baseAddressOffset);
    } else {
      message.baseAddressOffset = undefined;
    }
    return message;
  },

  toJSON(message: ParseOptions): unknown {
    const obj: any = {};
    message.treatOversizedInlineValuesAsWarnings !== undefined &&
      (obj.treatOversizedInlineValuesAsWarnings =
        message.treatOversizedInlineValuesAsWarnings);
    message.oversizedInlineValueSizing !== undefined &&
      (obj.oversizedInlineValueSizing =
        message.oversizedInlineValueSizing !== undefined
          ? oversizedInlineValueSizingToJSON(message.oversizedInlineValueSizing)
          : undefined);
    message.useMockForExternalAddresses !== undefined &&
      (obj.useMockForExternalAddresses = message.useMockForExternalAddresses);
    message.entryPoint !== undefined &&
      (obj.entryPoint = message.entryPoint
        ? AssemblyEntryPoint.toJSON(message.entryPoint)
        : undefined);
    message.baseAddressOffset !== undefined &&
      (obj.baseAddressOffset = message.baseAddressOffset);
    return obj;
  },

  fromPartial(object: DeepPartial<ParseOptions>): ParseOptions {
    const message = { ...baseParseOptions } as ParseOptions;
    if (
      object.treatOversizedInlineValuesAsWarnings !== undefined &&
      object.treatOversizedInlineValuesAsWarnings !== null
    ) {
      message.treatOversizedInlineValuesAsWarnings =
        object.treatOversizedInlineValuesAsWarnings;
    } else {
      message.treatOversizedInlineValuesAsWarnings = false;
    }
    if (
      object.oversizedInlineValueSizing !== undefined &&
      object.oversizedInlineValueSizing !== null
    ) {
      message.oversizedInlineValueSizing = object.oversizedInlineValueSizing;
    } else {
      message.oversizedInlineValueSizing = undefined;
    }
    if (
      object.useMockForExternalAddresses !== undefined &&
      object.useMockForExternalAddresses !== null
    ) {
      message.useMockForExternalAddresses = object.useMockForExternalAddresses;
    } else {
      message.useMockForExternalAddresses = false;
    }
    if (object.entryPoint !== undefined && object.entryPoint !== null) {
      message.entryPoint = AssemblyEntryPoint.fromPartial(object.entryPoint);
    } else {
      message.entryPoint = undefined;
    }
    if (
      object.baseAddressOffset !== undefined &&
      object.baseAddressOffset !== null
    ) {
      message.baseAddressOffset = object.baseAddressOffset;
    } else {
      message.baseAddressOffset = undefined;
    }
    return message;
  },
};

const baseExtendedAsmMessageContentExcerpt: object = {
  before: "",
  target: "",
  after: "",
};

export const ExtendedAsmMessageContentExcerpt = {
  encode(
    message: ExtendedAsmMessageContentExcerpt,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.before !== "") {
      writer.uint32(10).string(message.before);
    }
    if (message.target !== "") {
      writer.uint32(18).string(message.target);
    }
    if (message.after !== "") {
      writer.uint32(26).string(message.after);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ExtendedAsmMessageContentExcerpt {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseExtendedAsmMessageContentExcerpt,
    } as ExtendedAsmMessageContentExcerpt;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.before = reader.string();
          break;
        case 2:
          message.target = reader.string();
          break;
        case 3:
          message.after = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExtendedAsmMessageContentExcerpt {
    const message = {
      ...baseExtendedAsmMessageContentExcerpt,
    } as ExtendedAsmMessageContentExcerpt;
    if (object.before !== undefined && object.before !== null) {
      message.before = String(object.before);
    } else {
      message.before = "";
    }
    if (object.target !== undefined && object.target !== null) {
      message.target = String(object.target);
    } else {
      message.target = "";
    }
    if (object.after !== undefined && object.after !== null) {
      message.after = String(object.after);
    } else {
      message.after = "";
    }
    return message;
  },

  toJSON(message: ExtendedAsmMessageContentExcerpt): unknown {
    const obj: any = {};
    message.before !== undefined && (obj.before = message.before);
    message.target !== undefined && (obj.target = message.target);
    message.after !== undefined && (obj.after = message.after);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ExtendedAsmMessageContentExcerpt>
  ): ExtendedAsmMessageContentExcerpt {
    const message = {
      ...baseExtendedAsmMessageContentExcerpt,
    } as ExtendedAsmMessageContentExcerpt;
    if (object.before !== undefined && object.before !== null) {
      message.before = object.before;
    } else {
      message.before = "";
    }
    if (object.target !== undefined && object.target !== null) {
      message.target = object.target;
    } else {
      message.target = "";
    }
    if (object.after !== undefined && object.after !== null) {
      message.after = object.after;
    } else {
      message.after = "";
    }
    return message;
  },
};

const baseAsmMessageContentCoordinates: object = {
  startPosition: 0,
  endPosition: 0,
};

export const AsmMessageContentCoordinates = {
  encode(
    message: AsmMessageContentCoordinates,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.startPosition !== 0) {
      writer.uint32(8).uint32(message.startPosition);
    }
    if (message.endPosition !== 0) {
      writer.uint32(16).uint32(message.endPosition);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AsmMessageContentCoordinates {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseAsmMessageContentCoordinates,
    } as AsmMessageContentCoordinates;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.startPosition = reader.uint32();
          break;
        case 2:
          message.endPosition = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AsmMessageContentCoordinates {
    const message = {
      ...baseAsmMessageContentCoordinates,
    } as AsmMessageContentCoordinates;
    if (object.startPosition !== undefined && object.startPosition !== null) {
      message.startPosition = Number(object.startPosition);
    } else {
      message.startPosition = 0;
    }
    if (object.endPosition !== undefined && object.endPosition !== null) {
      message.endPosition = Number(object.endPosition);
    } else {
      message.endPosition = 0;
    }
    return message;
  },

  toJSON(message: AsmMessageContentCoordinates): unknown {
    const obj: any = {};
    message.startPosition !== undefined &&
      (obj.startPosition = message.startPosition);
    message.endPosition !== undefined &&
      (obj.endPosition = message.endPosition);
    return obj;
  },

  fromPartial(
    object: DeepPartial<AsmMessageContentCoordinates>
  ): AsmMessageContentCoordinates {
    const message = {
      ...baseAsmMessageContentCoordinates,
    } as AsmMessageContentCoordinates;
    if (object.startPosition !== undefined && object.startPosition !== null) {
      message.startPosition = object.startPosition;
    } else {
      message.startPosition = 0;
    }
    if (object.endPosition !== undefined && object.endPosition !== null) {
      message.endPosition = object.endPosition;
    } else {
      message.endPosition = 0;
    }
    return message;
  },
};

const baseExtendedAsmMessage: object = {
  code: 0,
  classification: 0,
  objectName: "",
  details: "",
};

export const ExtendedAsmMessage = {
  encode(
    message: ExtendedAsmMessage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).uint32(message.code);
    }
    if (message.classification !== 0) {
      writer.uint32(16).int32(message.classification);
    }
    if (message.contentCoordinates !== undefined) {
      AsmMessageContentCoordinates.encode(
        message.contentCoordinates,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.objectName !== "") {
      writer.uint32(34).string(message.objectName);
    }
    if (message.lineIndex !== undefined) {
      writer.uint32(40).uint32(message.lineIndex);
    }
    if (message.contentExcerpt !== undefined) {
      ExtendedAsmMessageContentExcerpt.encode(
        message.contentExcerpt,
        writer.uint32(50).fork()
      ).ldelim();
    }
    for (const v of message.details) {
      writer.uint32(58).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExtendedAsmMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseExtendedAsmMessage } as ExtendedAsmMessage;
    message.details = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.code = reader.uint32();
          break;
        case 2:
          message.classification = reader.int32() as any;
          break;
        case 3:
          message.contentCoordinates = AsmMessageContentCoordinates.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.objectName = reader.string();
          break;
        case 5:
          message.lineIndex = reader.uint32();
          break;
        case 6:
          message.contentExcerpt = ExtendedAsmMessageContentExcerpt.decode(
            reader,
            reader.uint32()
          );
          break;
        case 7:
          message.details.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExtendedAsmMessage {
    const message = { ...baseExtendedAsmMessage } as ExtendedAsmMessage;
    message.details = [];
    if (object.code !== undefined && object.code !== null) {
      message.code = Number(object.code);
    } else {
      message.code = 0;
    }
    if (object.classification !== undefined && object.classification !== null) {
      message.classification = asmMessageClassificationFromJSON(
        object.classification
      );
    } else {
      message.classification = 0;
    }
    if (
      object.contentCoordinates !== undefined &&
      object.contentCoordinates !== null
    ) {
      message.contentCoordinates = AsmMessageContentCoordinates.fromJSON(
        object.contentCoordinates
      );
    } else {
      message.contentCoordinates = undefined;
    }
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = String(object.objectName);
    } else {
      message.objectName = "";
    }
    if (object.lineIndex !== undefined && object.lineIndex !== null) {
      message.lineIndex = Number(object.lineIndex);
    } else {
      message.lineIndex = undefined;
    }
    if (object.contentExcerpt !== undefined && object.contentExcerpt !== null) {
      message.contentExcerpt = ExtendedAsmMessageContentExcerpt.fromJSON(
        object.contentExcerpt
      );
    } else {
      message.contentExcerpt = undefined;
    }
    if (object.details !== undefined && object.details !== null) {
      for (const e of object.details) {
        message.details.push(String(e));
      }
    }
    return message;
  },

  toJSON(message: ExtendedAsmMessage): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = message.code);
    message.classification !== undefined &&
      (obj.classification = asmMessageClassificationToJSON(
        message.classification
      ));
    message.contentCoordinates !== undefined &&
      (obj.contentCoordinates = message.contentCoordinates
        ? AsmMessageContentCoordinates.toJSON(message.contentCoordinates)
        : undefined);
    message.objectName !== undefined && (obj.objectName = message.objectName);
    message.lineIndex !== undefined && (obj.lineIndex = message.lineIndex);
    message.contentExcerpt !== undefined &&
      (obj.contentExcerpt = message.contentExcerpt
        ? ExtendedAsmMessageContentExcerpt.toJSON(message.contentExcerpt)
        : undefined);
    if (message.details) {
      obj.details = message.details.map((e) => e);
    } else {
      obj.details = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<ExtendedAsmMessage>): ExtendedAsmMessage {
    const message = { ...baseExtendedAsmMessage } as ExtendedAsmMessage;
    message.details = [];
    if (object.code !== undefined && object.code !== null) {
      message.code = object.code;
    } else {
      message.code = 0;
    }
    if (object.classification !== undefined && object.classification !== null) {
      message.classification = object.classification;
    } else {
      message.classification = 0;
    }
    if (
      object.contentCoordinates !== undefined &&
      object.contentCoordinates !== null
    ) {
      message.contentCoordinates = AsmMessageContentCoordinates.fromPartial(
        object.contentCoordinates
      );
    } else {
      message.contentCoordinates = undefined;
    }
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = object.objectName;
    } else {
      message.objectName = "";
    }
    if (object.lineIndex !== undefined && object.lineIndex !== null) {
      message.lineIndex = object.lineIndex;
    } else {
      message.lineIndex = undefined;
    }
    if (object.contentExcerpt !== undefined && object.contentExcerpt !== null) {
      message.contentExcerpt = ExtendedAsmMessageContentExcerpt.fromPartial(
        object.contentExcerpt
      );
    } else {
      message.contentExcerpt = undefined;
    }
    if (object.details !== undefined && object.details !== null) {
      for (const e of object.details) {
        message.details.push(e);
      }
    }
    return message;
  },
};

const baseParserOutput: object = { succeeded: false };

export const ParserOutput = {
  encode(
    message: ParserOutput,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.messages) {
      ExtendedAsmMessage.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.succeeded === true) {
      writer.uint32(16).bool(message.succeeded);
    }
    if (message.parserOptionsUsed !== undefined) {
      ParseOptions.encode(
        message.parserOptionsUsed,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ParserOutput {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseParserOutput } as ParserOutput;
    message.messages = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(
            ExtendedAsmMessage.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.succeeded = reader.bool();
          break;
        case 3:
          message.parserOptionsUsed = ParseOptions.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ParserOutput {
    const message = { ...baseParserOutput } as ParserOutput;
    message.messages = [];
    if (object.messages !== undefined && object.messages !== null) {
      for (const e of object.messages) {
        message.messages.push(ExtendedAsmMessage.fromJSON(e));
      }
    }
    if (object.succeeded !== undefined && object.succeeded !== null) {
      message.succeeded = Boolean(object.succeeded);
    } else {
      message.succeeded = false;
    }
    if (
      object.parserOptionsUsed !== undefined &&
      object.parserOptionsUsed !== null
    ) {
      message.parserOptionsUsed = ParseOptions.fromJSON(
        object.parserOptionsUsed
      );
    } else {
      message.parserOptionsUsed = undefined;
    }
    return message;
  },

  toJSON(message: ParserOutput): unknown {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map((e) =>
        e ? ExtendedAsmMessage.toJSON(e) : undefined
      );
    } else {
      obj.messages = [];
    }
    message.succeeded !== undefined && (obj.succeeded = message.succeeded);
    message.parserOptionsUsed !== undefined &&
      (obj.parserOptionsUsed = message.parserOptionsUsed
        ? ParseOptions.toJSON(message.parserOptionsUsed)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<ParserOutput>): ParserOutput {
    const message = { ...baseParserOutput } as ParserOutput;
    message.messages = [];
    if (object.messages !== undefined && object.messages !== null) {
      for (const e of object.messages) {
        message.messages.push(ExtendedAsmMessage.fromPartial(e));
      }
    }
    if (object.succeeded !== undefined && object.succeeded !== null) {
      message.succeeded = object.succeeded;
    } else {
      message.succeeded = false;
    }
    if (
      object.parserOptionsUsed !== undefined &&
      object.parserOptionsUsed !== null
    ) {
      message.parserOptionsUsed = ParseOptions.fromPartial(
        object.parserOptionsUsed
      );
    } else {
      message.parserOptionsUsed = undefined;
    }
    return message;
  },
};

const baseParseRequest: object = {};

export const ParseRequest = {
  encode(
    message: ParseRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.fileMap !== undefined) {
      FileMap.encode(message.fileMap, writer.uint32(10).fork()).ldelim();
    }
    if (message.options !== undefined) {
      ParseOptions.encode(message.options, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ParseRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseParseRequest } as ParseRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fileMap = FileMap.decode(reader, reader.uint32());
          break;
        case 2:
          message.options = ParseOptions.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ParseRequest {
    const message = { ...baseParseRequest } as ParseRequest;
    if (object.fileMap !== undefined && object.fileMap !== null) {
      message.fileMap = FileMap.fromJSON(object.fileMap);
    } else {
      message.fileMap = undefined;
    }
    if (object.options !== undefined && object.options !== null) {
      message.options = ParseOptions.fromJSON(object.options);
    } else {
      message.options = undefined;
    }
    return message;
  },

  toJSON(message: ParseRequest): unknown {
    const obj: any = {};
    message.fileMap !== undefined &&
      (obj.fileMap = message.fileMap
        ? FileMap.toJSON(message.fileMap)
        : undefined);
    message.options !== undefined &&
      (obj.options = message.options
        ? ParseOptions.toJSON(message.options)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<ParseRequest>): ParseRequest {
    const message = { ...baseParseRequest } as ParseRequest;
    if (object.fileMap !== undefined && object.fileMap !== null) {
      message.fileMap = FileMap.fromPartial(object.fileMap);
    } else {
      message.fileMap = undefined;
    }
    if (object.options !== undefined && object.options !== null) {
      message.options = ParseOptions.fromPartial(object.options);
    } else {
      message.options = undefined;
    }
    return message;
  },
};

const baseCompiledObject: object = { succeeded: false, objectName: "" };

export const CompiledObject = {
  encode(
    message: CompiledObject,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.succeeded === true) {
      writer.uint32(8).bool(message.succeeded);
    }
    if (message.objectName !== "") {
      writer.uint32(18).string(message.objectName);
    }
    if (message.xbytes.length !== 0) {
      writer.uint32(26).bytes(message.xbytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompiledObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCompiledObject } as CompiledObject;
    message.xbytes = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.succeeded = reader.bool();
          break;
        case 2:
          message.objectName = reader.string();
          break;
        case 3:
          message.xbytes = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CompiledObject {
    const message = { ...baseCompiledObject } as CompiledObject;
    message.xbytes = new Uint8Array();
    if (object.succeeded !== undefined && object.succeeded !== null) {
      message.succeeded = Boolean(object.succeeded);
    } else {
      message.succeeded = false;
    }
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = String(object.objectName);
    } else {
      message.objectName = "";
    }
    if (object.xbytes !== undefined && object.xbytes !== null) {
      message.xbytes = bytesFromBase64(object.xbytes);
    }
    return message;
  },

  toJSON(message: CompiledObject): unknown {
    const obj: any = {};
    message.succeeded !== undefined && (obj.succeeded = message.succeeded);
    message.objectName !== undefined && (obj.objectName = message.objectName);
    message.xbytes !== undefined &&
      (obj.xbytes = base64FromBytes(
        message.xbytes !== undefined ? message.xbytes : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<CompiledObject>): CompiledObject {
    const message = { ...baseCompiledObject } as CompiledObject;
    if (object.succeeded !== undefined && object.succeeded !== null) {
      message.succeeded = object.succeeded;
    } else {
      message.succeeded = false;
    }
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = object.objectName;
    } else {
      message.objectName = "";
    }
    if (object.xbytes !== undefined && object.xbytes !== null) {
      message.xbytes = object.xbytes;
    } else {
      message.xbytes = new Uint8Array();
    }
    return message;
  },
};

const baseCompiledAssembly: object = { succeeded: false };

export const CompiledAssembly = {
  encode(
    message: CompiledAssembly,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.succeeded === true) {
      writer.uint32(8).bool(message.succeeded);
    }
    for (const v of message.messages) {
      ExtendedAsmMessage.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.programBytes.length !== 0) {
      writer.uint32(26).bytes(message.programBytes);
    }
    for (const v of message.objects) {
      CompiledObject.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompiledAssembly {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCompiledAssembly } as CompiledAssembly;
    message.messages = [];
    message.objects = [];
    message.programBytes = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.succeeded = reader.bool();
          break;
        case 2:
          message.messages.push(
            ExtendedAsmMessage.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.programBytes = reader.bytes();
          break;
        case 4:
          message.objects.push(CompiledObject.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CompiledAssembly {
    const message = { ...baseCompiledAssembly } as CompiledAssembly;
    message.messages = [];
    message.objects = [];
    message.programBytes = new Uint8Array();
    if (object.succeeded !== undefined && object.succeeded !== null) {
      message.succeeded = Boolean(object.succeeded);
    } else {
      message.succeeded = false;
    }
    if (object.messages !== undefined && object.messages !== null) {
      for (const e of object.messages) {
        message.messages.push(ExtendedAsmMessage.fromJSON(e));
      }
    }
    if (object.programBytes !== undefined && object.programBytes !== null) {
      message.programBytes = bytesFromBase64(object.programBytes);
    }
    if (object.objects !== undefined && object.objects !== null) {
      for (const e of object.objects) {
        message.objects.push(CompiledObject.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: CompiledAssembly): unknown {
    const obj: any = {};
    message.succeeded !== undefined && (obj.succeeded = message.succeeded);
    if (message.messages) {
      obj.messages = message.messages.map((e) =>
        e ? ExtendedAsmMessage.toJSON(e) : undefined
      );
    } else {
      obj.messages = [];
    }
    message.programBytes !== undefined &&
      (obj.programBytes = base64FromBytes(
        message.programBytes !== undefined
          ? message.programBytes
          : new Uint8Array()
      ));
    if (message.objects) {
      obj.objects = message.objects.map((e) =>
        e ? CompiledObject.toJSON(e) : undefined
      );
    } else {
      obj.objects = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<CompiledAssembly>): CompiledAssembly {
    const message = { ...baseCompiledAssembly } as CompiledAssembly;
    message.messages = [];
    message.objects = [];
    if (object.succeeded !== undefined && object.succeeded !== null) {
      message.succeeded = object.succeeded;
    } else {
      message.succeeded = false;
    }
    if (object.messages !== undefined && object.messages !== null) {
      for (const e of object.messages) {
        message.messages.push(ExtendedAsmMessage.fromPartial(e));
      }
    }
    if (object.programBytes !== undefined && object.programBytes !== null) {
      message.programBytes = object.programBytes;
    } else {
      message.programBytes = new Uint8Array();
    }
    if (object.objects !== undefined && object.objects !== null) {
      for (const e of object.objects) {
        message.objects.push(CompiledObject.fromPartial(e));
      }
    }
    return message;
  },
};

const baseCompileRequest: object = {};

export const CompileRequest = {
  encode(
    message: CompileRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.fileMap !== undefined) {
      FileMap.encode(message.fileMap, writer.uint32(10).fork()).ldelim();
    }
    if (message.options !== undefined) {
      ParseOptions.encode(message.options, writer.uint32(18).fork()).ldelim();
    }
    if (message.entryPoint !== undefined) {
      AssemblyEntryPoint.encode(
        message.entryPoint,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompileRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCompileRequest } as CompileRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fileMap = FileMap.decode(reader, reader.uint32());
          break;
        case 2:
          message.options = ParseOptions.decode(reader, reader.uint32());
          break;
        case 3:
          message.entryPoint = AssemblyEntryPoint.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CompileRequest {
    const message = { ...baseCompileRequest } as CompileRequest;
    if (object.fileMap !== undefined && object.fileMap !== null) {
      message.fileMap = FileMap.fromJSON(object.fileMap);
    } else {
      message.fileMap = undefined;
    }
    if (object.options !== undefined && object.options !== null) {
      message.options = ParseOptions.fromJSON(object.options);
    } else {
      message.options = undefined;
    }
    if (object.entryPoint !== undefined && object.entryPoint !== null) {
      message.entryPoint = AssemblyEntryPoint.fromJSON(object.entryPoint);
    } else {
      message.entryPoint = undefined;
    }
    return message;
  },

  toJSON(message: CompileRequest): unknown {
    const obj: any = {};
    message.fileMap !== undefined &&
      (obj.fileMap = message.fileMap
        ? FileMap.toJSON(message.fileMap)
        : undefined);
    message.options !== undefined &&
      (obj.options = message.options
        ? ParseOptions.toJSON(message.options)
        : undefined);
    message.entryPoint !== undefined &&
      (obj.entryPoint = message.entryPoint
        ? AssemblyEntryPoint.toJSON(message.entryPoint)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<CompileRequest>): CompileRequest {
    const message = { ...baseCompileRequest } as CompileRequest;
    if (object.fileMap !== undefined && object.fileMap !== null) {
      message.fileMap = FileMap.fromPartial(object.fileMap);
    } else {
      message.fileMap = undefined;
    }
    if (object.options !== undefined && object.options !== null) {
      message.options = ParseOptions.fromPartial(object.options);
    } else {
      message.options = undefined;
    }
    if (object.entryPoint !== undefined && object.entryPoint !== null) {
      message.entryPoint = AssemblyEntryPoint.fromPartial(object.entryPoint);
    } else {
      message.entryPoint = undefined;
    }
    return message;
  },
};

const baseBuildOptionsInput: object = {};

export const BuildOptionsInput = {
  encode(
    message: BuildOptionsInput,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.treatOversizedInlineValuesAsWarnings !== undefined) {
      writer.uint32(8).bool(message.treatOversizedInlineValuesAsWarnings);
    }
    if (message.oversizedInlineValueSizing !== undefined) {
      writer.uint32(16).int32(message.oversizedInlineValueSizing);
    }
    if (message.useMockForExternalAddresses !== undefined) {
      writer.uint32(24).bool(message.useMockForExternalAddresses);
    }
    if (message.entryPoint !== undefined) {
      AssemblyEntryPoint.encode(
        message.entryPoint,
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.baseAddressOffset !== undefined) {
      writer.uint32(40).uint32(message.baseAddressOffset);
    }
    if (message.generateSourceMap !== undefined) {
      writer.uint32(48).bool(message.generateSourceMap);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BuildOptionsInput {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseBuildOptionsInput } as BuildOptionsInput;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.treatOversizedInlineValuesAsWarnings = reader.bool();
          break;
        case 2:
          message.oversizedInlineValueSizing = reader.int32() as any;
          break;
        case 3:
          message.useMockForExternalAddresses = reader.bool();
          break;
        case 4:
          message.entryPoint = AssemblyEntryPoint.decode(
            reader,
            reader.uint32()
          );
          break;
        case 5:
          message.baseAddressOffset = reader.uint32();
          break;
        case 6:
          message.generateSourceMap = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BuildOptionsInput {
    const message = { ...baseBuildOptionsInput } as BuildOptionsInput;
    if (
      object.treatOversizedInlineValuesAsWarnings !== undefined &&
      object.treatOversizedInlineValuesAsWarnings !== null
    ) {
      message.treatOversizedInlineValuesAsWarnings = Boolean(
        object.treatOversizedInlineValuesAsWarnings
      );
    } else {
      message.treatOversizedInlineValuesAsWarnings = undefined;
    }
    if (
      object.oversizedInlineValueSizing !== undefined &&
      object.oversizedInlineValueSizing !== null
    ) {
      message.oversizedInlineValueSizing = oversizedInlineValueSizingFromJSON(
        object.oversizedInlineValueSizing
      );
    } else {
      message.oversizedInlineValueSizing = undefined;
    }
    if (
      object.useMockForExternalAddresses !== undefined &&
      object.useMockForExternalAddresses !== null
    ) {
      message.useMockForExternalAddresses = Boolean(
        object.useMockForExternalAddresses
      );
    } else {
      message.useMockForExternalAddresses = undefined;
    }
    if (object.entryPoint !== undefined && object.entryPoint !== null) {
      message.entryPoint = AssemblyEntryPoint.fromJSON(object.entryPoint);
    } else {
      message.entryPoint = undefined;
    }
    if (
      object.baseAddressOffset !== undefined &&
      object.baseAddressOffset !== null
    ) {
      message.baseAddressOffset = Number(object.baseAddressOffset);
    } else {
      message.baseAddressOffset = undefined;
    }
    if (
      object.generateSourceMap !== undefined &&
      object.generateSourceMap !== null
    ) {
      message.generateSourceMap = Boolean(object.generateSourceMap);
    } else {
      message.generateSourceMap = undefined;
    }
    return message;
  },

  toJSON(message: BuildOptionsInput): unknown {
    const obj: any = {};
    message.treatOversizedInlineValuesAsWarnings !== undefined &&
      (obj.treatOversizedInlineValuesAsWarnings =
        message.treatOversizedInlineValuesAsWarnings);
    message.oversizedInlineValueSizing !== undefined &&
      (obj.oversizedInlineValueSizing =
        message.oversizedInlineValueSizing !== undefined
          ? oversizedInlineValueSizingToJSON(message.oversizedInlineValueSizing)
          : undefined);
    message.useMockForExternalAddresses !== undefined &&
      (obj.useMockForExternalAddresses = message.useMockForExternalAddresses);
    message.entryPoint !== undefined &&
      (obj.entryPoint = message.entryPoint
        ? AssemblyEntryPoint.toJSON(message.entryPoint)
        : undefined);
    message.baseAddressOffset !== undefined &&
      (obj.baseAddressOffset = message.baseAddressOffset);
    message.generateSourceMap !== undefined &&
      (obj.generateSourceMap = message.generateSourceMap);
    return obj;
  },

  fromPartial(object: DeepPartial<BuildOptionsInput>): BuildOptionsInput {
    const message = { ...baseBuildOptionsInput } as BuildOptionsInput;
    if (
      object.treatOversizedInlineValuesAsWarnings !== undefined &&
      object.treatOversizedInlineValuesAsWarnings !== null
    ) {
      message.treatOversizedInlineValuesAsWarnings =
        object.treatOversizedInlineValuesAsWarnings;
    } else {
      message.treatOversizedInlineValuesAsWarnings = undefined;
    }
    if (
      object.oversizedInlineValueSizing !== undefined &&
      object.oversizedInlineValueSizing !== null
    ) {
      message.oversizedInlineValueSizing = object.oversizedInlineValueSizing;
    } else {
      message.oversizedInlineValueSizing = undefined;
    }
    if (
      object.useMockForExternalAddresses !== undefined &&
      object.useMockForExternalAddresses !== null
    ) {
      message.useMockForExternalAddresses = object.useMockForExternalAddresses;
    } else {
      message.useMockForExternalAddresses = undefined;
    }
    if (object.entryPoint !== undefined && object.entryPoint !== null) {
      message.entryPoint = AssemblyEntryPoint.fromPartial(object.entryPoint);
    } else {
      message.entryPoint = undefined;
    }
    if (
      object.baseAddressOffset !== undefined &&
      object.baseAddressOffset !== null
    ) {
      message.baseAddressOffset = object.baseAddressOffset;
    } else {
      message.baseAddressOffset = undefined;
    }
    if (
      object.generateSourceMap !== undefined &&
      object.generateSourceMap !== null
    ) {
      message.generateSourceMap = object.generateSourceMap;
    } else {
      message.generateSourceMap = undefined;
    }
    return message;
  },
};

const baseAssemblyConstructDetails: object = {
  kind: 0,
  dataType: 0,
  nativeByteLength: 0,
  numericValue: 0,
};

export const AssemblyConstructDetails = {
  encode(
    message: AssemblyConstructDetails,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.kind !== 0) {
      writer.uint32(8).int32(message.kind);
    }
    if (message.dataType !== 0) {
      writer.uint32(16).int32(message.dataType);
    }
    if (message.nativeByteLength !== 0) {
      writer.uint32(24).sint32(message.nativeByteLength);
    }
    if (message.numericValue !== 0) {
      writer.uint32(32).uint32(message.numericValue);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AssemblyConstructDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseAssemblyConstructDetails,
    } as AssemblyConstructDetails;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.kind = reader.int32() as any;
          break;
        case 2:
          message.dataType = reader.int32() as any;
          break;
        case 3:
          message.nativeByteLength = reader.sint32();
          break;
        case 4:
          message.numericValue = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssemblyConstructDetails {
    const message = {
      ...baseAssemblyConstructDetails,
    } as AssemblyConstructDetails;
    if (object.kind !== undefined && object.kind !== null) {
      message.kind = languageConstructKindFromJSON(object.kind);
    } else {
      message.kind = 0;
    }
    if (object.dataType !== undefined && object.dataType !== null) {
      message.dataType = nativeDataTypeFromJSON(object.dataType);
    } else {
      message.dataType = 0;
    }
    if (
      object.nativeByteLength !== undefined &&
      object.nativeByteLength !== null
    ) {
      message.nativeByteLength = Number(object.nativeByteLength);
    } else {
      message.nativeByteLength = 0;
    }
    if (object.numericValue !== undefined && object.numericValue !== null) {
      message.numericValue = Number(object.numericValue);
    } else {
      message.numericValue = 0;
    }
    return message;
  },

  toJSON(message: AssemblyConstructDetails): unknown {
    const obj: any = {};
    message.kind !== undefined &&
      (obj.kind = languageConstructKindToJSON(message.kind));
    message.dataType !== undefined &&
      (obj.dataType = nativeDataTypeToJSON(message.dataType));
    message.nativeByteLength !== undefined &&
      (obj.nativeByteLength = message.nativeByteLength);
    message.numericValue !== undefined &&
      (obj.numericValue = message.numericValue);
    return obj;
  },

  fromPartial(
    object: DeepPartial<AssemblyConstructDetails>
  ): AssemblyConstructDetails {
    const message = {
      ...baseAssemblyConstructDetails,
    } as AssemblyConstructDetails;
    if (object.kind !== undefined && object.kind !== null) {
      message.kind = object.kind;
    } else {
      message.kind = 0;
    }
    if (object.dataType !== undefined && object.dataType !== null) {
      message.dataType = object.dataType;
    } else {
      message.dataType = 0;
    }
    if (
      object.nativeByteLength !== undefined &&
      object.nativeByteLength !== null
    ) {
      message.nativeByteLength = object.nativeByteLength;
    } else {
      message.nativeByteLength = 0;
    }
    if (object.numericValue !== undefined && object.numericValue !== null) {
      message.numericValue = object.numericValue;
    } else {
      message.numericValue = 0;
    }
    return message;
  },
};

const baseAssemblySourceEntity: object = {
  objectName: "",
  id: "",
  kind: 0,
  text: "",
  referencesToThis: "",
};

export const AssemblySourceEntity = {
  encode(
    message: AssemblySourceEntity,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.objectName !== "") {
      writer.uint32(10).string(message.objectName);
    }
    if (message.id !== "") {
      writer.uint32(18).string(message.id);
    }
    if (message.lineIndex !== undefined) {
      writer.uint32(24).uint32(message.lineIndex);
    }
    if (message.startPosition !== undefined) {
      writer.uint32(32).uint32(message.startPosition);
    }
    if (message.endPosition !== undefined) {
      writer.uint32(40).uint32(message.endPosition);
    }
    if (message.kind !== 0) {
      writer.uint32(48).int32(message.kind);
    }
    if (message.text !== "") {
      writer.uint32(58).string(message.text);
    }
    if (message.constructDetails !== undefined) {
      AssemblyConstructDetails.encode(
        message.constructDetails,
        writer.uint32(66).fork()
      ).ldelim();
    }
    if (message.group !== undefined) {
      writer.uint32(74).string(message.group);
    }
    for (const v of message.referencesToThis) {
      writer.uint32(82).string(v!);
    }
    for (const v of message.messages) {
      ExtendedAsmMessage.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AssemblySourceEntity {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseAssemblySourceEntity } as AssemblySourceEntity;
    message.referencesToThis = [];
    message.messages = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.objectName = reader.string();
          break;
        case 2:
          message.id = reader.string();
          break;
        case 3:
          message.lineIndex = reader.uint32();
          break;
        case 4:
          message.startPosition = reader.uint32();
          break;
        case 5:
          message.endPosition = reader.uint32();
          break;
        case 6:
          message.kind = reader.int32() as any;
          break;
        case 7:
          message.text = reader.string();
          break;
        case 8:
          message.constructDetails = AssemblyConstructDetails.decode(
            reader,
            reader.uint32()
          );
          break;
        case 9:
          message.group = reader.string();
          break;
        case 10:
          message.referencesToThis.push(reader.string());
          break;
        case 11:
          message.messages.push(
            ExtendedAsmMessage.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssemblySourceEntity {
    const message = { ...baseAssemblySourceEntity } as AssemblySourceEntity;
    message.referencesToThis = [];
    message.messages = [];
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = String(object.objectName);
    } else {
      message.objectName = "";
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = String(object.id);
    } else {
      message.id = "";
    }
    if (object.lineIndex !== undefined && object.lineIndex !== null) {
      message.lineIndex = Number(object.lineIndex);
    } else {
      message.lineIndex = undefined;
    }
    if (object.startPosition !== undefined && object.startPosition !== null) {
      message.startPosition = Number(object.startPosition);
    } else {
      message.startPosition = undefined;
    }
    if (object.endPosition !== undefined && object.endPosition !== null) {
      message.endPosition = Number(object.endPosition);
    } else {
      message.endPosition = undefined;
    }
    if (object.kind !== undefined && object.kind !== null) {
      message.kind = sourceEntityKindFromJSON(object.kind);
    } else {
      message.kind = 0;
    }
    if (object.text !== undefined && object.text !== null) {
      message.text = String(object.text);
    } else {
      message.text = "";
    }
    if (
      object.constructDetails !== undefined &&
      object.constructDetails !== null
    ) {
      message.constructDetails = AssemblyConstructDetails.fromJSON(
        object.constructDetails
      );
    } else {
      message.constructDetails = undefined;
    }
    if (object.group !== undefined && object.group !== null) {
      message.group = String(object.group);
    } else {
      message.group = undefined;
    }
    if (
      object.referencesToThis !== undefined &&
      object.referencesToThis !== null
    ) {
      for (const e of object.referencesToThis) {
        message.referencesToThis.push(String(e));
      }
    }
    if (object.messages !== undefined && object.messages !== null) {
      for (const e of object.messages) {
        message.messages.push(ExtendedAsmMessage.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: AssemblySourceEntity): unknown {
    const obj: any = {};
    message.objectName !== undefined && (obj.objectName = message.objectName);
    message.id !== undefined && (obj.id = message.id);
    message.lineIndex !== undefined && (obj.lineIndex = message.lineIndex);
    message.startPosition !== undefined &&
      (obj.startPosition = message.startPosition);
    message.endPosition !== undefined &&
      (obj.endPosition = message.endPosition);
    message.kind !== undefined &&
      (obj.kind = sourceEntityKindToJSON(message.kind));
    message.text !== undefined && (obj.text = message.text);
    message.constructDetails !== undefined &&
      (obj.constructDetails = message.constructDetails
        ? AssemblyConstructDetails.toJSON(message.constructDetails)
        : undefined);
    message.group !== undefined && (obj.group = message.group);
    if (message.referencesToThis) {
      obj.referencesToThis = message.referencesToThis.map((e) => e);
    } else {
      obj.referencesToThis = [];
    }
    if (message.messages) {
      obj.messages = message.messages.map((e) =>
        e ? ExtendedAsmMessage.toJSON(e) : undefined
      );
    } else {
      obj.messages = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<AssemblySourceEntity>): AssemblySourceEntity {
    const message = { ...baseAssemblySourceEntity } as AssemblySourceEntity;
    message.referencesToThis = [];
    message.messages = [];
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = object.objectName;
    } else {
      message.objectName = "";
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    } else {
      message.id = "";
    }
    if (object.lineIndex !== undefined && object.lineIndex !== null) {
      message.lineIndex = object.lineIndex;
    } else {
      message.lineIndex = undefined;
    }
    if (object.startPosition !== undefined && object.startPosition !== null) {
      message.startPosition = object.startPosition;
    } else {
      message.startPosition = undefined;
    }
    if (object.endPosition !== undefined && object.endPosition !== null) {
      message.endPosition = object.endPosition;
    } else {
      message.endPosition = undefined;
    }
    if (object.kind !== undefined && object.kind !== null) {
      message.kind = object.kind;
    } else {
      message.kind = 0;
    }
    if (object.text !== undefined && object.text !== null) {
      message.text = object.text;
    } else {
      message.text = "";
    }
    if (
      object.constructDetails !== undefined &&
      object.constructDetails !== null
    ) {
      message.constructDetails = AssemblyConstructDetails.fromPartial(
        object.constructDetails
      );
    } else {
      message.constructDetails = undefined;
    }
    if (object.group !== undefined && object.group !== null) {
      message.group = object.group;
    } else {
      message.group = undefined;
    }
    if (
      object.referencesToThis !== undefined &&
      object.referencesToThis !== null
    ) {
      for (const e of object.referencesToThis) {
        message.referencesToThis.push(e);
      }
    }
    if (object.messages !== undefined && object.messages !== null) {
      for (const e of object.messages) {
        message.messages.push(ExtendedAsmMessage.fromPartial(e));
      }
    }
    return message;
  },
};

const baseAssemblySourceLine: object = { objectName: "", lineIndex: 0 };

export const AssemblySourceLine = {
  encode(
    message: AssemblySourceLine,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.objectName !== "") {
      writer.uint32(10).string(message.objectName);
    }
    if (message.lineIndex !== 0) {
      writer.uint32(16).uint32(message.lineIndex);
    }
    for (const v of message.entities) {
      AssemblySourceEntity.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AssemblySourceLine {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseAssemblySourceLine } as AssemblySourceLine;
    message.entities = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.objectName = reader.string();
          break;
        case 2:
          message.lineIndex = reader.uint32();
          break;
        case 3:
          message.entities.push(
            AssemblySourceEntity.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssemblySourceLine {
    const message = { ...baseAssemblySourceLine } as AssemblySourceLine;
    message.entities = [];
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = String(object.objectName);
    } else {
      message.objectName = "";
    }
    if (object.lineIndex !== undefined && object.lineIndex !== null) {
      message.lineIndex = Number(object.lineIndex);
    } else {
      message.lineIndex = 0;
    }
    if (object.entities !== undefined && object.entities !== null) {
      for (const e of object.entities) {
        message.entities.push(AssemblySourceEntity.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: AssemblySourceLine): unknown {
    const obj: any = {};
    message.objectName !== undefined && (obj.objectName = message.objectName);
    message.lineIndex !== undefined && (obj.lineIndex = message.lineIndex);
    if (message.entities) {
      obj.entities = message.entities.map((e) =>
        e ? AssemblySourceEntity.toJSON(e) : undefined
      );
    } else {
      obj.entities = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<AssemblySourceLine>): AssemblySourceLine {
    const message = { ...baseAssemblySourceLine } as AssemblySourceLine;
    message.entities = [];
    if (object.objectName !== undefined && object.objectName !== null) {
      message.objectName = object.objectName;
    } else {
      message.objectName = "";
    }
    if (object.lineIndex !== undefined && object.lineIndex !== null) {
      message.lineIndex = object.lineIndex;
    } else {
      message.lineIndex = 0;
    }
    if (object.entities !== undefined && object.entities !== null) {
      for (const e of object.entities) {
        message.entities.push(AssemblySourceEntity.fromPartial(e));
      }
    }
    return message;
  },
};

const baseAssemblySourceMap: object = { HasErrors: false };

export const AssemblySourceMap = {
  encode(
    message: AssemblySourceMap,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.LINES) {
      AssemblySourceLine.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.HasErrors === true) {
      writer.uint32(16).bool(message.HasErrors);
    }
    for (const v of message.MESSAGES) {
      ExtendedAsmMessage.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AssemblySourceMap {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseAssemblySourceMap } as AssemblySourceMap;
    message.LINES = [];
    message.MESSAGES = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.LINES.push(
            AssemblySourceLine.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.HasErrors = reader.bool();
          break;
        case 3:
          message.MESSAGES.push(
            ExtendedAsmMessage.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssemblySourceMap {
    const message = { ...baseAssemblySourceMap } as AssemblySourceMap;
    message.LINES = [];
    message.MESSAGES = [];
    if (object.LINES !== undefined && object.LINES !== null) {
      for (const e of object.LINES) {
        message.LINES.push(AssemblySourceLine.fromJSON(e));
      }
    }
    if (object.HasErrors !== undefined && object.HasErrors !== null) {
      message.HasErrors = Boolean(object.HasErrors);
    } else {
      message.HasErrors = false;
    }
    if (object.MESSAGES !== undefined && object.MESSAGES !== null) {
      for (const e of object.MESSAGES) {
        message.MESSAGES.push(ExtendedAsmMessage.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: AssemblySourceMap): unknown {
    const obj: any = {};
    if (message.LINES) {
      obj.LINES = message.LINES.map((e) =>
        e ? AssemblySourceLine.toJSON(e) : undefined
      );
    } else {
      obj.LINES = [];
    }
    message.HasErrors !== undefined && (obj.HasErrors = message.HasErrors);
    if (message.MESSAGES) {
      obj.MESSAGES = message.MESSAGES.map((e) =>
        e ? ExtendedAsmMessage.toJSON(e) : undefined
      );
    } else {
      obj.MESSAGES = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<AssemblySourceMap>): AssemblySourceMap {
    const message = { ...baseAssemblySourceMap } as AssemblySourceMap;
    message.LINES = [];
    message.MESSAGES = [];
    if (object.LINES !== undefined && object.LINES !== null) {
      for (const e of object.LINES) {
        message.LINES.push(AssemblySourceLine.fromPartial(e));
      }
    }
    if (object.HasErrors !== undefined && object.HasErrors !== null) {
      message.HasErrors = object.HasErrors;
    } else {
      message.HasErrors = false;
    }
    if (object.MESSAGES !== undefined && object.MESSAGES !== null) {
      for (const e of object.MESSAGES) {
        message.MESSAGES.push(ExtendedAsmMessage.fromPartial(e));
      }
    }
    return message;
  },
};

const baseAlliumAssembly: object = { buildSucceeded: false, totalByteCount: 0 };

export const AlliumAssembly = {
  encode(
    message: AlliumAssembly,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.buildSucceeded === true) {
      writer.uint32(8).bool(message.buildSucceeded);
    }
    for (const v of message.messages) {
      ExtendedAsmMessage.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.totalByteCount !== 0) {
      writer.uint32(24).uint32(message.totalByteCount);
    }
    if (message.compilation !== undefined) {
      CompiledAssembly.encode(
        message.compilation,
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.sourceMap !== undefined) {
      AssemblySourceMap.encode(
        message.sourceMap,
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AlliumAssembly {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseAlliumAssembly } as AlliumAssembly;
    message.messages = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.buildSucceeded = reader.bool();
          break;
        case 2:
          message.messages.push(
            ExtendedAsmMessage.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.totalByteCount = reader.uint32();
          break;
        case 4:
          message.compilation = CompiledAssembly.decode(
            reader,
            reader.uint32()
          );
          break;
        case 5:
          message.sourceMap = AssemblySourceMap.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AlliumAssembly {
    const message = { ...baseAlliumAssembly } as AlliumAssembly;
    message.messages = [];
    if (object.buildSucceeded !== undefined && object.buildSucceeded !== null) {
      message.buildSucceeded = Boolean(object.buildSucceeded);
    } else {
      message.buildSucceeded = false;
    }
    if (object.messages !== undefined && object.messages !== null) {
      for (const e of object.messages) {
        message.messages.push(ExtendedAsmMessage.fromJSON(e));
      }
    }
    if (object.totalByteCount !== undefined && object.totalByteCount !== null) {
      message.totalByteCount = Number(object.totalByteCount);
    } else {
      message.totalByteCount = 0;
    }
    if (object.compilation !== undefined && object.compilation !== null) {
      message.compilation = CompiledAssembly.fromJSON(object.compilation);
    } else {
      message.compilation = undefined;
    }
    if (object.sourceMap !== undefined && object.sourceMap !== null) {
      message.sourceMap = AssemblySourceMap.fromJSON(object.sourceMap);
    } else {
      message.sourceMap = undefined;
    }
    return message;
  },

  toJSON(message: AlliumAssembly): unknown {
    const obj: any = {};
    message.buildSucceeded !== undefined &&
      (obj.buildSucceeded = message.buildSucceeded);
    if (message.messages) {
      obj.messages = message.messages.map((e) =>
        e ? ExtendedAsmMessage.toJSON(e) : undefined
      );
    } else {
      obj.messages = [];
    }
    message.totalByteCount !== undefined &&
      (obj.totalByteCount = message.totalByteCount);
    message.compilation !== undefined &&
      (obj.compilation = message.compilation
        ? CompiledAssembly.toJSON(message.compilation)
        : undefined);
    message.sourceMap !== undefined &&
      (obj.sourceMap = message.sourceMap
        ? AssemblySourceMap.toJSON(message.sourceMap)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<AlliumAssembly>): AlliumAssembly {
    const message = { ...baseAlliumAssembly } as AlliumAssembly;
    message.messages = [];
    if (object.buildSucceeded !== undefined && object.buildSucceeded !== null) {
      message.buildSucceeded = object.buildSucceeded;
    } else {
      message.buildSucceeded = false;
    }
    if (object.messages !== undefined && object.messages !== null) {
      for (const e of object.messages) {
        message.messages.push(ExtendedAsmMessage.fromPartial(e));
      }
    }
    if (object.totalByteCount !== undefined && object.totalByteCount !== null) {
      message.totalByteCount = object.totalByteCount;
    } else {
      message.totalByteCount = 0;
    }
    if (object.compilation !== undefined && object.compilation !== null) {
      message.compilation = CompiledAssembly.fromPartial(object.compilation);
    } else {
      message.compilation = undefined;
    }
    if (object.sourceMap !== undefined && object.sourceMap !== null) {
      message.sourceMap = AssemblySourceMap.fromPartial(object.sourceMap);
    } else {
      message.sourceMap = undefined;
    }
    return message;
  },
};

const baseBuildRequest: object = {};

export const BuildRequest = {
  encode(
    message: BuildRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.fileMap !== undefined) {
      FileMap.encode(message.fileMap, writer.uint32(10).fork()).ldelim();
    }
    if (message.options !== undefined) {
      BuildOptionsInput.encode(
        message.options,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BuildRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseBuildRequest } as BuildRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fileMap = FileMap.decode(reader, reader.uint32());
          break;
        case 2:
          message.options = BuildOptionsInput.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BuildRequest {
    const message = { ...baseBuildRequest } as BuildRequest;
    if (object.fileMap !== undefined && object.fileMap !== null) {
      message.fileMap = FileMap.fromJSON(object.fileMap);
    } else {
      message.fileMap = undefined;
    }
    if (object.options !== undefined && object.options !== null) {
      message.options = BuildOptionsInput.fromJSON(object.options);
    } else {
      message.options = undefined;
    }
    return message;
  },

  toJSON(message: BuildRequest): unknown {
    const obj: any = {};
    message.fileMap !== undefined &&
      (obj.fileMap = message.fileMap
        ? FileMap.toJSON(message.fileMap)
        : undefined);
    message.options !== undefined &&
      (obj.options = message.options
        ? BuildOptionsInput.toJSON(message.options)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<BuildRequest>): BuildRequest {
    const message = { ...baseBuildRequest } as BuildRequest;
    if (object.fileMap !== undefined && object.fileMap !== null) {
      message.fileMap = FileMap.fromPartial(object.fileMap);
    } else {
      message.fileMap = undefined;
    }
    if (object.options !== undefined && object.options !== null) {
      message.options = BuildOptionsInput.fromPartial(object.options);
    } else {
      message.options = undefined;
    }
    return message;
  },
};

const baseBaseDeviceProfile: object = {
  primaryDeviceIdentifier: 0,
  secondaryDeviceIdentifier: 0,
  clientToHostBufferSize: 0,
  hostToClientBufferSize: 0,
  serviceClass: 0,
  extendedServiceClass: 0,
};

export const BaseDeviceProfile = {
  encode(
    message: BaseDeviceProfile,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.primaryDeviceIdentifier !== 0) {
      writer.uint32(8).uint32(message.primaryDeviceIdentifier);
    }
    if (message.secondaryDeviceIdentifier !== 0) {
      writer.uint32(16).uint32(message.secondaryDeviceIdentifier);
    }
    if (message.clientToHostBufferSize !== 0) {
      writer.uint32(24).uint32(message.clientToHostBufferSize);
    }
    if (message.hostToClientBufferSize !== 0) {
      writer.uint32(32).uint32(message.hostToClientBufferSize);
    }
    if (message.serviceClass !== 0) {
      writer.uint32(40).int32(message.serviceClass);
    }
    if (message.extendedServiceClass !== 0) {
      writer.uint32(48).uint32(message.extendedServiceClass);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BaseDeviceProfile {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseBaseDeviceProfile } as BaseDeviceProfile;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.primaryDeviceIdentifier = reader.uint32();
          break;
        case 2:
          message.secondaryDeviceIdentifier = reader.uint32();
          break;
        case 3:
          message.clientToHostBufferSize = reader.uint32();
          break;
        case 4:
          message.hostToClientBufferSize = reader.uint32();
          break;
        case 5:
          message.serviceClass = reader.int32() as any;
          break;
        case 6:
          message.extendedServiceClass = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BaseDeviceProfile {
    const message = { ...baseBaseDeviceProfile } as BaseDeviceProfile;
    if (
      object.primaryDeviceIdentifier !== undefined &&
      object.primaryDeviceIdentifier !== null
    ) {
      message.primaryDeviceIdentifier = Number(object.primaryDeviceIdentifier);
    } else {
      message.primaryDeviceIdentifier = 0;
    }
    if (
      object.secondaryDeviceIdentifier !== undefined &&
      object.secondaryDeviceIdentifier !== null
    ) {
      message.secondaryDeviceIdentifier = Number(
        object.secondaryDeviceIdentifier
      );
    } else {
      message.secondaryDeviceIdentifier = 0;
    }
    if (
      object.clientToHostBufferSize !== undefined &&
      object.clientToHostBufferSize !== null
    ) {
      message.clientToHostBufferSize = Number(object.clientToHostBufferSize);
    } else {
      message.clientToHostBufferSize = 0;
    }
    if (
      object.hostToClientBufferSize !== undefined &&
      object.hostToClientBufferSize !== null
    ) {
      message.hostToClientBufferSize = Number(object.hostToClientBufferSize);
    } else {
      message.hostToClientBufferSize = 0;
    }
    if (object.serviceClass !== undefined && object.serviceClass !== null) {
      message.serviceClass = deviceServiceClassFromJSON(object.serviceClass);
    } else {
      message.serviceClass = 0;
    }
    if (
      object.extendedServiceClass !== undefined &&
      object.extendedServiceClass !== null
    ) {
      message.extendedServiceClass = Number(object.extendedServiceClass);
    } else {
      message.extendedServiceClass = 0;
    }
    return message;
  },

  toJSON(message: BaseDeviceProfile): unknown {
    const obj: any = {};
    message.primaryDeviceIdentifier !== undefined &&
      (obj.primaryDeviceIdentifier = message.primaryDeviceIdentifier);
    message.secondaryDeviceIdentifier !== undefined &&
      (obj.secondaryDeviceIdentifier = message.secondaryDeviceIdentifier);
    message.clientToHostBufferSize !== undefined &&
      (obj.clientToHostBufferSize = message.clientToHostBufferSize);
    message.hostToClientBufferSize !== undefined &&
      (obj.hostToClientBufferSize = message.hostToClientBufferSize);
    message.serviceClass !== undefined &&
      (obj.serviceClass = deviceServiceClassToJSON(message.serviceClass));
    message.extendedServiceClass !== undefined &&
      (obj.extendedServiceClass = message.extendedServiceClass);
    return obj;
  },

  fromPartial(object: DeepPartial<BaseDeviceProfile>): BaseDeviceProfile {
    const message = { ...baseBaseDeviceProfile } as BaseDeviceProfile;
    if (
      object.primaryDeviceIdentifier !== undefined &&
      object.primaryDeviceIdentifier !== null
    ) {
      message.primaryDeviceIdentifier = object.primaryDeviceIdentifier;
    } else {
      message.primaryDeviceIdentifier = 0;
    }
    if (
      object.secondaryDeviceIdentifier !== undefined &&
      object.secondaryDeviceIdentifier !== null
    ) {
      message.secondaryDeviceIdentifier = object.secondaryDeviceIdentifier;
    } else {
      message.secondaryDeviceIdentifier = 0;
    }
    if (
      object.clientToHostBufferSize !== undefined &&
      object.clientToHostBufferSize !== null
    ) {
      message.clientToHostBufferSize = object.clientToHostBufferSize;
    } else {
      message.clientToHostBufferSize = 0;
    }
    if (
      object.hostToClientBufferSize !== undefined &&
      object.hostToClientBufferSize !== null
    ) {
      message.hostToClientBufferSize = object.hostToClientBufferSize;
    } else {
      message.hostToClientBufferSize = 0;
    }
    if (object.serviceClass !== undefined && object.serviceClass !== null) {
      message.serviceClass = object.serviceClass;
    } else {
      message.serviceClass = 0;
    }
    if (
      object.extendedServiceClass !== undefined &&
      object.extendedServiceClass !== null
    ) {
      message.extendedServiceClass = object.extendedServiceClass;
    } else {
      message.extendedServiceClass = 0;
    }
    return message;
  },
};

const baseBaseDeviceMetadata: object = {
  developerId: "",
  categoryKey: "",
  humanReadableDeviceName: "",
};

export const BaseDeviceMetadata = {
  encode(
    message: BaseDeviceMetadata,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.developerId !== "") {
      writer.uint32(10).string(message.developerId);
    }
    if (message.categoryKey !== "") {
      writer.uint32(18).string(message.categoryKey);
    }
    if (message.humanReadableDeviceName !== "") {
      writer.uint32(26).string(message.humanReadableDeviceName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BaseDeviceMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseBaseDeviceMetadata } as BaseDeviceMetadata;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.developerId = reader.string();
          break;
        case 2:
          message.categoryKey = reader.string();
          break;
        case 3:
          message.humanReadableDeviceName = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BaseDeviceMetadata {
    const message = { ...baseBaseDeviceMetadata } as BaseDeviceMetadata;
    if (object.developerId !== undefined && object.developerId !== null) {
      message.developerId = String(object.developerId);
    } else {
      message.developerId = "";
    }
    if (object.categoryKey !== undefined && object.categoryKey !== null) {
      message.categoryKey = String(object.categoryKey);
    } else {
      message.categoryKey = "";
    }
    if (
      object.humanReadableDeviceName !== undefined &&
      object.humanReadableDeviceName !== null
    ) {
      message.humanReadableDeviceName = String(object.humanReadableDeviceName);
    } else {
      message.humanReadableDeviceName = "";
    }
    return message;
  },

  toJSON(message: BaseDeviceMetadata): unknown {
    const obj: any = {};
    message.developerId !== undefined &&
      (obj.developerId = message.developerId);
    message.categoryKey !== undefined &&
      (obj.categoryKey = message.categoryKey);
    message.humanReadableDeviceName !== undefined &&
      (obj.humanReadableDeviceName = message.humanReadableDeviceName);
    return obj;
  },

  fromPartial(object: DeepPartial<BaseDeviceMetadata>): BaseDeviceMetadata {
    const message = { ...baseBaseDeviceMetadata } as BaseDeviceMetadata;
    if (object.developerId !== undefined && object.developerId !== null) {
      message.developerId = object.developerId;
    } else {
      message.developerId = "";
    }
    if (object.categoryKey !== undefined && object.categoryKey !== null) {
      message.categoryKey = object.categoryKey;
    } else {
      message.categoryKey = "";
    }
    if (
      object.humanReadableDeviceName !== undefined &&
      object.humanReadableDeviceName !== null
    ) {
      message.humanReadableDeviceName = object.humanReadableDeviceName;
    } else {
      message.humanReadableDeviceName = "";
    }
    return message;
  },
};

const baseBaseDeviceBundle: object = { bundleId: "" };

export const BaseDeviceBundle = {
  encode(
    message: BaseDeviceBundle,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.bundleId !== "") {
      writer.uint32(10).string(message.bundleId);
    }
    if (message.profile !== undefined) {
      BaseDeviceProfile.encode(
        message.profile,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.metadata !== undefined) {
      BaseDeviceMetadata.encode(
        message.metadata,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BaseDeviceBundle {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseBaseDeviceBundle } as BaseDeviceBundle;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bundleId = reader.string();
          break;
        case 2:
          message.profile = BaseDeviceProfile.decode(reader, reader.uint32());
          break;
        case 3:
          message.metadata = BaseDeviceMetadata.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BaseDeviceBundle {
    const message = { ...baseBaseDeviceBundle } as BaseDeviceBundle;
    if (object.bundleId !== undefined && object.bundleId !== null) {
      message.bundleId = String(object.bundleId);
    } else {
      message.bundleId = "";
    }
    if (object.profile !== undefined && object.profile !== null) {
      message.profile = BaseDeviceProfile.fromJSON(object.profile);
    } else {
      message.profile = undefined;
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = BaseDeviceMetadata.fromJSON(object.metadata);
    } else {
      message.metadata = undefined;
    }
    return message;
  },

  toJSON(message: BaseDeviceBundle): unknown {
    const obj: any = {};
    message.bundleId !== undefined && (obj.bundleId = message.bundleId);
    message.profile !== undefined &&
      (obj.profile = message.profile
        ? BaseDeviceProfile.toJSON(message.profile)
        : undefined);
    message.metadata !== undefined &&
      (obj.metadata = message.metadata
        ? BaseDeviceMetadata.toJSON(message.metadata)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<BaseDeviceBundle>): BaseDeviceBundle {
    const message = { ...baseBaseDeviceBundle } as BaseDeviceBundle;
    if (object.bundleId !== undefined && object.bundleId !== null) {
      message.bundleId = object.bundleId;
    } else {
      message.bundleId = "";
    }
    if (object.profile !== undefined && object.profile !== null) {
      message.profile = BaseDeviceProfile.fromPartial(object.profile);
    } else {
      message.profile = undefined;
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = BaseDeviceMetadata.fromPartial(object.metadata);
    } else {
      message.metadata = undefined;
    }
    return message;
  },
};

const baseAlliumWorksDeviceSizePreference: object = { amount: 0, units: 0 };

export const AlliumWorksDeviceSizePreference = {
  encode(
    message: AlliumWorksDeviceSizePreference,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.amount !== 0) {
      writer.uint32(8).uint32(message.amount);
    }
    if (message.units !== 0) {
      writer.uint32(16).int32(message.units);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AlliumWorksDeviceSizePreference {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseAlliumWorksDeviceSizePreference,
    } as AlliumWorksDeviceSizePreference;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.amount = reader.uint32();
          break;
        case 2:
          message.units = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AlliumWorksDeviceSizePreference {
    const message = {
      ...baseAlliumWorksDeviceSizePreference,
    } as AlliumWorksDeviceSizePreference;
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Number(object.amount);
    } else {
      message.amount = 0;
    }
    if (object.units !== undefined && object.units !== null) {
      message.units = alliumWorksDeviceSizePreferenceUnitFromJSON(object.units);
    } else {
      message.units = 0;
    }
    return message;
  },

  toJSON(message: AlliumWorksDeviceSizePreference): unknown {
    const obj: any = {};
    message.amount !== undefined && (obj.amount = message.amount);
    message.units !== undefined &&
      (obj.units = alliumWorksDeviceSizePreferenceUnitToJSON(message.units));
    return obj;
  },

  fromPartial(
    object: DeepPartial<AlliumWorksDeviceSizePreference>
  ): AlliumWorksDeviceSizePreference {
    const message = {
      ...baseAlliumWorksDeviceSizePreference,
    } as AlliumWorksDeviceSizePreference;
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    } else {
      message.amount = 0;
    }
    if (object.units !== undefined && object.units !== null) {
      message.units = object.units;
    } else {
      message.units = 0;
    }
    return message;
  },
};

const baseAlliumWorksDeviceMetadata: object = {
  developerId: "",
  categoryKey: "",
  humanReadableDeviceName: "",
};

export const AlliumWorksDeviceMetadata = {
  encode(
    message: AlliumWorksDeviceMetadata,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.developerId !== "") {
      writer.uint32(10).string(message.developerId);
    }
    if (message.categoryKey !== "") {
      writer.uint32(18).string(message.categoryKey);
    }
    if (message.humanReadableDeviceName !== "") {
      writer.uint32(26).string(message.humanReadableDeviceName);
    }
    if (message.preferredWidth !== undefined) {
      AlliumWorksDeviceSizePreference.encode(
        message.preferredWidth,
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.preferredHeight !== undefined) {
      AlliumWorksDeviceSizePreference.encode(
        message.preferredHeight,
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AlliumWorksDeviceMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseAlliumWorksDeviceMetadata,
    } as AlliumWorksDeviceMetadata;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.developerId = reader.string();
          break;
        case 2:
          message.categoryKey = reader.string();
          break;
        case 3:
          message.humanReadableDeviceName = reader.string();
          break;
        case 4:
          message.preferredWidth = AlliumWorksDeviceSizePreference.decode(
            reader,
            reader.uint32()
          );
          break;
        case 5:
          message.preferredHeight = AlliumWorksDeviceSizePreference.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AlliumWorksDeviceMetadata {
    const message = {
      ...baseAlliumWorksDeviceMetadata,
    } as AlliumWorksDeviceMetadata;
    if (object.developerId !== undefined && object.developerId !== null) {
      message.developerId = String(object.developerId);
    } else {
      message.developerId = "";
    }
    if (object.categoryKey !== undefined && object.categoryKey !== null) {
      message.categoryKey = String(object.categoryKey);
    } else {
      message.categoryKey = "";
    }
    if (
      object.humanReadableDeviceName !== undefined &&
      object.humanReadableDeviceName !== null
    ) {
      message.humanReadableDeviceName = String(object.humanReadableDeviceName);
    } else {
      message.humanReadableDeviceName = "";
    }
    if (object.preferredWidth !== undefined && object.preferredWidth !== null) {
      message.preferredWidth = AlliumWorksDeviceSizePreference.fromJSON(
        object.preferredWidth
      );
    } else {
      message.preferredWidth = undefined;
    }
    if (
      object.preferredHeight !== undefined &&
      object.preferredHeight !== null
    ) {
      message.preferredHeight = AlliumWorksDeviceSizePreference.fromJSON(
        object.preferredHeight
      );
    } else {
      message.preferredHeight = undefined;
    }
    return message;
  },

  toJSON(message: AlliumWorksDeviceMetadata): unknown {
    const obj: any = {};
    message.developerId !== undefined &&
      (obj.developerId = message.developerId);
    message.categoryKey !== undefined &&
      (obj.categoryKey = message.categoryKey);
    message.humanReadableDeviceName !== undefined &&
      (obj.humanReadableDeviceName = message.humanReadableDeviceName);
    message.preferredWidth !== undefined &&
      (obj.preferredWidth = message.preferredWidth
        ? AlliumWorksDeviceSizePreference.toJSON(message.preferredWidth)
        : undefined);
    message.preferredHeight !== undefined &&
      (obj.preferredHeight = message.preferredHeight
        ? AlliumWorksDeviceSizePreference.toJSON(message.preferredHeight)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<AlliumWorksDeviceMetadata>
  ): AlliumWorksDeviceMetadata {
    const message = {
      ...baseAlliumWorksDeviceMetadata,
    } as AlliumWorksDeviceMetadata;
    if (object.developerId !== undefined && object.developerId !== null) {
      message.developerId = object.developerId;
    } else {
      message.developerId = "";
    }
    if (object.categoryKey !== undefined && object.categoryKey !== null) {
      message.categoryKey = object.categoryKey;
    } else {
      message.categoryKey = "";
    }
    if (
      object.humanReadableDeviceName !== undefined &&
      object.humanReadableDeviceName !== null
    ) {
      message.humanReadableDeviceName = object.humanReadableDeviceName;
    } else {
      message.humanReadableDeviceName = "";
    }
    if (object.preferredWidth !== undefined && object.preferredWidth !== null) {
      message.preferredWidth = AlliumWorksDeviceSizePreference.fromPartial(
        object.preferredWidth
      );
    } else {
      message.preferredWidth = undefined;
    }
    if (
      object.preferredHeight !== undefined &&
      object.preferredHeight !== null
    ) {
      message.preferredHeight = AlliumWorksDeviceSizePreference.fromPartial(
        object.preferredHeight
      );
    } else {
      message.preferredHeight = undefined;
    }
    return message;
  },
};

const baseAlliumWorksDeviceReadmeSection: object = {
  title: "",
  order: 0,
  paragraphs: "",
};

export const AlliumWorksDeviceReadmeSection = {
  encode(
    message: AlliumWorksDeviceReadmeSection,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.order !== 0) {
      writer.uint32(16).uint32(message.order);
    }
    for (const v of message.paragraphs) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AlliumWorksDeviceReadmeSection {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseAlliumWorksDeviceReadmeSection,
    } as AlliumWorksDeviceReadmeSection;
    message.paragraphs = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.order = reader.uint32();
          break;
        case 3:
          message.paragraphs.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AlliumWorksDeviceReadmeSection {
    const message = {
      ...baseAlliumWorksDeviceReadmeSection,
    } as AlliumWorksDeviceReadmeSection;
    message.paragraphs = [];
    if (object.title !== undefined && object.title !== null) {
      message.title = String(object.title);
    } else {
      message.title = "";
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = Number(object.order);
    } else {
      message.order = 0;
    }
    if (object.paragraphs !== undefined && object.paragraphs !== null) {
      for (const e of object.paragraphs) {
        message.paragraphs.push(String(e));
      }
    }
    return message;
  },

  toJSON(message: AlliumWorksDeviceReadmeSection): unknown {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.order !== undefined && (obj.order = message.order);
    if (message.paragraphs) {
      obj.paragraphs = message.paragraphs.map((e) => e);
    } else {
      obj.paragraphs = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<AlliumWorksDeviceReadmeSection>
  ): AlliumWorksDeviceReadmeSection {
    const message = {
      ...baseAlliumWorksDeviceReadmeSection,
    } as AlliumWorksDeviceReadmeSection;
    message.paragraphs = [];
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    } else {
      message.title = "";
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = object.order;
    } else {
      message.order = 0;
    }
    if (object.paragraphs !== undefined && object.paragraphs !== null) {
      for (const e of object.paragraphs) {
        message.paragraphs.push(e);
      }
    }
    return message;
  },
};

const baseAlliumWorksDeviceReadmeEmbeddedResource: object = { name: "" };

export const AlliumWorksDeviceReadmeEmbeddedResource = {
  encode(
    message: AlliumWorksDeviceReadmeEmbeddedResource,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.blob.length !== 0) {
      writer.uint32(18).bytes(message.blob);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AlliumWorksDeviceReadmeEmbeddedResource {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseAlliumWorksDeviceReadmeEmbeddedResource,
    } as AlliumWorksDeviceReadmeEmbeddedResource;
    message.blob = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.blob = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AlliumWorksDeviceReadmeEmbeddedResource {
    const message = {
      ...baseAlliumWorksDeviceReadmeEmbeddedResource,
    } as AlliumWorksDeviceReadmeEmbeddedResource;
    message.blob = new Uint8Array();
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = "";
    }
    if (object.blob !== undefined && object.blob !== null) {
      message.blob = bytesFromBase64(object.blob);
    }
    return message;
  },

  toJSON(message: AlliumWorksDeviceReadmeEmbeddedResource): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.blob !== undefined &&
      (obj.blob = base64FromBytes(
        message.blob !== undefined ? message.blob : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<AlliumWorksDeviceReadmeEmbeddedResource>
  ): AlliumWorksDeviceReadmeEmbeddedResource {
    const message = {
      ...baseAlliumWorksDeviceReadmeEmbeddedResource,
    } as AlliumWorksDeviceReadmeEmbeddedResource;
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = "";
    }
    if (object.blob !== undefined && object.blob !== null) {
      message.blob = object.blob;
    } else {
      message.blob = new Uint8Array();
    }
    return message;
  },
};

const baseAlliumWorksDeviceReadme: object = { descriptionParagraphs: "" };

export const AlliumWorksDeviceReadme = {
  encode(
    message: AlliumWorksDeviceReadme,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.descriptionParagraphs) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.sections) {
      AlliumWorksDeviceReadmeSection.encode(
        v!,
        writer.uint32(18).fork()
      ).ldelim();
    }
    for (const v of message.embeddedResources) {
      AlliumWorksDeviceReadmeEmbeddedResource.encode(
        v!,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AlliumWorksDeviceReadme {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseAlliumWorksDeviceReadme,
    } as AlliumWorksDeviceReadme;
    message.descriptionParagraphs = [];
    message.sections = [];
    message.embeddedResources = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.descriptionParagraphs.push(reader.string());
          break;
        case 2:
          message.sections.push(
            AlliumWorksDeviceReadmeSection.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.embeddedResources.push(
            AlliumWorksDeviceReadmeEmbeddedResource.decode(
              reader,
              reader.uint32()
            )
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AlliumWorksDeviceReadme {
    const message = {
      ...baseAlliumWorksDeviceReadme,
    } as AlliumWorksDeviceReadme;
    message.descriptionParagraphs = [];
    message.sections = [];
    message.embeddedResources = [];
    if (
      object.descriptionParagraphs !== undefined &&
      object.descriptionParagraphs !== null
    ) {
      for (const e of object.descriptionParagraphs) {
        message.descriptionParagraphs.push(String(e));
      }
    }
    if (object.sections !== undefined && object.sections !== null) {
      for (const e of object.sections) {
        message.sections.push(AlliumWorksDeviceReadmeSection.fromJSON(e));
      }
    }
    if (
      object.embeddedResources !== undefined &&
      object.embeddedResources !== null
    ) {
      for (const e of object.embeddedResources) {
        message.embeddedResources.push(
          AlliumWorksDeviceReadmeEmbeddedResource.fromJSON(e)
        );
      }
    }
    return message;
  },

  toJSON(message: AlliumWorksDeviceReadme): unknown {
    const obj: any = {};
    if (message.descriptionParagraphs) {
      obj.descriptionParagraphs = message.descriptionParagraphs.map((e) => e);
    } else {
      obj.descriptionParagraphs = [];
    }
    if (message.sections) {
      obj.sections = message.sections.map((e) =>
        e ? AlliumWorksDeviceReadmeSection.toJSON(e) : undefined
      );
    } else {
      obj.sections = [];
    }
    if (message.embeddedResources) {
      obj.embeddedResources = message.embeddedResources.map((e) =>
        e ? AlliumWorksDeviceReadmeEmbeddedResource.toJSON(e) : undefined
      );
    } else {
      obj.embeddedResources = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<AlliumWorksDeviceReadme>
  ): AlliumWorksDeviceReadme {
    const message = {
      ...baseAlliumWorksDeviceReadme,
    } as AlliumWorksDeviceReadme;
    message.descriptionParagraphs = [];
    message.sections = [];
    message.embeddedResources = [];
    if (
      object.descriptionParagraphs !== undefined &&
      object.descriptionParagraphs !== null
    ) {
      for (const e of object.descriptionParagraphs) {
        message.descriptionParagraphs.push(e);
      }
    }
    if (object.sections !== undefined && object.sections !== null) {
      for (const e of object.sections) {
        message.sections.push(AlliumWorksDeviceReadmeSection.fromPartial(e));
      }
    }
    if (
      object.embeddedResources !== undefined &&
      object.embeddedResources !== null
    ) {
      for (const e of object.embeddedResources) {
        message.embeddedResources.push(
          AlliumWorksDeviceReadmeEmbeddedResource.fromPartial(e)
        );
      }
    }
    return message;
  },
};

const baseAlliumWorksDeviceBundle: object = {
  bundleId: "",
  html: "",
  script: "",
  stylesheet: "",
};

export const AlliumWorksDeviceBundle = {
  encode(
    message: AlliumWorksDeviceBundle,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.bundleId !== "") {
      writer.uint32(10).string(message.bundleId);
    }
    if (message.profile !== undefined) {
      BaseDeviceProfile.encode(
        message.profile,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.metadata !== undefined) {
      AlliumWorksDeviceMetadata.encode(
        message.metadata,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.html !== "") {
      writer.uint32(34).string(message.html);
    }
    if (message.script !== "") {
      writer.uint32(42).string(message.script);
    }
    if (message.stylesheet !== "") {
      writer.uint32(50).string(message.stylesheet);
    }
    if (message.readme !== undefined) {
      AlliumWorksDeviceReadme.encode(
        message.readme,
        writer.uint32(58).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AlliumWorksDeviceBundle {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseAlliumWorksDeviceBundle,
    } as AlliumWorksDeviceBundle;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bundleId = reader.string();
          break;
        case 2:
          message.profile = BaseDeviceProfile.decode(reader, reader.uint32());
          break;
        case 3:
          message.metadata = AlliumWorksDeviceMetadata.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.html = reader.string();
          break;
        case 5:
          message.script = reader.string();
          break;
        case 6:
          message.stylesheet = reader.string();
          break;
        case 7:
          message.readme = AlliumWorksDeviceReadme.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AlliumWorksDeviceBundle {
    const message = {
      ...baseAlliumWorksDeviceBundle,
    } as AlliumWorksDeviceBundle;
    if (object.bundleId !== undefined && object.bundleId !== null) {
      message.bundleId = String(object.bundleId);
    } else {
      message.bundleId = "";
    }
    if (object.profile !== undefined && object.profile !== null) {
      message.profile = BaseDeviceProfile.fromJSON(object.profile);
    } else {
      message.profile = undefined;
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = AlliumWorksDeviceMetadata.fromJSON(object.metadata);
    } else {
      message.metadata = undefined;
    }
    if (object.html !== undefined && object.html !== null) {
      message.html = String(object.html);
    } else {
      message.html = "";
    }
    if (object.script !== undefined && object.script !== null) {
      message.script = String(object.script);
    } else {
      message.script = "";
    }
    if (object.stylesheet !== undefined && object.stylesheet !== null) {
      message.stylesheet = String(object.stylesheet);
    } else {
      message.stylesheet = "";
    }
    if (object.readme !== undefined && object.readme !== null) {
      message.readme = AlliumWorksDeviceReadme.fromJSON(object.readme);
    } else {
      message.readme = undefined;
    }
    return message;
  },

  toJSON(message: AlliumWorksDeviceBundle): unknown {
    const obj: any = {};
    message.bundleId !== undefined && (obj.bundleId = message.bundleId);
    message.profile !== undefined &&
      (obj.profile = message.profile
        ? BaseDeviceProfile.toJSON(message.profile)
        : undefined);
    message.metadata !== undefined &&
      (obj.metadata = message.metadata
        ? AlliumWorksDeviceMetadata.toJSON(message.metadata)
        : undefined);
    message.html !== undefined && (obj.html = message.html);
    message.script !== undefined && (obj.script = message.script);
    message.stylesheet !== undefined && (obj.stylesheet = message.stylesheet);
    message.readme !== undefined &&
      (obj.readme = message.readme
        ? AlliumWorksDeviceReadme.toJSON(message.readme)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<AlliumWorksDeviceBundle>
  ): AlliumWorksDeviceBundle {
    const message = {
      ...baseAlliumWorksDeviceBundle,
    } as AlliumWorksDeviceBundle;
    if (object.bundleId !== undefined && object.bundleId !== null) {
      message.bundleId = object.bundleId;
    } else {
      message.bundleId = "";
    }
    if (object.profile !== undefined && object.profile !== null) {
      message.profile = BaseDeviceProfile.fromPartial(object.profile);
    } else {
      message.profile = undefined;
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = AlliumWorksDeviceMetadata.fromPartial(object.metadata);
    } else {
      message.metadata = undefined;
    }
    if (object.html !== undefined && object.html !== null) {
      message.html = object.html;
    } else {
      message.html = "";
    }
    if (object.script !== undefined && object.script !== null) {
      message.script = object.script;
    } else {
      message.script = "";
    }
    if (object.stylesheet !== undefined && object.stylesheet !== null) {
      message.stylesheet = object.stylesheet;
    } else {
      message.stylesheet = "";
    }
    if (object.readme !== undefined && object.readme !== null) {
      message.readme = AlliumWorksDeviceReadme.fromPartial(object.readme);
    } else {
      message.readme = undefined;
    }
    return message;
  },
};

const baseDeviceBundle: object = {};

export const DeviceBundle = {
  encode(
    message: DeviceBundle,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.baseBundle !== undefined) {
      BaseDeviceBundle.encode(
        message.baseBundle,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.awBundle !== undefined) {
      AlliumWorksDeviceBundle.encode(
        message.awBundle,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceBundle {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseDeviceBundle } as DeviceBundle;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseBundle = BaseDeviceBundle.decode(reader, reader.uint32());
          break;
        case 2:
          message.awBundle = AlliumWorksDeviceBundle.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceBundle {
    const message = { ...baseDeviceBundle } as DeviceBundle;
    if (object.baseBundle !== undefined && object.baseBundle !== null) {
      message.baseBundle = BaseDeviceBundle.fromJSON(object.baseBundle);
    } else {
      message.baseBundle = undefined;
    }
    if (object.awBundle !== undefined && object.awBundle !== null) {
      message.awBundle = AlliumWorksDeviceBundle.fromJSON(object.awBundle);
    } else {
      message.awBundle = undefined;
    }
    return message;
  },

  toJSON(message: DeviceBundle): unknown {
    const obj: any = {};
    message.baseBundle !== undefined &&
      (obj.baseBundle = message.baseBundle
        ? BaseDeviceBundle.toJSON(message.baseBundle)
        : undefined);
    message.awBundle !== undefined &&
      (obj.awBundle = message.awBundle
        ? AlliumWorksDeviceBundle.toJSON(message.awBundle)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<DeviceBundle>): DeviceBundle {
    const message = { ...baseDeviceBundle } as DeviceBundle;
    if (object.baseBundle !== undefined && object.baseBundle !== null) {
      message.baseBundle = BaseDeviceBundle.fromPartial(object.baseBundle);
    } else {
      message.baseBundle = undefined;
    }
    if (object.awBundle !== undefined && object.awBundle !== null) {
      message.awBundle = AlliumWorksDeviceBundle.fromPartial(object.awBundle);
    } else {
      message.awBundle = undefined;
    }
    return message;
  },
};

const baseAlliumArchive: object = {
  schemaVersion: 0,
  creator: "",
  producer: "",
  timestamp: 0,
};

export const AlliumArchive = {
  encode(
    message: AlliumArchive,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.schemaVersion !== 0) {
      writer.uint32(8).uint32(message.schemaVersion);
    }
    if (message.creator !== "") {
      writer.uint32(18).string(message.creator);
    }
    if (message.producer !== "") {
      writer.uint32(26).string(message.producer);
    }
    if (message.timestamp !== 0) {
      writer.uint32(32).uint64(message.timestamp);
    }
    for (const v of message.devices) {
      DeviceBundle.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AlliumArchive {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseAlliumArchive } as AlliumArchive;
    message.devices = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.schemaVersion = reader.uint32();
          break;
        case 2:
          message.creator = reader.string();
          break;
        case 3:
          message.producer = reader.string();
          break;
        case 4:
          message.timestamp = longToNumber(reader.uint64() as Long);
          break;
        case 5:
          message.devices.push(DeviceBundle.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AlliumArchive {
    const message = { ...baseAlliumArchive } as AlliumArchive;
    message.devices = [];
    if (object.schemaVersion !== undefined && object.schemaVersion !== null) {
      message.schemaVersion = Number(object.schemaVersion);
    } else {
      message.schemaVersion = 0;
    }
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator);
    } else {
      message.creator = "";
    }
    if (object.producer !== undefined && object.producer !== null) {
      message.producer = String(object.producer);
    } else {
      message.producer = "";
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = Number(object.timestamp);
    } else {
      message.timestamp = 0;
    }
    if (object.devices !== undefined && object.devices !== null) {
      for (const e of object.devices) {
        message.devices.push(DeviceBundle.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: AlliumArchive): unknown {
    const obj: any = {};
    message.schemaVersion !== undefined &&
      (obj.schemaVersion = message.schemaVersion);
    message.creator !== undefined && (obj.creator = message.creator);
    message.producer !== undefined && (obj.producer = message.producer);
    message.timestamp !== undefined && (obj.timestamp = message.timestamp);
    if (message.devices) {
      obj.devices = message.devices.map((e) =>
        e ? DeviceBundle.toJSON(e) : undefined
      );
    } else {
      obj.devices = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<AlliumArchive>): AlliumArchive {
    const message = { ...baseAlliumArchive } as AlliumArchive;
    message.devices = [];
    if (object.schemaVersion !== undefined && object.schemaVersion !== null) {
      message.schemaVersion = object.schemaVersion;
    } else {
      message.schemaVersion = 0;
    }
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    } else {
      message.creator = "";
    }
    if (object.producer !== undefined && object.producer !== null) {
      message.producer = object.producer;
    } else {
      message.producer = "";
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = object.timestamp;
    } else {
      message.timestamp = 0;
    }
    if (object.devices !== undefined && object.devices !== null) {
      for (const e of object.devices) {
        message.devices.push(DeviceBundle.fromPartial(e));
      }
    }
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw new Error("Unable to locate global object");
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  for (let i = 0; i < arr.byteLength; ++i) {
    bin.push(String.fromCharCode(arr[i]));
  }
  return btoa(bin.join(""));
}

type Builtin = Date | Function | Uint8Array | string | number | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
