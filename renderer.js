// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const _ = require("lodash");
const assert = require("assert");

class GeneralLanguage {
    constructor() {
        throw "Can't instantiate GeneralLanguage";
    }

    // todo lookback for periods in numbers?
    static characterType(character = " ") {
        let unicode = character.charCodeAt(0);

        if (unicode <= 32) {
            return this.CHARACTER_TYPE.white;
        }

        if (unicode >= 48 && unicode <= 57) {
            return this.CHARACTER_TYPE.numeric;
        }

        if (
            unicode === 95 || // underscore
            (unicode >= 65 && unicode <= 90) || // capital letters
            (unicode >= 97 && unicode <= 122) // lowercase letters
        ) {
            return this.CHARACTER_TYPE.text;
        }

        return this.CHARACTER_TYPE.punctuation;
    }

    static tokenizer(line = "", previousLineContext = {}) {
        let index = 0;
        let tokens = [];

        while (index < line.length) {
            let charType = this.characterType(line[index]);

            if (charType !== this.CHARACTER_TYPE.punctuation) {
                let afterTokenIndex = index + 1;

                while (
                    afterTokenIndex < line.length &&
                    charType === this.characterType(line[afterTokenIndex])
                ) {
                    afterTokenIndex++;
                }

                tokens.push(
                    new Token(
                        line.substring(index, afterTokenIndex),
                        index,
                        charType
                    )
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
                    new Token(line.substr(index, tokenLength), index, charType)
                );

                index += tokenLength;
            }
        }

        return new this.TokenizerResult(
            new Line(tokens),
            {} // context for next line
        );
    }
}

GeneralLanguage.CHARACTER_TYPE = {
    white: "white",
    numeric: "numeric",
    text: "text",
    punctuation: "punctuation"
};

GeneralLanguage.MULTICHAR_OPERATORS = [
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

GeneralLanguage.TokenizerResult = class {
    constructor(line, previousLineContext) {
        this.line = line;
        this.previousLineContext = previousLineContext;
    }

    toString() {
        return this.line.tokens
            .map(token => '"' + token.text + '"/' + token.type)
            .join(", ");
    }
};

class Token {
    constructor(text, column = 0, type = "unknown") {
        assert(
            _.isString(text) && text.length > 0,
            "Token cannot have empty text"
        );
        assert(
            _.isNumber(column) && column >= 0,
            "Column must be nonnegative integer"
        );

        this.text = text;
        this.column = column;
        this.type = type;
    }

    get length() {
        return this.text.length;
    }

    get nextColumn() {
        return this.text.length + this.column;
    }

    toString() {
        return this.text;
    }
}

class Line {
    constructor(tokens = []) {
        this.tokens = tokens;
    }

    get length() {
        return this.tokens.length;
    }

    toString() {
        return this.tokens.join();
    }
}

exports.Line = Line;
exports.Token = Token;
exports.GeneralLanguage = GeneralLanguage;
