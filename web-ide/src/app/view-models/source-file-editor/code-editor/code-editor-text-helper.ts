import { CodeEditorToken } from './code-editor-token';

export class CodeEditorTextHelper {
    public update(selectionStart: number, selectionEnd: number, inputText: string, isForward: boolean, isLastToken: boolean, isStartOfNonWhitespaceToken: boolean): void {
        const fieldSelection = {
            start: selectionStart,
            end:  selectionEnd,
            direction: isForward,
            text: inputText
          };
          console.log(JSON.stringify(fieldSelection, null, 2))

        const tokenIndex = this._getTokens().findIndex(t => t.start <= selectionStart && t.end >= selectionEnd);
        if (tokenIndex > -1) {
            const token = this._getTokens()[tokenIndex];
            if (isLastToken) {
                this.updateBeforeNewline(tokenIndex, token.text, inputText, token.persistentIdentifier);
            } else if (isStartOfNonWhitespaceToken) {
                this.updateBeforeNonWhitespace(tokenIndex, inputText);
            } else {
                const textPosition = selectionStart - token.start;
                if (isForward) {
                    this.updateForward(tokenIndex, token.text, token.top, inputText, textPosition, token.persistentIdentifier);
                }
            }
        }
    }

    public insertNewline(tokenIndex: number, indexWithinTokenText: number): void {
        
    }

    public constructor(getTokens: () => Array<CodeEditorToken>,
        updateTokenText: (persistentIdentifier: string, updatedText: string) => void,
        updateTokenLeft: (afterIndex: number, top: number, delta: number) => void,
        deleteToken: (index: number) => void) {
        this._getTokens = getTokens;
        this._updateTokenText = updateTokenText;
        this._updateTokenLeft = updateTokenLeft;
        this._deleteToken = deleteToken;
    }

    private updateForward(tokenIndex: number, tokenText: string, tokenTop: number, inputText: string, textPosition: number, persistentIdentifier: string): void {
        const initialTextStartPosition = tokenText.length - this.trimLeft(tokenText).length;
        const innerInitialText = tokenText.substring(initialTextStartPosition);

        let updatedText = '';
        if (!!inputText) {
            if (textPosition > 1) {
                updatedText = innerInitialText.substring(0, textPosition - 1) + inputText + innerInitialText.substring(textPosition - 1);
            } else {
                updatedText = inputText + innerInitialText;
            }
            if (this._getTokens().length > tokenIndex + 1) {
                const nextToken = this._getTokens()[tokenIndex + 1];
                if (nextToken.top === tokenTop) {
                    const lengthDelta = updatedText.length - tokenText.length;
                    this._updateTokenLeft(tokenIndex, tokenTop, lengthDelta);
                }
            }
        } else {
            updatedText = innerInitialText.substring(0, textPosition) + innerInitialText.substring(textPosition + 1);
            if (this._getTokens().length > tokenIndex + 1) {
                const nextToken = this._getTokens()[tokenIndex + 1];
                if (nextToken.top === tokenTop) {
                    const lengthDelta = updatedText.length - tokenText.length;
                    this._updateTokenLeft(tokenIndex, nextToken.top, lengthDelta);
                }
            }
        }

        updatedText = tokenText.substring(0, initialTextStartPosition) + updatedText;
        this._updateTokenText(persistentIdentifier, updatedText);
    }

    private updateBeforeNewline(tokenIndex: number, tokenText: string, inputText: string, persistentIdentifier: string): void {
        // const initialTextStartPosition = tokenText.length - this.trimLeft(tokenText).length;
        // const innerInitialText = tokenText.substring(initialTextStartPosition);

        let updatedText = '';
        if (!!inputText) {
            const appendToToken = this._getTokens()[tokenIndex - 1];
            updatedText = appendToToken.text + inputText;// '';
            persistentIdentifier = appendToToken.persistentIdentifier;
        } else {
            updatedText = tokenText.substring(0, tokenText.length - 1);
        }

        this._updateTokenText(persistentIdentifier, updatedText);
    }

    private updateBeforeNonWhitespace(tokenIndex: number, inputText: string): void {
        let actualIndex = tokenIndex;
        let updatedText = '';
        let persistentIdentifier = '';
        if (!!inputText) {
            const token = this._getTokens()[actualIndex];
            updatedText = inputText + token.text;
            persistentIdentifier = token.persistentIdentifier;
        } else {
            actualIndex++;
            const token = this._getTokens()[actualIndex];
            updatedText = token.text.substring(1);
            persistentIdentifier = token.persistentIdentifier;
        }

        if (!!updatedText) {
            this._updateTokenText(persistentIdentifier, updatedText);
        } else {
            this._deleteToken(actualIndex);
        }
    }

    private trimLeft(s: string): string {
        const wsChars = [' ', '\t', '\n'];
        let t = s;
        while (t.length > 0 && wsChars.includes(t.charAt(0))) {
            t = t.substring(1);
        }
        return t;
    }

    private readonly _getTokens: () => Array<CodeEditorToken>;
    private readonly _updateTokenText: (persistentIdentifier: string, updatedText: string) => void;
    private readonly _updateTokenLeft: (afterIndex: number, top: number, delta: number) => void;
    private readonly _deleteToken: (index: number) => void;
    private readonly _updateTokenLineIndices: ( delta: number) => void;
}