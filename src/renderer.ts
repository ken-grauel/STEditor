// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const _ = require("lodash");
const assert = require("assert");

enum CharacterType {
    white,
    numeric,
    text,
    punctuation
};

export class GeneralLanguage {
    constructor() {
        throw "Can't instantiate GeneralLanguage";
    }

    // todo lookback for periods in numbers?
    static characterType(character: string = " "): CharacterType {
        let unicode = character.charCodeAt(0);

        if (unicode <= 32) {
            return CharacterType.white;
        }

        if (unicode >= 48 && unicode <= 57) {
            return CharacterType.numeric;
        }

        if (
            unicode === 95 || // underscore
            (unicode >= 65 && unicode <= 90) || // capital letters
            (unicode >= 97 && unicode <= 122) // lowercase letters
        ) {
            return CharacterType.text;
        }

        return CharacterType.punctuation;
    }

    static tokenizer(line: String = "", previousLineContext: any = null) {
        let index = 0;
        let tokens = [];

        while (index < line.length) {
            let charType = this.characterType(line[index]);

            if (charType !== CharacterType.punctuation) {
                let afterTokenIndex = index + 1;

                while (
                    afterTokenIndex < line.length &&
                    charType === this.characterType(line[afterTokenIndex])
                ) {
                    afterTokenIndex++;
                }

                tokens.push(
                    new Token(line.substring(index, afterTokenIndex))
                );

                index = afterTokenIndex;
            } else {
                let tokenLength = 1;

                for (const operator of this.MULTICHAR_OPERATORS) {
                    if (line.substr(index, operator.length) === operator) {
                        tokenLength = operator.length;
                        break;
                    }
                }

                tokens.push(
                    new Token(line.substr(index, tokenLength))
                );

                index += tokenLength;
            }
        }

        return new this.TokenizerResult(
            new Line(tokens),
            {} // context for next line
        );
    }

    public static readonly MULTICHAR_OPERATORS = [
        "...",
        "++",
        "--",
        "**",
        ">>>=",
        "<<=",
        ">>=",
        "<<",
        ">>",
        "<<<",
        ">>>",
        ">=",
        "<=",
        "===",
        "!==",
        "==",
        "!=",
        "&&",
        "||",
        "+=",
        "-=",
        "*=",
        "/=",
        "%=",
        "&=",
        "|=",
        "^="
    ];

    public static TokenizerResult = class {
        constructor(public line, public previousLineContext) {
            this.line = line;
            this.previousLineContext = previousLineContext;
        }

        toString() {
            return this.line.tokens
                .map(token => '"' + token.text + '"/' + token.type)
                .join(", ");
        }
    }
}

export class Token {
    constructor(public text: String) {
        this.text = text;
    }

    get length() {
        return this.text.length;
    }

    toString() {
        return this.text;
    }
}

export class Line {
    constructor(public tokens: Token[] = []) {
        this.tokens = tokens;
    }

    get length() {
        return this.tokens.length;
    }

    toString() {
        return this.tokens.join();
    }
}


