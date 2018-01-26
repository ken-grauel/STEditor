import { Language, TokenizerResult, getLanguage } from "./language";

export enum TokenType {
    white = 0,
    keyword,
    identifier,
    numeric,
    grouping,
    operator,
    quoted,
    unknown
}

export class Token {
    constructor(
        public index: number,
        public length: number,
        public type: TokenType = TokenType.unknown
    ) {
        this.index = index;
        this.length = length;
        this.type = type;
    }
}

export class Line {
    text: string;

    isValidated: boolean;
    tokenizerResult: TokenizerResult | null;

    constructor(text: string) {
        this.text = text;
        this.isValidated = false;
        this.tokenizerResult = null;
    }

    invalidate() {
        this.tokenizerResult = null;
        this.isValidated = false;
    }

    validate() {
        this.isValidated = true;
    }
}

export class Document {
    private _lines: Line[];
    private _language: Language;

    constructor(documentText: string = "", extensionOrLanguage: string | Language = "txt") {
        this._lines = documentText.split(/\r?\n/).map(lineText => new Line(lineText));

        if (typeof extensionOrLanguage === "string") {
            const extension: string = extensionOrLanguage; // safe cast to string
            this._language = getLanguage(extension);
        } else {
            this._language = extensionOrLanguage; // safe cast to Language
        }

        this.validateAll();
    }

    invalidateRange(initialLineIndex: number, finalLineIndex: number = initialLineIndex): void {
        for (let lineIndex = initialLineIndex; lineIndex <= finalLineIndex; lineIndex++) {
            if (lineIndex >= 0 && lineIndex < this._lines.length)
                this._lines[lineIndex].invalidate();
        }
    }

    invalidateAll(): void {
        this.invalidateRange(0, this._lines.length - 1);
    }

    // TODO validateRange() - need to effectively reuse old tokenizer carryovers
    //   this is a tricky optimization and I'm going to avoid it until I can show a need

    validateAll(): void {
        let index = 0;
        while (index < this._lines.length && this._lines[index].isValidated) index++;

        for (; index < this._lines.length; index++) {
            this._lines[index].invalidate();
            const tokenizerCarryover =
                index === 0
                    ? null
                    : (this._lines[index - 1].tokenizerResult as TokenizerResult).carryoverState;
            const tokenizerResult = this._language.tokenizer(
                this._lines[index].text,
                tokenizerCarryover
            );
            this._lines[index].tokenizerResult = tokenizerResult;
            this._lines[index].validate();
        }
    }

    debugPrint(callback: (output: string) => void): void {
        for (let line of this._lines) {
            callback('"' + line.text + '"');
            if (line.isValidated) {
                const tokenizerResult = <TokenizerResult>line.tokenizerResult;
                callback(
                    tokenizerResult.tokens
                        .map(
                            token =>
                                "[" +
                                line.text.substr(token.index, token.length) +
                                "]/" +
                                TokenType[token.type]
                        )
                        .join(" ")
                );
            }
        }
    }

    consolePrint(): void {
        this.debugPrint(text => console.log(text));
    }
}
