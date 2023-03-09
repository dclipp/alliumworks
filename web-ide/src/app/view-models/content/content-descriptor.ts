import { ContentType } from './content-type';

export class ContentDescriptor {
    readonly contentKey: string;
    readonly type: ContentType;
    readonly label: string;
    readonly iconName: string;
    readonly toolGroups?: Array<string>;

    public constructor(params: {
        readonly contextualId: string;
        readonly type: ContentType;
        readonly label: string;
        readonly iconName: string;
        readonly toolGroups?: Array<string>;
    }) {
        this.contentKey = ContentDescriptor.encodeKey(params.contextualId, params.type);
        this.type = params.type;
        this.label = params.label;
        this.iconName = params.iconName;
        this.toolGroups = params.toolGroups || [];
    }

    public static decodeKey(contentKey: string): {
        readonly contextualId: string;
        readonly type: ContentType;
    } {
        let type = ContentType.File;

        const segments = atob(decodeURIComponent(contentKey)).split('_').filter(s => !!s);
        if (segments[0] === 'file') {
            type = ContentType.File;
        } else if (segments[0] === 'device') {
            type = ContentType.Device;
        } else if (segments[0] === 'computer-presets') {
            type = ContentType.ComputerPresets;
        }

        return {
            contextualId: segments[1],
            type: type
        }
    }

    public static encodeKey(contextualId: string, type: ContentType): string {
        let prefix = '';
        switch (type) {
            case ContentType.File:
                prefix = 'file_';
                break;
            case ContentType.Device:
                prefix = 'device_';
                break;
            case ContentType.ComputerPresets:
                prefix = 'computer-presets_';
                break;
        }

        return encodeURIComponent(btoa(`${prefix}_${contextualId}`));
    }
}