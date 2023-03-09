export interface RegularModalInput {
    readonly title: string;
    readonly body: string;
    readonly bodyIsTemplate?: boolean;
    readonly hideNoButton: boolean;
    readonly yesButtonCaption?: string;
    readonly noButtonCaption?: string;
}