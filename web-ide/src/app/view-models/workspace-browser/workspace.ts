export class WorkspaceViewModel {
    public isSelected: boolean;
    public isEditing: boolean;

    public readonly id: string;
    public readonly title: string;
    public readonly version: string;

    public constructor(props: {
        readonly id: string;
        readonly title: string;
        readonly version: string;
    }) {
        this.id = props.id;
        this.title = props.title;
        this.version = props.version;
    }
}
