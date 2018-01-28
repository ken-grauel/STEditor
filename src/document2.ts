import {Language, TokenizerResult, getLanguage} from "./language";

export class Token {
	public text: string

	public next: Token | null
	public previous: Token | null

	constructor (text: string) {
		this. text = text
		this. next = null
		this. previous = null
	}


}


export interface Cursor {
	buffer: TextBuffer

	row: number
	element: number

	rowCount: number
	elementCount: number

	text: String
	
	clone (): Cursor
	tokenSpan (): Span
	rowSpan (): Span

	forward (): boolean
	backward (): boolean

	eol: boolean
	eof: boolean
}

export interface Span {
	first: Cursor
	last: Cursor
}

export interface TextBuffer {
	cursor(row: number, element: number): Cursor
}



interface SimpleTokenListener {
	onHorizontalShift(delta:number)
	onVerticalShift(delta:number)
	onDeletion(nearbySurvivor: SimpleToken)
}

class SimpleToken {
	constructor (public text: string) {
		this. text = text
	}
}

class SimpleSpan {
	constructor (public first: Cursor, public last: Cursor) {
		this. first = first
		this. last = last
	}
}

class SimpleCursor implements Cursor {
	private _token: SimpleToken
	private _buffer: SimpleBuffer

	constructor(desiredRow: number, desiredElement: number, parentBuffer: SimpleBuffer){
		this._buffer = parentBuffer

	}


	tokenSpan (): Span {
		return new BaseSpan(this. clone (), this. clone ())
	}

	rowSpan():Span {
		const first = this. clone ()
		first. element = 0

		const last = this. clone ()
		last. element = last. elementCount-1

		return new BaseSpan (first, last)
	}

}



export class SimpleBuffer implements TextBuffer{
	private lines: SimpleToken[]

	constructor () {
		this.lines = [new SimpleToken ("")]
	}

	cursor (step: Step = Step.token, row: number = 0, element: number = 0) {
		
	}
}







































