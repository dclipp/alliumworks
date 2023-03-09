export interface PackageEntitySelectionModalInput {
    readonly allowMultipleSelections: boolean;
    readonly requiredInputValidator?: (s: string) => string | true;
    readonly inputLabel?: string;
    readonly entityDescriptions: Array<{ readonly key: string, readonly title: string }>;
    readonly title: string;
    readonly body: string;
}