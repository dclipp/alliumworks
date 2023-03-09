export interface FormattedGuideNoteContent {
    readonly text: string;
    readonly type: 'bold' | 'italic' | 'small note' | 'paragraph' | 'regular';
}