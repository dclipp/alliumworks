export interface ArchivedDeviceReadme {
    readonly descriptionParagraphs?: Array<string>;
    readonly sections?: Array<{
        readonly title?: string;
        readonly order?: number;
        readonly paragraphs?: Array<string>;
    }>;
    readonly embeddedResources: Array<{
        readonly name?: string;
        readonly blob?: string;
    }>;
}