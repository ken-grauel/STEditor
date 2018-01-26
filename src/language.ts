
import {Token, TokenType} from "./document"


export enum CharacterType {
    white,
    numeric,
    text,
    punctuation
}

function characterType(character: string = " "): CharacterType {
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

export interface TokenizerResult {
    tokens: Token []
    carryoverState: any
}

export interface Language {
    tokenizer(lineText: string, carryoverState: any): TokenizerResult
}

function characterTypeToTokenType (charType: CharacterType): TokenType{
    switch (charType) {
        case CharacterType. white: return TokenType. white;
        case CharacterType. numeric: return TokenType. numeric;
        case CharacterType. text: return TokenType. identifier;
        case CharacterType. punctuation: return TokenType.operator;
    }
    return TokenType.unknown;
}

const genericLanguage: Language = {
    tokenizer: function(
        line: String = "",
        previousLineContext: any = null
    ): TokenizerResult {
        let index = 0;
        let tokens:Token []= [];

        while (index < line.length) {
            let charType = characterType(line[index]);

            if (charType !== CharacterType.punctuation) {
                let afterTokenIndex = index + 1;

                while (
                    afterTokenIndex < line.length &&
                    charType === characterType(line[afterTokenIndex])
                ) {
                    afterTokenIndex++;
                }

                tokens.push(new Token(index, afterTokenIndex - index, characterTypeToTokenType (charType)));

                index = afterTokenIndex;
            } else {
                let tokenLength = 1;

                for (const operator of MULTICHAR_OPERATORS) {
                    if (line.substr(index, operator.length) === operator) {
                        tokenLength = operator.length;
                        break;
                    }
                }

                tokens.push(new Token(index, tokenLength, characterTypeToTokenType ( charType)));

                index += tokenLength;
            }
        }

        return {
            tokens: tokens,
            carryoverState: null
        };
    }
}

export function getLanguage(fileExtension: string): Language {
    return genericLanguage;
}

const MULTICHAR_OPERATORS = [
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

