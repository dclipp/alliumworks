export type PanelDescriptor = {
    readonly title: string;
    readonly titleIcon: string;
    readonly key: string;
    readonly descriptorType: 'default' | 'device';
}

export function createPanelDescriptor(values?: {
    title: string,
    titleIcon: string,
    key: string
}): PanelDescriptor {
    if (!!values) {
        return {
            title: values.title,
            titleIcon: values.titleIcon,
            key: values.key,
            descriptorType: 'default'
        }
    } else {
        return {
            title: '',
            titleIcon: '',
            key: '',
            descriptorType: 'default'
        }
    }
}