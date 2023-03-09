export declare module cm4a_v2 {
    declare class Tracer {
        info(line: string): void;
        error(line: string): void;
        warn(line: string): void;
        constructor(enable: boolean, writeToBuffer: boolean, echoToConsole: boolean);
    }

    declare class CModule {
        readonly control: {
            setBreakpointMode(breakpointsEnabled: boolean): void;
            getBreakpointMode(): boolean;
            setActiveInstructionLine(lineIndex: number): void;
            getActiveInstructionLine(): number;
            clearActiveInstructionLine(): void;
            setFontSize(sizeInPx: number): void;
            formatSelection(): void;
            toggleComment(): void;
            setContent(content: string): void;
            setEditable(editable: boolean): void;
            readonly errorRange: {
                mark(startLineIndex: number, startCharIndex: number, endLineIndex: number, endCharIndex: number, errorText: string): void;
                clear(startLineIndex: number, startCharIndex: number, endLineIndex: number, endCharIndex: number): void;
                clearAll(): void;
            };
            readonly on: {
                ready(callback: () => void): string;
                contentChanged(callback: (objectName: string, changes: Array<any>, fullText: string) => void): string;
                breakpointToggled(callback: (objectName: string, lineIndex: number, isSet: boolean) => void): string;
                viewScrolled(callback: (objectName: string, firstVisibleLineIndex: number) => void): string;
                editableChanged(callback: (objectName: string, isEditable: boolean) => void): string;
            },
            off(handle: string): void;
            destroy(): void;
            refresh(): void;
        }
        constructor(textareaId: string, objectName: string, externals: {
            readonly sourceMap?: any;
            readonly library?: { readonly [key: string]: any };
            readonly getNumericValueForRegRef?: (rr: string) => number | null;
            readonly getBlockAddress?: (blockName: string) => number | null;
        }, tracer: Tracer);
    }
}